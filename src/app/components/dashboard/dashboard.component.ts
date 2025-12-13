import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { FilamentService } from '../../services/filament.service';
import { Order, Filament } from '../../models/types';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    activeTab: 'orders' | 'filaments' = 'orders';
    orders: Order[] = [];
    filaments: Filament[] = [];
    username: string = '';
    syncingOrders = false;
    showAddFilament = false;
    editingFilament: Filament | null = null;
    filamentForm = {
        material: '',
        color: '',
        initial_amount: 0,
        current_amount: 0,
        cost_per_gram: 0
    };

    constructor(
        private authService: AuthService,
        private orderService: OrderService,
        private filamentService: FilamentService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.authService.user$.subscribe(user => {
            if (user) {
                this.username = user.username;
            }
        });

        this.loadOrders();
        this.loadFilaments();
    }

    loadOrders(): void {
        this.orderService.getOrders().subscribe(
            (response) => {
                this.orders = response.orders;
            },
            (error) => {
                console.error('Error loading orders:', error);
            }
        );
    }

    loadFilaments(): void {
        this.filamentService.getFilaments().subscribe(
            (response) => {
                this.filaments = response.filaments;
            },
            (error) => {
                console.error('Error loading filaments:', error);
            }
        );
    }

    syncOrders(): void {
        this.syncingOrders = true;
        this.orderService.syncOrders().subscribe(
            (response) => {
                this.syncingOrders = false;
                this.loadOrders();
                alert('Orders synced successfully!');
            },
            (error) => {
                this.syncingOrders = false;
                console.error('Error syncing orders:', error);
                alert('Failed to sync orders');
            }
        );
    }

    editFilament(filament: Filament): void {
        this.editingFilament = filament;
        this.filamentForm = {
            material: filament.material,
            color: filament.color,
            initial_amount: filament.initial_amount,
            current_amount: filament.current_amount,
            cost_per_gram: filament.cost_per_gram || 0
        };
        this.showAddFilament = true;
    }

    deleteFilament(filamentId: number): void {
        if (confirm('Are you sure you want to delete this filament?')) {
            this.filamentService.deleteFilament(filamentId).subscribe(
                () => {
                    this.loadFilaments();
                },
                (error) => {
                    console.error('Error deleting filament:', error);
                    alert('Failed to delete filament');
                }
            );
        }
    }

    saveFilament(): void {
        if (this.editingFilament) {
            this.filamentService.updateFilament(this.editingFilament.id, this.filamentForm).subscribe(
                () => {
                    this.loadFilaments();
                    this.closeModal();
                },
                (error) => {
                    console.error('Error updating filament:', error);
                    alert('Failed to update filament');
                }
            );
        } else {
            this.filamentService.createFilament(this.filamentForm).subscribe(
                () => {
                    this.loadFilaments();
                    this.closeModal();
                },
                (error) => {
                    console.error('Error creating filament:', error);
                    alert('Failed to create filament');
                }
            );
        }
    }

    editOrderFilament(order: Order): void {
        alert(`Managing filament for order ${order.etsy_order_id} - This feature will be implemented soon`);
    }

    closeModal(): void {
        this.showAddFilament = false;
        this.editingFilament = null;
        this.filamentForm = {
            material: '',
            color: '',
            initial_amount: 0,
            current_amount: 0,
            cost_per_gram: 0
        };
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    logout(): void {
        this.authService.logout().subscribe(
            () => {
                this.router.navigate(['/login']);
            },
            (error) => {
                console.error('Error logging out:', error);
            }
        );
    }
}
