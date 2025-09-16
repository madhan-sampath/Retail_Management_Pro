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

      <!-- Product Modal -->
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
                    <label class="form-label">Product Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="productForm.name" 
                           name="name" required [readonly]="!isEditMode && modalTitle === 'Product Details'">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">SKU *</label>
                    <input type="text" class="form-control" [(ngModel)]="productForm.sku" 
                           name="sku" required [readonly]="!isEditMode && modalTitle === 'Product Details'">
                  </div>
                  <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="3" [(ngModel)]="productForm.description" 
                              name="description" [readonly]="!isEditMode && modalTitle === 'Product Details'"></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Barcode</label>
                    <input type="text" class="form-control" [(ngModel)]="productForm.barcode" 
                           name="barcode" [readonly]="!isEditMode && modalTitle === 'Product Details'">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Category</label>
                    <select class="form-select" [(ngModel)]="productForm.categoryId" 
                            name="categoryId" [disabled]="!isEditMode && modalTitle === 'Product Details'">
                      <option *ngFor="let category of categories" [value]="category.id">
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Price *</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input type="number" class="form-control" [(ngModel)]="productForm.price" 
                             name="price" step="0.01" required [readonly]="!isEditMode && modalTitle === 'Product Details'">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Cost</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input type="number" class="form-control" [(ngModel)]="productForm.cost" 
                             name="cost" step="0.01" [readonly]="!isEditMode && modalTitle === 'Product Details'">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Stock Quantity</label>
                    <input type="number" class="form-control" [(ngModel)]="productForm.stockQuantity" 
                           name="stockQuantity" [readonly]="!isEditMode && modalTitle === 'Product Details'">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Min Stock Level</label>
                    <input type="number" class="form-control" [(ngModel)]="productForm.minStockLevel" 
                           name="minStockLevel" [readonly]="!isEditMode && modalTitle === 'Product Details'">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Max Stock Level</label>
                    <input type="number" class="form-control" [(ngModel)]="productForm.maxStockLevel" 
                           name="maxStockLevel" [readonly]="!isEditMode && modalTitle === 'Product Details'">
                  </div>
                  <div class="col-12">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="productForm.isActive" 
                             name="isActive" [disabled]="!isEditMode && modalTitle === 'Product Details'">
                      <label class="form-check-label">
                        Active Product
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Close</button>
              <button *ngIf="isEditMode" type="button" class="btn btn-primary" (click)="saveProduct()">
                <i class="fas fa-save me-2"></i>Save Changes
              </button>
              <button *ngIf="!isEditMode && modalTitle !== 'Product Details'" type="button" class="btn btn-success" (click)="saveProduct()">
                <i class="fas fa-plus me-2"></i>Create Product
              </button>
            </div>
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

  // Modal properties
  showModal = false;
  modalTitle = '';
  isEditMode = false;
  selectedProduct: Product | null = null;
  productForm: any = {
    name: '',
    description: '',
    sku: '',
    barcode: '',
    price: 0,
    cost: 0,
    categoryId: 1,
    supplierId: 1,
    stockQuantity: 0,
    minStockLevel: 0,
    maxStockLevel: 100,
    isActive: true
  };

  // Categories for dropdown
  categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Home & Garden' },
    { id: 4, name: 'Books' },
    { id: 5, name: 'Sports' }
  ];

  exportProducts() {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  generateCSV(): string {
    const headers = ['Name', 'SKU', 'Description', 'Price', 'Cost', 'Stock', 'Category', 'Status'];
    const rows = this.filteredProducts.map(product => [
      product.name,
      product.sku,
      product.description,
      product.price,
      product.cost,
      product.stockQuantity,
      product.category?.name || 'N/A',
      product.isActive ? 'Active' : 'Inactive'
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  openAddModal() {
    this.modalTitle = 'Add New Product';
    this.isEditMode = false;
    this.selectedProduct = null;
    this.productForm = {
      name: '',
      description: '',
      sku: '',
      barcode: '',
      price: 0,
      cost: 0,
      categoryId: 1,
      supplierId: 1,
      stockQuantity: 0,
      minStockLevel: 0,
      maxStockLevel: 100,
      isActive: true
    };
    this.showModal = true;
  }

  editProduct(product: Product) {
    this.modalTitle = 'Edit Product';
    this.isEditMode = true;
    this.selectedProduct = product;
    this.productForm = {
      name: product.name,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode,
      price: product.price,
      cost: product.cost,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      isActive: product.isActive
    };
    this.showModal = true;
  }

  viewProduct(product: Product) {
    this.modalTitle = 'Product Details';
    this.isEditMode = false;
    this.selectedProduct = product;
    this.productForm = {
      name: product.name,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode,
      price: product.price,
      cost: product.cost,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      isActive: product.isActive
    };
    this.showModal = true;
  }

  saveProduct() {
    if (this.isEditMode && this.selectedProduct) {
      this.apiService.updateProduct(this.selectedProduct.id, this.productForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.showModal = false;
            this.loadProducts();
            this.showSuccessMessage('Product updated successfully!');
          }
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.showErrorMessage('Error updating product');
        }
      });
    } else {
      this.apiService.createProduct(this.productForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.showModal = false;
            this.loadProducts();
            this.showSuccessMessage('Product created successfully!');
          }
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.showErrorMessage('Error creating product');
        }
      });
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.apiService.deleteProduct(product.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadProducts();
            this.showSuccessMessage('Product deleted successfully!');
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.showErrorMessage('Error deleting product');
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedProduct = null;
  }

  showSuccessMessage(message: string) {
    // You can implement a toast notification here
    alert(message);
  }

  showErrorMessage(message: string) {
    // You can implement a toast notification here
    alert(message);
  }
}
