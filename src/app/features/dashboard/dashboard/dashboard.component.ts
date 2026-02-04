import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <div class="w-64 bg-gray-800 text-white flex flex-col">
        <div class="h-16 flex items-center justify-center bg-gray-900 shadow-md z-10">
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            CIUDADELA
          </h1>
        </div>
        <nav class="flex-1 p-4 space-y-2">
          <a routerLink="/dashboard" routerLinkActive="bg-gray-700" [routerLinkActiveOptions]="{exact: true}" class="block p-2 rounded hover:bg-gray-700">Resumen</a>
          <a routerLink="/dashboard/apartments" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Apartamentos</a>
          <a routerLink="/dashboard/residents" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Residentes</a>
          <a routerLink="/dashboard/vehicles" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Vehículos</a>
          <a routerLink="/dashboard/parking" routerLinkActive="bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Control Parqueadero</a>
        </nav>
        <div class="p-4 bg-gray-900">
          <button (click)="logout()" class="w-full p-2 text-center bg-red-600 rounded hover:bg-red-700">Cerrar Sesión</button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <header class="flex items-center justify-between p-4 bg-white shadow">
          <h2 class="text-xl font-semibold">Panel de Control</h2>
          <div class="text-gray-600">
            Bienvenido, {{ currentUser()?.name || 'Usuario' }}
          </div>
        </header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser; // Signal

  logout() {
    this.authService.logout().subscribe();
  }
}
