import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>
      
      <!-- Main Content -->
      <div class="main-content" (click)="closeSidebarOnMobile()">
        <!-- Navbar -->
        <app-navbar></app-navbar>
        
        <!-- Page Content -->
        <div class="container-fluid p-4">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-content {
      min-height: 100vh;
      background-color: #f8f9fa;
    }
  `]
})
export class AppComponent {
  title = 'Retail Management System';

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Close sidebar on desktop when window is resized
    if (event.target.innerWidth > 768) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.remove('show');
      }
    }
  }

  closeSidebarOnMobile() {
    // Close sidebar on mobile when clicking on main content
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.remove('show');
      }
    }
  }
}
