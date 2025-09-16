import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Customer } from '../../services/api.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  cities: string[] = [];
  loading = true;
  searchQuery = '';
  selectedStatus = '';
  selectedCity = '';
  sortBy = 'firstName';
  viewMode: 'table' | 'grid' = 'table';
  showModal = false;
  modalTitle = '';
  isEditMode = false;
  customerForm: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    address: '',
    status: 'active',
    dateOfBirth: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.apiService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response.data || [];
        this.filteredCustomers = response.data || [];
        this.extractCities();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }

  extractCities() {
    this.cities = [...new Set(this.customers.map(customer => customer.city).filter(city => city))];
  }

  searchCustomers() {
    this.filterCustomers();
  }

  filterCustomers() {
    let filtered = [...this.customers];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.firstName.toLowerCase().includes(query) ||
        customer.lastName.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.phone && customer.phone.includes(query))
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(customer => customer.status === this.selectedStatus);
    }

    if (this.selectedCity) {
      filtered = filtered.filter(customer => customer.city === this.selectedCity);
    }

    this.filteredCustomers = filtered;
    this.sortCustomers();
  }

  sortCustomers() {
    this.filteredCustomers.sort((a, b) => {
      switch (this.sortBy) {
        case 'firstName':
          return a.firstName.localeCompare(b.firstName);
        case 'lastName':
          return a.lastName.localeCompare(b.lastName);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }

  setViewMode(mode: 'table' | 'grid') {
    this.viewMode = mode;
  }

  refreshCustomers() {
    this.loadCustomers();
  }

  exportCustomers() {
    // Implementation for exporting customers
    console.log('Exporting customers...');
  }

  openAddModal() {
    this.modalTitle = 'Add New Customer';
    this.isEditMode = true;
    this.showModal = true;
    this.customerForm = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      country: '',
      address: '',
      status: 'active',
      dateOfBirth: ''
    };
  }

  editCustomer(customer: Customer) {
    this.modalTitle = 'Edit Customer';
    this.isEditMode = true;
    this.showModal = true;
    this.customerForm = { ...customer };
  }

  viewCustomer(customer: Customer) {
    this.modalTitle = 'Customer Details';
    this.isEditMode = false;
    this.showModal = true;
    this.customerForm = { ...customer };
  }

  saveCustomer() {
    if (this.isEditMode) {
      if (this.customerForm.id) {
        // Update existing customer
        this.apiService.updateCustomer(this.customerForm.id, this.customerForm).subscribe({
          next: () => {
            this.loadCustomers();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating customer:', error);
          }
        });
      } else {
        // Create new customer
        this.apiService.createCustomer(this.customerForm).subscribe({
          next: () => {
            this.loadCustomers();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating customer:', error);
          }
        });
      }
    }
  }

  deleteCustomer(customer: Customer) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.apiService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.loadCustomers();
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.customerForm = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      country: '',
      address: '',
      status: 'active',
      dateOfBirth: ''
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
}
