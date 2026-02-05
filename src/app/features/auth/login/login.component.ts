import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div class="flex justify-center mb-6">
            <img src="/ciudadela.png" alt="Logo Ciudadela" class="h-20 w-auto">
        </div>
        <h2 class="mb-6 text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block mb-2 text-sm font-bold text-gray-700" for="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            >
          </div>
          
          <div class="mb-6">
            <label class="block mb-2 text-sm font-bold text-gray-700" for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              class="w-full px-3 py-2 mb-3 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            >
          </div>

          <div *ngIf="errorMessage" class="mb-4 text-sm text-red-500">
            {{ errorMessage }}
          </div>
          
          <div class="flex items-center justify-between">
            <button 
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {{ isLoading ? 'Cargando...' : 'Ingresar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid email or password.';
          console.error(err);
        }
      });
    }
  }
}
