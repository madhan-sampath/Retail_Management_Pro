import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Customer } from '../../services/api.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1 text-gradient">Customers</h1>
          <p class="text-muted mb-0">Manage your customer database and relationships.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="exportCustomers()">
            <i class="fas fa-download me-2"></i>Export
          </button>
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fas fa-plus me-2"></i>Add Customer
          </button>
        </div>
      </div>

      <!-- Customer Stats -->
      <div class="row mb-4" *ngIf="customerStats">
        <div class="col-xl-3 col-md-6 mb-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <div class="h4 mb-0">{{ customerStats.totalCustomers }}</div>
                  <div class="small">Total Customers</div>
                </div>
                <div class="fs-1">
                  <i class="fas fa-users"></i>
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
                  <div class="h4 mb-0">{{ customerStats.activeCustomers }}</div>
                  <div class="small">Active Customers</div>
                </div>
                <div class="fs-1">
                  <i class="fas fa-user-check"></i>
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
                  <div class="h4 mb-0">{{ customerStats.inactiveCustomers }}</div>
                  <div class="small">Inactive Customers</div>
                </div>
                <div class="fs-1">
                  <i class="fas fa-user-times"></i>
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
                  <div class="h4 mb-0">\${{ this.formatNumber(totalRevenue) }}</div>
                  <div class="small">Total Revenue</div>
                </div>
                <div class="fs-1">
                  <i class="fas fa-dollar-sign"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Search Customers</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input type="text" class="form-control" placeholder="Search by name, email, phone..."
                       [(ngModel)]="searchQuery" (input)="searchCustomers()">
              </div>
            </div>
            <div class="col-md-2">
              <label class="form-label">Status</label>
              <select class="form-select" [(ngModel)]="selectedStatus" (change)="filterCustomers()">
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">City</label>
              <select class="form-select" [(ngModel)]="selectedCity" (change)="filterCustomers()">
                <option value="">All Cities</option>
                <option *ngFor="let city of cities" [value]="city">{{ city }}</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">State</label>
              <select class="form-select" [(ngModel)]="selectedState" (change)="filterCustomers()">
                <option value="">All States</option>
                <option *ngFor="let state of states" [value]="state">{{ state }}</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Sort By</label>
              <select class="form-select" [(ngModel)]="sortBy" (change)="filterCustomers()">
                <option value="firstName">Name</option>
                <option value="createdAt">Date Added</option>
                <option value="email">Email</option>
                <option value="city">City</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Customers Table -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">
            <i class="fas fa-users me-2"></i>Customers ({{ filteredCustomers.length }})
          </h5>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" (click)="refreshCustomers()">
              <i class="fas fa-sync-alt me-1"></i>Refresh
            </button>
            <div class="btn-group" role="group">
              <button class="btn btn-outline-secondary btn-sm" [class.active]="viewMode === 'table'"
                      (click)="setViewMode('table')">
                <i class="fas fa-table"></i>
              </button>
              <button class="btn btn-outline-secondary btn-sm" [class.active]="viewMode === 'grid'"
                      (click)="setViewMode('grid')">
                <i class="fas fa-th"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading customers...</p>
          </div>

          <!-- Table View -->
          <div *ngIf="!loading && viewMode === 'table'" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let customer of filteredCustomers">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center"
                           style="width: 40px; height: 40px;">
                        {{ getInitials(customer.firstName, customer.lastName) }}
                      </div>
                      <div>
                        <div class="fw-bold">{{ customer.firstName }} {{ customer.lastName }}</div>
                        <small class="text-muted">ID: {{ customer.id }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{{ customer.email }}</div>
                    <small class="text-muted">{{ customer.phone }}</small>
                  </td>
                  <td>
                    <div>{{ customer.city }}, {{ customer.state }}</div>
                    <small class="text-muted">{{ customer.zipCode }}</small>
                  </td>
                  <td>
                    <span *ngIf="customer.company" class="badge bg-info">{{ customer.company }}</span>
                    <span *ngIf="!customer.company" class="text-muted">-</span>
                  </td>
                  <td>
                    <span [class]="'badge ' + (customer.isActive ? 'bg-success' : 'bg-secondary')">
                      {{ customer.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div>{{ this.formatDate(customer.createdAt, 'short') }}</div>
                    <small class="text-muted">{{ this.formatDate(customer.createdAt, 'medium') }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="viewCustomer(customer)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-outline-success" (click)="editCustomer(customer)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-outline-info" (click)="viewOrders(customer)">
                        <i class="fas fa-shopping-cart"></i>
                      </button>
                      <button class="btn btn-outline-warning" (click)="toggleCustomerStatus(customer)">
                        <i [class]="customer.isActive ? 'fas fa-user-times' : 'fas fa-user-check'"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="deleteCustomer(customer)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Grid View -->
          <div *ngIf="!loading && viewMode === 'grid'" class="row p-3">
            <div class="col-xl-3 col-lg-4 col-md-6 mb-4" *ngFor="let customer of filteredCustomers">
              <div class="card h-100">
                <div class="card-body text-center">
                  <div class="avatar bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                       style="width: 60px; height: 60px; font-size: 1.2rem;">
                    {{ getInitials(customer.firstName, customer.lastName) }}
                  </div>
                  <h6 class="card-title">{{ customer.firstName }} {{ customer.lastName }}</h6>
                  <p class="text-muted small mb-3">{{ customer.email }}</p>
                  
                  <div class="mb-3">
                    <div class="d-flex justify-content-between small">
                      <span class="text-muted">Phone:</span>
                      <span>{{ customer.phone }}</span>
                    </div>
                    <div class="d-flex justify-content-between small">
                      <span class="text-muted">Location:</span>
                      <span>{{ customer.city }}, {{ customer.state }}</span>
                    </div>
                    <div class="d-flex justify-content-between small" *ngIf="customer.company">
                      <span class="text-muted">Company:</span>
                      <span>{{ customer.company }}</span>
                    </div>
                  </div>

                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span [class]="'badge ' + (customer.isActive ? 'bg-success' : 'bg-secondary')">
                      {{ customer.isActive ? 'Active' : 'Inactive' }}
                    </span>
                    <small class="text-muted">{{ this.formatDate(customer.createdAt, 'short') }}</small>
                  </div>

                  <div class="btn-group btn-group-sm w-100">
                    <button class="btn btn-outline-primary" (click)="viewCustomer(customer)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" (click)="editCustomer(customer)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" (click)="viewOrders(customer)">
                      <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="btn btn-outline-warning" (click)="toggleCustomerStatus(customer)">
                      <i [class]="customer.isActive ? 'fas fa-user-times' : 'fas fa-user-check'"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && filteredCustomers.length === 0" class="text-center py-5">
            <i class="fas fa-users fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No customers found</h5>
            <p class="text-muted">Try adjusting your search criteria or add a new customer.</p>
            <button class="btn btn-primary" (click)="openAddModal()">
              <i class="fas fa-plus me-2"></i>Add Customer
            </button>
          </div>
        </div>
      </div>

      <!-- Customer Modal -->
      <div *ngIf="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ modalTitle }}</h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">First Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="customerForm.firstName" 
                           name="firstName" required [readonly]="!isEditMode && modalTitle === 'Customer Details'">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Last Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="customerForm.lastName" 
                           name="lastName" required [readonly]="!isEditMode && modalTitle === 'Customer Details'">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-control" [(ngModel)]="customerForm.email" 
                           name="email" required [readonly]="!isEditMode && modalTitle === 'Customer Details'">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Phone</label>
                    <input type="tel" class="form-control" [(ngModel)]="customerForm.phone" 
                           name="phone" [readonly]="!isEditMode && modalTitle === 'Customer Details'">
                  </div>
                  <div class="col-12">
                    <label class="form-label">Address</label>
                    <input type="text" class="form-control" [(ngModel)]="customerForm.address" 
                           name="address" [readonly]="!isEditMode && modalTitle === 'Customer Details'">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">City</label>
                    <input type="text" class="form-control" [(ngModel)]="customerForm.city" 
                           name="city" [readonly]="!isEditMode && modalTitle === 'Customer Details'">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">State</label>
                    <input type="text" class="form-control" [(ngModel)]="customerForm.state" 
                           name="state" [readonly]="!isEditMode && modalTitle === 'Customer Details'">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Zip Code</label>
                    <input type="text" class="form-control" [(ngModel)]="customerForm.zipCode" 
                           name="zipCode" [readonly]="!isEditMode && modalTitle === 'Customer Details'">
                  </div>
                  <div class="col-12">
                    <label class="form-label">Company</label>
                    <input type="text" class="form-control" [(ngModel)]="customerForm.company" 
                           name="company" [readonly]="!isEditMode && modalTitle === 'Customer Details'">
                  </div>
                  <div class="col-12">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="customerForm.isActive" 
                             name="isActive" [disabled]="!isEditMode && modalTitle === 'Customer Details'">
                      <label class="form-check-label">
                        Active Customer
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Close</button>
              <button *ngIf="isEditMode" type="button" class="btn btn-primary" (click)="saveCustomer()">
                <i class="fas fa-save me-2"></i>Save Changes
              </button>
              <button *ngIf="!isEditMode && modalTitle !== 'Customer Details'" type="button" class="btn btn-success" (click)="saveCustomer()">
                <i class="fas fa-plus me-2"></i>Create Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Orders Modal -->
      <div *ngIf="showOrdersModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Orders for {{ selectedCustomer?.firstName }} {{ selectedCustomer?.lastName }}</h5>
              <button type="button" class="btn-close" (click)="closeOrdersModal()"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="customerOrders.length === 0" class="text-center py-4">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h6 class="text-muted">No orders found for this customer</h6>
              </div>
              
              <div *ngIf="customerOrders.length > 0" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let order of customerOrders">
                      <td>
                        <div class="fw-bold">{{ order.orderNumber }}</div>
                        <small class="text-muted">ID: {{ order.id }}</small>
                      </td>
                      <td>
                        <div class="fw-bold">\${{ formatNumber(order.totalAmount) }}</div>
                      </td>
                      <td>
                        <span [class]="'badge ' + getStatusClass(order.status)">
                          {{ formatTitleCase(order.status) }}
                        </span>
                      </td>
                      <td>
                        <span class="badge bg-secondary">{{ formatTitleCase(order.paymentMethod) }}</span>
                      </td>
                      <td>
                        <div>{{ formatDate(order.orderDate, 'short') }}</div>
                        <small class="text-muted">{{ formatDate(order.orderDate, 'medium') }}</small>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeOrdersModal()">Close</button>
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
      font-weight: 600;
      font-size: 0.7rem;
    }

    .btn-group-sm .btn {
      padding: 0.2rem 0.4rem;
      font-size: 0.7rem;
    }

    .badge {
      font-size: 0.65rem;
      padding: 3px 6px;
    }

    .fw-bold {
      font-size: 0.85rem;
    }

    .text-muted {
      font-size: 0.75rem;
    }

    .small {
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
      
      .avatar {
        font-size: 0.65rem;
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
      
      .avatar {
        font-size: 0.6rem;
      }
    }
  `]
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  customerStats: any = null;
  loading = true;
  viewMode: 'table' | 'grid' = 'table';
  totalRevenue = 0;
  
  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedCity = '';
  selectedState = '';
  sortBy = 'firstName';
  
  cities: string[] = [];
  states: string[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCustomers();
    this.loadCustomerStats();
  }

  formatNumber(value: number): string {
    return value.toFixed(2);
  }

  formatDate(date: string | Date, format: 'short' | 'medium' = 'short'): string {
    const d = new Date(date);
    if (format === 'short') {
      return d.toLocaleDateString();
    } else {
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    }
  }

  loadCustomers() {
    this.loading = true;
    this.apiService.getCustomers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.customers = response.data;
          this.filteredCustomers = [...this.customers];
          this.extractCitiesAndStates();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }

  loadCustomerStats() {
    this.apiService.getCustomerStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.customerStats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading customer stats:', error);
      }
    });
  }

  extractCitiesAndStates() {
    const citySet = new Set<string>();
    const stateSet = new Set<string>();
    
    this.customers.forEach(customer => {
      if (customer.city) citySet.add(customer.city);
      if (customer.state) stateSet.add(customer.state);
    });
    
    this.cities = Array.from(citySet).sort();
    this.states = Array.from(stateSet).sort();
  }

  searchCustomers() {
    if (!this.searchQuery.trim()) {
      this.filteredCustomers = [...this.customers];
    } else {
      this.apiService.searchCustomers(this.searchQuery).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.filteredCustomers = response.data;
          }
        },
        error: (error) => {
          console.error('Error searching customers:', error);
        }
      });
    }
  }

  filterCustomers() {
    this.filteredCustomers = this.customers.filter(customer => {
      let matches = true;

      if (this.selectedStatus && customer.isActive.toString() !== this.selectedStatus) {
        matches = false;
      }

      if (this.selectedCity && customer.city !== this.selectedCity) {
        matches = false;
      }

      if (this.selectedState && customer.state !== this.selectedState) {
        matches = false;
      }

      return matches;
    });

    // Sort customers
    this.filteredCustomers.sort((a, b) => {
      const aValue = a[this.sortBy as keyof Customer];
      const bValue = b[this.sortBy as keyof Customer];
      
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
  }

  setViewMode(mode: 'table' | 'grid') {
    this.viewMode = mode;
  }

  refreshCustomers() {
    this.loadCustomers();
  }

  // Modal properties
  showModal = false;
  modalTitle = '';
  isEditMode = false;
  selectedCustomer: Customer | null = null;
  customerForm: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    company: '',
    isActive: true
  };

  // Customer orders for view
  customerOrders: any[] = [];
  showOrdersModal = false;

  exportCustomers() {
    const csvContent = this.generateCustomersCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  generateCustomersCSV(): string {
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip Code', 'Company', 'Status', 'Created Date'];
    const rows = this.filteredCustomers.map(customer => [
      `${customer.firstName} ${customer.lastName}`,
      customer.email,
      customer.phone,
      customer.address,
      customer.city,
      customer.state,
      customer.zipCode,
      customer.company || '',
      customer.isActive ? 'Active' : 'Inactive',
      this.formatDate(customer.createdAt, 'short')
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  openAddModal() {
    this.modalTitle = 'Add New Customer';
    this.isEditMode = false;
    this.selectedCustomer = null;
    this.customerForm = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      company: '',
      isActive: true
    };
    this.showModal = true;
  }

  viewCustomer(customer: Customer) {
    this.modalTitle = 'Customer Details';
    this.isEditMode = false;
    this.selectedCustomer = customer;
    this.customerForm = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      company: customer.company,
      isActive: customer.isActive
    };
    this.showModal = true;
  }

  editCustomer(customer: Customer) {
    this.modalTitle = 'Edit Customer';
    this.isEditMode = true;
    this.selectedCustomer = customer;
    this.customerForm = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      company: customer.company,
      isActive: customer.isActive
    };
    this.showModal = true;
  }

  viewOrders(customer: Customer) {
    this.selectedCustomer = customer;
    this.loadCustomerOrders(customer.id);
    this.showOrdersModal = true;
  }

  loadCustomerOrders(customerId: number) {
    this.apiService.getOrders({ customerId }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.customerOrders = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading customer orders:', error);
      }
    });
  }

  saveCustomer() {
    if (this.isEditMode && this.selectedCustomer) {
      this.apiService.updateCustomer(this.selectedCustomer.id, this.customerForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.showModal = false;
            this.loadCustomers();
            this.loadCustomerStats();
            this.showSuccessMessage('Customer updated successfully!');
          }
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          this.showErrorMessage('Error updating customer');
        }
      });
    } else {
      this.apiService.createCustomer(this.customerForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.showModal = false;
            this.loadCustomers();
            this.loadCustomerStats();
            this.showSuccessMessage('Customer created successfully!');
          }
        },
        error: (error) => {
          console.error('Error creating customer:', error);
          this.showErrorMessage('Error creating customer');
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedCustomer = null;
  }

  closeOrdersModal() {
    this.showOrdersModal = false;
    this.selectedCustomer = null;
    this.customerOrders = [];
  }

  showSuccessMessage(message: string) {
    alert(message);
  }

  showErrorMessage(message: string) {
    alert(message);
  }

  toggleCustomerStatus(customer: Customer) {
    const newStatus = !customer.isActive;
    this.apiService.updateCustomerStatus(customer.id, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          customer.isActive = newStatus;
          this.loadCustomerStats();
        }
      },
      error: (error) => {
        console.error('Error updating customer status:', error);
      }
    });
  }

  deleteCustomer(customer: Customer) {
    if (confirm(`Are you sure you want to delete "${customer.firstName} ${customer.lastName}"?`)) {
      this.apiService.deleteCustomer(customer.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadCustomers();
            this.loadCustomerStats();
          }
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
        }
      });
    }
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  formatTitleCase(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
