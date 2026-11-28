import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import qrcode from 'qrcode-generator';
import { FilamentService } from 'services/filament.service';
import { Filament } from 'models/types';
import { spoolPageUrl } from 'models/spool-code';
import { IconComponent } from 'components/icon/icon.component';

interface LabelSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
}

interface SpoolLabel {
  spool: Filament;
  url: string;
  /** QR modules as one SVG path, in module units, plus the grid size. */
  qr: { size: number; path: string };
}

const LABEL_SIZES: LabelSize[] = [
  { id: '2x1in', name: '2 × 1 in (51 × 25 mm)', widthMm: 50.8, heightMm: 25.4 },
  { id: '2.25x1.25in', name: '2¼ × 1¼ in (57 × 32 mm, Dymo 30334)', widthMm: 57.2, heightMm: 31.8 },
  { id: '62x29mm', name: '62 × 29 mm (Brother DK-1209)', widthMm: 62, heightMm: 29 },
  { id: '3x2in', name: '3 × 2 in (76 × 51 mm)', widthMm: 76.2, heightMm: 50.8 },
];

const PREFS_KEY = 'spool_label_prefs';
const PAGE_STYLE_ID = 'spool-label-page-style';
/** Blank modules around the code. The standard asks for 4; phone cameras read 2 fine and labels are small. */
const QUIET_ZONE = 2;

/**
 * Printable QR labels for spools. Each code holds the spool's PrintOps address, so scanning it
 * with a phone camera opens the spool page. Prints from the browser to any printer.
 */
@Component({
  selector: 'app-spool-labels',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './spool-labels.component.html',
  styleUrls: ['./spool-labels.component.scss'],
})
export class SpoolLabelsComponent implements OnInit, OnDestroy {
  readonly sizes = LABEL_SIZES;
  readonly quietZone = QUIET_ZONE;
  sizeId = LABEL_SIZES[0].id;
  layout: 'sheet' | 'roll' = 'sheet';
  labels: SpoolLabel[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private filamentService: FilamentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
      if (LABEL_SIZES.some(s => s.id === saved.sizeId)) this.sizeId = saved.sizeId;
      if (saved.layout === 'roll' || saved.layout === 'sheet') this.layout = saved.layout;
    } catch { /* keep defaults */ }
    this.applyPageStyle();

    const wanted = new Set((this.route.snapshot.queryParamMap.get('ids') || '')
      .split(',').map(Number).filter(n => Number.isInteger(n) && n > 0));
    this.filamentService.getFilaments().subscribe({
      next: ({ filaments }) => {
        const chosen = wanted.size ? filaments.filter(f => wanted.has(f.id)) : filaments;
        this.labels = chosen.sort((a, b) => a.id - b.id).map(spool => {
          const url = spoolPageUrl(spool.id);
          return { spool, url, qr: qrPath(url) };
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not load your spools.';
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    document.getElementById(PAGE_STYLE_ID)?.remove();
  }

  get size(): LabelSize {
    return LABEL_SIZES.find(s => s.id === this.sizeId) ?? LABEL_SIZES[0];
  }

  onSettingsChange(): void {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ sizeId: this.sizeId, layout: this.layout }));
    this.applyPageStyle();
  }

  print(): void {
    window.print();
  }

  /**
   * Paper size can't be set from component styles, so it goes in a <style> tag in <head>:
   * a label-printer roll gets one label per page at the label's exact size.
   */
  private applyPageStyle(): void {
    let style = document.getElementById(PAGE_STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = PAGE_STYLE_ID;
      document.head.appendChild(style);
    }
    const { widthMm, heightMm } = this.size;
    style.textContent = this.layout === 'roll'
      ? `@page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }`
      : '@page { margin: 10mm; }';
  }
}

function qrPath(text: string): { size: number; path: string } {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const size = qr.getModuleCount();
  let path = '';
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (qr.isDark(row, col)) path += `M${col} ${row}h1v1h-1z`;
    }
  }
  return { size, path };
}
