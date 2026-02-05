import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-vigilante-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-800">Maestro de Vigilantes</h2>
          <p class="text-gray-500">Gestión de personal de seguridad y sus accesos</p>
        </div>
        <button (click)="openModal()" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo Vigilante
        </button>
      </div>

      <div class="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto border border-gray-100">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr class="text-gray-500 uppercase text-xs font-bold tracking-wider">
              <th class="py-4 px-6 text-left">Vigilante</th>
              <th class="py-4 px-6 text-left">Contacto</th>
              <th class="py-4 px-6 text-center">Estado de Acceso</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm">
            <tr *ngFor="let v of vigilantes()" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td class="py-4 px-6 text-left uppercase">
                <div class="font-black text-gray-900">{{ v.person?.name }}</div>
                <div class="text-[10px] text-gray-400 font-mono">{{ v.person?.document_type }} {{ v.person?.document }}</div>
              </td>
              <td class="py-4 px-6 text-left">
                <div class="text-xs">{{ v.email }}</div>
                <div class="text-[10px] text-gray-400 italic">{{ v.person?.phone || 'Sin teléfono' }}</div>
              </td>
              <td class="py-4 px-6 text-center">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700 border border-green-200">
                  Activo
                </span>
              </td>
            </tr>
            <tr *ngIf="vigilantes().length === 0">
                <td colspan="3" class="py-12 text-center text-gray-400 italic">No hay vigilantes registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">Registrar Vigilante</h3>

            <div *ngIf="errorMessage()" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded animate-in fade-in zoom-in">
                {{ errorMessage() }}
            </div>

            <form (ngSubmit)="saveVigilante()">
                <div class="flex gap-2 mb-4">
                    <div class="w-1/3">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Tipo</label>
                        <select [(ngModel)]="currentVigilante.document_type" name="document_type" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                            <option value="CC">CC</option>
                            <option value="TI">TI</option>
                            <option value="TE">TE</option>
                        </select>
                    </div>
                    <div class="w-2/3">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Documento</label>
                        <input [(ngModel)]="currentVigilante.document" name="document" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                    <input [(ngModel)]="currentVigilante.name" name="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Email (Usuario)</label>
                    <input [(ngModel)]="currentVigilante.email" name="email" type="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                    <input [(ngModel)]="currentVigilante.phone" name="phone" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                    <input [(ngModel)]="currentVigilante.password" name="password" type="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" (click)="closeModal()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Crear Acceso</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VigilanteListComponent implements OnInit {
  apiService = inject(ApiService);
  vigilantes = signal<any[]>([]);
  errorMessage = signal<string>('');
  isModalOpen = false;
  currentVigilante: any = { document_type: 'CC', document: '', name: '', email: '', phone: '', password: '' };

  ngOnInit() {
    this.loadVigilantes();
  }

  loadVigilantes() {
    this.apiService.getUsers().subscribe((response: any) => {
      const users = Array.isArray(response) ? response : (response.data || []);
      this.vigilantes.set(users.filter((u: any) => u.role?.name === 'vigilante'));
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentVigilante = { document_type: 'CC', document: '', name: '', email: '', phone: '', password: '' };
  }

  saveVigilante() {
    this.errorMessage.set('');
    this.apiService.createVigilante(this.currentVigilante).subscribe({
      next: () => {
        this.loadVigilantes();
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        if (err.error?.errors) {
          const firstError = Object.values(err.error.errors)[0] as string[];
          this.errorMessage.set(firstError[0]);
        } else {
          this.errorMessage.set(err.error?.message || 'Error al crear vigilante. Por favor verifique los datos.');
        }
      }
    });
  }
}
