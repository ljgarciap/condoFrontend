import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="container mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-800">Mascotas</h2>
          <p class="text-gray-500">Listado general de mascotas en el conjunto</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div class="relative w-full sm:w-auto">
                <input 
                    type="text" 
                    [(ngModel)]="searchQuery"
                    (keyup.enter)="loadPets()"
                    placeholder="Buscar (Nombre, Raza, Apto)..." 
                    class="border-2 border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-80 transition-all"
                >
                <button (click)="loadPets()" class="absolute right-2 top-2 text-gray-400 hover:text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </button>
            </div>
            <button *ngIf="authService.isAdmin()" (click)="openCreateModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Crear Mascota
            </button>
        </div>
      </div>

      <div class="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto border border-gray-100 my-6">
        <table class="min-w-full table-auto">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Mascota</th>
              <th class="py-3 px-6 text-left">Raza / Descripción</th>
              <th class="py-3 px-6 text-left">Apartamento</th>
              <th class="py-3 px-6 text-center">Vacunas</th>
              <th class="py-3 px-6 text-center" *ngIf="authService.isAdmin()">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr *ngFor="let pet of pets" class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ pet.type === 'dog' ? '🐶' : (pet.type === 'cat' ? '🐱' : '🐾') }}</span>
                  <span class="font-medium text-gray-800 text-base">{{ pet.name }}</span>
                </div>
              </td>
              <td class="py-3 px-6 text-left">
                <div class="flex flex-col">
                  <span *ngIf="pet.breed" class="font-bold text-xs uppercase text-gray-500">{{ pet.breed }}</span>
                  <span *ngIf="pet.description" class="text-xs italic">{{ pet.description }}</span>
                  <span *ngIf="!pet.breed && !pet.description" class="text-gray-400">-</span>
                </div>
              </td>
              <td class="py-3 px-6 text-left">
                <div *ngIf="pet.apartment" class="font-semibold text-gray-700">
                    Torre {{ pet.apartment.block }} - {{ pet.apartment.number }}
                </div>
              </td>
              <td class="py-3 px-6 text-center">
                <span [class]="'py-1 px-3 rounded-full text-xs font-bold uppercase ' + (pet.vaccinations_current ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')">
                  {{ pet.vaccinations_current ? 'Al día' : 'Pendiente' }}
                </span>
              </td>
              <td class="py-3 px-6 text-center" *ngIf="authService.isAdmin()">
                <button (click)="deletePet(pet.id)" class="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 p-2 rounded-full transition-colors" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="pets.length === 0">
                <td colspan="5" class="py-6 text-center text-gray-500">
                    No se encontraron mascotas.
                </td>
            </tr>
          </tbody>
        </table>
      </div>

      <app-pagination
        [currentPage]="paginationData.current_page"
        [lastPage]="paginationData.last_page"
        (pageChange)="loadPets($event)">
      </app-pagination>
    </div>

    <!-- Create Modal -->
    <div *ngIf="isModalOpen" class="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">Registrar Mascota</h3>
            
            <div class="space-y-4">
                <!-- Step 1: Select Apartment -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Apartamento</label>
                    <div class="relative">
                        <input 
                            type="text" 
                            [(ngModel)]="apartmentSearchTerm"
                            (input)="searchApartments()"
                            placeholder="Buscar Torre / Número..." 
                            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                        <div *ngIf="showApartmentDropdown && filteredApartments.length > 0" class="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                            <div 
                                *ngFor="let apt of filteredApartments" 
                                (click)="selectApartment(apt)"
                                class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                                Torre {{ apt.block }} - {{ apt.number }}
                            </div>
                        </div>
                    </div>
                    <div *ngIf="selectedApartment" class="mt-2 text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded inline-block">
                        Seleccionado: Torre {{ selectedApartment.block }} - {{ selectedApartment.number }}
                    </div>
                </div>

                <!-- Step 2: Pet Details -->
                <div class="border-t pt-4">
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input [(ngModel)]="newPet.name" class="w-full border rounded-lg px-3 py-2 focus:outline-blue-500">
                    </div>
                    
                    <div class="flex gap-4 mb-3">
                        <div class="w-1/2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select [(ngModel)]="newPet.type" class="w-full border rounded-lg px-3 py-2 bg-white focus:outline-blue-500">
                                <option value="dog">Perro</option>
                                <option value="cat">Gato</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        <div class="w-1/2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                            <input [(ngModel)]="newPet.breed" class="w-full border rounded-lg px-3 py-2 focus:outline-blue-500">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea [(ngModel)]="newPet.description" rows="2" class="w-full border rounded-lg px-3 py-2 focus:outline-blue-500"></textarea>
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" [(ngModel)]="newPet.vaccinations_current" id="vacc" class="rounded text-blue-600 mr-2">
                        <label for="vacc" class="text-sm text-gray-700 cursor-pointer">Vacunas al día</label>
                    </div>
                </div>
            </div>

            <div class="mt-6 flex justify-end gap-2">
                <button (click)="closeModal()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                <button 
                    (click)="createPet()" 
                    [disabled]="!selectedApartment || !newPet.name" 
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    Guardar
                </button>
            </div>
        </div>
    </div>
  `
})
export class PetListComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);

  pets: any[] = [];
  paginationData: any = { current_page: 1, last_page: 1 };
  searchQuery = '';

  // Modal State
  isModalOpen = false;

  // Apartment Search Logic
  apartmentSearchTerm = '';
  filteredApartments: any[] = [];
  showApartmentDropdown = false;
  selectedApartment: any = null;

  // Form Data
  newPet = { name: '', type: 'dog', breed: '', description: '', vaccinations_current: false };

  ngOnInit() {
    this.loadPets();
  }

  loadPets(page: number = 1) {
    this.apiService.getPets(page, this.searchQuery).subscribe(response => {
      this.pets = response.data;
      this.paginationData = response;
    });
  }

  openCreateModal() {
    this.isModalOpen = true;
    this.resetForm();
  }

  closeModal() {
    this.isModalOpen = false;
  }

  resetForm() {
    this.selectedApartment = null;
    this.apartmentSearchTerm = '';
    this.newPet = { name: '', type: 'dog', breed: '', description: '', vaccinations_current: false };
    this.showApartmentDropdown = false;
  }

  searchApartments() {
    if (!this.apartmentSearchTerm) {
      this.filteredApartments = [];
      this.showApartmentDropdown = false;
      return;
    }

    this.apiService.getApartments(1, this.apartmentSearchTerm).subscribe(res => {
      this.filteredApartments = res.data;
      this.showApartmentDropdown = true;
    });
  }

  selectApartment(apt: any) {
    this.selectedApartment = apt;
    this.apartmentSearchTerm = `Torre ${apt.block} - ${apt.number}`;
    this.showApartmentDropdown = false;
  }

  createPet() {
    if (!this.selectedApartment) return;

    const payload = {
      ...this.newPet,
      apartment_id: this.selectedApartment.id
    };

    this.apiService.createPet(payload).subscribe(() => {
      this.closeModal();
      this.loadPets();
    });
  }

  deletePet(id: number) {
    if (confirm('¿Estás seguro de eliminar esta mascota?')) {
      this.apiService.deletePet(id).subscribe(() => {
        this.loadPets(this.paginationData.current_page);
      });
    }
  }
}
