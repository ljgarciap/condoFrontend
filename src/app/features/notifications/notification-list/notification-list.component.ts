import { Component, inject, OnInit, signal, Output, EventEmitter } from '@angular/core';
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
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-800">Centro de Notificaciones</h2>
          <p class="text-sm sm:text-base text-gray-500">Comunicaciones entre administración y residentes</p>
        </div>
        <button (click)="openModal()" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Notificación
        </button>
      </div>

      <div class="flex flex-row space-x-1 rounded-xl bg-gray-100 p-1 mb-6 w-full max-w-full sm:max-w-md mx-auto sm:mx-0">
        <button (click)="changeTab('received')" [class]="'flex-1 text-center rounded-lg py-2.5 text-sm font-medium leading-5 transition-all ' + (activeTab === 'received' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700')">
            Recibidas
        </button>
        <button (click)="changeTab('sent')" [class]="'flex-1 text-center rounded-lg py-2.5 text-sm font-medium leading-5 transition-all ' + (activeTab === 'sent' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700')">
            Enviadas
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div *ngFor="let note of notifications()" 
             [class]="'p-4 sm:p-6 rounded-2xl border-l-4 shadow-sm transition-all ' + (activeTab === 'sent' ? 'bg-white border-gray-200' : (note.read_at ? 'bg-white border-gray-200 grayscale-[0.5]' : 'bg-indigo-50 border-indigo-500 shadow-md transform hover:scale-[1.01]'))">
            <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span [class]="'px-2 py-0.5 rounded text-[10px] uppercase font-black ' + (note.type === 'alert' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')">
                            {{ note.type }}
                        </span>
                        <h3 class="font-bold text-gray-900">{{ note.title }}</h3>
                        <span *ngIf="activeTab === 'received' && !note.read_at" class="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    </div>
                    <p class="text-gray-600 text-sm mb-3">{{ note.message }}</p>
                    <div *ngIf="note.attachment" class="mb-3">
                        <button (click)="downloadAttachment(note)" class="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                            </svg>
                            Ver adjunto
                        </button>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-400 font-medium">
                        <span class="flex items-center gap-1">
                            De: {{ note.sender?.person?.name || 'Sistema' }}
                        </span>
                        <span class="hidden sm:inline">•</span>
                        <span>{{ note.created_at | date:'medium' }}</span>
                    </div>
                </div>
                <button *ngIf="activeTab === 'received' && !note.read_at" (click)="markAsRead(note.id)" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase tracking-widest px-3 py-1 hover:bg-indigo-100 rounded-lg transition-colors">
                    Marcar como leída
                </button>
                <div *ngIf="activeTab === 'sent' && note.read_at" class="text-green-600 text-xs font-bold px-3 py-1 bg-green-50 rounded border border-green-100">
                    Leído: {{ note.read_at | date:'short' }}
                </div>
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
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
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
                        <option *ngFor="let user of users()" [value]="user.id">
                            {{ user.person?.name }} 
                            <span *ngIf="user.role?.name === 'resident'">- Apto {{ user.resident?.apartment?.block }}{{ user.resident?.apartment?.number }}</span>
                            ({{ user.role?.name }})
                        </option>
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

                <div>
                    <label class="block text-xs font-black uppercase text-gray-400 mb-1 ml-1">Adjunto (Opcional)</label>
                    <input type="file" (change)="onFileSelected($event)" accept="image/*,.pdf" class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm">
                    <p class="text-xs text-gray-400 mt-1 ml-1">Imágenes o PDF, máx. 10MB</p>
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
    @Output() notificationRead = new EventEmitter<void>();

    notifications = signal<any[]>([]);
    users = signal<any[]>([]);

    // Pagination & Tabs
    currentPage = signal(1);
    totalPages = signal(1);
    perPage = signal(5);
    activeTab: 'received' | 'sent' = 'received';

    isModalOpen = false;
    currentNote: any = { receiver_id: null, title: '', message: '', type: 'info' };
    selectedFile: File | null = null;

    ngOnInit() {
        this.loadNotifications();
        if (this.authService.isAdmin()) {
            this.loadUsers();
        }
    }

    loadNotifications() {
        this.apiService.getNotifications(this.currentPage(), this.perPage(), this.activeTab).subscribe(response => {
            this.notifications.set(response.data);
            this.currentPage.set(response.current_page);
            this.totalPages.set(response.last_page);
        });
    }

    changeTab(tab: 'received' | 'sent') {
        this.activeTab = tab;
        this.currentPage.set(1);
        this.loadNotifications();
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
        this.loadNotifications();
    }

    loadUsers() {
        this.apiService.getUsers(1, '', null).subscribe(response => {
            const allUsers = Array.isArray(response) ? response : (response.data || []);
            this.users.set(allUsers.filter((u: any) => u.id !== this.authService.currentUser()?.id));
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
        if (this.selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                const filename = this.selectedFile!.name;

                // If larger than 1MB, use chunked upload
                if (this.selectedFile!.size > 1 * 1024 * 1024) {
                    this.uploadInChunks(base64, filename);
                } else {
                    const notificationData = {
                        ...this.currentNote,
                        attachment: base64,
                        attachment_name: filename
                    };
                    this.apiService.sendNotification(notificationData).subscribe(() => {
                        this.loadNotifications();
                        this.closeModal();
                    });
                }
            };
            reader.readAsDataURL(this.selectedFile);
        } else {
            this.apiService.sendNotification(this.currentNote).subscribe(() => {
                this.loadNotifications();
                this.closeModal();
            });
        }
    }

    async uploadInChunks(base64: string, filename: string) {
        const chunkSize = 1 * 1024 * 1024; // 1MB chunks (well within 2MB limit)
        const totalChunks = Math.ceil(base64.length / chunkSize);
        const identifier = Math.random().toString(36).substring(2, 10) + Date.now();

        for (let i = 0; i < totalChunks; i++) {
            const chunk = base64.substring(i * chunkSize, (i + 1) * chunkSize);
            const payload = {
                base64_chunk: chunk,
                chunk_index: i,
                total_chunks: totalChunks,
                identifier: identifier,
                filename: filename
            };

            try {
                // Simple use of lastValueFrom might be needed if toPromise() is deprecated
                const response = await this.apiService.uploadChunk(payload).toPromise();

                if (response.status === 'completed') {
                    const notificationData = {
                        ...this.currentNote,
                        attachment_path: response.path,
                        attachment_name: filename
                    };
                    this.apiService.sendNotification(notificationData).subscribe(() => {
                        this.loadNotifications();
                        this.closeModal();
                    });
                }
            } catch (error) {
                console.error('Error uploading chunk', i, error);
                alert('Error al subir el archivo adjunto.');
                break;
            }
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 10MB.');
                event.target.value = '';
                return;
            }
            this.selectedFile = file;
        }
    }

    downloadAttachment(note: any) {
        try {
            const attachmentData = JSON.parse(note.attachment);
            const link = document.createElement('a');

            if (attachmentData.data) {
                // Direct Base64
                link.href = 'data:application/octet-stream;base64,' + attachmentData.data;
            } else if (attachmentData.path) {
                // Stored file path (via proxy)
                link.href = '/storage/' + attachmentData.path;
            }

            link.download = attachmentData.name;
            link.click();
        } catch (e) {
            console.error('Error downloading attachment:', e);
        }
    }

    markAsRead(id: number) {
        this.apiService.markNotificationRead(id).subscribe(() => {
            this.loadNotifications();
            this.notificationRead.emit();
        });
    }
}
