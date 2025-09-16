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
    <div class="sidebar d-flex align-items-center" id="sidebar">
      <!-- Logo -->
      <div class="sidebar-header d-flex align-items-center me-4">
        <h5 class="text-white mb-0 me-3">
          <span class="material-symbols-outlined me-1">store</span>
          Retail Pro
        </h5>
        <small class="text-white-50" style="font-size: 0.7rem;">Management System</small>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav flex-grow-1">
        <ul class="nav d-flex">
          <li class="nav-item" *ngFor="let item of menuItems">
            <a class="nav-link" 
               [routerLink]="item.route" 
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}">
              <span class="material-symbols-outlined me-1">{{ item.icon }}</span>
              <span>{{ item.title }}</span>
              <span *ngIf="item.badge" 
                    [class]="'badge ' + (item.badgeClass || 'bg-primary')">
                {{ item.badge }}
              </span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Actions -->
      <div class="sidebar-actions d-flex align-items-center">
        <div class="d-flex align-items-center text-white-50 me-3">
          <span class="material-symbols-outlined text-success me-1" style="font-size: 0.5rem;">circle</span>
          <small style="font-size: 0.7rem;">Online</small>
        </div>
        <button class="btn btn-link text-white p-0" (click)="toggleSidebar()" title="Hide Navigation">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 100%;
      height: 60px;
      background: linear-gradient(145deg, #1e293b 0%, #334155 50%, #475569 100%);
      box-shadow: var(--shadow-lg);
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar.collapsed {
      height: 0;
      overflow: hidden;
    }

    .sidebar-header {
      flex-shrink: 0;
    }

    .sidebar-nav .nav-link {
      color: rgba(255, 255, 255, 0.85);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius);
      margin: 0 var(--space-1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 0.8rem;
      position: relative;
      overflow: hidden;
      white-space: nowrap;
    }

    .sidebar-nav .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: var(--radius);
    }

    .sidebar-nav .nav-link:hover {
      color: white;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .sidebar-nav .nav-link:hover::before {
      opacity: 1;
    }

    .sidebar-nav .nav-link.active {
      color: white;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .sidebar-nav .nav-link.active::before {
      opacity: 0;
    }

    .sidebar-nav .nav-link .material-symbols-outlined {
      margin-right: var(--space-1);
      width: 18px;
      text-align: center;
      font-size: 1rem;
      vertical-align: middle;
    }

    .sidebar-actions {
      flex-shrink: 0;
    }

    .badge {
      font-size: 0.65rem;
      padding: 3px 6px;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .sidebar {
        height: auto;
        min-height: 60px;
        flex-wrap: wrap;
      }
      
      .sidebar-nav {
        order: 3;
        width: 100%;
        margin-top: var(--space-2);
      }
      
      .sidebar-nav .nav {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .sidebar-nav .nav-link {
        margin: 2px;
        font-size: 0.75rem;
        padding: var(--space-1) var(--space-2);
      }
    }

    @media (max-width: 576px) {
      .sidebar-header h5 {
        font-size: 1rem;
      }
      
      .sidebar-header small {
        display: none;
      }
      
      .sidebar-actions small {
        display: none;
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

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
  }
}

