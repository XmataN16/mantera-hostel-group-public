import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, JwtLoginResponse, CurrentUserResponse } from '../../shared/models/auth.model';

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

function getStorageItem(key: string): string | null {
  return isBrowser ? localStorage.getItem(key) : null;
}

function setStorageItem(key: string, value: string): void {
  if (isBrowser) localStorage.setItem(key, value);
}

function removeStorageItem(key: string): void {
  if (isBrowser) localStorage.removeItem(key);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowserEnv = isPlatformBrowser(this.platformId);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  private token = signal<string | null>(getStorageItem('access_token'));
  private username = signal<string | null>(getStorageItem('username'));
  private roles = signal<string[]>(JSON.parse(getStorageItem('roles') || '[]'));
  private isGuest = signal<boolean>(getStorageItem('is_guest') === 'true');

  isAuthenticated = computed(() => !!this.token() || this.isGuest());
  currentUser = computed(() => this.username());
  userRoles = computed(() => this.roles());
  isAdmin = computed(() => this.roles().includes('ADMIN'));
  isManager = computed(() => this.roles().includes('MANAGER') || this.isAdmin());
  isReceptionist = computed(() => this.roles().includes('RECEPTIONIST') || this.isManager());

  login(request: LoginRequest): Observable<JwtLoginResponse> {
    return this.http.post<JwtLoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        setStorageItem('access_token', response.accessToken);
        setStorageItem('username', response.username);
        setStorageItem('roles', JSON.stringify(response.roles));
        removeStorageItem('is_guest');
        removeStorageItem('client_guest_id');
        removeStorageItem('client_guest_name');
        this.token.set(response.accessToken);
        this.username.set(response.username);
        this.roles.set(response.roles);
        this.isGuest.set(false);
      })
    );
  }

  // НОВЫЙ МЕТОД: вход гостя по номеру документа (после успешного запроса к /guests/by-document)
  loginAsGuestById(guestId: string, guestName: string): void {
    setStorageItem('is_guest', 'true');
    setStorageItem('client_guest_id', guestId);
    setStorageItem('client_guest_name', guestName);
    removeStorageItem('access_token');
    removeStorageItem('username');
    removeStorageItem('roles');
    this.token.set(null);
    this.username.set(guestName);
    this.roles.set([]);
    this.isGuest.set(true);
  }

  loginAsGuest(): void {
    setStorageItem('is_guest', 'true');
    setStorageItem('client_guest_name', 'Гость');
    removeStorageItem('access_token');
    removeStorageItem('username');
    removeStorageItem('roles');
    removeStorageItem('client_guest_id');
    this.token.set(null);
    this.username.set('Гость');
    this.roles.set([]);
    this.isGuest.set(true);
  }

  logout(): void {
    removeStorageItem('access_token');
    removeStorageItem('username');
    removeStorageItem('roles');
    removeStorageItem('is_guest');
    removeStorageItem('client_guest_id');
    removeStorageItem('client_guest_name');
    this.token.set(null);
    this.username.set(null);
    this.roles.set([]);
    this.isGuest.set(false);
  }

  getCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(`${this.apiUrl}/me`);
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.roles().includes(role));
  }

  isGuestUser(): boolean {
    return this.isGuest();
  }

  // Вспомогательный метод для получения ID гостя
  getGuestId(): string | null {
    return getStorageItem('client_guest_id');
  }

  getGuestName(): string {
    return getStorageItem('client_guest_name') || 'Гость';
  }
}