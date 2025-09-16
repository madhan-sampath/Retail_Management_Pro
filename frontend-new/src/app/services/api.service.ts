import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  price: number;
  cost: number;
  categoryId: number;
  supplierId: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: any;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  userId: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  notes: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  customer?: any;
  customerName?: string;
  customerEmail?: string;
  items?: any[];
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  company: string;
  status: string;
  isActive: boolean;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private getParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return httpParams;
  }

  // Authentication
  login(email: string, password: string): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http.post<ApiResponse<{ user: User; token: string }>>(`${this.apiUrl}/auth/login`, {
      email,
      password
    });
  }

  register(userData: any): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http.post<ApiResponse<{ user: User; token: string }>>(`${this.apiUrl}/auth/register`, userData);
  }

  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/logout`, {}, {
      headers: this.getHeaders()
    });
  }

  getProfile(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.apiUrl}/auth/profile`, {
      headers: this.getHeaders()
    });
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  // Products
  getProducts(params: any = {}): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`, {
      headers: this.getHeaders(),
      params: this.getParams(params)
    });
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`, {
      headers: this.getHeaders()
    });
  }

  createProduct(product: any): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/products`, product, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: number, product: any): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`, product, {
      headers: this.getHeaders()
    });
  }

  deleteProduct(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/products/${id}`, {
      headers: this.getHeaders()
    });
  }

  searchProducts(query: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/search`, {
      headers: this.getHeaders(),
      params: this.getParams({ q: query })
    });
  }

  getLowStockProducts(threshold: number = 10): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/low-stock`, {
      headers: this.getHeaders(),
      params: this.getParams({ threshold })
    });
  }

  getTopSellingProducts(limit: number = 10): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/top-selling`, {
      headers: this.getHeaders(),
      params: this.getParams({ limit })
    });
  }

  // Orders
  getOrders(params: any = {}): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/orders`, {
      headers: this.getHeaders(),
      params: this.getParams(params)
    });
  }

  getOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/orders/${id}`, {
      headers: this.getHeaders()
    });
  }

  createOrder(order: any): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/orders`, order, {
      headers: this.getHeaders()
    });
  }

  updateOrder(id: number, order: any): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/orders/${id}`, order, {
      headers: this.getHeaders()
    });
  }

  updateOrderStatus(id: number, status: string, notes?: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/orders/${id}/status`, {
      status,
      notes
    }, {
      headers: this.getHeaders()
    });
  }

  deleteOrder(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/orders/${id}`, {
      headers: this.getHeaders()
    });
  }

  getOrderStats(startDate?: string, endDate?: string): Observable<ApiResponse<any>> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/orders/stats`, {
      headers: this.getHeaders(),
      params: this.getParams(params)
    });
  }

  searchOrders(query: string): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/orders/search`, {
      headers: this.getHeaders(),
      params: this.getParams({ q: query })
    });
  }

  // Customers
  getCustomers(params: any = {}): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(`${this.apiUrl}/customers`, {
      headers: this.getHeaders(),
      params: this.getParams(params)
    });
  }

  getCustomer(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.apiUrl}/customers/${id}`, {
      headers: this.getHeaders()
    });
  }

  createCustomer(customer: any): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${this.apiUrl}/customers`, customer, {
      headers: this.getHeaders()
    });
  }

  updateCustomer(id: number, customer: any): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.apiUrl}/customers/${id}`, customer, {
      headers: this.getHeaders()
    });
  }

  deleteCustomer(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/customers/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateCustomerStatus(id: number, isActive: boolean): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/customers/${id}/status`, {
      isActive
    }, {
      headers: this.getHeaders()
    });
  }

  getCustomerStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/customers/stats`, {
      headers: this.getHeaders()
    });
  }

  getTopCustomers(limit: number = 10): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(`${this.apiUrl}/customers/top`, {
      headers: this.getHeaders(),
      params: this.getParams({ limit })
    });
  }

  searchCustomers(query: string): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(`${this.apiUrl}/customers/search`, {
      headers: this.getHeaders(),
      params: this.getParams({ q: query })
    });
  }

  // Reports
  getDashboardStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reports/dashboard`, {
      headers: this.getHeaders()
    });
  }

  getSalesReport(startDate: string, endDate: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reports/sales`, {
      headers: this.getHeaders(),
      params: this.getParams({ startDate, endDate })
    });
  }

  getInventoryReport(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reports/inventory`, {
      headers: this.getHeaders()
    });
  }

  getCustomerReport(startDate: string, endDate: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reports/customers`, {
      headers: this.getHeaders(),
      params: this.getParams({ startDate, endDate })
    });
  }

  getProductReport(startDate: string, endDate: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reports/products`, {
      headers: this.getHeaders(),
      params: this.getParams({ startDate, endDate })
    });
  }

  getRevenueReport(startDate: string, endDate: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reports/revenue`, {
      headers: this.getHeaders(),
      params: this.getParams({ startDate, endDate })
    });
  }
}
