import { Component, inject, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-apartment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="container mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-800">Apartamentos</h2>
          <p class="text-gray-500">Gestión de unidades residenciales</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div class="relative w-full sm:w-auto">
                <input 
                    type="text" 
                    [(ngModel)]="searchQuery"
                    (keyup.enter)="onSearch()"
                    placeholder="Buscar..." 
                    class="border-2 border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64 transition-all"
                >
                <button (click)="onSearch()" class="absolute right-2 top-2 text-gray-400 hover:text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </button>
            </div>
            <button *ngIf="authService.isAdmin()" (click)="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Crear
            </button>
        </div>
      </div>
      
      <div class="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto border border-gray-100 my-6">
        <table class="min-w-full table-auto">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Torre</th>
              <th class="py-3 px-6 text-left">Piso</th>
              <th class="py-3 px-6 text-left">Número</th>
              <th class="py-3 px-6 text-left">Propietario</th>
              <th class="py-3 px-6 text-center">Vehículos</th>
              <th class="py-3 px-6 text-center">Mascotas</th>
              <th class="py-3 px-6 text-center">Residentes</th>
              <th class="py-3 px-6 text-center" *ngIf="authService.isAdmin()">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr *ngFor="let apt of apartments()" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">{{ apt.block }}</td>
              <td class="py-3 px-6 text-left">{{ apt.floor }}</td>
              <td class="py-3 px-6 text-left">{{ apt.number }}</td>
              <td class="py-3 px-6 text-left">{{ apt.owner?.person?.name || 'N/A' }}</td>
              <td class="py-3 px-6 text-center">
                <button (click)="openDetailsModal(apt, 'vehicles')" class="bg-blue-200 text-blue-600 py-1 px-3 rounded-full text-xs hover:bg-blue-300 transition focus:outline-none">
                    {{ apt.vehicles?.length || 0 }}
                </button>
              </td>
              <td class="py-3 px-6 text-center">
                <button (click)="openDetailsModal(apt, 'pets')" class="bg-orange-200 text-orange-600 py-1 px-3 rounded-full text-xs hover:bg-orange-300 transition focus:outline-none">
                    {{ apt.pets?.length || 0 }}
                </button>
              </td>
              <td class="py-3 px-6 text-center">
                 <button (click)="openDetailsModal(apt, 'residents')" class="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs hover:bg-green-300 transition focus:outline-none">
                    {{ apt.residents?.length || 0 }}
                 </button>
              </td>
              <td class="py-3 px-6 text-center" *ngIf="authService.isAdmin()">
                <button (click)="openModal(apt)" class="text-blue-500 hover:text-blue-700 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </button>
                <button (click)="deleteApartment(apt.id)" class="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="apartments().length === 0">
              <td colspan="7" class="py-4 text-center">No se encontraron apartamentos.</td>
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

      <!-- Detail Modal -->
      <div *ngIf="isDetailModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">
                {{ detailType === 'vehicles' ? 'Vehículos' : (detailType === 'pets' ? 'Mascotas' : 'Residentes') }} 
                (Apto Torre {{ currentApartment.block }} - {{ currentApartment.number }})
            </h3>
            
            <ul class="list-disc pl-5">
                <ng-container *ngIf="detailType === 'vehicles'">
                    <li *ngFor="let vehicle of currentApartment.vehicles" class="mb-2 flex justify-between items-center group">
                        <div>
                            <span class="font-bold border px-1 rounded">{{ vehicle.plate }}</span> - {{ vehicle.type === 'car' ? 'Carro' : 'Moto' }}
                            <span class="text-xs text-gray-500 block">{{ vehicle.description }}</span>
                        </div>
                        <button *ngIf="authService.isAdmin() || authService.isResident()" (click)="deleteVehicle(vehicle.id)" class="text-red-400 hover:text-red-600 transition-opacity" title="Eliminar vehículo">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </li>
                    <li *ngIf="!currentApartment.vehicles?.length" class="text-gray-500 mb-4">Sin vehículos.</li>

                    <div *ngIf="authService.isAdmin() || authService.isResident()" class="mt-4 border-t pt-4">
                        <button *ngIf="!isAddingVehicle" (click)="isAddingVehicle = true" class="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                            + Agregar Vehículo
                        </button>

                        <div *ngIf="isAddingVehicle" class="bg-gray-50 p-3 rounded-lg animate-fade-in">
                            <div class="mb-2">
                                <input [(ngModel)]="newVehicle.plate" class="w-full border rounded px-2 py-1 text-sm uppercase mb-2 shadow-sm" placeholder="PLACA">
                                <select [(ngModel)]="newVehicle.type" class="w-full border rounded px-2 py-1 text-sm bg-white mb-2 shadow-sm">
                                    <option value="car">Carro</option>
                                    <option value="motorcycle">Moto</option>
                                </select>
                                <input [(ngModel)]="newVehicle.description" class="w-full border rounded px-2 py-1 text-sm shadow-sm" placeholder="Descripción (Color, Marca...)">
                            </div>
                            
                            <div *ngIf="vehicleError" class="text-red-500 text-xs mb-2">{{ vehicleError }}</div>

                            <div class="flex justify-end gap-2 mt-2">
                                <button (click)="isAddingVehicle = false; vehicleError = ''" class="text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
                                <button (click)="saveVehicle()" [disabled]="!newVehicle.plate" class="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50">Guardar</button>
                            </div>
                        </div>
                    </div>
                </ng-container>
                
                <ng-container *ngIf="detailType === 'pets'">
                    <li *ngFor="let pet of currentApartment.pets" class="mb-2 flex justify-between items-center group">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">{{ pet.type === 'dog' ? '🐶' : (pet.type === 'cat' ? '🐱' : '🐾') }}</span>
                            <div>
                                <span class="font-bold block">{{ pet.name }} <span *ngIf="pet.breed" class="text-xs font-normal text-gray-500">({{ pet.breed }})</span></span>
                                <span *ngIf="pet.description" class="text-xs text-gray-500 block">{{ pet.description }}</span>
                                <span class="text-xs" [ngClass]="pet.vaccinations_current ? 'text-green-600' : 'text-red-500'">
                                    {{ pet.vaccinations_current ? 'Vacunas al día' : 'Sin vacunas' }}
                                </span>
                            </div>
                        </div>
                        <button *ngIf="authService.isAdmin() || authService.isResident()" (click)="deletePet(pet.id)" class="text-red-400 hover:text-red-600 transition-opacity" title="Eliminar mascota">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </li>
                    <li *ngIf="!currentApartment.pets?.length" class="text-gray-500 mb-4">Sin mascotas registradas.</li>

                    <!-- Add Pet Form -->
                    <div *ngIf="authService.isAdmin() || authService.isResident()" class="mt-4 border-t pt-4">
                        <button *ngIf="!isAddingPet" (click)="isAddingPet = true" class="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                            + Agregar Mascota
                        </button>

                        <div *ngIf="isAddingPet" class="bg-gray-50 p-3 rounded-lg animate-fade-in">
                            <div class="mb-2">
                                <input [(ngModel)]="newPet.name" placeholder="Nombre" class="w-full border rounded px-2 py-1 text-sm focus:outline-blue-500 mb-2">
                                <input [(ngModel)]="newPet.breed" placeholder="Raza" class="w-full border rounded px-2 py-1 text-sm focus:outline-blue-500 mb-2">
                                <input [(ngModel)]="newPet.description" placeholder="Descripción (Color, señas...)" class="w-full border rounded px-2 py-1 text-sm focus:outline-blue-500">
                            </div>
                            <div class="flex gap-2 mb-2">
                                <select [(ngModel)]="newPet.type" class="w-1/2 border rounded px-2 py-1 text-sm focus:outline-blue-500 bg-white">
                                    <option value="dog">Perro</option>
                                    <option value="cat">Gato</option>
                                    <option value="other">Otro</option>
                                </select>
                                <label class="flex items-center gap-2 text-sm text-gray-600 w-1/2 cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="newPet.vaccinations_current" class="rounded text-blue-600">
                                    Vacunas OK
                                </label>
                            </div>
                            <div class="flex justify-end gap-2 mt-2">
                                <button (click)="isAddingPet = false" class="text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
                                <button (click)="savePet()" [disabled]="!newPet.name" class="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50">Guardar</button>
                            </div>
                        </div>
                    </div>
                </ng-container>

                <ng-container *ngIf="detailType === 'residents'">
                    <li *ngFor="let resident of currentApartment.residents" class="mb-2 flex justify-between items-center group">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-bold">{{ resident.person?.name }}</span>
                                <span *ngIf="resident.id === currentApartment.owner_id" class="bg-yellow-200 text-yellow-800 text-xs px-2 rounded-full">Propietario</span>
                            </div>
                            <div class="text-sm text-gray-600">
                                <div>Doc: {{ resident.person?.document }}</div>
                                <div>Tel: {{ resident.person?.phone || 'N/A' }}</div>
                            </div>
                        </div>
                         <button *ngIf="authService.isAdmin() || authService.isResident()" (click)="deleteResident(resident.id)" class="text-red-400 hover:text-red-600 transition-opacity" title="Eliminar residente">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </li>
                     <li *ngIf="!currentApartment.residents?.length" class="text-gray-500">Sin residentes.</li>

                    <div *ngIf="authService.isAdmin() || authService.isResident()" class="mt-4 border-t pt-4">
                        <button *ngIf="!isAddingResident" (click)="isAddingResident = true" class="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                            + Agregar Residente
                        </button>

                        <div *ngIf="isAddingResident" class="bg-gray-50 p-3 rounded-lg animate-fade-in">
                            <div class="grid grid-cols-2 gap-2 mb-2">
                                <input [(ngModel)]="newResident.name" class="col-span-2 w-full border rounded px-2 py-1 text-sm mb-1" placeholder="Nombre completo">
                                <select [(ngModel)]="newResident.document_type" class="border rounded px-2 py-1 text-sm bg-white">
                                    <option value="CC">CC</option>
                                    <option value="TI">TI</option>
                                    <option value="TE">CE (Extranjería)</option>
                                    <option value="PAS">Pasaporte</option>
                                    <option value="PEP">PEP</option>
                                </select>
                                <input [(ngModel)]="newResident.document" class="border rounded px-2 py-1 text-sm" placeholder="Documento">
                                <input [(ngModel)]="newResident.email" class="w-full border rounded px-2 py-1 text-sm" placeholder="Email (Obligatorio si tiene acceso)">
                                <input [(ngModel)]="newResident.phone" class="w-full border rounded px-2 py-1 text-sm" placeholder="Teléfono">
                                <input type="date" [(ngModel)]="newResident.birthdate" class="col-span-2 w-full border rounded px-2 py-1 text-sm">
                                
                                <div class="col-span-2 mt-2 pt-2 border-t">
                                    <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input type="checkbox" [(ngModel)]="newResident.create_user" class="rounded text-blue-600">
                                        Dar acceso a la plataforma
                                    </label>
                                </div>
                                
                                <ng-container *ngIf="newResident.create_user">
                                    <input type="password" [(ngModel)]="newResident.password" class="col-span-2 w-full border rounded px-2 py-1 text-sm mt-1" placeholder="Contraseña de acceso" [required]="newResident.create_user">
                                </ng-container>
                             </div>

                            <div class="flex justify-end gap-2 mt-2">
                                <button (click)="isAddingResident = false" class="text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
                                <button (click)="saveResident()" [disabled]="!newResident.name || !newResident.document || (newResident.create_user && (!newResident.password || newResident.password.length < 6))" class="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50">Guardar</button>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ul>

            <div class="mt-4 flex justify-end">
                 <button (click)="closeDetailModal()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cerrar</button>
            </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-40">
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Editar' : 'Crear' }} Apartamento</h3>
            <form (ngSubmit)="saveApartment()">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Torre</label>
                    <input [(ngModel)]="editApartment.block" name="block" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline uppercase" required placeholder="Ej: 5">
                </div>
                 <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Piso</label>
                    <input [(ngModel)]="editApartment.floor" name="floor" type="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Número</label>
                    <input [(ngModel)]="editApartment.number" name="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                 <div class="mb-4 relative">
                     <label class="block text-gray-700 text-sm font-bold mb-2">Propietario (Buscar Residente)</label>
                     <input 
                        type="text" 
                        [(ngModel)]="ownerSearchTerm" 
                        name="ownerSearch"
                        placeholder="Nombre o Documento..." 
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        (input)="filterResidents()"
                        (focus)="showOwnerDropdown = true"
                     >
                     <!-- Dropdown -->
                     <ul *ngIf="showOwnerDropdown && filteredOwnerList.length > 0" class="absolute z-10 bg-white border border-gray-300 w-full mt-1 max-h-48 overflow-y-auto rounded shadow-lg">
                        <li 
                            *ngFor="let resident of filteredOwnerList" 
                            (click)="selectOwner(resident)"
                            class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                            <div class="font-bold">{{ resident.person?.name }}</div> 
                            <div class="text-xs text-gray-500">{{ resident.person?.document ? 'Doc: ' + resident.person?.document : '' }} - {{ resident.person?.email }}</div>
                        </li>
                     </ul>
                      <div *ngIf="selectedOwnerName" class="mt-1 text-sm text-green-600">
                        Seleccionado: {{ selectedOwnerName }}
                     </div>
                </div>

                <div class="flex justify-end gap-2">
                    <button type="button" (click)="closeModal()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
                </div>
            </form>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class ApartmentListComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  apartments = signal<any[]>([]);
  residents: any[] = [];
  searchQuery = '';
  perPage = 5;
  paginationData: any = { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Create/Edit Modal State
  isModalOpen = false;
  isEditing = false;
  editApartment: any = { block: '', number: '', floor: '', owner_id: null };

  // Owner Autocomplete
  ownerSearchTerm = '';
  showOwnerDropdown = false;
  filteredOwnerList: any[] = [];
  selectedOwnerName = '';

  // Detail Modal State
  isDetailModalOpen = false;
  detailType: 'vehicles' | 'residents' | 'pets' = 'residents';
  currentApartment: any = {};

  ngOnInit() {
    this.loadApartments();
    // Keep loading residents for autocomplete (might need pagination if too many, but usually residents list is smaller for a dropdown)
    this.loadResidents();
  }

  loadApartments(page: number = 1) {
    this.apiService.getApartments(page, this.searchQuery, this.perPage).subscribe(response => {
      this.apartments.set(response.data);
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
    this.loadApartments(page);
  }

  onSearch() {
    this.loadApartments(1);
  }

  onPerPageChange(perPage: number) {
    this.perPage = perPage;
    this.loadApartments(1);
  }

  loadResidents() {
    this.apiService.getResidents(1, '').subscribe(response => {
      this.residents = response.data || response;
    });
  }

  // Autocomplete Logic
  filterResidents() {
    const term = this.ownerSearchTerm.toLowerCase();
    if (!term) {
      this.filteredOwnerList = [];
      return;
    }
    this.filteredOwnerList = this.residents.filter(res =>
      res.person?.name.toLowerCase().includes(term) ||
      (res.person?.document && res.person?.document.toLowerCase().includes(term))
    );
    this.showOwnerDropdown = true;
  }

  selectOwner(resident: any) {
    this.editApartment.owner_id = resident.id;
    this.selectedOwnerName = resident.person?.name || '';
    this.ownerSearchTerm = ''; // or keep name
    this.showOwnerDropdown = false;
  }

  openModal(apartment: any = null) {
    this.ownerSearchTerm = '';
    this.selectedOwnerName = '';
    this.filteredOwnerList = [];
    this.showOwnerDropdown = false;

    if (apartment) {
      this.isEditing = true;
      this.editApartment = { ...apartment };
      if (apartment.owner) {
        this.editApartment.owner_id = apartment.owner.id;
        this.selectedOwnerName = apartment.owner.person?.name || '';
      }
    } else {
      this.isEditing = false;
      this.editApartment = { block: '', number: '', floor: '', owner_id: null };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openDetailsModal(apartment: any, type: 'vehicles' | 'residents' | 'pets') {
    this.currentApartment = apartment;
    this.detailType = type;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.isAddingPet = false;
    this.isAddingVehicle = false;
    this.isAddingResident = false;
    this.vehicleError = '';
    this.newPet = { name: '', type: 'dog', vaccinations_current: false, breed: '', description: '' };
    this.newVehicle = { plate: '', type: 'car', description: '' };
    this.newResident = { name: '', document: '', document_type: 'CC', email: '', phone: '', birthdate: '', create_user: false, password: '' };
  }

  // Pet Logic
  isAddingPet = false;
  newPet = { name: '', type: 'dog', vaccinations_current: false, breed: '', description: '' };

  savePet() {
    if (!this.newPet.name) return;

    const petData = { ...this.newPet, apartment_id: this.currentApartment.id };
    this.apiService.createPet(petData).subscribe(newPet => {
      if (!this.currentApartment.pets) this.currentApartment.pets = [];
      this.currentApartment.pets.push(newPet);
      this.newPet = { name: '', type: 'dog', vaccinations_current: false, breed: '', description: '' };
      this.isAddingPet = false;
      // Refresh list to update count in table
      this.loadApartments(this.paginationData.current_page);
    });
  }

  deletePet(id: number) {
    if (confirm('¿Borrar mascota?')) {
      this.apiService.deletePet(id).subscribe(() => {
        this.currentApartment.pets = this.currentApartment.pets.filter((p: any) => p.id !== id);
        // Refresh list to update count in table
        this.loadApartments(this.paginationData.current_page);
      });
    }
  }

  // Vehicle Logic
  isAddingVehicle = false;
  newVehicle = { plate: '', type: 'car', description: '' };
  vehicleError = '';

  saveVehicle() {
    if (!this.newVehicle.plate) return;
    this.vehicleError = '';

    const vehicleData = { ...this.newVehicle, apartment_id: this.currentApartment.id };
    this.apiService.createVehicle(vehicleData).subscribe({
      next: (newVehicle) => {
        if (!this.currentApartment.vehicles) this.currentApartment.vehicles = [];
        this.currentApartment.vehicles.push(newVehicle);
        this.newVehicle = { plate: '', type: 'car', description: '' };
        this.isAddingVehicle = false;
        this.loadApartments(this.paginationData.current_page);
      },
      error: (err) => {
        if (err.error && err.error.errors && err.error.errors.type) {
          this.vehicleError = err.error.errors.type[0];
        } else if (err.error && err.error.message) {
          this.vehicleError = err.error.message;
        } else {
          this.vehicleError = 'Error al guardar vehículo.';
        }
      }
    });
  }

  deleteVehicle(id: number) {
    if (confirm('¿Borrar vehículo?')) {
      this.apiService.deleteVehicle(id).subscribe(() => {
        this.currentApartment.vehicles = this.currentApartment.vehicles.filter((v: any) => v.id !== id);
        this.loadApartments(this.paginationData.current_page);
      });
    }
  }

  // Resident Logic
  isAddingResident = false;
  newResident = { name: '', document: '', document_type: 'CC', email: '', phone: '', birthdate: '', create_user: false, password: '' };

  saveResident() {
    if (!this.newResident.name || !this.newResident.document) return;

    // Use the actual create_user flag from the form
    const residentData = { ...this.newResident, apartment_id: this.currentApartment.id };
    this.apiService.createResident(residentData).subscribe(newResident => {
      if (!this.currentApartment.residents) this.currentApartment.residents = [];

      // The API returns the resident with loaded relationships, but just in case, ensures structure matches view expectations
      if (!newResident.person) newResident.person = { name: this.newResident.name, document: this.newResident.document, phone: this.newResident.phone };

      this.currentApartment.residents.push(newResident);
      this.newResident = { name: '', document: '', document_type: 'CC', email: '', phone: '', birthdate: '', create_user: false, password: '' };
      this.isAddingResident = false;
      this.loadResidents(); // Refresh autocomplete list
      this.loadApartments(this.paginationData.current_page);
    });
  }

  deleteResident(id: number) {
    if (confirm('¿Borrar residente? Esta acción borrará al residente del apartamento.')) {
      this.apiService.deleteResident(id).subscribe(() => {
        this.currentApartment.residents = this.currentApartment.residents.filter((r: any) => r.id !== id);
        this.loadApartments(this.paginationData.current_page);
      });
    }
  }

  calculateAge(birthdate: string): number {
    if (!birthdate) return 0;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  saveApartment() {
    // Uppercase block
    if (this.editApartment.block) this.editApartment.block = this.editApartment.block.toUpperCase();

    if (this.isEditing) {
      this.apiService.updateApartment(this.editApartment.id, this.editApartment).subscribe(() => {
        this.loadApartments();
        this.closeModal();
      });
    } else {
      this.apiService.createApartment(this.editApartment).subscribe(() => {
        this.loadApartments();
        this.closeModal();
      });
    }
  }

  deleteApartment(id: number) {
    if (confirm('¿Estás seguro de eliminar este apartamento?')) {
      this.apiService.deleteApartment(id).subscribe(() => {
        this.loadApartments();
      });
    }
  }
}
