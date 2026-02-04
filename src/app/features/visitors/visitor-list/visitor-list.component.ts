import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="container mx-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Registro de Visitantes</h2>
        <button (click)="openModal()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            + Nuevo Ingreso
        </button>
      </div>

      <div class="bg-white shadow-md rounded my-6 overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Visitante</th>
              <th class="py-3 px-6 text-left">Documento</th>
              <th class="py-3 px-6 text-left">Apartamento</th>
              <th class="py-3 px-6 text-center">Entrada</th>
              <th class="py-3 px-6 text-center">Salida</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr *ngFor="let visit of visits()" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <div class="font-bold text-gray-900">{{ visit.person?.name }}</div>
                <div class="text-xs text-gray-400 font-bold uppercase">{{ visit.reason || 'Sin motivo' }}</div>
              </td>
              <td class="py-3 px-6 text-left">
                <span class="font-medium">{{ visit.person?.document_type }}</span> {{ visit.person?.document }}
              </td>
              <td class="py-3 px-6 text-left">
                Torre {{ visit.apartment?.block }} - {{ visit.apartment?.number }}
              </td>
              <td class="py-3 px-6 text-center text-xs">{{ visit.entry_at | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td class="py-3 px-6 text-center text-xs">
                {{ visit.exit_at ? (visit.exit_at | date: 'dd/MM/yyyy HH:mm') : 'En curso' }}
              </td>
              <td class="py-3 px-6 text-center">
                <button 
                  *ngIf="!visit.exit_at" 
                  (click)="recordExit(visit.id)" 
                  class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                >
                  Registrar Salida
                </button>
              </td>
            </tr>
            <tr *ngIf="visits().length === 0">
              <td colspan="6" class="py-4 text-center">No hay visitas registradas.</td>
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
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 py-10">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4 text-center">Registrar Ingreso de Visitante</h3>
            <form (ngSubmit)="saveVisit()">
                <div class="flex gap-2 mb-4">
                    <div class="w-1/3">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Tipo</label>
                        <select [(ngModel)]="newVisit.document_type" name="document_type" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
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
                        <input [(ngModel)]="newVisit.document" (blur)="fetchPerson()" name="document" placeholder="Número" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                    <input [(ngModel)]="newVisit.name" name="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Apartamento Destino</label>
                    <select [(ngModel)]="newVisit.apartment_id" name="apartment_id" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                        <option *ngFor="let apt of apartments" [value]="apt.id">Torre {{ apt.block }} - {{ apt.number }}</option>
                    </select>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Motivo / Observaciones</label>
                    <textarea [(ngModel)]="newVisit.reason" name="reason" rows="2" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Teléfono (Opcional)</label>
                    <input [(ngModel)]="newVisit.phone" name="phone" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" (click)="closeModal()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button type="submit" class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">Registrar Ingreso</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VisitorListComponent implements OnInit {
  apiService = inject(ApiService);
  visits = signal<any[]>([]);
  apartments: any[] = [];
  perPage = 5;
  paginationData: any = { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  isModalOpen = false;
  newVisit: any = { document: '', document_type: 'CC', name: '', phone: '', apartment_id: null, reason: '' };

  ngOnInit() {
    this.loadVisits();
    this.apiService.getApartments(1, '').subscribe(response => this.apartments = response.data || response);
  }

  loadVisits(page: number = 1) {
    this.apiService.getVisits(page, '', this.perPage).subscribe(response => {
      this.visits.set(response.data);
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
    this.loadVisits(page);
  }

  onPerPageChange(perPage: number) {
    this.perPage = perPage;
    this.loadVisits(1);
  }

  fetchPerson() {
    if (!this.newVisit.document) return;
    this.apiService.getPersonByDocument(this.newVisit.document).subscribe({
      next: (person) => {
        if (person) {
          this.newVisit.name = person.name;
          this.newVisit.document_type = person.document_type;
          this.newVisit.phone = person.phone;
        }
      },
      error: () => { }
    });
  }

  openModal() {
    this.newVisit = { document: '', document_type: 'CC', name: '', phone: '', apartment_id: null, reason: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveVisit() {
    this.apiService.createVisit(this.newVisit).subscribe(() => {
      this.loadVisits();
      this.closeModal();
    });
  }

  recordExit(id: number) {
    this.apiService.updateVisit(id, {}).subscribe(() => {
      this.loadVisits();
    });
  }
}
