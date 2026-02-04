import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./features/dashboard/summary/summary.component').then(m => m.SummaryComponent)
            },
            {
                path: 'apartments',
                loadComponent: () => import('./features/apartments/apartment-list/apartment-list.component').then(m => m.ApartmentListComponent)
            },
            {
                path: 'people',
                loadComponent: () => import('./features/people/person-list/person-list.component').then(m => m.PersonListComponent)
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
            },
            {
                path: 'parking/history',
                loadComponent: () => import('./features/parking/parking-history/parking-history.component').then(m => m.ParkingHistoryComponent)
            },
            {
                path: 'visitors',
                loadComponent: () => import('./features/visitors/visitor-list/visitor-list.component').then(m => m.VisitorListComponent)
            },
            {
                path: 'cartera',
                canActivate: [adminGuard],
                loadComponent: () => import('./features/cartera/cartera-list/cartera-list.component').then(m => m.CarteraListComponent)
            },
            {
                path: 'notifications',
                loadComponent: () => import('./features/notifications/notification-list/notification-list.component').then(m => m.NotificationListComponent)
            },
            {
                path: 'vigilantes',
                canActivate: [adminGuard],
                loadComponent: () => import('./features/users/vigilante-list/vigilante-list.component').then(m => m.VigilanteListComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'my-vehicles',
                loadComponent: () => import('./features/vehicles/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent)
            },
            {
                path: 'my-cartera',
                loadComponent: () => import('./features/cartera/cartera-list/cartera-list.component').then(m => m.CarteraListComponent)
            }
        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
