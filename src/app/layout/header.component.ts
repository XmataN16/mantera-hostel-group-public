import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonModule],
  template: `
<header class="site-header">
  <div class="header-inner">
    <a routerLink="/" class="logo">
      <span class="logo-icon"></span>
      <span class="logo-text">Mantera Hotels</span>
    </a>
    <nav class="main-nav">
      <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Главная</a>
      <a routerLink="/search" routerLinkActive="active">Найти номер</a>
      @if (authService.isAuthenticated()) {
        <a routerLink="/profile" routerLinkActive="active">Личный кабинет</a>
      }
    </nav>
    <div class="header-contacts">
      @if (authService.isAuthenticated()) {
        <button pButton label="Выйти" icon="pi pi-sign-out" size="small" severity="secondary" (click)="logout()"></button>
      } @else {
        <span class="phone">+7 (861) 200-00-01</span>
      }
    </div>
  </div>
</header>
`,
  styles: [`
    .site-header {
      background: #1a2332;
      color: #fff;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: #fff;
    }
    .logo-icon { font-size: 1.5rem; }
    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .main-nav {
      display: flex;
      gap: 1.5rem;
      a {
        color: #b0bec5;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
        padding: 0.25rem 0;
        border-bottom: 2px solid transparent;
        transition: color 0.2s, border-color 0.2s;
        &:hover, &.active {
          color: #fff;
          border-bottom-color: #42a5f5;
        }
      }
    }
    .header-contacts .phone {
      font-weight: 600;
      font-size: 0.95rem;
      color: #90caf9;
    }
    @media (max-width: 640px) {
      .header-contacts { display: none; }
      .main-nav { gap: 1rem; }
    }
  `],
})
export class HeaderComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  public authService = inject(AuthService);

  ngOnInit(): void {
    // AuthService сам инициализируется из localStorage при создании сервиса
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}