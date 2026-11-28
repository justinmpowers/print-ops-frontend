import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from 'services/order.service';
import { CommunicationLog, Order, OrderNote } from 'models/types';

/**
 * An order's working details: items, internal notes, customer log, shipping and finished photo.
 * Used under a row in the orders list and in the side panel of the orders board.
 */
@Component({
    selector: 'app-order-details',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, FormsModule],
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.scss'],
    host: { '[class.stacked]': 'layout === "stacked"' },
})
export class OrderDetailsComponent implements OnChanges {
    @Input({ required: true }) order!: Order;
    /** 'row': panels side by side (orders list). 'stacked': one column (board side panel). */
    @Input() layout: 'row' | 'stacked' = 'row';
    /** Something changed that the order list should reload for (e.g. last customer contact). */
    @Output() changed = new EventEmitter<void>();

    notes: OrderNote[] = [];
    comms: CommunicationLog[] = [];
    noteDraft = '';
    commDraft = { message: '', direction: 'outbound', channel: 'message' };
    photoFile: File | null = null;
    private loadedFor: number | null = null;

    constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        // The list refreshes every 30 seconds with new objects for the same orders; only a
        // different order needs its notes fetched (and drafts cleared).
        if (changes['order'] && this.order.id !== this.loadedFor) {
            this.loadedFor = this.order.id;
            this.notes = [];
            this.comms = [];
            this.noteDraft = '';
            this.commDraft = { message: '', direction: 'outbound', channel: 'message' };
            this.photoFile = null;
            this.loadNotes();
            this.loadCommunications();
        }
    }

    private loadNotes(): void {
        const id = this.order.id;
        this.orderService.listNotes(id).subscribe({
            next: (res) => { if (id === this.loadedFor) { this.notes = res.notes; this.cdr.detectChanges(); } },
            error: (err) => console.error('Failed to load notes', err)
        });
    }

    private loadCommunications(): void {
        const id = this.order.id;
        this.orderService.listCommunications(id).subscribe({
            next: (res) => { if (id === this.loadedFor) { this.comms = res.logs; this.cdr.detectChanges(); } },
            error: (err) => console.error('Failed to load communications', err)
        });
    }

    saveNote(): void {
        const content = this.noteDraft;
        if (!content || !content.trim()) {
            alert('Note cannot be empty');
            return;
        }
        this.orderService.addNote(this.order.id, content).subscribe({
            next: (note) => {
                this.noteDraft = '';
                this.notes.unshift(note);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to add note', err);
                alert('Failed to add note');
            }
        });
    }

    saveCommunication(): void {
        if (!this.commDraft.message || !this.commDraft.message.trim()) {
            alert('Message cannot be empty');
            return;
        }
        this.orderService.addCommunication(this.order.id, this.commDraft).subscribe({
            next: (log) => {
                this.comms.unshift(log);
                this.commDraft = { message: '', direction: 'outbound', channel: 'message' };
                this.changed.emit();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to add communication', err);
                alert('Failed to add communication');
            }
        });
    }

    onPhotoSelected(event: Event): void {
        this.photoFile = (event.target as HTMLInputElement).files?.[0] || null;
    }

    uploadPhoto(): void {
        if (!this.photoFile) {
            alert('Select a photo first');
            return;
        }
        this.orderService.uploadPhoto(this.order.id, this.photoFile).subscribe({
            next: (res) => {
                this.order.photo_url = res.photo_url;
                this.photoFile = null;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Photo upload failed', err);
                alert('Photo upload failed');
            }
        });
    }

    editOrderFilament(): void {
        alert(`Managing filament for order ${this.order.etsy_order_id} - This feature will be implemented soon`);
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }
}
