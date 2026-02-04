import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-sm">
      <div class="flex justify-between flex-1 sm:hidden">
        <button (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 1" 
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
          Anterior
        </button>
        <button (click)="onPageChange(currentPage + 1)" [disabled]="currentPage === lastPage"
          class="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
          Siguiente
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <p class="text-sm text-gray-700">
            Mostrando <span class="font-medium">{{ from }}</span> a <span class="font-medium">{{ to }}</span> de <span class="font-medium">{{ total }}</span> resultados
          </p>
          <div class="flex items-center gap-2 ml-4">
            <label class="text-xs text-gray-500">Por página:</label>
            <select (change)="onPerPageChange($event)" [value]="perPage" class="border rounded text-xs py-1 px-2 focus:outline-none">
              <option *ngFor="let opt of perPageOptions" [value]="opt">{{ opt }}</option>
            </select>
          </div>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <span class="sr-only">Anterior</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <ng-container *ngFor="let page of pages">
                <button (click)="onPageChange(page)" 
                    [class.bg-blue-50]="page === currentPage"
                    [class.border-blue-500]="page === currentPage"
                    [class.text-blue-600]="page === currentPage"
                    [class.z-10]="page === currentPage"
                    class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                    {{ page }}
                </button>
            </ng-container>

            <button (click)="onPageChange(currentPage + 1)" [disabled]="currentPage === lastPage"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <span class="sr-only">Siguiente</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() lastPage: number = 1;
  @Input() total: number = 0;
  @Input() from: number = 0;
  @Input() to: number = 0;
  @Input() perPage: number = 5;

  @Output() pageChange = new EventEmitter<number>();
  @Output() perPageChange = new EventEmitter<number>();

  perPageOptions = [5, 10, 20, 50, 100, 200, 500];

  get pages(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.lastPage, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.lastPage && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPerPageChange(event: any) {
    const value = parseInt(event.target.value, 10);
    this.perPageChange.emit(value);
  }
}
