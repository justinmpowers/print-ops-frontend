import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FilamentService } from 'services/filament.service';
import { SpoolDetail } from 'models/types';
import { spoolIdFromScan } from 'models/spool-code';
import { IconComponent } from 'components/icon/icon.component';

/**
 * One spool, as opened by scanning its QR label: how much is left, and quick ways to log a print,
 * weigh it, move it or mark it empty. Laid out for a phone held over the spool.
 */
@Component({
  selector: 'app-spool',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './spool.component.html',
  styleUrls: ['./spool.component.scss'],
})
export class SpoolComponent implements OnInit {
  spool: SpoolDetail | null = null;
  loading = true;
  notFound = false;
  loadError = '';
  busy = false;
  flash = '';

  usedGrams: number | null = null;
  usedNote = '';
  scaleReading: number | null = null;
  locationDraft = '';
  scanDraft = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private filamentService: FilamentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = spoolIdFromScan(params.get('id'));
      this.spool = null;
      this.flash = '';
      if (id === null) {
        this.loading = false;
        this.notFound = true;
        return;
      }
      this.load(id);
    });
  }

  private load(id: number): void {
    this.loading = true;
    this.notFound = false;
    this.loadError = '';
    this.filamentService.getFilament(id).subscribe({
      next: (spool) => {
        this.spool = spool;
        this.locationDraft = spool.location || '';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 404) {
          this.notFound = true;
        } else {
          this.loadError = 'Could not load this spool. Check your connection and try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  reload(): void {
    if (this.spool) this.load(this.spool.id);
  }

  get remainingPct(): number {
    const s = this.spool;
    if (!s || !s.initial_amount) return 0;
    return Math.max(0, Math.min(100, Math.round((s.current_amount / s.initial_amount) * 100)));
  }

  /** What a scale reading means for what's left: minus the empty spool when its weight is known. */
  get remainingFromScale(): number | null {
    if (this.scaleReading === null || this.scaleReading === undefined || isNaN(this.scaleReading)) return null;
    const tare = this.spool?.spool_weight;
    return Math.max(0, Math.round((tare ? this.scaleReading - tare : this.scaleReading) * 10) / 10);
  }

  logUse(): void {
    const grams = Number(this.usedGrams);
    if (!this.spool || !(grams > 0)) return;
    this.run(this.filamentService.recordUsage({
      filament_id: this.spool.id,
      amount_used: grams,
      description: this.usedNote.trim() || 'Logged from spool label',
    }), `Logged ${grams} g.`, () => { this.usedGrams = null; this.usedNote = ''; });
  }

  saveWeight(): void {
    const remaining = this.remainingFromScale;
    if (!this.spool || remaining === null) return;
    const note = this.spool.spool_weight
      ? `Weighed on scale: ${this.scaleReading} g (spool ${this.spool.spool_weight} g)`
      : 'Set remaining amount';
    this.run(this.filamentService.adjustRemaining(this.spool.id, remaining, note),
      `Updated to ${remaining} g left.`, () => { this.scaleReading = null; });
  }

  markEmpty(): void {
    if (!this.spool || !confirm(`Mark ${this.spool.code} (${this.spool.material} ${this.spool.color}) as empty?`)) return;
    this.run(this.filamentService.adjustRemaining(this.spool.id, 0, 'Marked empty'), 'Marked empty.');
  }

  saveLocation(): void {
    if (!this.spool) return;
    const location = this.locationDraft.trim();
    if (location === (this.spool.location || '')) return;
    this.run(this.filamentService.updateFilament(this.spool.id, { location }),
      location ? `Moved to ${location}.` : 'Location cleared.');
  }

  openScanned(): void {
    const id = spoolIdFromScan(this.scanDraft);
    if (id === null) {
      alert(`"${this.scanDraft}" isn't a spool code. Codes look like F-0042.`);
      return;
    }
    this.scanDraft = '';
    this.router.navigate(['/spool', id]);
  }

  private run(request: Observable<unknown>, done: string, after?: () => void): void {
    this.busy = true;
    this.flash = '';
    request.subscribe({
      next: () => {
        this.busy = false;
        this.flash = done;
        after?.();
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.busy = false;
        alert(err.error?.error || 'That didn\'t save. Try again.');
        this.cdr.detectChanges();
      }
    });
  }

  /** The API's timestamps are UTC without a zone marker; mark them so they display in local time. */
  asUtc(value: string): string {
    return /(?:[zZ]|[+-]\d\d:?\d\d)$/.test(value) ? value : `${value}Z`;
  }

  describeUsage(amount: number): string {
    if (amount > 0) return `−${amount} g`;
    return `+${Math.abs(amount)} g`;
  }
}
