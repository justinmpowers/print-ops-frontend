import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { OrderService } from 'services/order.service';
import { Order } from 'models/types';
import { IconComponent } from 'components/icon/icon.component';
import { OrderDetailsComponent } from 'components/order-details/order-details.component';

export type BoardStatus = 'QUEUED' | 'PRINTING' | 'PRINTED' | 'SHIPPED' | 'FAILED';

interface BoardColumn {
  status: BoardStatus;
  label: string;
  hint: string;
}

/** Etsy statuses for orders that will never be made; they stay off the board. */
const HIDDEN_ETSY_STATUSES = new Set(['CANCELED', 'CANCELLED']);
/** Shipped grows forever, so it shows the newest few until asked for more. */
const SHIPPED_PAGE = 20;

const PRIORITY_LABELS: Record<number, string> = { 1: 'Urgent', 2: 'High' };

/**
 * Orders as a Kanban board, one column per production stage. Drag a card to another column to
 * change its stage, or up and down to set the order you'll work through them.
 */
@Component({
  selector: 'app-order-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, DragDropModule, IconComponent, OrderDetailsComponent],
  templateUrl: './order-board.component.html',
  styleUrls: ['./order-board.component.scss'],
})
export class OrderBoardComponent implements OnChanges {
  @Input() orders: Order[] = [];
  /** A change was saved; the parent should reload orders from the server. */
  @Output() changed = new EventEmitter<void>();

  readonly columns: BoardColumn[] = [
    { status: 'QUEUED', label: 'Queued', hint: 'Waiting to print' },
    { status: 'PRINTING', label: 'Printing', hint: 'On a printer now' },
    { status: 'PRINTED', label: 'Printed', hint: 'Ready to pack and ship' },
    { status: 'SHIPPED', label: 'Shipped', hint: 'Sent, newest first' },
    { status: 'FAILED', label: 'Failed', hint: 'Needs a reprint' },
  ];
  readonly dropListIds = this.columns.map(c => this.listId(c.status));

  lanes: Record<BoardStatus, Order[]> = { QUEUED: [], PRINTING: [], PRINTED: [], SHIPPED: [], FAILED: [] };
  shippedShown = SHIPPED_PAGE;
  selectedId: number | null = null;
  saving = new Set<number>();

  private dragging = false;
  private lastDragEnd = 0;
  private rebuildPending = false;

  constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    // Rebuilding mid-drag or mid-save would snap cards back to where the server last had them.
    if (this.dragging || this.saving.size) {
      this.rebuildPending = true;
      return;
    }
    this.buildLanes();
  }

  get selected(): Order | undefined {
    return this.selectedId === null ? undefined : this.orders.find(o => o.id === this.selectedId);
  }

  listId(status: BoardStatus): string {
    return `board-${status.toLowerCase()}`;
  }

  private buildLanes(): void {
    this.rebuildPending = false;
    const lanes: Record<BoardStatus, Order[]> = { QUEUED: [], PRINTING: [], PRINTED: [], SHIPPED: [], FAILED: [] };
    for (const order of this.orders) {
      if (HIDDEN_ETSY_STATUSES.has((order.status || '').toUpperCase())) continue;
      lanes[this.laneOf(order)].push(order);
    }
    for (const column of this.columns) {
      lanes[column.status].sort(column.status === 'SHIPPED' ? byNewestShipped : byBoardOrder);
    }
    this.lanes = lanes;
  }

  private laneOf(order: Order): BoardStatus {
    const status = (order.production_status || 'QUEUED').toUpperCase() as BoardStatus;
    return status in this.lanes ? status : 'QUEUED';
  }

  visible(status: BoardStatus): Order[] {
    const lane = this.lanes[status];
    // Always a prefix of the lane, so drag indexes match the lane array.
    return status === 'SHIPPED' ? lane.slice(0, this.shippedShown) : lane;
  }

  showMoreShipped(): void {
    this.shippedShown += SHIPPED_PAGE;
  }

  // ----- drag and drop -----

  dragStarted(): void {
    this.dragging = true;
  }

  dragEnded(): void {
    this.lastDragEnd = Date.now();
    // The drop handler runs right after this; let it go first.
    setTimeout(() => {
      this.dragging = false;
      this.flushPendingRebuild();
    });
  }

  drop(event: CdkDragDrop<Order[]>, target: BoardStatus): void {
    const order: Order = event.item.data;
    const sameLane = event.previousContainer === event.container;
    if (sameLane && event.previousIndex === event.currentIndex) return;

    if (sameLane) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.save(order, target);
  }

  /** Move from the side panel's stage picker (also the keyboard-friendly way to move a card). */
  moveTo(order: Order, target: BoardStatus): void {
    const from = this.laneOf(order);
    if (from === target) return;
    const source = this.lanes[from];
    const index = source.indexOf(order);
    if (index >= 0) source.splice(index, 1);
    this.lanes[target].push(order);
    this.save(order, target);
  }

  private save(order: Order, target: BoardStatus): void {
    const lane = this.lanes[target];
    const before = { production_status: order.production_status, board_position: order.board_position,
                     shipped_at: order.shipped_at };
    order.production_status = target;
    if (target === 'SHIPPED') {
      order.shipped_at = order.shipped_at || new Date().toISOString();
      lane.sort(byNewestShipped);
    } else {
      lane.forEach((o, i) => { o.board_position = i; });
    }
    // Shipped is sorted by date, so only the moved card's status matters there.
    const columnOrder = target === 'SHIPPED' ? [order.id] : lane.map(o => o.id);

    this.saving.add(order.id);
    this.orderService.moveOnBoard(order.id, target, columnOrder).subscribe({
      next: (updated) => {
        Object.assign(order, updated);
        this.saving.delete(order.id);
        this.changed.emit();
        this.flushPendingRebuild();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to move order', err);
        Object.assign(order, before);
        this.saving.delete(order.id);
        alert(`Couldn't move order #${order.etsy_order_id}. It's been put back.`);
        this.changed.emit();   // reload restores the server's view
        this.rebuildPending = true;
        this.flushPendingRebuild();
        this.cdr.detectChanges();
      }
    });
  }

  private flushPendingRebuild(): void {
    if (this.rebuildPending && !this.dragging && !this.saving.size) {
      this.buildLanes();
      this.cdr.detectChanges();
    }
  }

  // ----- side panel -----

  open(order: Order): void {
    // A mouse drag ends with a click on the card; that isn't a request to open it.
    if (Date.now() - this.lastDragEnd < 250) return;
    this.selectedId = order.id;
  }

  close(): void {
    this.selectedId = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  // ----- card text -----

  priorityLabel(order: Order): string | null {
    return PRIORITY_LABELS[order.priority] ?? null;
  }

  itemsSummary(order: Order): string {
    const items = order.items ?? [];
    if (items.length === 0) return 'No items';
    const first = `${items[0].quantity} × ${items[0].title}`;
    return items.length > 1 ? `${first} +${items.length - 1} more` : first;
  }

  /** "3d" style age since the order came in, or since it shipped in the Shipped column. */
  age(order: Order, status: BoardStatus): string {
    const from = status === 'SHIPPED' && order.shipped_at ? order.shipped_at : order.created_at;
    if (!from) return '';
    const minutes = Math.max(0, (Date.now() - new Date(from).getTime()) / 60000);
    if (minutes < 60) return `${Math.round(minutes)}m`;
    if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / (60 * 24))}d`;
  }

  laneMinutes(status: BoardStatus): number {
    return this.lanes[status].reduce((sum, o) => sum + (o.estimated_print_time || 0), 0);
  }

  formatMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  }

  trackById(_: number, order: Order): number {
    return order.id;
  }
}

/** Cards you've placed by hand first, in that order; then most urgent, oldest first. */
function byBoardOrder(a: Order, b: Order): number {
  const pa = a.board_position ?? Number.POSITIVE_INFINITY;
  const pb = b.board_position ?? Number.POSITIVE_INFINITY;
  if (pa !== pb) return pa - pb;
  if (a.priority !== b.priority) return (a.priority ?? 3) - (b.priority ?? 3);
  return timeOf(a.created_at) - timeOf(b.created_at);
}

function byNewestShipped(a: Order, b: Order): number {
  return timeOf(b.shipped_at || b.updated_at || b.created_at) - timeOf(a.shipped_at || a.updated_at || a.created_at);
}

function timeOf(value: string | null | undefined): number {
  return value ? new Date(value).getTime() : 0;
}
