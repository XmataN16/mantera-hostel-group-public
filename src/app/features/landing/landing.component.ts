import { Component, OnInit, OnDestroy, inject, afterNextRender, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { LoginRequest } from '../../shared/models/auth.model';
import { GuestBookingInfo } from '../../shared/models/booking.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';

interface ParallaxLayer {
  element: HTMLElement | null;
  speed: number;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    PasswordModule,
    MessagesModule
  ],
  providers: [MessageService],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  layers: ParallaxLayer[] = [];
  private mouseMoveListener: (e: MouseEvent) => void;

  displayAuthModal = false;
  isLoginMode = true;
  isLoading = false;

  loginForm: LoginRequest = { username: '', password: '' };

  registerForm = {
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    gender: 'MALE',
    phone: '',
    email: '',
    citizenship: 'Россия',
    documentType: 'PASSPORT',
    documentNumber: '',
    password: '',
    confirmPassword: ''
  };

  showGuestWarning = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private messageService: MessageService
  ) {
    this.mouseMoveListener = this.handleMouseMove.bind(this);

    if (this.isBrowser) {
      afterNextRender(() => {
        this.initParallaxLayers();
        window.addEventListener('mousemove', this.mouseMoveListener);
      });
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('mousemove', this.mouseMoveListener);
    }
  }

  private initParallaxLayers(): void {
    if (!this.isBrowser) return;
    setTimeout(() => {
      this.layers = [
        { element: document.querySelector('.layer-bg'), speed: 0.2 },
        { element: document.querySelector('.layer-mid'), speed: 0.5 },
        { element: document.querySelector('.layer-front'), speed: 0.8 },
        { element: document.querySelector('.layer-content'), speed: 1.0 }
      ];
    }, 100);
  }

  handleMouseMove(e: MouseEvent): void {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;
    this.layers.forEach(layer => {
      if (layer.element) {
        layer.element.style.transform = `translate(${mouseX * 100 * layer.speed}px, ${mouseY * 100 * layer.speed}px)`;
      }
    });
  }

  openLoginModal(): void {
    this.isLoginMode = true;
    this.displayAuthModal = true;
    this.showGuestWarning = false;
  }

  openRegisterModal(): void {
    this.isLoginMode = false;
    this.displayAuthModal = true;
    this.showGuestWarning = false;
  }

  closeAuthModal(): void {
    this.displayAuthModal = false;
    this.resetForms();
  }

  onLogin(): void {
    if (!this.loginForm.username || !this.loginForm.password) {
      this.messageService.add({ severity: 'warn', summary: 'Ошибка', detail: 'Введите логин и пароль' });
      return;
    }
    this.isLoading = true;
    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeAuthModal();
        this.router.navigate(['/home']);
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Ошибка авторизации', detail: 'Неверный логин или пароль' });
      }
    });
  }

  // src/app/features/landing/landing.component.ts

onRegister(): void {
  // Добавлена проверка на пустую дату рождения
  if (!this.registerForm.lastName || !this.registerForm.firstName || !this.registerForm.documentNumber || !this.registerForm.birthDate) {
    this.messageService.add({ severity: 'warn', summary: 'Ошибка', detail: 'Заполните ФИО, дату рождения и номер документа' });
    return;
  }
  if (this.registerForm.password !== this.registerForm.confirmPassword) {
    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Пароли не совпадают' });
    return;
  }

  this.isLoading = true;

  // Явное приведение типов для соответствия интерфейсу GuestBookingInfo
  const guestData: GuestBookingInfo = {
    lastName: this.registerForm.lastName,
    firstName: this.registerForm.firstName,
    middleName: this.registerForm.middleName || null,
    birthDate: this.registerForm.birthDate || '', // Гарантируем тип string
    gender: this.registerForm.gender,
    phone: this.registerForm.phone || null,
    email: this.registerForm.email || null,
    citizenship: this.registerForm.citizenship || null,
    documentType: this.registerForm.documentType,
    documentNumber: this.registerForm.documentNumber
  };

  this.apiService.createGuest(guestData).subscribe({
    next: (createdGuest: any) => {
      if (this.isBrowser) {
        localStorage.setItem('client_guest_id', createdGuest.id.toString());
        localStorage.setItem('client_guest_name', `${createdGuest.firstName} ${createdGuest.lastName}`);
      }
      this.isLoading = false;
      this.closeAuthModal();
      this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Регистрация успешна!' });
      this.router.navigate(['/profile']);
    },
    error: (err) => {
      this.isLoading = false;
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Ошибка', 
        detail: err.error?.message || 'Гость с таким документом уже существует или данные заполнены неверно' 
      });
    }
  });
}

  continueAsGuest(): void {
    this.showGuestWarning = true;
    setTimeout(() => {
      if (this.isBrowser) {
        localStorage.setItem('is_guest', 'true');
      }
      this.router.navigate(['/home'], { queryParams: { guest: 'true' } });
    }, 1500);
  }

  private resetForms(): void {
    this.loginForm = { username: '', password: '' };
    this.registerForm = {
      lastName: '', firstName: '', middleName: '', birthDate: '', gender: 'MALE',
      phone: '', email: '', citizenship: 'Россия', documentType: 'PASSPORT', documentNumber: '',
      password: '', confirmPassword: ''
    };
    this.showGuestWarning = false;
  }
}