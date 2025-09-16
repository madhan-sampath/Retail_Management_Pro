import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar d-flex flex-column" id="sidebar">
      <!-- Logo -->
      <div class="sidebar-header p-4 text-center">
        <h4 class="text-white mb-0">
          <span class="material-symbols-outlined me-2">store</span>
          Retail Pro
        </h4>
        <small class="text-white-50">Management System</small>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav flex-grow-1 px-3">
        <ul class="nav flex-column">
          <li class="nav-item" *ngFor="let item of menuItems">
            <a class="nav-link d-flex align-items-center" 
               [routerLink]="item.route" 
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}">
              <span class="material-symbols-outlined me-3">{{ item.icon }}</span>
              <span class="flex-grow-1">{{ item.title }}</span>
              <span *ngIf="item.badge" 
                    [class]="'badge ' + (item.badgeClass || 'bg-primary')">
                {{ item.badge }}
              </span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer p-3 border-top border-light border-opacity-25">
        <div class="d-flex align-items-center text-white-50">
          <span class="material-symbols-outlined text-success me-2" style="font-size: 0.5rem;">circle</span>
          <small>System Online</small>
        </div>
        <small class="text-white-50 d-block mt-1">v1.0.0</small>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      transition: left 0.3s ease;
    }

    .sidebar-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-nav .nav-link {
      color: rgba(255, 255, 255, 0.8);
      padding: 12px 16px;
      border-radius: 8px;
      margin: 4px 0;
      transition: all 0.3s ease;
      text-decoration: none;
      display: flex;
      align-items: center;
    }

    .sidebar-nav .nav-link:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateX(5px);
    }

    .sidebar-nav .nav-link.active {
      color: white;
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }

    .sidebar-nav .nav-link i {
      width: 20px;
      text-align: center;
      font-size: 1.1rem;
    }

    .sidebar-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .badge {
      font-size: 0.7rem;
      padding: 4px 8px;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .sidebar {
        left: -250px;
      }
      
      .sidebar.show {
        left: 0;
      }
    }

    /* Main content adjustment */
    .main-content {
      margin-left: 250px;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      title: 'Products',
      icon: 'inventory',
      route: '/products',
      badge: '5',
      badgeClass: 'bg-warning'
    },
    {
      title: 'Orders',
      icon: 'shopping_cart',
      route: '/orders',
      badge: '12',
      badgeClass: 'bg-success'
    },
    {
      title: 'Customers',
      icon: 'people',
      route: '/customers'
    },
    {
      title: 'Inventory',
      icon: 'warehouse',
      route: '/inventory',
      badge: '3',
      badgeClass: 'bg-danger'
    },
    {
      title: 'Reports',
      icon: 'bar_chart',
      route: '/reports'
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/settings'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Add any initialization logic here
  }
}
