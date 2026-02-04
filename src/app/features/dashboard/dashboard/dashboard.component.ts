import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { PolicyModalComponent } from '../../../shared/components/policy-modal/policy-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PolicyModalComponent],
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden">
      <!-- Mobile Sidebar Overlay -->
      <div *ngIf="isSidebarOpen" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden" (click)="toggleSidebar()"></div>

      <!-- Sidebar -->
      <div [class]="'fixed inset-y-0 left-0 bg-gray-800 text-white flex flex-col transition-transform duration-300 transform z-30 md:translate-x-0 md:static md:inset-auto w-64 ' + (isSidebarOpen ? 'translate-x-0' : '-translate-x-full')">
        <div class="h-16 flex items-center justify-center bg-gray-900 shadow-md">
          <img src="/ciudadela.png" alt="Ciudadela" class="h-12">
        </div>
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <!-- Admin & Vigilante common links -->
          <ng-container *ngIf="!authService.isResident()">
            <a routerLink="/dashboard" routerLinkActive="bg-gray-700" [routerLinkActiveOptions]="{exact: true}" class="block p-2 rounded hover:bg-gray-700">Resumen</a>
            <a *ngIf="authService.isAdmin()" routerLink="/dashboard/apartments" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Apartamentos</a>
            <a *ngIf="authService.isAdmin()" routerLink="/dashboard/people" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Personas</a>
            <a *ngIf="authService.isAdmin()" routerLink="/dashboard/residents" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Residentes</a>
            <a *ngIf="authService.isAdmin()" routerLink="/dashboard/vigilantes" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Vigilantes</a>
            <a *ngIf="authService.isAdmin()" routerLink="/dashboard/vehicles" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Vehículos</a>
            <a routerLink="/dashboard/parking" routerLinkActive="bg-gray-700" [routerLinkActiveOptions]="{exact: true}" class="block p-2 rounded hover:bg-gray-700">Control Parqueadero</a>
            <a routerLink="/dashboard/parking/history" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Histórico Parqueadero</a>
            <a routerLink="/dashboard/visitors" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Visitantes</a>
            <a *ngIf="authService.isAdmin()" routerLink="/dashboard/cartera" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Cartera</a>
          </ng-container>

          <!-- Resident specific links -->
          <ng-container *ngIf="authService.isResident()">
            <a routerLink="/dashboard/profile" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Mi Perfil</a>
            <a routerLink="/dashboard/my-vehicles" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Mis Vehículos</a>
            <a routerLink="/dashboard/my-cartera" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Mi Cartera</a>
          </ng-container>

          <!-- Notification link (All) -->
          <a routerLink="/dashboard/notifications" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700 flex justify-between items-center">
            Notificaciones
            <span *ngIf="unreadCount() > 0" class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ unreadCount() }}</span>
          </a>
        </nav>
        <div class="p-4 bg-gray-900">
          <button (click)="logout()" class="w-full p-2 text-center bg-red-600 rounded hover:bg-red-700">Cerrar Sesión</button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden w-full">
        <header class="flex items-center justify-between p-4 bg-white shadow z-10">
          <div class="flex items-center gap-4">
            <button (click)="toggleSidebar()" class="text-gray-500 focus:outline-none md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h2 class="text-xl font-semibold truncate">Panel de Control</h2>
          </div>
          <div class="flex items-center gap-4">
            <a routerLink="/dashboard/notifications" class="relative text-gray-600 hover:text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              <span *ngIf="unreadCount() > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{{ unreadCount() }}</span>
            </a>
            <div class="text-gray-600">
              Bienvenido, {{ currentUser()?.person?.name || currentUser()?.name || 'Usuario' }}
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Policy Acceptance Modal -->
      <app-policy-modal></app-policy-modal>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  currentUser = this.authService.currentUser; // Signal
  unreadCount = signal<number>(0);
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private pollingInterval: any;

  ngOnInit() {
    this.loadUnreadCount();
    // Refresh count every 30 seconds to reduce server load
    this.pollingInterval = setInterval(() => this.loadUnreadCount(), 30000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadUnreadCount() {
    this.apiService.getNotifications(1, 100).subscribe(response => {
      const notifications = response.data || [];
      const unread = notifications.filter((n: any) => !n.read_at).length;
      this.unreadCount.set(unread);
    });
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
