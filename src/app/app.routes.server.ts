import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'hotel/:id', renderMode: RenderMode.Server },
  { path: 'search', renderMode: RenderMode.Client },
  { path: 'booking', renderMode: RenderMode.Client },
  { path: 'confirmation/:id', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server } // Главная и остальные
];