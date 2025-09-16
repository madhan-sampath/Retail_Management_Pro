import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  selectedReportType = 'sales';
  dateFrom = '';
  dateTo = '';
  quickRange = '';
  loading = false;
  salesReport: any[] = [];
  inventoryReport: any[] = [];
  customerReport: any[] = [];
  revenueReport: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.setDefaultDateRange();
    this.loadReport();
  }

  setDefaultDateRange() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    this.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
    this.dateTo = today.toISOString().split('T')[0];
  }

  setQuickRange() {
    const today = new Date();
    let fromDate: Date;

    switch (this.quickRange) {
      case 'today':
        fromDate = new Date(today);
        break;
      case 'week':
        fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        fromDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        fromDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    this.dateFrom = fromDate.toISOString().split('T')[0];
    this.dateTo = today.toISOString().split('T')[0];
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    
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
      case 'revenue':
        this.loadRevenueReport();
        break;
    }
  }

  loadSalesReport() {
    this.apiService.getSalesReport(this.dateFrom, this.dateTo).subscribe({
      next: (report) => {
        this.salesReport = report;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sales report:', error);
        this.loading = false;
      }
    });
  }

  loadInventoryReport() {
    this.apiService.getInventoryReport().subscribe({
      next: (report) => {
        this.inventoryReport = report;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading inventory report:', error);
        this.loading = false;
      }
    });
  }

  loadCustomerReport() {
    this.apiService.getCustomerReport(this.dateFrom, this.dateTo).subscribe({
      next: (report) => {
        this.customerReport = report;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer report:', error);
        this.loading = false;
      }
    });
  }

  loadRevenueReport() {
    this.apiService.getRevenueReport(this.dateFrom, this.dateTo).subscribe({
      next: (report) => {
        this.revenueReport = report;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading revenue report:', error);
        this.loading = false;
      }
    });
  }

  generateReport() {
    this.loadReport();
  }

  exportReport() {
    // Implementation for exporting reports
    console.log('Exporting report...');
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
