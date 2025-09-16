import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./components/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'customers',
    loadComponent: () => import('./components/customers/customers.component').then(m => m.CustomersComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
