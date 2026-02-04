import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoleTranslatePipe } from '../../../shared/pipes/role-translate.pipe';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RoleTranslatePipe],
    template: `
    <div class="container mx-auto max-w-4xl">
      <div class="mb-8">
        <h2 class="text-3xl font-black text-gray-800">Mi Perfil</h2>
        <p class="text-gray-500">Información personal y de contacto registrada en la copropiedad</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Sidebar Info -->
        <div class="md:col-span-1 space-y-6">
            <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center">
                <div class="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl mb-4 font-black">
                    {{ (user()?.person?.name || 'U')[0] }}
                </div>
                <h3 class="text-xl font-bold text-gray-900">{{ user()?.person?.name }}</h3>
                <p class="text-xs font-black uppercase tracking-widest text-indigo-500 mt-1">{{ user()?.role?.name | roleTranslate }}</p>
                
                <div class="mt-6 pt-6 border-t border-gray-100 w-full text-left space-y-4">
                    <div>
                        <span class="text-[10px] font-black uppercase text-gray-400 block mb-1">Identificación</span>
                        <span class="text-sm font-bold text-gray-700">{{ user()?.person?.document_type }} {{ user()?.person?.document }}</span>
                    </div>
                </div>
            </div>

            <div class="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
                <h4 class="text-lg font-bold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    Mi Vivienda
                </h4>
                <div *ngIf="apartment()" class="space-y-4">
                    <div class="text-4xl font-black">
                        {{ apartment()?.block }}{{ apartment()?.number }}
                    </div>
                    <div class="text-indigo-100 text-xs font-medium">
                        Piso: {{ apartment()?.floor || 'N/A' }} | Torre: {{ apartment()?.block }}
                    </div>
                </div>
                <div *ngIf="!apartment()" class="text-xs italic opacity-60">No se encontraron datos de vivienda.</div>
            </div>
        </div>

        <!-- Details -->
        <div class="md:col-span-2 space-y-6">
            <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h4 class="text-lg font-bold text-gray-800 mb-6 border-b border-gray-50 pb-4">Información de Contacto</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <label class="block text-[10px] font-black uppercase text-gray-400 mb-1">Email</label>
                        <div class="text-sm font-bold text-gray-900">{{ user()?.person?.email || 'N/A' }}</div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black uppercase text-gray-400 mb-1">Teléfono</label>
                        <div class="text-sm font-bold text-gray-900">{{ user()?.person?.phone || 'N/A' }}</div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h4 class="text-lg font-bold text-gray-800 mb-6 border-b border-gray-50 pb-4">Privacidad y Políticas</h4>
                <div class="flex items-start gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div class="p-2 bg-green-100 text-green-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                    </div>
                    <div>
                        <h5 class="text-sm font-bold text-green-800">Políticas Aceptadas</h5>
                        <p class="text-xs text-green-700 opacity-80 mt-1">Has aceptado la política de Habeas Data el {{ user()?.policies_accepted_at | date:'mediumDate' }}.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class ProfileComponent implements OnInit {
    apiService = inject(ApiService);
    authService = inject(AuthService);
    user = signal<any>(this.authService.currentUser());
    apartment = signal<any>(null);

    ngOnInit() {
        this.loadMyApartment();
    }

    loadMyApartment() {
        // Calling getApartments while filtered for resident will return just their apartment
        this.apiService.getApartments(1, '').subscribe(response => {
            const apts = response.data || [];
            if (apts.length > 0) {
                this.apartment.set(apts[0]);
            }
        });
    }
}
