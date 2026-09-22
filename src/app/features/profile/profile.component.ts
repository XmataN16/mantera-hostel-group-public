import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    MessagesModule
  ],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  guestName = signal(this.authService.getGuestName());
  bookings = signal<any[]>([]);
  isLoading = signal(true);

  // Данные гостя для редактирования
  editMode = signal(false);
  guestForm = signal<any>({
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    gender: 'MALE',
    phone: '',
    email: '',
    citizenship: 'Россия',
    documentType: 'PASSPORT',
    documentNumber: ''
  });
  isSaving = signal(false);

  genderOptions = [
    { label: 'Мужской', value: 'MALE' },
    { label: 'Женский', value: 'FEMALE' }
  ];

  ngOnInit(): void {
    const guestId = this.authService.getGuestId();
    if (!guestId) {
      this.router.navigate(['/']);
      return;
    }

    // Загружаем историю бронирований
    this.api.getGuestHistory(Number(guestId)).subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    // Загружаем данные гостя из localStorage или API
    const cachedData = this.authService.getGuestData();
    if (cachedData) {
      this.guestForm.set({
        lastName: cachedData.lastName || '',
        firstName: cachedData.firstName || '',
        middleName: cachedData.middleName || '',
        birthDate: cachedData.birthDate || '',
        gender: cachedData.gender || 'MALE',
        phone: cachedData.phone || '',
        email: cachedData.email || '',
        citizenship: cachedData.citizenship || 'Россия',
        documentType: cachedData.documentType || 'PASSPORT',
        documentNumber: cachedData.documentNumber || ''
      });
    } else {
      // Если в localStorage нет — загружаем с сервера
      this.api.getGuestById(Number(guestId)).subscribe({
        next: (data) => {
          this.authService.setGuestData(data);
          this.guestForm.set({
            lastName: data.lastName || '',
            firstName: data.firstName || '',
            middleName: data.middleName || '',
            birthDate: data.birthDate || '',
            gender: data.gender || 'MALE',
            phone: data.phone || '',
            email: data.email || '',
            citizenship: data.citizenship || 'Россия',
            documentType: data.documentType || 'PASSPORT',
            documentNumber: data.documentNumber || ''
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'warn',
            summary: 'Внимание',
            detail: 'Не удалось загрузить данные профиля'
          });
        }
      });
    }
  }

  toggleEditMode(): void {
    this.editMode.set(!this.editMode());
  }

  saveProfile(): void {
    const guestId = this.authService.getGuestId();
    if (!guestId) return;

    const form = this.guestForm();
    if (!form.lastName || !form.firstName || !form.documentNumber || !form.birthDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка',
        detail: 'Заполните обязательные поля: ФИО, дату рождения и номер документа'
      });
      return;
    }

    this.isSaving.set(true);
    this.api.updateGuest(Number(guestId), form).subscribe({
      next: (updated) => {
        this.authService.updateGuestData(updated);
        this.guestName.set(`${updated.firstName} ${updated.lastName}`);
        this.isSaving.set(false);
        this.editMode.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Успех',
          detail: 'Данные профиля обновлены'
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: err.error?.message || 'Ошибка при сохранении профиля'
        });
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      'CONFIRMED': 'success', 'CHECKED_IN': 'info', 'CREATED': 'warning',
      'CANCELLED': 'danger', 'CHECKED_OUT': 'secondary'
    };
    return map[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'CONFIRMED': 'Подтверждено', 'CHECKED_IN': 'Заселен', 'CREATED': 'Создано',
      'CANCELLED': 'Отменено', 'CHECKED_OUT': 'Выселен'
    };
    return map[status] || status;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}