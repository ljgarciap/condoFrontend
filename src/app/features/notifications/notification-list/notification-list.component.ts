import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-notification-list',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginationComponent],
    template: `
    <div class="container mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-800">Centro de Notificaciones</h2>
          <p class="text-gray-500">Comunicaciones entre administración y residentes</p>
        </div>
        <button (click)="openModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Notificación
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div *ngFor="let note of notifications()" 
             [class]="'p-6 rounded-2xl border-l-4 shadow-sm transition-all ' + (note.read_at ? 'bg-white border-gray-200 grayscale-[0.5]' : 'bg-indigo-50 border-indigo-500 shadow-md transform hover:scale-[1.01]')">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span [class]="'px-2 py-0.5 rounded text-[10px] uppercase font-black ' + (note.type === 'alert' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')">
                            {{ note.type }}
                        </span>
                        <h3 class="font-bold text-gray-900">{{ note.title }}</h3>
                        <span *ngIf="!note.read_at" class="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    </div>
                    <p class="text-gray-600 text-sm mb-3">{{ note.message }}</p>
                    <div class="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
                        <span class="flex items-center gap-1">
                            De: {{ note.sender?.person?.name || 'Sistema' }}
                        </span>
                        <span>•</span>
                        <span>{{ note.created_at | date:'medium' }}</span>
                    </div>
                </div>
                <button *ngIf="!note.read_at" (click)="markAsRead(note.id)" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase tracking-widest px-3 py-1 hover:bg-indigo-100 rounded-lg transition-colors">
                    Marcar como leída
                </button>
            </div>
        </div>

        <div *ngIf="notifications().length === 0" class="py-20 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-16 h-16 mx-auto mb-4 opacity-20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            No tienes notificaciones por ahora.
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h3 class="text-2xl font-black mb-6 text-gray-800 flex items-center gap-3">
                <div class="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                </div>
                Nueva Notificación
            </h3>

            <form (ngSubmit)="sendNotification()" class="space-y-4">
                <div *ngIf="authService.isAdmin()">
                    <label class="block text-xs font-black uppercase text-gray-400 mb-1 ml-1">Destinatario</label>
                    <select [(ngModel)]="currentNote.receiver_id" name="receiver_id" class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 transition-all outline-none">
                        <option [value]="null">Todos (Broadcast)</option>
                        <option *ngFor="let user of users()" [value]="user.id">{{ user.person?.name }} ({{ user.role?.name }})</option>
                    </select>
                </div>

                <div *ngIf="authService.isResident()">
                    <p class="text-xs font-medium text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">Su mensaje será enviado directamente a la Administración.</p>
                </div>

                <div>
                    <label class="block text-xs font-black uppercase text-gray-400 mb-1 ml-1">Asunto</label>
                    <input [(ngModel)]="currentNote.title" name="title" placeholder="Ej: Reporte de daño" class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 transition-all outline-none" required>
                </div>

                <div>
                    <label class="block text-xs font-black uppercase text-gray-400 mb-1 ml-1">Mensaje</label>
                    <textarea [(ngModel)]="currentNote.message" name="message" rows="4" placeholder="Describa su solicitud..." class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 transition-all outline-none resize-none" required></textarea>
                </div>

                <div class="flex gap-2">
                    <button type="button" (click)="closeModal()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-xl transition-all">Cancelar</button>
                    <button type="submit" class="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all">Enviar Notificación</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class NotificationListComponent implements OnInit {
    apiService = inject(ApiService);
    authService = inject(AuthService);

    notifications = signal<any[]>([]);
    users = signal<any[]>([]);
    isModalOpen = false;
    currentNote: any = { receiver_id: null, title: '', message: '', type: 'info' };

    ngOnInit() {
        this.loadNotifications();
        if (this.authService.isAdmin()) {
            this.loadUsers();
        }
    }

    loadNotifications() {
        this.apiService.getNotifications().subscribe(response => {
            this.notifications.set(response.data);
        });
    }

    loadUsers() {
        // We need an endpoint or use existing getUsers
        this.apiService.getUsers().subscribe(users => {
            this.users.set(users.filter((u: any) => u.id !== this.authService.currentUser().id));
        });
    }

    openModal() {
        this.isModalOpen = true;
        if (this.authService.isResident()) {
            // Enforce sending to Admin (we might need to find an admin ID or handle in backend)
            this.currentNote.receiver_id = null; // Backend handles null receiver from resident as "To Admin"
        }
    }

    closeModal() {
        this.isModalOpen = false;
        this.currentNote = { receiver_id: null, title: '', message: '', type: 'info' };
    }

    sendNotification() {
        this.apiService.sendNotification(this.currentNote).subscribe(() => {
            this.loadNotifications();
            this.closeModal();
        });
    }

    markAsRead(id: number) {
        this.apiService.markNotificationRead(id).subscribe(() => {
            this.loadNotifications();
        });
    }
}
