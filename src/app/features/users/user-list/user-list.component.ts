import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="container mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-800">Gestión de Usuarios</h2>
          <p class="text-gray-500">Administración de accesos y roles (Administradores y Vigilantes)</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <div class="relative w-full sm:w-auto">
                <input 
                    type="text" 
                    [(ngModel)]="searchQuery"
                    (keyup.enter)="loadUsers()"
                    placeholder="Buscar usuarios..." 
                    class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <button (click)="openModal()" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nuevo Usuario
            </button>
        </div>
      </div>

      <div class="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto border border-gray-100">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr class="text-gray-500 uppercase text-xs font-bold tracking-wider">
              <th class="py-4 px-6 text-left">Usuario</th>
              <th class="py-4 px-6 text-left">Rol</th>
              <th class="py-4 px-6 text-left">Contacto</th>
              <th class="py-4 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm">
            <tr *ngFor="let u of users()" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td class="py-4 px-6 text-left uppercase">
                <div class="font-black text-gray-900">{{ u.person?.name }}</div>
                <div class="text-[10px] text-gray-400 font-mono">{{ u.person?.document_type }} {{ u.person?.document }}</div>
              </td>
              <td class="py-4 px-6 text-left">
                  <span [ngClass]="{'bg-purple-100 text-purple-700': u.role?.name === 'admin', 'bg-blue-100 text-blue-700': u.role?.name === 'vigilante'}" class="px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {{ u.role?.name === 'admin' ? 'Administrador' : 'Vigilante' }}
                  </span>
              </td>
              <td class="py-4 px-6 text-left">
                <div class="text-xs">{{ u.email }}</div>
                <div class="text-[10px] text-gray-400 italic">{{ u.person?.phone || 'Sin teléfono' }}</div>
              </td>
              <td class="py-4 px-6 text-center flex justify-center gap-2">
                 <button (click)="editUser(u)" class="text-blue-500 hover:text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                 </button>
                 <button (click)="deleteUser(u)" class="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                 </button>
              </td>
            </tr>
            <tr *ngIf="users().length === 0">
                <td colspan="4" class="py-12 text-center text-gray-400 italic">No hay usuarios encontrados.</td>
            </tr>
          </tbody>
        </table>
         <app-pagination
            [currentPage]="paginationData.current_page"
            [lastPage]="paginationData.last_page"
            (pageChange)="changePage($event)">
        </app-pagination>
      </div>

      <!-- User Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Editar' : 'Registrar' }} Usuario</h3>

            <div *ngIf="errorMessage()" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded animate-in fade-in zoom-in">
                {{ errorMessage() }}
            </div>

            <form (ngSubmit)="saveUser()">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Rol</label>
                    <select [(ngModel)]="currentUser.role_name" name="role_name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                        <option value="admin">Administrador</option>
                        <option value="vigilante">Vigilante</option>
                    </select>
                </div>

                <div class="flex gap-2 mb-4">
                    <div class="w-1/3">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Tipo</label>
                        <select [(ngModel)]="currentUser.document_type" name="document_type" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                            <option value="CC">CC</option>
                            <option value="TI">TI</option>
                            <option value="TE">TE</option>
                             <option value="PAS">PAS</option>
                        </select>
                    </div>
                    <div class="w-2/3">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Documento</label>
                        <input [(ngModel)]="currentUser.document" name="document" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                    <input [(ngModel)]="currentUser.name" name="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Email (Usuario)</label>
                    <input [(ngModel)]="currentUser.email" name="email" type="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                    <input [(ngModel)]="currentUser.phone" name="phone" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Contraseña {{ isEditing ? '(Opcional)' : '' }}</label>
                    <input [(ngModel)]="currentUser.password" name="password" type="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" [required]="!isEditing">
                    <p *ngIf="isEditing" class="text-[10px] text-gray-500 mt-1">Dejar en blanco para no cambiar.</p>
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" (click)="closeModal()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{{ isEditing ? 'Actualizar' : 'Crear' }}</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  apiService = inject(ApiService);
  users = signal<any[]>([]);
  paginationData = { current_page: 1, last_page: 1 };
  searchQuery = '';
  errorMessage = signal<string>('');
  isModalOpen = false;
  isEditing = false;

  currentUser: any = {
    id: null,
    document_type: 'CC',
    document: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    role_name: 'vigilante'
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(page: number = 1) {
    this.apiService.getUsers(page, this.searchQuery).subscribe((response: any) => {
      // Handle Laravel Pagination or Array
      if (response.data && Array.isArray(response.data)) {
        this.users.set(response.data);
        this.paginationData = {
          current_page: response.current_page,
          last_page: response.last_page
        };
      } else if (Array.isArray(response)) {
        this.users.set(response);
      }
    });
  }

  changePage(page: number) {
    this.loadUsers(page);
  }

  openModal() {
    this.isEditing = false;
    this.currentUser = { document_type: 'CC', document: '', name: '', email: '', phone: '', password: '', role_name: 'vigilante' };
    this.isModalOpen = true;
  }

  editUser(user: any) {
    this.isEditing = true;
    this.currentUser = {
      id: user.id,
      document_type: user.person?.document_type || 'CC',
      document: user.person?.document || '',
      name: user.person?.name || '',
      email: user.email,
      phone: user.person?.phone || '',
      password: '',
      role_name: user.role?.name || 'vigilante'
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.errorMessage.set('');
  }

  saveUser() {
    this.errorMessage.set('');

    const request = this.isEditing
      ? this.apiService.updateUser(this.currentUser.id, this.currentUser)
      : this.apiService.createUser(this.currentUser);

    request.subscribe({
      next: () => {
        this.loadUsers(this.paginationData.current_page);
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        if (err.error?.errors) {
          const firstError = Object.values(err.error.errors)[0] as string[];
          this.errorMessage.set(firstError[0]);
        } else {
          this.errorMessage.set(err.error?.message || 'Error al guardar usuario.');
        }
      }
    });
  }

  deleteUser(user: any) {
    if (confirm(`¿Estás seguro de eliminar el usuario ${user.person?.name || user.email}?`)) {
      this.apiService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers(this.paginationData.current_page);
          alert('El usuario ha sido eliminado.');
        },
        error: (err) => alert('No se pudo eliminar el usuario.')
      });
    }
  }
}
