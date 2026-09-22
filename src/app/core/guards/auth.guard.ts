// src/app/core/guards/auth.guard.ts (обновите существующий)
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Если не авторизован - редирект на landing page
  router.navigate(['/']);
  return false;
};