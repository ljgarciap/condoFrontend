import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-resident-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="container mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
           <h2 class="text-3xl font-extrabold text-gray-800">Residentes</h2>
           <p class="text-gray-500">Listado de habitantes y propietarios</p>
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
              <th class="py-3 px-6 text-left">Nombre</th>
              <th class="py-3 px-6 text-left">Correo</th>
              <th class="py-3 px-6 text-left">Teléfono</th>
              <th class="py-3 px-6 text-left">Apartamento</th>
              <th class="py-3 px-6 text-center">Nacimiento</th>
              <th class="py-3 px-6 text-center" *ngIf="authService.isAdmin()">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr *ngFor="let resident of residents()" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left">
                <div class="font-bold text-gray-900">{{ resident.person?.name }}</div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400">{{ resident.person?.document_type }} {{ resident.person?.document }}</span>
                    <span *ngIf="resident.person?.user" class="text-[8px] font-black uppercase px-1.5 py-0.5 bg-green-100 text-green-700 rounded border border-green-200">Con Acceso</span>
                    <span *ngIf="!resident.person?.user" class="text-[8px] font-black uppercase px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">Sin Acceso</span>
                </div>
              </td>
              <td class="py-3 px-6 text-left">{{ resident.person?.email || '-' }}</td>
              <td class="py-3 px-6 text-left">{{ resident.person?.phone || '-' }}</td>
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
             <tr *ngIf="residents().length === 0">
              <td colspan="6" class="py-4 text-center">No se encontraron residentes.</td>
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
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Editar' : 'Crear' }} Residente</h3>
            
            <div *ngIf="errorMessage()" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded animate-in fade-in zoom-in">
                {{ errorMessage() }}
            </div>

            <form (ngSubmit)="saveResident()">
                <div class="flex gap-2 mb-4">
                    <div class="w-1/3">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Tipo</label>
                        <select [(ngModel)]="currentResident.document_type" name="document_type" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                            <option value="CC">CC</option>
                            <option value="TI">TI</option>
                            <option value="TE">TE</option>
                            <option value="PAS">PAS</option>
                            <option value="PEP">PEP</option>
                            <option value="RC">RC</option>
                        </select>
                    </div>
                    <div class="w-2/3">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Documento</label>
                        <input [(ngModel)]="currentResident.document" (blur)="onDocumentBlur()" name="document" placeholder="Número" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                    <input [(ngModel)]="currentResident.name" name="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
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

                 <div *ngIf="!hasAccess" class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="currentResident.create_user" name="create_user" class="w-4 h-4 text-blue-600">
                        <span class="text-sm font-bold text-blue-800">¿Habilitar acceso a plataforma?</span>
                    </label>
                    <div *ngIf="currentResident.create_user" class="mt-3 animate-in fade-in slide-in-from-top-1">
                        <label class="block text-gray-700 text-xs font-bold mb-1">Contraseña de Acceso</label>
                        <input [(ngModel)]="currentResident.password" name="password" type="password" placeholder="Mínimo 6 caracteres" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" [required]="currentResident.create_user">
                        <p class="text-[10px] text-blue-500 mt-1 italic">El correo registrado será usado para el ingreso.</p>
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
export class ResidentListComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  residents = signal<any[]>([]);
  apartments: any[] = [];
  searchQuery = '';
  perPage = 5;
  paginationData: any = { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Modal State
  isModalOpen = false;
  isEditing = false;
  hasAccess = false;
  errorMessage = signal<string>('');
  currentResident: any = {};

  ngOnInit() {
    this.loadResidents();
    this.loadApartments();
  }

  loadResidents(page: number = 1) {
    this.apiService.getResidents(page, this.searchQuery, this.perPage).subscribe(response => {
      this.residents.set(response.data);
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
    this.loadResidents(page);
  }

  onSearch() {
    this.loadResidents(1);
  }

  onPerPageChange(perPage: number) {
    this.perPage = perPage;
    this.loadResidents(1);
  }

  loadApartments() {
    this.apiService.getApartments(1, '').subscribe(response => {
      this.apartments = response.data || response;
    });
  }

  openModal(resident: any = null) {
    if (resident) {
      this.isEditing = true;
      this.hasAccess = !!resident.person?.user;
      this.currentResident = {
        ...resident,
        name: resident.person?.name,
        document: resident.person?.document,
        document_type: resident.person?.document_type,
        email: resident.person?.email,
        phone: resident.person?.phone,
        apartment_id: resident.apartment?.id,
        create_user: false,
        password: ''
      };
    } else {
      this.isEditing = false;
      this.hasAccess = false;
      this.currentResident = {
        name: '',
        document: '',
        document_type: 'CC',
        birthdate: '',
        apartment_id: null,
        email: '',
        phone: '',
        create_user: false,
        password: ''
      };
    }
    this.isModalOpen = true;
  }

  onDocumentBlur() {
    if (!this.currentResident.document || this.isEditing) return;

    this.apiService.getPersonByDocument(this.currentResident.document).subscribe({
      next: (person) => {
        if (person) {
          this.currentResident.name = person.name;
          this.currentResident.document_type = person.document_type;
          this.currentResident.email = person.email;
          this.currentResident.phone = person.phone;
        }
      },
      error: () => {
        // Person not found, user will fill manually
      }
    });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveResident() {
    this.errorMessage.set('');
    if (this.isEditing) {
      this.apiService.updateResident(this.currentResident.id, this.currentResident).subscribe({
        next: () => {
          this.loadResidents();
          this.closeModal();
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    } else {
      this.apiService.createResident(this.currentResident).subscribe({
        next: () => {
          this.loadResidents();
          this.closeModal();
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }

  private handleError(err: any) {
    console.error(err);
    if (err.error?.errors) {
      const firstError = Object.values(err.error.errors)[0] as string[];
      this.errorMessage.set(firstError[0]);
    } else {
      this.errorMessage.set(err.error?.message || 'Error al guardar residente. Por favor verifique los datos.');
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
