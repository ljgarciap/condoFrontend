import { Component, inject, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-apartment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Apartamentos</h2>
        <div class="flex gap-4">
            <div class="relative">
                <input 
                    type="text" 
                    [(ngModel)]="searchTerm"
                    placeholder="Buscar..." 
                    class="border rounded py-2 px-4 shadow focus:outline-none focus:shadow-outline"
                >
            </div>
            <button *ngIf="authService.isAdmin()" (click)="openModal()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                + Crear
            </button>
        </div>
      </div>
      
      <div class="bg-white shadow-md rounded my-6 overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Torre</th>
              <th class="py-3 px-6 text-left">Piso</th>
              <th class="py-3 px-6 text-left">Número</th>
              <th class="py-3 px-6 text-left">Propietario</th>
              <th class="py-3 px-6 text-center">Vehículos</th>
              <th class="py-3 px-6 text-center">Residentes</th>
              <th class="py-3 px-6 text-center" *ngIf="authService.isAdmin()">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr *ngFor="let apt of filteredApartments()" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">{{ apt.block }}</td>
              <td class="py-3 px-6 text-left">{{ apt.floor }}</td>
              <td class="py-3 px-6 text-left">{{ apt.number }}</td>
              <td class="py-3 px-6 text-left">{{ apt.owner?.name || 'N/A' }}</td>
              <td class="py-3 px-6 text-center">
                <button (click)="openDetailsModal(apt, 'vehicles')" class="bg-blue-200 text-blue-600 py-1 px-3 rounded-full text-xs hover:bg-blue-300 transition focus:outline-none">
                    {{ apt.vehicles?.length || 0 }}
                </button>
              </td>
              <td class="py-3 px-6 text-center">
                 <button (click)="openDetailsModal(apt, 'residents')" class="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs hover:bg-green-300 transition focus:outline-none">
                    {{ apt.residents?.length || 0 }}
                 </button>
              </td>
              <td class="py-3 px-6 text-center" *ngIf="authService.isAdmin()">
                <button (click)="openModal(apt)" class="text-blue-500 hover:text-blue-700 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </button>
                <button (click)="deleteApartment(apt.id)" class="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredApartments().length === 0">
              <td colspan="7" class="py-4 text-center">No se encontraron apartamentos.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Detail Modal -->
      <div *ngIf="isDetailModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">
                {{ detailType === 'vehicles' ? 'Vehículos' : 'Residentes' }} 
                (Apto Torre {{ currentApartment.block }} - {{ currentApartment.number }})
            </h3>
            
            <ul class="list-disc pl-5">
                <ng-container *ngIf="detailType === 'vehicles'">
                    <li *ngFor="let vehicle of currentApartment.vehicles">
                        <span class="font-bold border px-1 rounded">{{ vehicle.plate }}</span> - {{ vehicle.type === 'car' ? 'Carro' : 'Moto' }}
                        <span class="text-xs text-gray-500 block">{{ vehicle.description }}</span>
                    </li>
                    <li *ngIf="!currentApartment.vehicles?.length" class="text-gray-500">Sin vehículos.</li>
                </ng-container>
                
                <ng-container *ngIf="detailType === 'residents'">
                    <li *ngFor="let resident of currentApartment.residents" class="mb-2">
                        <div class="flex items-center gap-2">
                            <span class="font-bold">{{ resident.name }}</span>
                            <span *ngIf="resident.id === currentApartment.owner_id" class="bg-yellow-200 text-yellow-800 text-xs px-2 rounded-full">Propietario</span>
                        </div>
                        <div class="text-sm text-gray-600">
                             <div>Tel: {{ resident.phone || 'N/A' }}</div>
                             <div>Edad: {{ calculateAge(resident.birthdate) }} años</div>
                        </div>
                    </li>
                     <li *ngIf="!currentApartment.residents?.length" class="text-gray-500">Sin residentes.</li>
                </ng-container>
            </ul>

            <div class="mt-4 flex justify-end">
                 <button (click)="closeDetailModal()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cerrar</button>
            </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-40">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Editar' : 'Crear' }} Apartamento</h3>
            <form (ngSubmit)="saveApartment()">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Torre</label>
                    <input [(ngModel)]="editApartment.block" name="block" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline uppercase" required placeholder="Ej: 5">
                </div>
                 <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Piso</label>
                    <input [(ngModel)]="editApartment.floor" name="floor" type="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Número</label>
                    <input [(ngModel)]="editApartment.number" name="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                 <div class="mb-4 relative">
                     <label class="block text-gray-700 text-sm font-bold mb-2">Propietario (Buscar Residente)</label>
                     <input 
                        type="text" 
                        [(ngModel)]="ownerSearchTerm" 
                        name="ownerSearch"
                        placeholder="Nombre o Documento..." 
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        (input)="filterResidents()"
                        (focus)="showOwnerDropdown = true"
                     >
                     <!-- Dropdown -->
                     <ul *ngIf="showOwnerDropdown && filteredOwnerList.length > 0" class="absolute z-10 bg-white border border-gray-300 w-full mt-1 max-h-48 overflow-y-auto rounded shadow-lg">
                        <li 
                            *ngFor="let resident of filteredOwnerList" 
                            (click)="selectOwner(resident)"
                            class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                            <div class="font-bold">{{ resident.name }}</div> 
                            <div class="text-xs text-gray-500">{{ resident.document ? 'Doc: ' + resident.document : '' }} - {{ resident.email }}</div>
                        </li>
                     </ul>
                      <div *ngIf="selectedOwnerName" class="mt-1 text-sm text-green-600">
                        Seleccionado: {{ selectedOwnerName }}
                     </div>
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
export class ApartmentListComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  apartments = signal<any[]>([]);
  residents: any[] = [];
  searchTerm = signal('');

  // Create/Edit Modal State
  isModalOpen = false;
  isEditing = false;
  editApartment: any = { block: '', number: '', floor: '', owner_id: null };

  // Owner Autocomplete
  ownerSearchTerm = '';
  showOwnerDropdown = false;
  filteredOwnerList: any[] = [];
  selectedOwnerName = '';

  // Detail Modal State
  isDetailModalOpen = false;
  detailType: 'vehicles' | 'residents' = 'residents';
  currentApartment: any = {};

  filteredApartments = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.apartments()
      .filter(apt => {
        const fullIdentifier = (apt.block + apt.number).toLowerCase();
        return apt.block.toLowerCase().includes(term) ||
          apt.number.toLowerCase().includes(term) ||
          fullIdentifier.includes(term) ||
          (apt.owner?.name || '').toLowerCase().includes(term);
      })
      .sort((a, b) => {
        if (a.block !== b.block) return Number(a.block) - Number(b.block);
        if (a.floor !== b.floor) return Number(a.floor) - Number(b.floor);
        return Number(a.number) - Number(b.number);
      });
  });

  ngOnInit() {
    this.loadApartments();
    this.loadResidents();
  }

  loadApartments() {
    this.apiService.getApartments().subscribe(data => {
      this.apartments.set(data);
    });
  }

  loadResidents() {
    this.apiService.getResidents().subscribe(data => {
      this.residents = data;
    });
  }

  // Autocomplete Logic
  filterResidents() {
    const term = this.ownerSearchTerm.toLowerCase();
    if (!term) {
      this.filteredOwnerList = [];
      return;
    }
    this.filteredOwnerList = this.residents.filter(res =>
      res.name.toLowerCase().includes(term) ||
      (res.document && res.document.toLowerCase().includes(term))
    );
    this.showOwnerDropdown = true;
  }

  selectOwner(resident: any) {
    this.editApartment.owner_id = resident.id;
    this.selectedOwnerName = resident.name;
    this.ownerSearchTerm = ''; // or keep name
    this.showOwnerDropdown = false;
  }

  openModal(apartment: any = null) {
    this.ownerSearchTerm = '';
    this.selectedOwnerName = '';
    this.filteredOwnerList = [];
    this.showOwnerDropdown = false;

    if (apartment) {
      this.isEditing = true;
      this.editApartment = { ...apartment };
      if (apartment.owner) {
        this.editApartment.owner_id = apartment.owner.id;
        this.selectedOwnerName = apartment.owner.name;
      }
    } else {
      this.isEditing = false;
      this.editApartment = { block: '', number: '', floor: '', owner_id: null };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openDetailsModal(apartment: any, type: 'vehicles' | 'residents') {
    this.currentApartment = apartment;
    this.detailType = type;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
  }

  calculateAge(birthdate: string): number {
    if (!birthdate) return 0;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  saveApartment() {
    // Uppercase block
    if (this.editApartment.block) this.editApartment.block = this.editApartment.block.toUpperCase();

    if (this.isEditing) {
      this.apiService.updateApartment(this.editApartment.id, this.editApartment).subscribe(() => {
        this.loadApartments();
        this.closeModal();
      });
    } else {
      this.apiService.createApartment(this.editApartment).subscribe(() => {
        this.loadApartments();
        this.closeModal();
      });
    }
  }

  deleteApartment(id: number) {
    if (confirm('¿Estás seguro de eliminar este apartamento?')) {
      this.apiService.deleteApartment(id).subscribe(() => {
        this.loadApartments();
      });
    }
  }
}
