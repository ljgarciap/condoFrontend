import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-person-list',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginationComponent],
    template: `
    <div class="container mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-800">Maestro de Personas</h2>
          <p class="text-gray-500">Gestión centralizada de identidades (Residentes, Usuarios y Visitantes)</p>
        </div>
        <div class="flex gap-4">
            <div class="relative">
                <input 
                    type="text" 
                    [(ngModel)]="searchQuery"
                    (keyup.enter)="onSearch()"
                    placeholder="Buscar por nombre o doc..." 
                    class="border-2 border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 transition-all"
                >
                <button (click)="onSearch()" class="absolute right-2 top-2 text-gray-400 hover:text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </button>
            </div>
            <button *ngIf="authService.isAdmin()" (click)="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nueva Persona
            </button>
        </div>
      </div>
      
      <div class="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr class="text-gray-500 uppercase text-xs font-bold tracking-wider">
              <th class="py-4 px-6 text-left">Identificacion</th>
              <th class="py-4 px-6 text-left">Información Personal</th>
              <th class="py-4 px-6 text-center">Roles / Vínculos</th>
              <th class="py-4 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm">
            <tr *ngFor="let person of people()" class="border-b border-gray-100 hover:bg-blue-50 transition-colors">
              <td class="py-4 px-6 text-left">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-1">
                  {{ person.document_type }}
                </span>
                <span class="font-mono text-gray-900 font-bold">{{ person.document }}</span>
              </td>
              <td class="py-4 px-6 text-left">
                <div class="text-base font-semibold text-gray-900">{{ person.name }}</div>
                <div class="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        {{ person.email || 'N/A' }}
                    </span>
                    <span class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                        </svg>
                        {{ person.phone || 'N/A' }}
                    </span>
                </div>
              </td>
              <td class="py-4 px-6 text-center">
                <div class="flex flex-wrap justify-center gap-2">
                    <span *ngIf="person.user" class="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] uppercase font-bold border border-blue-200">Usuario</span>
                    <span *ngIf="person.residents && person.residents.length > 0" class="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] uppercase font-bold border border-green-200">Residente</span>
                    <span *ngIf="person.visits && person.visits.length > 0" class="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] uppercase font-bold border border-purple-200">Visitante</span>
                    <span *ngIf="!person.user && (!person.residents || person.residents.length === 0) && (!person.visits || person.visits.length === 0)" class="px-2 py-0.5 rounded bg-gray-100 text-gray-400 text-[10px] uppercase font-bold italic">Sin asignar</span>
                </div>
              </td>
              <td class="py-4 px-6 text-center">
                <div class="flex justify-center gap-3">
                    <button (click)="openModal(person)" class="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    <button (click)="deletePerson(person.id)" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="people().length === 0">
              <td colspan="4" class="py-12 text-center text-gray-500">
                <div class="flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-12 h-12 text-gray-300">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                    </svg>
                    No se encontraron personas registradas.
                </div>
              </td>
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
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="relative p-6 border w-[450px] shadow-2xl rounded-2xl bg-white border-gray-200">
            <h3 class="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span class="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </span>
                {{ isEditing ? 'Actualizar' : 'Registrar' }} Información Base
            </h3>

            <form (ngSubmit)="savePerson()" class="space-y-5">
                <div class="flex gap-4">
                    <div class="w-1/3">
                        <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Tipo Doc.</label>
                        <select [(ngModel)]="currentPerson.document_type" name="document_type" class="w-full bg-gray-50 border-2 border-gray-100 rounded-lg py-2 px-3 text-gray-700 leading-tight focus:bg-white focus:border-blue-500 focus:outline-none transition-all" required>
                            <option value="CC">CC</option>
                            <option value="TI">TI</option>
                            <option value="TE">TE</option>
                            <option value="PAS">PAS</option>
                            <option value="PEP">PEP</option>
                            <option value="RC">RC</option>
                        </select>
                    </div>
                    <div class="w-2/3">
                        <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Número Documento</label>
                        <input [(ngModel)]="currentPerson.document" name="document" placeholder="Ingrese número" class="w-full bg-gray-50 border-2 border-gray-100 rounded-lg py-2 px-3 text-gray-700 leading-tight focus:bg-white focus:border-blue-500 focus:outline-none transition-all" required>
                    </div>
                </div>

                <div>
                    <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Nombre Completo</label>
                    <input [(ngModel)]="currentPerson.name" name="name" placeholder="Ej: Juan Perez" class="w-full bg-gray-50 border-2 border-gray-100 rounded-lg py-2 px-3 text-gray-700 leading-tight focus:bg-white focus:border-blue-500 focus:outline-none transition-all" required>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
                        <input [(ngModel)]="currentPerson.email" name="email" type="email" placeholder="email@ejemplo.com" class="w-full bg-gray-50 border-2 border-gray-100 rounded-lg py-2 px-3 text-gray-700 leading-tight focus:bg-white focus:border-blue-500 focus:outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Teléfono</label>
                        <input [(ngModel)]="currentPerson.phone" name="phone" placeholder="300 1234567" class="w-full bg-gray-50 border-2 border-gray-100 rounded-lg py-2 px-3 text-gray-700 leading-tight focus:bg-white focus:border-blue-500 focus:outline-none transition-all">
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                    <button type="button" (click)="closeModal()" class="bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-500 font-bold py-2.5 px-6 rounded-lg transition-all">Cancelar</button>
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-200 transition-all">
                        {{ isEditing ? 'Guardar Cambios' : 'Crear Persona' }}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class PersonListComponent implements OnInit {
    authService = inject(AuthService);
    apiService = inject(ApiService);

    people = signal<any[]>([]);
    searchQuery = '';
    perPage = 5;
    paginationData: any = { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

    // Modal State
    isModalOpen = false;
    isEditing = false;
    currentPerson: any = {};

    ngOnInit() {
        this.loadPeople();
    }

    loadPeople(page: number = 1) {
        this.apiService.getPeople(page, this.searchQuery, this.perPage).subscribe(response => {
            this.people.set(response.data);
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
        this.loadPeople(page);
    }

    onSearch() {
        this.loadPeople(1);
    }

    onPerPageChange(perPage: number) {
        this.perPage = perPage;
        this.loadPeople(1);
    }

    openModal(person: any = null) {
        if (person) {
            this.isEditing = true;
            this.currentPerson = { ...person };
        } else {
            this.isEditing = false;
            this.currentPerson = { name: '', document: '', document_type: 'CC', email: '', phone: '' };
        }
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    savePerson() {
        if (this.isEditing) {
            this.apiService.updatePerson(this.currentPerson.id, this.currentPerson).subscribe(() => {
                this.loadPeople();
                this.closeModal();
            });
        } else {
            this.apiService.createPerson(this.currentPerson).subscribe(() => {
                this.loadPeople();
                this.closeModal();
            });
        }
    }

    deletePerson(id: number) {
        if (confirm('¿Estás seguro de eliminar este registro? Esto no afectará asignaciones existentes pero la persona no aparecerá en búsquedas.')) {
            this.apiService.deletePerson(id).subscribe({
                next: () => {
                    this.loadPeople();
                },
                error: (err) => {
                    alert(err.error?.message || 'Error al eliminar la persona. Verifique si tiene vínculos activos.');
                }
            });
        }
    }
}
