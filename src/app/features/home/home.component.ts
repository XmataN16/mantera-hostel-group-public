import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { HotelDto } from '../../shared/models/hotel.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    CardModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private router = inject(Router);

  hotels = signal<HotelDto[]>([]);

  searchHotelId = signal<number | null>(null);
  checkIn = signal(this.getTodayIso());
  checkOut = signal(this.addDaysIso(1));
  adults = signal(2);
  children = signal(0);

  ngOnInit(): void {
    this.seo.setTags(
      'Mantera Hotels — Бронирование отелей',
      'Забронируйте номер в отелях Mantera на побережье Чёрного моря. Лучшие цены, удобное расположение.'
    );
    this.api.getHotels().subscribe({
      next: (h) => {
        this.hotels.set(h);
        if (h.length > 0 && !this.searchHotelId()) {
          this.searchHotelId.set(h[0].id);
        }
      },
    });
  }

  onSearch(): void {
    if (!this.searchHotelId() || !this.checkIn() || !this.checkOut()) return;
    this.router.navigate(['/search'], {
      queryParams: {
        hotelId: this.searchHotelId(),
        checkIn: this.checkIn(),
        checkOut: this.checkOut(),
        adults: this.adults(),
        children: this.children(),
      },
    });
  }

  private getTodayIso(): string {
    return this.toIso(new Date());
  }

  private addDaysIso(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return this.toIso(d);
  }

  private toIso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}