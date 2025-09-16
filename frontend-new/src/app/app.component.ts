import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="app-container">
      <!-- Horizontal Sidebar -->
      <app-sidebar></app-sidebar>
      
      <!-- Main Content -->
      <div class="main-content">
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
    // Handle responsive behavior if needed
  }
}
