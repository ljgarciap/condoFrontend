import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
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
               <th class="py-3 px-6 text-center" *ngIf="authService.isAdmin()">Acciones</th>
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
              <td class="py-3 px-6 text-center" *ngIf="authService.isAdmin()">
                 <button (click)="openModal(vehicle)" class="text-blue-500 hover:text-blue-700 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </button>
                <button (click)="deleteVehicle(vehicle.id)" class="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
              </td>
            </tr>
             <tr *ngIf="vehicles().length === 0">
              <td colspan="5" class="py-4 text-center">No se encontraron vehículos.</td>
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

       <!-- Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Editar' : 'Crear' }} Vehículo</h3>
            <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {{ errorMessage }}
            </div>
            <form (ngSubmit)="saveVehicle()">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Placa</label>
                    <input [(ngModel)]="currentVehicle.plate" (input)="currentVehicle.plate = currentVehicle.plate.toUpperCase()" name="plate" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline uppercase" required [disabled]="isEditing"> 
                    <!-- Assuming plate update might be tricky or allowed, usually primary key logic might block it, but standard CRUD allows updates. Disabling if edited just in case of unique check issues unless handled well -->
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
