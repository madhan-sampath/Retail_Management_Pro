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

      <!-- Order Modal -->
      <div *ngIf="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ modalTitle }}</h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="row g-3 mb-4">
                  <div class="col-md-6">
                    <label class="form-label">Customer *</label>
                    <select class="form-select" [(ngModel)]="orderForm.customerId" 
                            name="customerId" required [disabled]="!isEditMode && modalTitle === 'Order Details'">
                      <option value="">Select Customer</option>
                      <option *ngFor="let customer of customers" [value]="customer.id">
                        {{ customer.firstName }} {{ customer.lastName }} - {{ customer.email }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" [(ngModel)]="orderForm.status" 
                            name="status" [disabled]="!isEditMode && modalTitle === 'Order Details'">
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Payment Method</label>
                    <select class="form-select" [(ngModel)]="orderForm.paymentMethod" 
                            name="paymentMethod" [disabled]="!isEditMode && modalTitle === 'Order Details'">
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Notes</label>
                    <textarea class="form-control" rows="2" [(ngModel)]="orderForm.notes" 
                              name="notes" [readonly]="!isEditMode && modalTitle === 'Order Details'"></textarea>
                  </div>
                </div>

                <!-- Order Items -->
                <div class="mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0">Order Items</h6>
                    <button *ngIf="isEditMode || modalTitle === 'Create New Order'" type="button" 
                            class="btn btn-sm btn-outline-primary" (click)="addOrderItem()">
                      <i class="fas fa-plus me-1"></i>Add Item
                    </button>
                  </div>
                  
                  <div *ngIf="orderForm.orderItems.length === 0" class="text-center py-3 text-muted">
                    No items in this order
                  </div>
                  
                  <div *ngFor="let item of orderForm.orderItems; let i = index" class="row g-2 mb-2 align-items-end">
                    <div class="col-md-5">
                      <label class="form-label">Product</label>
                      <select class="form-select" [(ngModel)]="item.productId" 
                              (change)="onProductChange(item)" [disabled]="!isEditMode && modalTitle === 'Order Details'">
                        <option value="">Select Product</option>
                        <option *ngFor="let product of products" [value]="product.id">
                          {{ product.name }} - \${{ formatNumber(product.price) }}
                        </option>
                      </select>
                    </div>
                    <div class="col-md-2">
                      <label class="form-label">Quantity</label>
                      <input type="number" class="form-control" [(ngModel)]="item.quantity" 
                             (input)="calculateTotal()" min="1" [readonly]="!isEditMode && modalTitle === 'Order Details'">
                    </div>
                    <div class="col-md-2">
                      <label class="form-label">Price</label>
                      <input type="number" class="form-control" [(ngModel)]="item.price" 
                             step="0.01" [readonly]="true">
                    </div>
                    <div class="col-md-2">
                      <label class="form-label">Total</label>
                      <input type="number" class="form-control" 
                             [value]="item.quantity * item.price" readonly>
                    </div>
                    <div class="col-md-1">
                      <button *ngIf="isEditMode || modalTitle === 'Create New Order'" type="button" 
                              class="btn btn-sm btn-outline-danger" (click)="removeOrderItem(i)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Order Total -->
                <div class="row">
                  <div class="col-md-6"></div>
                  <div class="col-md-6">
                    <div class="card">
                      <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                          <h5 class="mb-0">Total Amount:</h5>
                          <h4 class="mb-0 text-primary">\${{ formatNumber(orderForm.totalAmount) }}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Close</button>
              <button *ngIf="isEditMode" type="button" class="btn btn-primary" (click)="saveOrder()">
                <i class="fas fa-save me-2"></i>Save Changes
              </button>
              <button *ngIf="!isEditMode && modalTitle !== 'Order Details'" type="button" class="btn btn-success" (click)="saveOrder()">
                <i class="fas fa-plus me-2"></i>Create Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-title {
      color: #1e293b;
      font-weight: 600;
      font-size: 1rem;
    }

    .table th {
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table td {
      font-size: 0.8rem;
    }

    .avatar {
      font-size: 0.7rem;
      font-weight: 600;
    }

    .btn-group-sm .btn {
      padding: 0.2rem 0.4rem;
      font-size: 0.7rem;
    }

    .badge {
      font-size: 0.65rem;
      padding: 3px 6px;
    }

    .dropdown-menu {
      border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border-radius: 8px;
    }

    .dropdown-item {
      padding: 6px 12px;
      font-size: 0.75rem;
    }

    .fw-bold {
      font-size: 0.85rem;
    }

    .text-muted {
      font-size: 0.75rem;
    }

    @media (max-width: 768px) {
      .table th,
      .table td {
        font-size: 0.7rem;
        padding: 0.5rem;
      }
      
      .btn-group-sm .btn {
        padding: 0.15rem 0.3rem;
        font-size: 0.65rem;
      }
      
      .badge {
        font-size: 0.6rem;
        padding: 2px 4px;
      }
      
      .dropdown-item {
        padding: 4px 8px;
        font-size: 0.7rem;
      }
    }

    @media (max-width: 576px) {
      .table th,
      .table td {
        font-size: 0.65rem;
        padding: 0.4rem;
      }
      
      .btn-group-sm .btn {
        padding: 0.1rem 0.2rem;
        font-size: 0.6rem;
      }
      
      .badge {
        font-size: 0.55rem;
        padding: 1px 3px;
      }
      
      .dropdown-item {
        padding: 3px 6px;
        font-size: 0.65rem;
      }
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

  // Modal properties
  showModal = false;
  modalTitle = '';
  isEditMode = false;
  selectedOrder: Order | null = null;
  orderForm: any = {
    customerId: null,
    totalAmount: 0,
    status: 'pending',
    paymentMethod: 'cash',
    notes: '',
    orderItems: []
  };

  // Available customers for dropdown
  customers: any[] = [];
  products: any[] = [];

  exportOrders() {
    const csvContent = this.generateOrdersCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  generateOrdersCSV(): string {
    const headers = ['Order Number', 'Customer', 'Total Amount', 'Status', 'Payment Method', 'Order Date'];
    const rows = this.filteredOrders.map(order => [
      order.orderNumber,
      `${order.customer?.firstName} ${order.customer?.lastName}`,
      order.totalAmount,
      order.status,
      order.paymentMethod,
      this.formatDate(order.orderDate, 'short')
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  openAddModal() {
    this.modalTitle = 'Create New Order';
    this.isEditMode = false;
    this.selectedOrder = null;
    this.orderForm = {
      customerId: null,
      totalAmount: 0,
      status: 'pending',
      paymentMethod: 'cash',
      notes: '',
      orderItems: []
    };
    this.loadCustomers();
    this.loadProducts();
    this.showModal = true;
  }

  viewOrder(order: Order) {
    this.modalTitle = 'Order Details';
    this.isEditMode = false;
    this.selectedOrder = order;
    this.orderForm = {
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      orderItems: order.orderItems || []
    };
    this.showModal = true;
  }

  editOrder(order: Order) {
    this.modalTitle = 'Edit Order';
    this.isEditMode = true;
    this.selectedOrder = order;
    this.orderForm = {
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      orderItems: order.orderItems || []
    };
    this.loadCustomers();
    this.loadProducts();
    this.showModal = true;
  }

  loadCustomers() {
    this.apiService.getCustomers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.customers = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  loadProducts() {
    this.apiService.getProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  addOrderItem() {
    this.orderForm.orderItems.push({
      productId: null,
      quantity: 1,
      price: 0
    });
  }

  removeOrderItem(index: number) {
    this.orderForm.orderItems.splice(index, 1);
    this.calculateTotal();
  }

  onProductChange(item: any) {
    const product = this.products.find(p => p.id === item.productId);
    if (product) {
      item.price = product.price;
      this.calculateTotal();
    }
  }

  calculateTotal() {
    this.orderForm.totalAmount = this.orderForm.orderItems.reduce((total: number, item: any) => {
      return total + (item.quantity * item.price);
    }, 0);
  }

  saveOrder() {
    if (this.isEditMode && this.selectedOrder) {
      this.apiService.updateOrder(this.selectedOrder.id, this.orderForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.showModal = false;
            this.loadOrders();
            this.showSuccessMessage('Order updated successfully!');
          }
        },
        error: (error) => {
          console.error('Error updating order:', error);
          this.showErrorMessage('Error updating order');
        }
      });
    } else {
      this.apiService.createOrder(this.orderForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.showModal = false;
            this.loadOrders();
            this.showSuccessMessage('Order created successfully!');
          }
        },
        error: (error) => {
          console.error('Error creating order:', error);
          this.showErrorMessage('Error creating order');
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedOrder = null;
  }

  showSuccessMessage(message: string) {
    alert(message);
  }

  showErrorMessage(message: string) {
    alert(message);
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
