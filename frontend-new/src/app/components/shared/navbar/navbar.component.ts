import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, User } from '../../../services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container-fluid">
        <!-- Sidebar toggle button -->
        <button class="btn btn-outline-light me-3" type="button" (click)="toggleSidebar()" title="Toggle Sidebar">
          <span class="material-symbols-outlined">menu</span>
        </button>

        <!-- Brand -->
        <a class="navbar-brand fw-bold" href="#">
          <span class="material-symbols-outlined me-2">store</span>
          Retail Management
        </a>

        <!-- Navbar items -->
        <div class="navbar-nav ms-auto">
          <!-- Notifications -->
          <div class="nav-item dropdown me-3">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              <span class="material-symbols-outlined">notifications</span>
              <span class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                3
              </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><h6 class="dropdown-header">Notifications</h6></li>
              <li><a class="dropdown-item" href="#">
                <span class="material-symbols-outlined text-warning me-2">warning</span>
                Low stock alert: iPhone 15 Pro
              </a></li>
              <li><a class="dropdown-item" href="#">
                <span class="material-symbols-outlined text-success me-2">check_circle</span>
                Order #ORD-001 completed
              </a></li>
              <li><a class="dropdown-item" href="#">
                <span class="material-symbols-outlined text-info me-2">info</span>
                New customer registered
              </a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-center" href="#">View all notifications</a></li>
            </ul>
          </div>

          <!-- User menu -->
          <div class="nav-item dropdown" *ngIf="currentUser">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
              <div class="avatar bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                {{ getInitials(currentUser.firstName, currentUser.lastName) }}
              </div>
              <span class="d-none d-md-inline">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><h6 class="dropdown-header">{{ currentUser.email }}</h6></li>
              <li><a class="dropdown-item" href="#">
                <span class="material-symbols-outlined me-2">person</span>Profile
              </a></li>
              <li><a class="dropdown-item" href="#">
                <span class="material-symbols-outlined me-2">settings</span>Settings
              </a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" (click)="logout()">
                <span class="material-symbols-outlined me-2">logout</span>Logout
              </a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #ffffff !important;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    .navbar-brand {
      font-size: 1.25rem;
      color: #1e293b !important;
      font-weight: 600;
    }

    .nav-link {
      color: #64748b !important;
      transition: color 0.3s ease;
    }

    .nav-link:hover {
      color: #1e293b !important;
    }

    .btn-outline-light {
      border-color: #e2e8f0;
      color: #64748b;
    }

    .btn-outline-light:hover {
      background-color: #f1f5f9;
      border-color: #cbd5e1;
      color: #1e293b;
    }

    .avatar {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .dropdown-menu {
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 8px;
      margin-top: 8px;
    }

    .dropdown-item {
      padding: 8px 16px;
      transition: background-color 0.3s ease;
      font-size: 0.875rem;
    }

    .dropdown-item:hover {
      background-color: #f8fafc;
    }

    .badge {
      font-size: 0.6rem;
      padding: 4px 6px;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.apiService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentUser = response.data.user;
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        this.apiService.removeToken();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Still remove token and redirect on error
        this.apiService.removeToken();
        this.router.navigate(['/login']);
      }
    });
  }
}
