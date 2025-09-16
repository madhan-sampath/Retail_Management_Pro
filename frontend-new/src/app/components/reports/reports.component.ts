import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1 text-gradient">Reports & Analytics</h1>
          <p class="text-muted mb-0">Analyze your business performance with detailed reports.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="exportReport()">
            <i class="fas fa-download me-2"></i>Export Report
          </button>
          <button class="btn btn-primary" (click)="refreshReports()">
            <i class="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      <!-- Date Range Selector -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Start Date</label>
              <input type="date" class="form-control" [(ngModel)]="startDate" (change)="updateReports()">
            </div>
            <div class="col-md-3">
              <label class="form-label">End Date</label>
              <input type="date" class="form-control" [(ngModel)]="endDate" (change)="updateReports()">
            </div>
            <div class="col-md-3">
              <label class="form-label">Report Type</label>
              <select class="form-select" [(ngModel)]="selectedReportType" (change)="loadReport()">
                <option value="sales">Sales Report</option>
                <option value="inventory">Inventory Report</option>
                <option value="customers">Customer Report</option>
                <option value="products">Product Report</option>
                <option value="revenue">Revenue Report</option>
              </select>
            </div>
            <div class="col-md-3 d-flex align-items-end">
              <button class="btn btn-primary w-100" (click)="loadReport()">
                <i class="fas fa-chart-bar me-2"></i>Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Stats -->
      <div class="row mb-4" *ngIf="dashboardStats">
        <div class="col-xl-3 col-md-6 mb-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <div class="h4 mb-0">{{ dashboardStats.today.orders }}</div>
                  <div class="small">Today's Orders</div>
                </div>
                <div class="fs-1">
                  <i class="fas fa-shopping-cart"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6 mb-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <div class="h4 mb-0">\${{ formatNumber(dashboardStats.today.revenue) }}</div>
                  <div class="small">Today's Revenue</div>
                </div>
                <div class="fs-1">
                  <i class="fas fa-dollar-sign"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6 mb-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <div class="h4 mb-0">{{ dashboardStats.overall.lowStockItems }}</div>
                  <div class="small">Low Stock Items</div>
                </div>
                <div class="fs-1">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6 mb-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <div class="h4 mb-0">{{ dashboardStats.overall.totalCustomers }}</div>
                  <div class="small">Total Customers</div>
                </div>
                <div class="fs-1">
                  <i class="fas fa-users"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Content -->
      <div class="row">
        <!-- Sales Report -->
        <div class="col-12" *ngIf="selectedReportType === 'sales' && salesReport">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-line me-2"></i>Sales Report
                <span class="badge bg-primary ms-2">{{ this.formatDate(salesReport.period.startDate, 'short') }} - {{ this.formatDate(salesReport.period.endDate, 'short') }}</span>
              </h5>
            </div>
            <div class="card-body">
              <div class="row mb-4">
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-primary">{{ salesReport.totalOrders }}</div>
                    <div class="text-muted">Total Orders</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-success">{{ salesReport.completedOrders }}</div>
                    <div class="text-muted">Completed Orders</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-info">\${{ formatNumber(salesReport.totalRevenue) }}</div>
                    <div class="text-muted">Total Revenue</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-warning">\${{ formatNumber(salesReport.averageOrderValue) }}</div>
                    <div class="text-muted">Avg Order Value</div>
                  </div>
                </div>
              </div>

              <!-- Top Products -->
              <div class="row">
                <div class="col-12">
                  <h6 class="mb-3">Top Selling Products</h6>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity Sold</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let product of salesReport.topProducts">
                          <td>{{ product.productName }}</td>
                          <td>{{ product.quantity }}</td>
                          <td>\${{ formatNumber(product.revenue) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory Report -->
        <div class="col-12" *ngIf="selectedReportType === 'inventory' && inventoryReport">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-warehouse me-2"></i>Inventory Report
              </h5>
            </div>
            <div class="card-body">
              <div class="row mb-4">
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-primary">{{ inventoryReport.totalItems }}</div>
                    <div class="text-muted">Total Items</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-success">\${{ formatNumber(inventoryReport.totalValue) }}</div>
                    <div class="text-muted">Total Value</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-warning">{{ inventoryReport.lowStockCount }}</div>
                    <div class="text-muted">Low Stock Items</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-danger">{{ inventoryReport.outOfStockCount }}</div>
                    <div class="text-muted">Out of Stock</div>
                  </div>
                </div>
              </div>

              <!-- Low Stock Items -->
              <div class="row" *ngIf="inventoryReport.lowStockItems.length > 0">
                <div class="col-12">
                  <h6 class="mb-3 text-warning">Low Stock Items</h6>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Current Stock</th>
                          <th>Min Level</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let item of inventoryReport.lowStockItems">
                          <td>{{ item.product?.name }}</td>
                          <td>{{ item.currentStock }}</td>
                          <td>{{ item.minStockLevel }}</td>
                          <td>
                            <span class="badge bg-warning">Low Stock</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Report -->
        <div class="col-12" *ngIf="selectedReportType === 'customers' && customerReport">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-users me-2"></i>Customer Report
                <span class="badge bg-primary ms-2">{{ this.formatDate(customerReport.period.startDate, 'short') }} - {{ this.formatDate(customerReport.period.endDate, 'short') }}</span>
              </h5>
            </div>
            <div class="card-body">
              <div class="row mb-4">
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-primary">{{ customerReport.totalCustomers }}</div>
                    <div class="text-muted">Total Customers</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-success">{{ customerReport.activeCustomers }}</div>
                    <div class="text-muted">Active Customers</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-info">\${{ formatNumber(customerReport.totalRevenue) }}</div>
                    <div class="text-muted">Total Revenue</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h3 text-warning">\${{ formatNumber(customerReport.averageOrderValue) }}</div>
                    <div class="text-muted">Avg Order Value</div>
                  </div>
                </div>
              </div>

              <!-- Top Customers -->
              <div class="row">
                <div class="col-12">
                  <h6 class="mb-3">Top Customers</h6>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Orders</th>
                          <th>Total Spent</th>
                          <th>Avg Order Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let customer of customerReport.topCustomers">
                          <td>{{ customer.firstName }} {{ customer.lastName }}</td>
                          <td>{{ customer.orderCount }}</td>
                          <td>\${{ formatNumber(customer.totalSpent) }}</td>
                          <td>\${{ formatNumber(customer.averageOrderValue) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Report -->
        <div class="col-12" *ngIf="selectedReportType === 'revenue' && revenueReport">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-area me-2"></i>Revenue Report
                <span class="badge bg-primary ms-2">{{ this.formatDate(revenueReport.period.startDate, 'short') }} - {{ this.formatDate(revenueReport.period.endDate, 'short') }}</span>
              </h5>
            </div>
            <div class="card-body">
              <div class="row mb-4">
                <div class="col-md-4">
                  <div class="text-center">
                    <div class="h3 text-success">\${{ formatNumber(revenueReport.totalRevenue) }}</div>
                    <div class="text-muted">Total Revenue</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="text-center">
                    <div class="h3 text-info">\${{ formatNumber(revenueReport.averageDailyRevenue) }}</div>
                    <div class="text-muted">Avg Daily Revenue</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="text-center">
                    <div class="h3 text-primary">{{ revenueReport.totalOrders }}</div>
                    <div class="text-muted">Total Orders</div>
                  </div>
                </div>
              </div>

              <!-- Revenue by Payment Method -->
              <div class="row">
                <div class="col-12">
                  <h6 class="mb-3">Revenue by Payment Method</h6>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Payment Method</th>
                          <th>Amount</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let method of getPaymentMethods()">
                          <td>{{ formatTitleCase(method.name) }}</td>
                          <td>\${{ formatNumber(method.amount) }}</td>
                          <td>{{ formatPercentage(method.amount, revenueReport.totalRevenue) }}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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

    .badge {
      font-size: 0.65rem;
      padding: 3px 6px;
    }

    .h3 {
      font-size: 1.5rem;
    }

    .h4 {
      font-size: 1.25rem;
    }

    .small {
      font-size: 0.75rem;
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
      
      .badge {
        font-size: 0.6rem;
        padding: 2px 4px;
      }
      
      .h3 {
        font-size: 1.25rem;
      }
      
      .h4 {
        font-size: 1.125rem;
      }
    }

    @media (max-width: 576px) {
      .table th,
      .table td {
        font-size: 0.65rem;
        padding: 0.4rem;
      }
      
      .badge {
        font-size: 0.55rem;
        padding: 1px 3px;
      }
      
      .h3 {
        font-size: 1rem;
      }
      
      .h4 {
        font-size: 0.875rem;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  startDate = '';
  endDate = '';
  selectedReportType = 'sales';
  
  dashboardStats: any = null;
  salesReport: any = null;
  inventoryReport: any = null;
  customerReport: any = null;
  revenueReport: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    this.startDate = startDate.toISOString().split('T')[0];
    this.endDate = endDate.toISOString().split('T')[0];
    
    this.loadDashboardStats();
    this.loadReport();
  }

  loadDashboardStats() {
    this.apiService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboardStats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  loadReport() {
    if (!this.startDate || !this.endDate) {
      return;
    }

    switch (this.selectedReportType) {
      case 'sales':
        this.loadSalesReport();
        break;
      case 'inventory':
        this.loadInventoryReport();
        break;
      case 'customers':
        this.loadCustomerReport();
        break;
      case 'products':
        this.loadProductReport();
        break;
      case 'revenue':
        this.loadRevenueReport();
        break;
    }
  }

  loadSalesReport() {
    this.apiService.getSalesReport(this.startDate, this.endDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.salesReport = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading sales report:', error);
      }
    });
  }

  loadInventoryReport() {
    this.apiService.getInventoryReport().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.inventoryReport = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading inventory report:', error);
      }
    });
  }

  loadCustomerReport() {
    this.apiService.getCustomerReport(this.startDate, this.endDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.customerReport = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading customer report:', error);
      }
    });
  }

  loadProductReport() {
    this.apiService.getProductReport(this.startDate, this.endDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Handle product report data
          console.log('Product report:', response.data);
        }
      },
      error: (error) => {
        console.error('Error loading product report:', error);
      }
    });
  }

  loadRevenueReport() {
    this.apiService.getRevenueReport(this.startDate, this.endDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.revenueReport = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading revenue report:', error);
      }
    });
  }

  updateReports() {
    this.loadReport();
  }

  refreshReports() {
    this.loadDashboardStats();
    this.loadReport();
  }

  exportReport() {
    const reportData = this.getCurrentReportData();
    if (!reportData) {
      alert('No report data available to export');
      return;
    }

    const csvContent = this.generateReportCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.selectedReportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getCurrentReportData(): any {
    switch (this.selectedReportType) {
      case 'sales':
        return this.salesReport;
      case 'inventory':
        return this.inventoryReport;
      case 'customers':
        return this.customerReport;
      case 'revenue':
        return this.revenueReport;
      default:
        return null;
    }
  }

  generateReportCSV(reportData: any): string {
    let headers: string[] = [];
    let rows: any[] = [];

    switch (this.selectedReportType) {
      case 'sales':
        headers = ['Product', 'Quantity Sold', 'Revenue'];
        rows = reportData.topProducts || [];
        break;
      case 'inventory':
        headers = ['Product', 'Current Stock', 'Min Level', 'Status'];
        rows = reportData.lowStockItems || [];
        break;
      case 'customers':
        headers = ['Customer', 'Orders', 'Total Spent', 'Avg Order Value'];
        rows = reportData.topCustomers || [];
        break;
      case 'revenue':
        headers = ['Payment Method', 'Amount', 'Percentage'];
        const paymentMethods = this.getPaymentMethods();
        rows = paymentMethods.map(method => ({
          name: method.name,
          amount: method.amount,
          percentage: this.formatPercentage(method.amount, reportData.totalRevenue)
        }));
        break;
      default:
        return '';
    }

    const csvRows = [headers, ...rows.map(row => 
      headers.map(header => {
        const key = this.getKeyFromHeader(header);
        return `"${row[key] || ''}"`;
      })
    )];

    return csvRows.map(row => row.join(',')).join('\n');
  }

  getKeyFromHeader(header: string): string {
    const keyMap: { [key: string]: string } = {
      'Product': 'productName',
      'Quantity Sold': 'quantity',
      'Revenue': 'revenue',
      'Current Stock': 'currentStock',
      'Min Level': 'minStockLevel',
      'Status': 'status',
      'Customer': 'firstName',
      'Orders': 'orderCount',
      'Total Spent': 'totalSpent',
      'Avg Order Value': 'averageOrderValue',
      'Payment Method': 'name',
      'Amount': 'amount',
      'Percentage': 'percentage'
    };
    return keyMap[header] || header.toLowerCase().replace(/\s+/g, '');
  }

  getPaymentMethods() {
    if (!this.revenueReport || !this.revenueReport.byMethod) {
      return [];
    }
    
    return Object.entries(this.revenueReport.byMethod).map(([name, amount]) => ({
      name,
      amount: amount as number
    }));
  }

  formatNumber(value: number): string {
    return value.toFixed(2);
  }

  formatPercentage(amount: number, total: number): string {
    if (total === 0) return '0.0';
    return ((amount / total) * 100).toFixed(1);
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
}
