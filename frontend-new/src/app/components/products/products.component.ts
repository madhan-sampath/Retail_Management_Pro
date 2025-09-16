import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Product } from '../../services/api.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: any[] = [];
  loading = true;
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedStockLevel = '';
  viewMode: 'table' | 'grid' = 'table';
  showModal = false;
  modalTitle = '';
  isEditMode = false;
  productForm: any = {
    name: '',
    sku: '',
    categoryId: '',
    status: 'active',
    price: 0,
    stockQuantity: 0,
    minStockLevel: 0,
    description: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (response) => {
        this.products = response.data || [];
        this.filteredProducts = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    // Mock categories for now
    this.categories = [
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Clothing' },
      { id: 3, name: 'Books' },
      { id: 4, name: 'Home & Garden' }
    ];
  }

  searchProducts() {
    this.filterProducts();
  }

  filterProducts() {
    let filtered = [...this.products];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === parseInt(this.selectedCategory));
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(product => product.status === this.selectedStatus);
    }

    if (this.selectedStockLevel) {
      filtered = filtered.filter(product => {
        switch (this.selectedStockLevel) {
          case 'low':
            return product.stockQuantity <= product.minStockLevel;
          case 'out':
            return product.stockQuantity === 0;
          case 'in-stock':
            return product.stockQuantity > product.minStockLevel;
          default:
            return true;
        }
      });
    }

    this.filteredProducts = filtered;
  }

  setViewMode(mode: 'table' | 'grid') {
    this.viewMode = mode;
  }

  refreshProducts() {
    this.loadProducts();
  }

  exportProducts() {
    // Implementation for exporting products
    console.log('Exporting products...');
  }

  openAddModal() {
    this.modalTitle = 'Add New Product';
    this.isEditMode = true;
    this.showModal = true;
    this.productForm = {
      name: '',
      sku: '',
      categoryId: '',
      status: 'active',
      price: 0,
      stockQuantity: 0,
      minStockLevel: 0,
      description: ''
    };
  }

  editProduct(product: Product) {
    this.modalTitle = 'Edit Product';
    this.isEditMode = true;
    this.showModal = true;
    this.productForm = { ...product };
  }

  viewProduct(product: Product) {
    this.modalTitle = 'Product Details';
    this.isEditMode = false;
    this.showModal = true;
    this.productForm = { ...product };
  }

  saveProduct() {
    if (this.isEditMode) {
      if (this.productForm.id) {
        // Update existing product
        this.apiService.updateProduct(this.productForm.id, this.productForm).subscribe({
          next: () => {
            this.loadProducts();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating product:', error);
          }
        });
      } else {
        // Create new product
        this.apiService.createProduct(this.productForm).subscribe({
          next: () => {
            this.loadProducts();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating product:', error);
          }
        });
      }
    }
  }

  deleteProduct(product: Product) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.apiService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.productForm = {
      name: '',
      sku: '',
      categoryId: '',
      status: 'active',
      price: 0,
      stockQuantity: 0,
      minStockLevel: 0,
      description: ''
    };
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  formatTitleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  formatDate(value: string | Date, format: 'short' | 'medium' | 'long' = 'short'): string {
    const date = new Date(value);
    return date.toLocaleDateString();
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength);
  }
}
