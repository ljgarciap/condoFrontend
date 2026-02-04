import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminOrVigilanteGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAdmin() || authService.isVigilante()) {
        return true;
    }

    // If not admin or vigilante (i.e., resident), redirect to profile
    return router.createUrlTree(['/dashboard/profile']);
};
