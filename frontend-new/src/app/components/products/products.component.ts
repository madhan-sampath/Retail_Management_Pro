import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Product } from '../../services/api.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1 text-gradient">Products</h1>
          <p class="text-muted mb-0">Manage your product inventory and catalog.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="exportProducts()">
            <i class="fas fa-download me-2"></i>Export
          </button>
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fas fa-plus me-2"></i>Add Product
          </button>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Search Products</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input type="text" class="form-control" placeholder="Search by name, SKU, or description..."
                       [(ngModel)]="searchQuery" (input)="searchProducts()">
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">Category</label>
              <select class="form-select" [(ngModel)]="selectedCategory" (change)="filterProducts()">
                <option value="">All Categories</option>
                <option value="1">Electronics</option>
                <option value="2">Clothing</option>
                <option value="3">Home & Garden</option>
                <option value="4">Books</option>
                <option value="5">Sports</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Status</label>
              <select class="form-select" [(ngModel)]="selectedStatus" (change)="filterProducts()">
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Stock Level</label>
              <select class="form-select" [(ngModel)]="stockFilter" (change)="filterProducts()">
                <option value="">All</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">
            <i class="fas fa-box me-2"></i>Products ({{ filteredProducts.length }})
          </h5>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" (click)="refreshProducts()">
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
            <p class="mt-2 text-muted">Loading products...</p>
          </div>

          <!-- Table View -->
          <div *ngIf="!loading && viewMode === 'table'" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of filteredProducts">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="product-image me-3">
                        <div class="bg-light rounded d-flex align-items-center justify-content-center"
                             style="width: 50px; height: 50px;">
                          <i class="fas fa-box text-muted"></i>
                        </div>
                      </div>
                      <div>
                        <div class="fw-bold">{{ product.name }}</div>
                        <small class="text-muted">{{ this.truncateText(product.description, 50) }}...</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code>{{ product.sku }}</code>
                  </td>
                  <td>
                    <span class="badge bg-info">{{ product.category?.name || 'N/A' }}</span>
                  </td>
                  <td>
                    <div class="fw-bold">\${{ this.formatNumber(product.price) }}</div>
                    <small class="text-muted">Cost: \${{ this.formatNumber(product.cost) }}</small>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <span class="me-2">{{ product.stockQuantity }}</span>
                      <span *ngIf="product.stockQuantity <= product.minStockLevel" 
                            class="badge bg-warning">Low</span>
                      <span *ngIf="product.stockQuantity === 0" 
                            class="badge bg-danger">Out</span>
                    </div>
                  </td>
                  <td>
                    <span [class]="'badge ' + (product.isActive ? 'bg-success' : 'bg-secondary')">
                      {{ product.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="editProduct(product)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-outline-info" (click)="viewProduct(product)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="deleteProduct(product)">
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
            <div class="col-xl-3 col-lg-4 col-md-6 mb-4" *ngFor="let product of filteredProducts">
              <div class="card h-100">
                <div class="card-body">
                  <div class="text-center mb-3">
                    <div class="product-image mx-auto mb-3">
                      <div class="bg-light rounded d-flex align-items-center justify-content-center"
                           style="width: 80px; height: 80px;">
                        <i class="fas fa-box text-muted fa-2x"></i>
                      </div>
                    </div>
                    <h6 class="card-title">{{ product.name }}</h6>
                    <p class="text-muted small">{{ this.truncateText(product.description, 60) }}...</p>
                  </div>
                  <div class="mb-3">
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">SKU:</span>
                      <code>{{ product.sku }}</code>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Price:</span>
                      <strong>\${{ this.formatNumber(product.price) }}</strong>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Stock:</span>
                      <span [class]="product.stockQuantity <= product.minStockLevel ? 'text-warning' : 'text-success'">
                        {{ product.stockQuantity }}
                      </span>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <span [class]="'badge ' + (product.isActive ? 'bg-success' : 'bg-secondary')">
                      {{ product.isActive ? 'Active' : 'Inactive' }}
                    </span>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="editProduct(product)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-outline-info" (click)="viewProduct(product)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="deleteProduct(product)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && filteredProducts.length === 0" class="text-center py-5">
            <i class="fas fa-box fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No products found</h5>
            <p class="text-muted">Try adjusting your search criteria or add a new product.</p>
            <button class="btn btn-primary" (click)="openAddModal()">
              <i class="fas fa-plus me-2"></i>Add Product
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-image {
      border-radius: 8px;
    }

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

    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }

    .badge {
      font-size: 0.75rem;
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  viewMode: 'table' | 'grid' = 'table';
  
  // Filters
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  stockFilter = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadProducts();
  }

  formatNumber(value: number): string {
    return value.toFixed(2);
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) : text;
  }

  loadProducts() {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products = response.data;
          this.filteredProducts = [...this.products];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  searchProducts() {
    if (!this.searchQuery.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      this.apiService.searchProducts(this.searchQuery).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.filteredProducts = response.data;
          }
        },
        error: (error) => {
          console.error('Error searching products:', error);
        }
      });
    }
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      let matches = true;

      if (this.selectedCategory && product.categoryId !== parseInt(this.selectedCategory)) {
        matches = false;
      }

      if (this.selectedStatus && product.isActive.toString() !== this.selectedStatus) {
        matches = false;
      }

      if (this.stockFilter === 'low' && product.stockQuantity > product.minStockLevel) {
        matches = false;
      }

      if (this.stockFilter === 'out' && product.stockQuantity > 0) {
        matches = false;
      }

      return matches;
    });
  }

  setViewMode(mode: 'table' | 'grid') {
    this.viewMode = mode;
  }

  refreshProducts() {
    this.loadProducts();
  }

  exportProducts() {
    // Implementation for exporting products
    console.log('Export products functionality');
  }

  openAddModal() {
    // Implementation for opening add product modal
    console.log('Open add product modal');
  }

  editProduct(product: Product) {
    // Implementation for editing product
    console.log('Edit product:', product);
  }

  viewProduct(product: Product) {
    // Implementation for viewing product details
    console.log('View product:', product);
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.apiService.deleteProduct(product.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadProducts();
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }
}
