import { Component, OnInit, OnDestroy, inject, afterNextRender, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
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
  public authService = inject(AuthService);
  private apiService = inject(ApiService);
  public router = inject(Router);
  private messageService = inject(MessageService);

  layers: ParallaxLayer[] = [];
  private mouseMoveListener: (e: MouseEvent) => void;
  displayAuthModal = false;
  isLoginMode = true;
  isLoading = false;
  loginDocumentNumber = '';
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

  constructor() {
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
    this.loginDocumentNumber = '';
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

  // Нормализация номера документа: убираем пробелы, дефисы, приводим к верхнему регистру
  private normalizeDocumentNumber(doc: string): string {
    return doc.replace(/[\s\-]/g, '').toUpperCase();
  }

  onLogin(): void {
    const normalizedDoc = this.normalizeDocumentNumber(this.loginDocumentNumber);
    if (!normalizedDoc) {
      this.messageService.add({ severity: 'warn', summary: 'Ошибка', detail: 'Введите номер документа' });
      return;
    }
    this.isLoading = true;
    this.apiService.getGuestByDocument(normalizedDoc).subscribe({
      next: (guest: any) => {
        // ВАЖНО: используем authService.loginAsGuestById — это установит is_guest=true
        this.authService.loginAsGuestById(guest.id.toString(), `${guest.firstName} ${guest.lastName}`);
        this.isLoading = false;
        this.closeAuthModal();
        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Добро пожаловать!' });
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.messageService.add({
            severity: 'error',
            summary: 'Гость не найден',
            detail: 'Пользователь с таким номером документа не найден. Пожалуйста, зарегистрируйтесь.'
          });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Ошибка сервера при входе' });
        }
      }
    });
  }

  onRegister(): void {
    if (!this.registerForm.lastName || !this.registerForm.firstName || !this.registerForm.documentNumber || !this.registerForm.birthDate) {
      this.messageService.add({ severity: 'warn', summary: 'Ошибка', detail: 'Заполните ФИО, дату рождения и номер документа' });
      return;
    }
    this.isLoading = true;
    const guestData: GuestBookingInfo = {
      lastName: this.registerForm.lastName,
      firstName: this.registerForm.firstName,
      middleName: this.registerForm.middleName || null,
      birthDate: this.registerForm.birthDate || '',
      gender: this.registerForm.gender,
      phone: this.registerForm.phone || null,
      email: this.registerForm.email || null,
      citizenship: this.registerForm.citizenship || null,
      documentType: this.registerForm.documentType,
      documentNumber: this.normalizeDocumentNumber(this.registerForm.documentNumber) // нормализуем
    };
    this.apiService.createGuest(guestData).subscribe({
      next: (createdGuest: any) => {
        // ВАЖНО: используем authService.loginAsGuestById
        this.authService.loginAsGuestById(createdGuest.id.toString(), `${createdGuest.firstName} ${createdGuest.lastName}`);
        this.isLoading = false;
        this.closeAuthModal();
        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Регистрация успешна!' });
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Уже зарегистрирован',
            detail: 'Гость с таким номером документа уже существует. Пожалуйста, используйте форму "Войти".'
          });
          this.isLoginMode = true;
          this.loginDocumentNumber = this.registerForm.documentNumber;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: err.error?.message || 'Ошибка при регистрации'
          });
        }
      }
    });
  }

  continueAsGuest(): void {
    this.showGuestWarning = true;
    setTimeout(() => {
      this.authService.loginAsGuest();
      this.router.navigate(['/home']);
    }, 1500);
  }

  private resetForms(): void {
    this.loginDocumentNumber = '';
    this.registerForm = {
      lastName: '', firstName: '', middleName: '', birthDate: '', gender: 'MALE',
      phone: '', email: '', citizenship: 'Россия', documentType: 'PASSPORT', documentNumber: '',
      password: '', confirmPassword: ''
    };
    this.showGuestWarning = false;
  }
}