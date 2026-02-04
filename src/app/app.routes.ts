import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'apartments', pathMatch: 'full' },
            {
                path: 'apartments',
                loadComponent: () => import('./features/apartments/apartment-list/apartment-list.component').then(m => m.ApartmentListComponent)
            },
            {
                path: 'residents',
                loadComponent: () => import('./features/residents/resident-list/resident-list.component').then(m => m.ResidentListComponent)
            },
            {
                path: 'vehicles',
                loadComponent: () => import('./features/vehicles/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent)
            },
            {
                path: 'parking',
                loadComponent: () => import('./features/parking/parking-control/parking-control.component').then(m => m.ParkingControlComponent)
            }
        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
