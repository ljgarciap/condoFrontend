import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-parking-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto max-w-lg">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Control de Parqueadero</h2>
         <button *ngIf="authService.isAdmin()" (click)="openSettingsModal()" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded text-sm">
            ⚙️ Configurar
        </button>
      </div>

      <!-- Capacity Status -->
      <div class="space-y-4 mb-6">
          <!-- Cars -->
          <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
              <div class="flex justify-between">
                  <p class="font-bold">Carros</p>
                  <p class="text-sm">{{ cars.occupied }} / {{ cars.total }} ocupados</p>
              </div>
              <div class="w-full bg-blue-200 rounded-full h-2.5 mt-2">
                <div class="bg-blue-600 h-2.5 rounded-full" [style.width.%]="(cars.occupied / cars.total) * 100"></div>
              </div>
          </div>
          
          <!-- Motorcycles -->
           <div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
              <div class="flex justify-between">
                  <p class="font-bold">Motos</p>
                  <p class="text-sm">{{ motorcycles.occupied }} / {{ motorcycles.total }} ocupados</p>
              </div>
              <div class="w-full bg-orange-200 rounded-full h-2.5 mt-2">
                <div class="bg-orange-600 h-2.5 rounded-full" [style.width.%]="(motorcycles.occupied / motorcycles.total) * 100"></div>
              </div>
          </div>
      </div>

      
      <div class="bg-white shadow-lg rounded-lg p-8">
        <label class="block text-gray-700 text-sm font-bold mb-2">Placa del Vehículo</label>
        <input 
          [(ngModel)]="plate" 
          type="text" 
          placeholder="ABC-123"
          (input)="plate = plate.toUpperCase()"
          class="w-full px-4 py-3 rounded-lg bg-gray-200 border border-gray-300 focus:outline-none focus:border-blue-500 mb-6 uppercase text-xl text-center tracking-widest"
        >

        <div class="flex gap-4">
          <button 
            (click)="registerEntry()" 
            [disabled]="!plate || isLoading"
            class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition"
          >
            Registrar Entrada
          </button>
          
          <button 
            (click)="registerExit()"
             [disabled]="!plate || isLoading" 
            class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition"
          >
            Registrar Salida
          </button>
        </div>

        <!-- Feedback Area -->
        <div *ngIf="message" class="mt-6 p-4 rounded" [ngClass]="{'bg-green-100 text-green-700': !isError, 'bg-red-100 text-red-700': isError}">
          {{ message }}
        </div>
      </div>

       <!-- Settings Modal -->
      <div *ngIf="isSettingsModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">Configurar Capacidades</h3>
            <form (ngSubmit)="saveSettings()">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Capacidad Carros</label>
                    <input [(ngModel)]="settingsForm.car_capacity" name="car_capacity" type="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                 <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Capacidad Motos</label>
                    <input [(ngModel)]="settingsForm.motorcycle_capacity" name="motorcycle_capacity" type="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Deuda Máxima Permitida ($)</label>
                    <input [(ngModel)]="settingsForm.max_overdue_amount" name="max_overdue_amount" type="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                    <p class="text-[10px] text-gray-500 mt-1">Si la deuda del apartamento supera este valor, el ingreso será bloqueado.</p>
                </div>

                <div class="flex justify-end gap-2">
                    <button type="button" (click)="closeSettingsModal()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ParkingControlComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  plate = '';
  message = '';
  isError = false;
  isLoading = false;

  // Capacity Stats
  cars = { occupied: 0, total: 0, available: 0 };
  motorcycles = { occupied: 0, total: 0, available: 0 };

  // Settings Modal
  isSettingsModalOpen = false;
  settingsForm = { car_capacity: 0, motorcycle_capacity: 0, max_overdue_amount: 0 };
  currentSettings: any = {};

  ngOnInit() {
    this.loadStatus();
  }

  loadStatus() {
    this.apiService.getParkingStatus().subscribe(status => {
      this.cars = status.cars;
      this.motorcycles = status.motorcycles;
      this.currentSettings = status.settings || {};
    });
  }

  openSettingsModal() {
    this.settingsForm = {
      car_capacity: this.currentSettings.car_capacity || this.cars.total,
      motorcycle_capacity: this.currentSettings.motorcycle_capacity || this.motorcycles.total,
      max_overdue_amount: this.currentSettings.max_overdue_amount || 0
    };
    this.isSettingsModalOpen = true;
  }

  closeSettingsModal() {
    this.isSettingsModalOpen = false;
  }

  saveSettings() {
    this.apiService.updateParkingSettings(this.settingsForm).subscribe(() => {
      this.loadStatus();
      this.closeSettingsModal();
    });
  }

  registerEntry() {
    this.plate = this.plate.toUpperCase();
    this.processAction(() => this.apiService.registerEntry(this.plate));
  }

  registerExit() {
    this.plate = this.plate.toUpperCase();
    this.processAction(() => this.apiService.registerExit(this.plate));
  }

  private processAction(action: () => any) {
    this.isLoading = true;
    this.message = '';
    this.isError = false;

    action().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.message = res.message || 'Operación exitosa';
        this.isError = false;
        this.plate = ''; // Clear input on success
        this.loadStatus(); // Reload stats
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isError = true;

        // Extract error message from API response
        if (err.error && err.error.errors) {
          // Validation errors (e.g., plate not found, blocked)
          const firstKey = Object.keys(err.error.errors)[0];
          this.message = err.error.errors[firstKey][0];
        } else if (err.error && err.error.message) {
          this.message = err.error.message;
        } else {
          this.message = 'Ocurrió un error inesperado al procesar la solicitud.';
        }
      }
    });
  }
}
