// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'home',
    loadComponent: () => 
      import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'hotel/:id',
    loadComponent: () => 
      import('./features/hotel/hotel.component').then(m => m.HotelComponent)
  },
  {
    path: 'search',
    loadComponent: () => 
      import('./features/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'booking',
    loadComponent: () => 
      import('./features/booking/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'confirmation/:id',
    loadComponent: () => 
      import('./features/confirmation/confirmation.component').then(m => m.ConfirmationComponent)
  },
  {
  path: 'profile',
  loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];