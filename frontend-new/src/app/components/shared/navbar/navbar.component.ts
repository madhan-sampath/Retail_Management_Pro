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
        <!-- Mobile menu button -->
        <button class="btn btn-outline-light d-lg-none me-3" type="button" (click)="toggleSidebar()">
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .navbar-brand {
      font-size: 1.5rem;
      color: white !important;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.9) !important;
      transition: color 0.3s ease;
    }

    .nav-link:hover {
      color: white !important;
    }

    .avatar {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .dropdown-menu {
      border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border-radius: 12px;
      margin-top: 8px;
    }

    .dropdown-item {
      padding: 10px 20px;
      transition: background-color 0.3s ease;
    }

    .dropdown-item:hover {
      background-color: #f8f9fa;
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
    // This would toggle the sidebar on mobile
    // Implementation depends on your sidebar component
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('show');
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
