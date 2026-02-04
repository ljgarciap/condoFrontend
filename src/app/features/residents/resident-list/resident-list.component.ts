import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-resident-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Residentes</h2>
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
              <th class="py-3 px-6 text-left">Nombre</th>
              <th class="py-3 px-6 text-left">Correo</th>
              <th class="py-3 px-6 text-left">Teléfono</th>
              <th class="py-3 px-6 text-left">Apartamento</th>
              <th class="py-3 px-6 text-center">Nacimiento</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr *ngFor="let resident of filteredResidents()" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left font-bold">{{ resident.name }}</td>
              <td class="py-3 px-6 text-left">{{ resident.email || '-' }}</td>
              <td class="py-3 px-6 text-left">{{ resident.phone || '-' }}</td>
              <td class="py-3 px-6 text-left">
                {{ resident.apartment?.block }}{{ resident.apartment?.number }}
              </td>
              <td class="py-3 px-6 text-center">{{ resident.birthdate | date: 'dd/MM/yyyy' }}</td>
              <td class="py-3 px-6 text-center" *ngIf="authService.isAdmin()">
                 <button (click)="openModal(resident)" class="text-blue-500 hover:text-blue-700 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </button>
                <button (click)="deleteResident(resident.id)" class="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
              </td>
            </tr>
             <tr *ngIf="filteredResidents().length === 0">
              <td colspan="6" class="py-4 text-center">No se encontraron residentes.</td>
            </tr>
          </tbody>
        </table>
      </div>

       <!-- Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Editar' : 'Crear' }} Residente</h3>
            <form (ngSubmit)="saveResident()">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
                    <input [(ngModel)]="currentResident.name" name="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                 <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Documento</label>
                    <input [(ngModel)]="currentResident.document" name="document" placeholder="Cédula / DNI" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Fecha Nacimiento</label>
                    <input [(ngModel)]="currentResident.birthdate" name="birthdate" type="date" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                <div class="mb-4">
                     <label class="block text-gray-700 text-sm font-bold mb-2">Apartamento</label>
                     <select [(ngModel)]="currentResident.apartment_id" name="apartment_id" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                         <option *ngFor="let apt of apartments" [value]="apt.id">Torre {{ apt.block }} - {{ apt.number }}</option>
                     </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input [(ngModel)]="currentResident.email" name="email" type="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                 <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                    <input [(ngModel)]="currentResident.phone" name="phone" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
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
export class ResidentListComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  residents = signal<any[]>([]);
  apartments: any[] = [];
  searchTerm = signal('');

  // Modal State
  isModalOpen = false;
  isEditing = false;
  currentResident: any = {};

  filteredResidents = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.residents()
      .filter(res => {
        const fullApt = (res.apartment?.block || '') + (res.apartment?.number || '');
        return res.name.toLowerCase().includes(term) ||
          (res.email || '').toLowerCase().includes(term) ||
          (res.apartment?.block || '').toLowerCase().includes(term) ||
          (res.apartment?.number || '').toLowerCase().includes(term) ||
          fullApt.toLowerCase().includes(term);
      })
      .sort((a, b) => {
        const aptA = a.apartment;
        const aptB = b.apartment;
        if (!aptA || !aptB) return 0;
        if (aptA.block !== aptB.block) return Number(aptA.block) - Number(aptB.block);
        if (aptA.floor !== aptB.floor) return Number(aptA.floor) - Number(aptB.floor);
        return Number(aptA.number) - Number(aptB.number);
      });
  });

  ngOnInit() {
    this.loadResidents();
    this.loadApartments();
  }

  loadResidents() {
    this.apiService.getResidents().subscribe(data => {
      this.residents.set(data);
    });
  }

  loadApartments() {
    this.apiService.getApartments().subscribe(data => {
      this.apartments = data;
    });
  }

  openModal(resident: any = null) {
    if (resident) {
      this.isEditing = true;
      this.currentResident = { ...resident };
      // Ensure apartment_id is set correctly for select
      if (resident.apartment) {
        this.currentResident.apartment_id = resident.apartment.id;
      }
    } else {
      this.isEditing = false;
      this.currentResident = { name: '', document: '', birthdate: '', apartment_id: null, email: '', phone: '' };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveResident() {
    if (this.isEditing) {
      this.apiService.updateResident(this.currentResident.id, this.currentResident).subscribe(() => {
        this.loadResidents();
        this.closeModal();
      });
    } else {
      this.apiService.createResident(this.currentResident).subscribe(() => {
        this.loadResidents();
        this.closeModal();
      });
    }
  }

  deleteResident(id: number) {
    if (confirm('¿Estás seguro de eliminar este residente?')) {
      this.apiService.deleteResident(id).subscribe(() => {
        this.loadResidents();
      });
    }
  }
}
