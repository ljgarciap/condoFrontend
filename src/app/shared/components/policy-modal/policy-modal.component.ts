import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-policy-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="isVisible()" class="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <!-- Header -->
        <div class="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <h2 class="text-3xl font-black mb-2">Bienvenido a Ciudadela</h2>
          <p class="text-blue-100 opacity-90">Para continuar, por favor revise y acepte nuestras políticas legales y operativas.</p>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-8 space-y-8">
          <!-- Habeas Data -->
          <section>
            <div class="flex items-center gap-3 mb-4">
                <div class="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">1. Política de Habeas Data (Colombia)</h3>
            </div>
            <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-600 text-sm leading-relaxed">
              <p>De conformidad con la Ley 1581 de 2012, autorizo de manera voluntaria, previa, explícita e informada a <strong>Ciudadela</strong> para recolectar, almacenar y hacer uso de mis datos personales para fines de comunicación, seguridad y gestión administrativa dentro del conjunto residencial.</p>
              <ul class="list-disc ml-5 mt-3 space-y-1">
                <li>Notificaciones de administración y seguridad.</li>
                <li>Control de acceso vehicular y peatonal.</li>
                <li>Gestión de pagos y estados de cuenta.</li>
              </ul>
            </div>
          </section>

          <!-- Vehicle Policy -->
          <section>
            <div class="flex items-center gap-3 mb-4">
                <div class="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 18.75h6m-12.75-6h1.125c.621 0 1.125-.504 1.125-1.125V9.75M4.875 4.875h14.25c.621 0 1.125.504 1.125 1.125v1.875c0 .621-.504 1.125-1.125 1.125H4.875a1.125 1.125 0 0 1-1.125-1.125V6c0-.621.504-1.125 1.125-1.125Z" />
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">2. Política de Acceso Vehicular</h3>
            </div>
            <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-600 text-sm leading-relaxed">
              <p>El ingreso y salida de vehículos está automatizado. Es <strong>obligatorio</strong> registrar su placa y documentos ante la administración para habilitar el acceso. Recuerde que el sistema puede bloquear su ingreso si presenta mora superior al límite permitido.</p>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="p-8 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-6">
           <p class="text-xs text-gray-400 max-w-[200px]">Al hacer clic en aceptar, confirma que ha leído y está de acuerdo con las políticas.</p>
           <button 
            (click)="acceptAndClose()" 
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95"
           >
            Aceptar y Continuar
           </button>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class PolicyModalComponent {
    apiService = inject(ApiService);
    authService = inject(AuthService);
    isVisible = signal<boolean>(this.authService.needsPolicyAcceptance());

    acceptAndClose() {
        this.apiService.acceptPolicies().subscribe(() => {
            // Update local state
            const user = this.authService.currentUser();
            user.policies_accepted_at = new Date().toISOString();
            this.authService.currentUser.set({ ...user });
            localStorage.setItem('user', JSON.stringify(user));
            this.isVisible.set(false);
        });
    }
}
