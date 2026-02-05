import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { BarcodeComponent } from '../../../shared/components/barcode/barcode.component';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, BarcodeComponent],
  template: `
    <div class="container mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
         <div>
            <h2 class="text-3xl font-extrabold text-gray-800">Vehículos</h2>
            <p class="text-gray-500">Control de parqueadero y propietarios</p>
         </div>
         <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <div class="relative w-full sm:w-auto">
                 <input 
                    type="text" 
                    [(ngModel)]="searchQuery"
                    (keyup.enter)="onSearch()"
                    placeholder="Buscar..." 
                    class="border-2 border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64 transition-all"
                 >
                 <button (click)="onSearch()" class="absolute right-2 top-2 text-gray-400 hover:text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                 </button>
            </div>
            <button *ngIf="authService.isAdmin()" (click)="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Crear
            </button>
        </div>
      </div>
      
      <div class="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto border border-gray-100 my-6">
        <table class="min-w-full table-auto">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Placa</th>
              <th class="py-3 px-6 text-left">Tipo</th>
               <th class="py-3 px-6 text-left">Apartamento</th>
              <th class="py-3 px-6 text-center">Cartera</th>
              <th class="py-3 px-6 text-left">Descripción</th>
               <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr *ngFor="let vehicle of vehicles()" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left font-bold">{{ vehicle.plate }}</td>
              <td class="py-3 px-6 text-left capitalize">
                {{ vehicle.type === 'car' ? 'Carro' : (vehicle.type === 'motorcycle' ? 'Moto' : vehicle.type) }}
              </td>
               <td class="py-3 px-6 text-left whitespace-nowrap">
                <span class="font-bold">{{ vehicle.apartment?.block }}{{ vehicle.apartment?.number }}</span>
              </td>
              <td class="py-3 px-6 text-center">
                <span *ngIf="vehicle.apartment?.debt_status?.is_up_to_date" 
                      class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-400">
                  Al día
                </span>
                <span *ngIf="!vehicle.apartment?.debt_status?.is_up_to_date" 
                      class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-red-400 flex flex-col items-center">
                  <span>Deuda</span>
                  <span class="text-[10px] leading-tight text-red-600 font-bold" *ngIf="vehicle.apartment?.debt_status?.overdue_amount > 0">
                    MORA: $ {{ vehicle.apartment?.debt_status?.overdue_amount | number }}
                  </span>
                </span>
              </td>
              <td class="py-3 px-6 text-left">{{ vehicle.description || '-' }}</td>
              <td class="py-3 px-6 text-center">
                 <button (click)="viewCard(vehicle)" class="text-purple-500 hover:text-purple-700 mr-2" title="Ver Carnet">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                    </svg>
                 </button>
                 <ng-container *ngIf="authService.isAdmin()">
                     <button (click)="openModal(vehicle)" class="text-blue-500 hover:text-blue-700 mr-2" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    <button (click)="deleteVehicle(vehicle.id)" class="text-red-500 hover:text-red-700" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                 </ng-container>
            </tr>
             <tr *ngIf="vehicles().length === 0">
              <td colspan="6" class="py-4 text-center">No se encontraron vehículos.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <app-pagination 
        [currentPage]="paginationData.current_page"
        [lastPage]="paginationData.last_page"
        [total]="paginationData.total"
        [from]="paginationData.from"
        [to]="paginationData.to"
        [perPage]="perPage"
        (pageChange)="onPageChange($event)"
        (perPageChange)="onPerPageChange($event)"
      ></app-pagination>

       <!-- Create/Edit Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Editar' : 'Crear' }} Vehículo</h3>
            <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {{ errorMessage }}
            </div>
            <form (ngSubmit)="saveVehicle()">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Placa</label>
                    <input [(ngModel)]="currentVehicle.plate" (input)="currentVehicle.plate = currentVehicle.plate.toUpperCase()" name="plate" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline uppercase" required [disabled]="isEditing"> 
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Tipo</label>
                    <select [(ngModel)]="currentVehicle.type" name="type" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                        <option value="car">Carro</option>
                        <option value="motorcycle">Moto</option>
                    </select>
                </div>
                <div class="mb-4">
                     <label class="block text-gray-700 text-sm font-bold mb-2">Apartamento</label>
                     <select [(ngModel)]="currentVehicle.apartment_id" name="apartment_id" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                        <option *ngFor="let apt of apartments" [value]="apt.id">Torre {{ apt.block }} - {{ apt.number }}</option>
                     </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
                    <input [(ngModel)]="currentVehicle.description" name="description" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>

                <div class="flex justify-end gap-2">
                    <button type="button" (click)="closeModal()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
                </div>
            </form>
        </div>
      </div>

      <!-- Access Card Modal -->
      <div *ngIf="isCardModalOpen" class="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div id="printable-card" class="relative w-80 shadow-2xl rounded-xl bg-white overflow-hidden transform transition-all duration-300 print:shadow-none print:w-full print:h-full print:rounded-none">
            <!-- Header Background (Gradient) -->
            <div class="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center relative print:bg-none print:border-b print:border-gray-300">
                <div class="absolute inset-0 bg-white/10 pattern-dots print:hidden"></div> 
                <img src="/ciudadela.png" alt="Logo" class="h-10 relative z-10 brightness-200 print:brightness-0 print:invert-0">
            </div>

            <!-- Content -->
            <div class="p-6 pt-0 relative -mt-6">
                <!-- Vehicle Icon Container -->
                <div class="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-3 border-2 border-gray-100 print:border-gray-300">
                     <span class="text-2xl" *ngIf="currentVehicleForCard?.type === 'car'">🚗</span>
                     <span class="text-2xl" *ngIf="currentVehicleForCard?.type === 'motorcycle'">🏍️</span>
                </div>

                <div class="text-center mb-6">
                    <h2 class="text-3xl font-black text-gray-800 tracking-wider">{{ currentVehicleForCard?.plate }}</h2>
                    <p class="text-gray-500 text-sm font-medium">Torre {{ currentVehicleForCard?.apartment?.block }} - {{ currentVehicleForCard?.apartment?.number }}</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center justify-center mb-4 print:bg-white print:border-2">
                    <app-barcode 
                        [value]="currentVehicleForCard?.unique_id" 
                        [displayValue]="false"
                        [height]="40"
                        [width]="1.5"
                    ></app-barcode>
                    <div class="mt-2 text-[8px] text-gray-400 font-mono text-center break-all w-full">
                        {{ currentVehicleForCard?.unique_id }}
                    </div>
                </div>

                <div class="flex gap-2 no-print">
                     <button (click)="printCard()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 0 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                        </svg>
                        Imprimir
                    </button>
                     <button (click)="closeCardModal()" class="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VehicleListComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  vehicles = signal<any[]>([]);
  apartments: any[] = [];
  searchQuery = '';
  perPage = 5;
  paginationData: any = { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Modal State
  isModalOpen = false;
  isEditing = false;
  currentVehicle: any = {};
  errorMessage = '';

  // Card Modal State
  isCardModalOpen = false;
  currentVehicleForCard: any = null;

  ngOnInit() {
    this.loadVehicles();
    this.loadApartments();
  }

  loadVehicles(page: number = 1) {
    this.apiService.getVehicles(page, this.searchQuery, this.perPage).subscribe(response => {
      this.vehicles.set(response.data);
      this.paginationData = {
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
        from: response.from,
        to: response.to
      };
    });
  }

  onPageChange(page: number) {
    this.loadVehicles(page);
  }

  onSearch() {
    this.loadVehicles(1);
  }

  onPerPageChange(perPage: number) {
    this.perPage = perPage;
    this.loadVehicles(1);
  }

  loadApartments() {
    this.apiService.getApartments(1, '').subscribe(response => {
      this.apartments = response.data || response;
    });
  }

  openModal(vehicle: any = null) {
    this.errorMessage = '';
    if (vehicle) {
      this.isEditing = true;
      this.currentVehicle = { ...vehicle };
      if (vehicle.apartment) {
        this.currentVehicle.apartment_id = vehicle.apartment.id;
      }
    } else {
      this.isEditing = false;
      this.currentVehicle = { plate: '', type: 'car', apartment_id: null, description: '' };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  viewCard(vehicle: any) {
    this.currentVehicleForCard = vehicle;
    this.isCardModalOpen = true;
  }

  closeCardModal() {
    this.isCardModalOpen = false;
    this.currentVehicleForCard = null;
  }

  printCard() {
    window.print();
  }

  saveVehicle() {
    this.errorMessage = ''; // Clear previous errors
    // Enforce uppercase
    if (this.currentVehicle.plate) {
      this.currentVehicle.plate = this.currentVehicle.plate.toUpperCase();
    }
    if (this.isEditing) {
      this.apiService.updateVehicle(this.currentVehicle.id, this.currentVehicle).subscribe({
        next: () => {
          this.loadVehicles();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error al actualizar vehículo';
          if (err.error?.errors?.type) {
            this.errorMessage = err.error.errors.type[0];
          }
        }
      });
    } else {
      this.apiService.createVehicle(this.currentVehicle).subscribe({
        next: () => {
          this.loadVehicles();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error al crear vehículo';
          if (err.error?.errors?.type) {
            this.errorMessage = err.error.errors.type[0];
          }
        }
      });
    }
  }

  deleteVehicle(id: number) {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      this.apiService.deleteVehicle(id).subscribe(() => {
        this.loadVehicles();
      });
    }
  }
}
