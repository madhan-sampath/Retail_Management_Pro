import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Order } from '../../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1 text-gradient">Orders</h1>
          <p class="text-muted mb-0">Manage customer orders and track order status.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="exportOrders()">
            <i class="fas fa-download me-2"></i>Export
          </button>
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fas fa-plus me-2"></i>New Order
          </button>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Search Orders</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input type="text" class="form-control" placeholder="Search by order number, customer..."
                       [(ngModel)]="searchQuery" (input)="searchOrders()">
              </div>
            </div>
            <div class="col-md-2">
              <label class="form-label">Status</label>
              <select class="form-select" [(ngModel)]="selectedStatus" (change)="filterOrders()">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Payment Method</label>
              <select class="form-select" [(ngModel)]="selectedPaymentMethod" (change)="filterOrders()">
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Date From</label>
              <input type="date" class="form-control" [(ngModel)]="dateFrom" (change)="filterOrders()">
            </div>
            <div class="col-md-2">
              <label class="form-label">Date To</label>
              <input type="date" class="form-control" [(ngModel)]="dateTo" (change)="filterOrders()">
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">
            <i class="fas fa-shopping-cart me-2"></i>Orders ({{ filteredOrders.length }})
          </h5>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" (click)="refreshOrders()">
              <i class="fas fa-sync-alt me-1"></i>Refresh
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading orders...</p>
          </div>

          <!-- Orders Table -->
          <div *ngIf="!loading" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of filteredOrders">
                  <td>
                    <div class="fw-bold">{{ order.orderNumber }}</div>
                    <small class="text-muted">ID: {{ order.id }}</small>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center"
                           style="width: 32px; height: 32px; font-size: 0.8rem;">
                        {{ getInitials(order.customer?.firstName, order.customer?.lastName) }}
                      </div>
                      <div>
                        <div class="fw-bold">{{ order.customer?.firstName }} {{ order.customer?.lastName }}</div>
                        <small class="text-muted">{{ order.customer?.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-info">{{ order.orderItems?.length || 0 }} items</span>
                  </td>
                  <td>
                    <div class="fw-bold">\${{ this.formatNumber(order.totalAmount) }}</div>
                  </td>
                  <td>
                    <span [class]="'badge ' + getStatusClass(order.status)">
                      {{ this.formatTitleCase(order.status) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ this.formatTitleCase(order.paymentMethod) }}</span>
                  </td>
                  <td>
                    <div>{{ this.formatDate(order.orderDate, 'short') }}</div>
                    <small class="text-muted">{{ this.formatDate(order.orderDate, 'medium') }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="viewOrder(order)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-outline-success" (click)="editOrder(order)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                          <i class="fas fa-cog"></i>
                        </button>
                        <ul class="dropdown-menu">
                          <li><a class="dropdown-item" href="#" (click)="updateOrderStatus(order, 'processing')">
                            <i class="fas fa-play me-2"></i>Mark as Processing
                          </a></li>
                          <li><a class="dropdown-item" href="#" (click)="updateOrderStatus(order, 'shipped')">
                            <i class="fas fa-truck me-2"></i>Mark as Shipped
                          </a></li>
                          <li><a class="dropdown-item" href="#" (click)="updateOrderStatus(order, 'delivered')">
                            <i class="fas fa-check me-2"></i>Mark as Delivered
                          </a></li>
                          <li><hr class="dropdown-divider"></li>
                          <li><a class="dropdown-item text-danger" href="#" (click)="cancelOrder(order)">
                            <i class="fas fa-times me-2"></i>Cancel Order
                          </a></li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && filteredOrders.length === 0" class="text-center py-5">
            <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No orders found</h5>
            <p class="text-muted">Try adjusting your search criteria or create a new order.</p>
            <button class="btn btn-primary" (click)="openAddModal()">
              <i class="fas fa-plus me-2"></i>New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-title {
      color: white;
      font-weight: 600;
    }

    .table th {
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .avatar {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }

    .badge {
      font-size: 0.75rem;
    }

    .dropdown-menu {
      border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border-radius: 8px;
    }

    .dropdown-item {
      padding: 8px 16px;
      font-size: 0.875rem;
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  
  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedPaymentMethod = '';
  dateFrom = '';
  dateTo = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadOrders();
  }

  formatNumber(value: number): string {
    return value.toFixed(2);
  }

  formatTitleCase(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDate(date: string | Date, format: 'short' | 'medium' = 'short'): string {
    const d = new Date(date);
    if (format === 'short') {
      return d.toLocaleDateString();
    } else {
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    }
  }

  loadOrders() {
    this.loading = true;
    this.apiService.getOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data;
          this.filteredOrders = [...this.orders];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  searchOrders() {
    if (!this.searchQuery.trim()) {
      this.filteredOrders = [...this.orders];
    } else {
      this.apiService.searchOrders(this.searchQuery).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.filteredOrders = response.data;
          }
        },
        error: (error) => {
          console.error('Error searching orders:', error);
        }
      });
    }
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter(order => {
      let matches = true;

      if (this.selectedStatus && order.status !== this.selectedStatus) {
        matches = false;
      }

      if (this.selectedPaymentMethod && order.paymentMethod !== this.selectedPaymentMethod) {
        matches = false;
      }

      if (this.dateFrom && new Date(order.orderDate) < new Date(this.dateFrom)) {
        matches = false;
      }

      if (this.dateTo && new Date(order.orderDate) > new Date(this.dateTo)) {
        matches = false;
      }

      return matches;
    });
  }

  refreshOrders() {
    this.loadOrders();
  }

  exportOrders() {
    // Implementation for exporting orders
    console.log('Export orders functionality');
  }

  openAddModal() {
    // Implementation for opening add order modal
    console.log('Open add order modal');
  }

  viewOrder(order: Order) {
    // Implementation for viewing order details
    console.log('View order:', order);
  }

  editOrder(order: Order) {
    // Implementation for editing order
    console.log('Edit order:', order);
  }

  updateOrderStatus(order: Order, status: string) {
    this.apiService.updateOrderStatus(order.id, status).subscribe({
      next: (response) => {
        if (response.success) {
          order.status = status;
          this.refreshOrders();
        }
      },
      error: (error) => {
        console.error('Error updating order status:', error);
      }
    });
  }

  cancelOrder(order: Order) {
    if (confirm(`Are you sure you want to cancel order "${order.orderNumber}"?`)) {
      this.updateOrderStatus(order, 'cancelled');
    }
  }

  getInitials(firstName?: string, lastName?: string): string {
    if (!firstName || !lastName) return '?';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'processing':
        return 'bg-info';
      case 'shipped':
        return 'bg-primary';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
