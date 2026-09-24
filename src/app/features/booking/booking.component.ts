import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { GuestBookingInfo, PublicBookingRequest } from '../../shared/models/booking.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    MessageModule,
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
})
export class BookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private authService = inject(AuthService);

  // Параметры из URL
  hotelId = 0;
  roomId = 0;
  roomTypeId = 0;
  checkIn = '';
  checkOut = '';
  adults = 2;
  children = 0;
  pricePerNight = 0;
  roomTypeName = '';
  roomNumber = '';

  // Форма гостя
  guest: GuestBookingInfo = {
    lastName: '',
    firstName: '',
    middleName: null,
    birthDate: '',
    gender: 'MALE',
    phone: '',
    email: '',
    citizenship: 'Россия',
    documentType: 'PASSPORT',
    documentNumber: '',
  };

  genderOptions = [
    { label: 'Мужской', value: 'MALE' },
    { label: 'Женский', value: 'FEMALE' },
  ];

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.setTags('Бронирование номера', 'Оформите бронирование в отеле Mantera');

    const qp = this.route.snapshot.queryParams;
    this.hotelId = Number(qp['hotelId']) || 0;
    this.roomId = Number(qp['roomId']) || 0;
    this.roomTypeId = Number(qp['roomTypeId']) || 0;
    this.checkIn = qp['checkIn'] || '';
    this.checkOut = qp['checkOut'] || '';
    this.adults = Number(qp['adults']) || 2;
    this.children = Number(qp['children']) || 0;
    this.pricePerNight = Number(qp['pricePerNight']) || 0;
    this.roomTypeName = qp['roomTypeName'] || '';
    this.roomNumber = qp['roomNumber'] || '';

    if (!this.hotelId || !this.roomId) {
      this.router.navigate(['/']);
      return;
    }

    // Если пользователь авторизован — подставляем его данные из профиля
    if (this.authService.isAuthorizedGuest()) {
      const guestData = this.authService.getGuestData();
      if (guestData) {
        this.guest = {
          lastName: guestData.lastName || '',
          firstName: guestData.firstName || '',
          middleName: guestData.middleName || null,
          birthDate: guestData.birthDate || '',
          gender: guestData.gender || 'MALE',
          phone: guestData.phone || '',
          email: guestData.email || '',
          citizenship: guestData.citizenship || 'Россия',
          documentType: guestData.documentType || 'PASSPORT',
          documentNumber: guestData.documentNumber || ''
        };
      }
    }
  }

  get nights(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const a = new Date(this.checkIn);
    const b = new Date(this.checkOut);
    return Math.max(Math.round((b.getTime() - a.getTime()) / 86400000), 0);
  }

  get totalPrice(): number {
    return this.pricePerNight * this.nights;
  }

  formatPrice(v: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(v);
  }

  submit(): void {
    if (!this.guest.lastName || !this.guest.firstName || !this.guest.birthDate) {
      this.errorMessage.set('Заполните обязательные поля: ФИО и дата рождения');
      return;
    }
    if (!this.guest.documentNumber || !this.guest.phone) {
      this.errorMessage.set('Укажите номер документа и телефон');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // Проверяем, авторизован ли гость
    if (this.authService.isAuthorizedGuest()) {
      // Авторизованный гость — используем существующий guestId
      const guestId = this.authService.getGuestId();
      if (!guestId) {
        this.isSubmitting.set(false);
        this.errorMessage.set('Не удалось определить ID гостя');
        return;
      }
      this.createBooking(Number(guestId));
    } else {
      // Анонимный гость — сначала создаём профиль, потом бронируем
      this.api.createGuest(this.guest).subscribe({
        next: (createdGuest: any) => {
          this.createBooking(createdGuest.id);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err?.error?.message || 'Ошибка при создании профиля гостя'
          );
        },
      });
    }
  }

  private createBooking(guestId: number): void {
    const booking: PublicBookingRequest = {
      hotelId: this.hotelId,
      guestId: guestId,
      reservationNumber: null,
      source: 'WEBSITE',
      checkInDate: this.checkIn,
      checkOutDate: this.checkOut,
      adults: this.adults,
      children: this.children,
      comment: 'Бронирование с публичного сайта',
      rooms: [
        {
          roomTypeId: this.roomTypeId,
          roomId: this.roomId,
          ratePlanId: null,
          guestsCount: this.adults + this.children,
          pricePerNight: this.pricePerNight,
        },
      ],
    };

    this.api.createBooking(booking).subscribe({
      next: (result) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/confirmation', result.id], {
          queryParams: { number: result.reservationNumber },
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Ошибка при создании бронирования'
        );
      },
    });
  }
}