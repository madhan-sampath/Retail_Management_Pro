import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Order, Customer } from '../../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  customers: Customer[] = [];
  loading = true;
  searchQuery = '';
  selectedStatus = '';
  selectedPaymentMethod = '';
  selectedDateRange = '';
  sortBy = 'orderDate';
  showModal = false;
  modalTitle = '';
  isEditMode = false;
  orderForm: any = {
    customerId: '',
    status: 'pending',
    paymentMethod: 'credit_card',
    shippingAddress: '',
    notes: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadOrders();
    this.loadCustomers();
  }

  loadOrders() {
    this.loading = true;
    this.apiService.getOrders().subscribe({
      next: (response) => {
        this.orders = response.data || [];
        this.filteredOrders = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  loadCustomers() {
    this.apiService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response.data || [];
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  searchOrders() {
    this.filterOrders();
  }

  filterOrders() {
    let filtered = [...this.orders];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        (order.customerName && order.customerName.toLowerCase().includes(query)) ||
        (order.customerEmail && order.customerEmail.toLowerCase().includes(query))
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    if (this.selectedPaymentMethod) {
      filtered = filtered.filter(order => order.paymentMethod === this.selectedPaymentMethod);
    }

    if (this.selectedDateRange) {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        switch (this.selectedDateRange) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          case 'quarter':
            const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            return orderDate >= quarterAgo;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return orderDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    this.filteredOrders = filtered;
    this.sortOrders();
  }

  sortOrders() {
    this.filteredOrders.sort((a, b) => {
      switch (this.sortBy) {
        case 'orderDate':
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        case 'totalAmount':
          return b.totalAmount - a.totalAmount;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'customerName':
          return (a.customerName || '').localeCompare(b.customerName || '');
        default:
          return 0;
      }
    });
  }

  refreshOrders() {
    this.loadOrders();
  }

  exportOrders() {
    // Implementation for exporting orders
    console.log('Exporting orders...');
  }

  openAddModal() {
    this.modalTitle = 'Add New Order';
    this.isEditMode = true;
    this.showModal = true;
    this.orderForm = {
      customerId: '',
      status: 'pending',
      paymentMethod: 'credit_card',
      shippingAddress: '',
      notes: ''
    };
  }

  editOrder(order: Order) {
    this.modalTitle = 'Edit Order';
    this.isEditMode = true;
    this.showModal = true;
    this.orderForm = { ...order };
  }

  viewOrder(order: Order) {
    this.modalTitle = 'Order Details';
    this.isEditMode = false;
    this.showModal = true;
    this.orderForm = { ...order };
  }

  saveOrder() {
    if (this.isEditMode) {
      if (this.orderForm.id) {
        // Update existing order
        this.apiService.updateOrder(this.orderForm.id, this.orderForm).subscribe({
          next: () => {
            this.loadOrders();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating order:', error);
          }
        });
      } else {
        // Create new order
        this.apiService.createOrder(this.orderForm).subscribe({
          next: () => {
            this.loadOrders();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating order:', error);
          }
        });
      }
    }
  }

  updateOrderStatus(order: Order, status: string) {
    const updatedOrder = { ...order, status };
    this.apiService.updateOrder(order.id, updatedOrder).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
      }
    });
  }

  cancelOrder(order: Order) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.updateOrderStatus(order, 'cancelled');
    }
  }

  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.orderForm = {
      customerId: '',
      status: 'pending',
      paymentMethod: 'credit_card',
      shippingAddress: '',
      notes: ''
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
