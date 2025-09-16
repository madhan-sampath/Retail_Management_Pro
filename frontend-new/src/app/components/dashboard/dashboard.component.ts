import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Order, Product } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardStats: any = {
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0
  };
  recentOrders: Order[] = [];
  topProducts: Product[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load dashboard stats
    this.apiService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
      }
    });

    // Load recent orders
    this.apiService.getOrders().subscribe({
      next: (response) => {
        this.recentOrders = (response.data || []).slice(0, 5); // Get latest 5 orders
      },
      error: (error) => {
        console.error('Error loading recent orders:', error);
      }
    });

    // Load top products
    this.apiService.getProducts().subscribe({
      next: (response) => {
        this.topProducts = (response.data || []).slice(0, 5); // Get top 5 products
      },
      error: (error) => {
        console.error('Error loading top products:', error);
      }
    });
  }

  refreshDashboard() {
    this.loadDashboardData();
  }

  exportReport() {
    // Implementation for exporting dashboard report
    console.log('Exporting dashboard report...');
  }

  navigateToProducts() {
    // Navigate to products page
    window.location.href = '/products';
  }

  navigateToOrders() {
    // Navigate to orders page
    window.location.href = '/orders';
  }

  navigateToCustomers() {
    // Navigate to customers page
    window.location.href = '/customers';
  }

  navigateToReports() {
    // Navigate to reports page
    window.location.href = '/reports';
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
