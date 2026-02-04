import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-cartera-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="container mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
           <h2 class="text-3xl font-extrabold text-gray-800">Seguimiento de Cartera</h2>
           <p class="text-gray-500">Control de pagos y deudas</p>
        </div>
        <div *ngIf="authService.isAdmin()" class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button (click)="openChargeModal()" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Registrar Cobro
            </button>
            <button (click)="openPaymentModal()" class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Registrar Pago
            </button>
        </div>
      </div>

      <div class="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto border border-gray-100 my-6">
        <table class="min-w-full table-auto">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Apartamento</th>
              <th class="py-3 px-6 text-left">Concepto</th>
              <th class="py-3 px-6 text-center">Valor</th>
              <th class="py-3 px-6 text-center">Fecha Limite / Pago</th>
              <th class="py-3 px-6 text-center">Estado</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr *ngFor="let payment of payments()" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left font-bold">
                {{ payment.apartment?.block }}{{ payment.apartment?.number }}
              </td>
              <td class="py-3 px-6 text-left">
                {{ payment.description || 'Administración' }}
              </td>
              <td class="py-3 px-6 text-center font-bold">
                $ {{ payment.amount | number }}
              </td>
              <td class="py-3 px-6 text-center">
                <div class="flex flex-col text-xs">
                    <span>Límite: {{ payment.due_date | date:'dd/MM/yyyy' }}</span>
                    <span *ngIf="payment.paid_date" class="text-green-600 font-bold">Pagado: {{ payment.paid_date | date:'dd/MM/yyyy' }}</span>
                </div>
              </td>
              <td class="py-3 px-6 text-center">
                <span [ngClass]="{
                  'bg-green-100 text-green-800': payment.status === 'paid',
                  'bg-yellow-100 text-yellow-800': payment.status === 'pending',
                  'bg-red-100 text-red-800': payment.status === 'overdue'
                }" class="px-2 py-1 rounded-full text-xs font-bold uppercase">
                  {{ payment.status === 'paid' ? 'Pagado' : (payment.status === 'overdue' ? 'Vencido' : 'Pendiente') }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <button *ngIf="authService.isAdmin() && payment.status !== 'paid'" (click)="markAsPaid(payment)" class="text-green-500 hover:text-green-700 font-bold text-xs uppercase underline">
                  Marcar Pago
                </button>
                <button *ngIf="authService.isAdmin()" (click)="deletePayment(payment.id)" class="text-red-500 hover:text-red-700 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
                <span *ngIf="!authService.isAdmin()" class="text-gray-400 text-xs italic">-</span>
              </td>
            </tr>
            <tr *ngIf="payments().length === 0">
              <td colspan="6" class="py-4 text-center">No hay registros de cartera.</td>
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

      <!-- Modal Registrar Cobro -->
      <div *ngIf="isChargeModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">Registrar Nuevo Cobro</h3>
            <form (ngSubmit)="saveCharge()">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Apartamento</label>
                    <select [(ngModel)]="activeRecord.apartment_id" name="apartment_id" class="shadow border rounded w-full py-2 px-3 focus:outline-none" required>
                        <option *ngFor="let apt of apartments" [value]="apt.id">Torre {{ apt.block }} - {{ apt.number }}</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Concepto</label>
                    <input [(ngModel)]="activeRecord.description" name="description" placeholder="Ej: Administración Febrero" class="shadow border rounded w-full py-2 px-3 focus:outline-none" required>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Valor ($)</label>
                    <input type="number" [(ngModel)]="activeRecord.amount" name="amount" class="shadow border rounded w-full py-2 px-3 focus:outline-none" required>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Fecha Límite</label>
                    <input type="date" [(ngModel)]="activeRecord.due_date" name="due_date" class="shadow border rounded w-full py-2 px-3 focus:outline-none" required>
                </div>
                <div class="flex justify-end gap-2">
                    <button type="button" (click)="closeModals()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded">Guardar</button>
                </div>
            </form>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class CarteraListComponent implements OnInit {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  payments = signal<any[]>([]);
  apartments: any[] = [];
  perPage = 10;
  paginationData: any = { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  isChargeModalOpen = false;
  activeRecord: any = { apartment_id: '', amount: 0, due_date: '', description: '', status: 'pending' };

  ngOnInit() {
    this.loadPayments();
    this.apiService.getApartments(1, '', 500).subscribe(response => this.apartments = response.data || response);
  }

  loadPayments(page: number = 1) {
    this.apiService.getAdminPayments(page, this.perPage).subscribe(response => {
      this.payments.set(response.data);
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
    this.loadPayments(page);
  }

  onPerPageChange(perPage: number) {
    this.perPage = perPage;
    this.loadPayments(1);
  }

  openChargeModal() {
    this.activeRecord = { apartment_id: '', amount: 0, due_date: '', description: '', status: 'pending' };
    this.isChargeModalOpen = true;
  }

  openPaymentModal() {
    // For now we use the same as "Marcar Pago" on existing list or a quick register
    // But let's simplify: user can register a charge and then mark it as paid.
    this.openChargeModal();
  }

  closeModals() {
    this.isChargeModalOpen = false;
  }

  saveCharge() {
    this.apiService.createAdminPayment(this.activeRecord).subscribe(() => {
      this.loadPayments();
      this.closeModals();
    });
  }

  markAsPaid(payment: any) {
    if (!confirm('¿Marcar este registro como PAGADO hoy?')) return;

    this.apiService.updateAdminPayment(payment.id, {
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0]
    }).subscribe(() => {
      this.loadPayments();
    });
  }

  deletePayment(id: number) {
    if (!confirm('¿Eliminar este registro de cartera?')) return;
    this.apiService.deleteAdminPayment(id).subscribe(() => this.loadPayments());
  }
}
