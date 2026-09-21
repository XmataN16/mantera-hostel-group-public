import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'hotel/:id',
    loadComponent: () =>
      import('./features/hotel/hotel.component').then((m) => m.HotelComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component').then(
        (m) => m.SearchComponent
      ),
  },
  {
    path: 'booking',
    loadComponent: () =>
      import('./features/booking/booking.component').then(
        (m) => m.BookingComponent
      ),
  },
  {
    path: 'confirmation/:id',
    loadComponent: () =>
      import('./features/confirmation/confirmation.component').then(
        (m) => m.ConfirmationComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];