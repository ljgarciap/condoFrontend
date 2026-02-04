import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-parking-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Historial de Movimientos</h2>
        <button (click)="loadHistory()" class="text-blue-500 hover:text-blue-700">
            Actualizar
        </button>
      </div>

      <div *ngIf="isLoading()" class="text-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-500">Cargando historial...</p>
      </div>

      <div *ngIf="!isLoading()">
        <!-- Warning for stationary vehicles -->
        <div *ngIf="stationary().length > 0" class="mb-8">
            <h3 class="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
                ⚠️ Vehículos Estacionarios (>30 días)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let v of stationary()" class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-xl font-bold text-red-800">{{ v.plate }}</span>
                            <p class="text-sm border inline-block px-1 rounded bg-white ml-2">
                                {{ v.type === 'car' ? 'Carro' : 'Moto' }}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-bold text-red-700 uppercase">Apto {{ v.apartment?.block }}-{{ v.apartment?.number }}</p>
                        </div>
                    </div>
                    <p class="text-sm mt-1">Propietario: <span class="font-bold">{{ v.apartment?.owner?.person?.name || 'N/A' }}</span></p>
                </div>
            </div>
        </div>

        <div class="bg-white shadow-md rounded my-6 overflow-x-auto">
            <table class="min-w-full table-auto text-sm">
            <thead>
                <tr class="bg-gray-200 text-gray-600 uppercase text-xs leading-normal">
                <th class="py-3 px-6 text-left">Placa</th>
                <th class="py-3 px-6 text-left">Tipo</th>
                <th class="py-3 px-6 text-left">Apartamento</th>
                <th class="py-3 px-6 text-center">Entrada</th>
                <th class="py-3 px-6 text-center">Salida</th>
                <th class="py-3 px-6 text-center">Duración</th>
                </tr>
            </thead>
            <tbody class="text-gray-600 font-light">
                <tr *ngFor="let move of movements()" class="border-b border-gray-200 hover:bg-gray-100">
                <td class="py-3 px-6 text-left font-bold">{{ move.vehicle?.plate }}</td>
                <td class="py-3 px-6 text-left capitalize">
                    {{ move.vehicle?.type === 'car' ? 'Carro' : 'Moto' }}
                </td>
                <td class="py-3 px-6 text-left">
                    {{ move.vehicle?.apartment?.block }}{{ move.vehicle?.apartment?.number }}
                    <span class="text-xs text-gray-400 block">{{ move.vehicle?.apartment?.owner?.person?.name }}</span>
                </td>
                <td class="py-3 px-6 text-center">{{ move.entry_time | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td class="py-3 px-6 text-center">
                    {{ move.exit_time ? (move.exit_time | date: 'dd/MM/yyyy HH:mm') : 'Todavía adentro' }}
                </td>
                <td class="py-3 px-6 text-center">
                    {{ calculateDuration(move) }}
                </td>
                </tr>
                <tr *ngIf="movements().length === 0">
                <td colspan="6" class="py-4 text-center">No hay movimientos registrados.</td>
                </tr>
            </tbody>
            </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ParkingHistoryComponent implements OnInit {
  apiService = inject(ApiService);
  movements = signal<any[]>([]);
  stationary = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading.set(true);
    this.apiService.getParkingHistory().subscribe({
      next: (data) => {
        this.movements.set(data.movements);
        this.stationary.set(data.stationary);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  calculateDuration(move: any): string {
    if (!move.exit_time) return '-';
    const start = new Date(move.entry_time);
    const end = new Date(move.exit_time);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';

    const diffMs = end.getTime() - start.getTime();

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  }
}
