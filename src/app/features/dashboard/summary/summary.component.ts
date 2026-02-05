import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
    selector: 'app-summary',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container mx-auto">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Resumen del Conjunto</h2>
      
      <div *ngIf="isLoading()" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Residentes -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center mb-4">
                <div class="p-4 bg-blue-100 rounded-lg text-blue-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                </div>
                <div>
                   <p class="text-sm text-gray-500 font-medium">Población</p>
                   <p class="text-2xl font-bold text-gray-800">{{ stats().residents.total }} Residentes</p>
                </div>
            </div>
            
            <div class="border-t border-gray-50 pt-3 mt-2">
                <p class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🐾 Mascotas: {{ stats().pets.total }}</span>
                    <span *ngIf="stats().pets.unvaccinated > 0" class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        {{ stats().pets.unvaccinated }} sin vacuna ⚠️
                    </span>
                </p>
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div class="flex items-center gap-1">
                        <span class="text-lg">🐶</span>
                        <span>{{ stats().pets.dogs }} Perros</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-lg">🐱</span>
                        <span>{{ stats().pets.cats }} Gatos</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Apartamentos -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center mb-4">
                <div class="p-3 bg-purple-100 rounded-lg text-purple-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                </div>
                <h3 class="font-bold text-gray-700">Apartamentos</h3>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Total:</span>
                <span class="font-bold">{{ stats().apartments.total }}</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
                <span class="text-green-600">Datos completos:</span>
                <span class="font-bold">{{ stats().apartments.complete }}</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
                <span class="text-yellow-600">Datos incompletos:</span>
                <span class="font-bold">{{ stats().apartments.incomplete }}</span>
            </div>
        </div>

        <!-- Vehículos -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center mb-4">
                <div class="p-3 bg-indigo-100 rounded-lg text-indigo-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 18.75h6m-12.75-6h1.125c.621 0 1.125-.504 1.125-1.125V9.75M4.875 4.875h14.25c.621 0 1.125.504 1.125 1.125v1.875c0 .621-.504 1.125-1.125 1.125H4.875a1.125 1.125 0 0 1-1.125-1.125V6c0-.621.504-1.125 1.125-1.125Z" />
                    </svg>
                </div>
                <h3 class="font-bold text-gray-700">Vehículos</h3>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="col-span-2 pb-2 border-b border-gray-50 mb-2">
                    <span class="text-gray-500 font-bold block mb-1">Registrados Total:</span>
                     <div class="flex items-center gap-4">
                        <div>
                            <span class="text-3xl font-black text-gray-800">{{ stats().vehicles.total }}</span>
                        </div>
                        <div class="text-xs space-y-1">
                            <div class="flex items-center gap-1">
                                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span class="text-gray-600">Carros: <b>{{ stats().vehicles.cars }}</b></span>
                            </div>
                            <div class="flex items-center gap-1">
                                <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                                <span class="text-gray-600">Motos: <b>{{ stats().vehicles.motos }}</b></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-span-2">
                    <span class="text-blue-600 font-bold block mb-1">Adentro Ahora:</span>
                    <div class="flex items-center gap-4">
                        <div>
                            <span class="text-3xl font-black text-gray-800">{{ stats().vehicles.inside }}</span>
                        </div>
                        <div class="text-xs space-y-1">
                            <div class="flex items-center gap-1">
                                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span class="text-gray-600">Carros: <b>{{ stats().vehicles.cars_inside }}</b></span>
                            </div>
                            <div class="flex items-center gap-1">
                                <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                                <span class="text-gray-600">Motos: <b>{{ stats().vehicles.motos_inside }}</b></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cartera -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div class="p-4 bg-red-100 rounded-lg text-red-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Deuda Total en Mora</p>
                <p class="text-2xl font-bold text-red-600">$ {{ stats().portfolio.total_overdue | number }}</p>
                <p class="text-xs text-gray-400">{{ stats().portfolio.in_debt_count }} aptos con mora</p>
            </div>
        </div>

        <!-- Visitantes -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div class="p-4 bg-green-100 rounded-lg text-green-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Visitantes Adentro</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats().visitors.inside }}</p>
            </div>
        </div>

        <!-- Demografía -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center mb-4">
                <div class="p-3 bg-yellow-100 rounded-lg text-yellow-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                </div>
                <h3 class="font-bold text-gray-700">Demografía</h3>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Mayores de 70:</span>
                <span class="font-bold">{{ stats().demographics.over_70 }}</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
                <span class="text-gray-500">Menores de 18:</span>
                <span class="font-bold">{{ stats().demographics.under_18 }}</span>
            </div>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class SummaryComponent implements OnInit, OnDestroy {
    apiService = inject(ApiService);
    stats = signal<any>({
        residents: { total: 0 },
        apartments: { total: 0, complete: 0, incomplete: 0 },
        vehicles: { total: 0, cars: 0, motos: 0, inside: 0 },
        portfolio: { in_debt_count: 0, total_overdue: 0 },
        visitors: { inside: 0 },
        demographics: { over_70: 0, under_18: 0 },
        pets: { total: 0, dogs: 0, cats: 0, vaccinated: 0, unvaccinated: 0 }
    });
    isLoading = signal<boolean>(true);

    intervalId: any;

    ngOnInit() {
        this.loadStats();
        // Live update dashboard stats
        this.intervalId = setInterval(() => this.loadStats(), 15000);
    }

    ngOnDestroy() {
        if (this.intervalId) clearInterval(this.intervalId);
    }

    loadStats() {
        this.apiService.getDashboardStats().subscribe({
            next: (data) => {
                this.stats.set(data);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }
}
