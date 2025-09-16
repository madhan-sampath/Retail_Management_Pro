import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

interface DashboardStats {
  today: {
    orders: number;
    revenue: number;
  };
  overall: {
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fade-in">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1 text-gradient">Dashboard</h1>
          <p class="text-muted mb-0">Welcome back! Here's what's happening with your retail business.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary">
            <i class="fas fa-download me-2"></i>Export Report
          </button>
          <button class="btn btn-primary">
            <i class="fas fa-plus me-2"></i>New Order
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4" *ngIf="stats">
        <!-- Today's Orders -->
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="dashboard-card primary">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <div class="card-value text-primary">{{ stats.today.orders }}</div>
                <div class="card-label">Today's Orders</div>
              </div>
              <div class="card-icon text-primary">
                <i class="fas fa-shopping-cart"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Today's Revenue -->
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="dashboard-card success">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <div class="card-value text-success">\${{ this.formatNumber(stats.today.revenue) }}</div>
                <div class="card-label">Today's Revenue</div>
              </div>
              <div class="card-icon text-success">
                <i class="fas fa-dollar-sign"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Products -->
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="dashboard-card info">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <div class="card-value text-info">{{ stats.overall.totalProducts }}</div>
                <div class="card-label">Total Products</div>
              </div>
              <div class="card-icon text-info">
                <i class="fas fa-box"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Customers -->
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="dashboard-card warning">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <div class="card-value text-warning">{{ stats.overall.totalCustomers }}</div>
                <div class="card-label">Total Customers</div>
              </div>
              <div class="card-icon text-warning">
                <i class="fas fa-users"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts Row -->
      <div class="row mb-4" *ngIf="stats && (stats.overall.lowStockItems > 0 || stats.overall.outOfStockItems > 0)">
        <div class="col-12">
          <div class="alert alert-warning d-flex align-items-center" role="alert">
            <i class="fas fa-exclamation-triangle me-3"></i>
            <div>
              <strong>Inventory Alert!</strong>
              <span *ngIf="stats.overall.outOfStockItems > 0">
                {{ stats.overall.outOfStockItems }} items are out of stock.
              </span>
              <span *ngIf="stats.overall.lowStockItems > 0">
                {{ stats.overall.lowStockItems }} items are running low on stock.
              </span>
              <a href="/inventory" class="alert-link ms-2">View Inventory</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Tables Row -->
      <div class="row">
        <!-- Recent Orders -->
        <div class="col-xl-8 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-clock me-2"></i>Recent Orders
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let order of recentOrders">
                      <td>
                        <strong>{{ order.orderNumber }}</strong>
                      </td>
                      <td>{{ order.customer?.firstName }} {{ order.customer?.lastName }}</td>
                      <td>\${{ this.formatNumber(order.totalAmount) }}</td>
                      <td>
                        <span [class]="'badge ' + getStatusClass(order.status)">
                          {{ this.formatTitleCase(order.status) }}
                        </span>
                      </td>
                      <td>{{ this.formatDate(order.orderDate, 'short') }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="card-footer text-center">
              <a href="/orders" class="btn btn-outline-primary btn-sm">View All Orders</a>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-xl-4 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-bolt me-2"></i>Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-primary">
                  <i class="fas fa-plus me-2"></i>New Order
                </button>
                <button class="btn btn-outline-success">
                  <i class="fas fa-box me-2"></i>Add Product
                </button>
                <button class="btn btn-outline-info">
                  <i class="fas fa-user-plus me-2"></i>Add Customer
                </button>
                <button class="btn btn-outline-warning">
                  <i class="fas fa-chart-bar me-2"></i>View Reports
                </button>
              </div>
            </div>
          </div>

          <!-- Top Products -->
          <div class="card mt-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-star me-2"></i>Top Products
              </h5>
            </div>
            <div class="card-body">
              <div *ngFor="let product of topProducts; let i = index" class="d-flex align-items-center mb-3">
                <div class="me-3">
                  <span class="badge bg-primary rounded-circle" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                    {{ i + 1 }}
                  </span>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-bold">{{ product.name }}</div>
                  <small class="text-muted">{{ product.totalSold }} sold</small>
                </div>
                <div class="text-end">
                  <div class="fw-bold">\${{ this.formatNumber(product.price) }}</div>
                </div>
              </div>
            </div>
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

    .table td {
      font-size: 0.9rem;
    }

    .badge {
      font-size: 0.75rem;
      padding: 6px 12px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentOrders: any[] = [];
  topProducts: any[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
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

  loadDashboardData() {
    this.loading = true;
    
    // Load dashboard stats
    this.apiService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });

    // Load recent orders
    this.apiService.getOrders({ limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentOrders = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading recent orders:', error);
      }
    });

    // Load top products
    this.apiService.getTopSellingProducts(5).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.topProducts = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading top products:', error);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'processing':
        return 'bg-info';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
