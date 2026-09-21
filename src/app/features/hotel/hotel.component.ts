import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { HotelDto } from '../../shared/models/hotel.model';
import { RoomTypeResponse } from '../../shared/models/room-type.model';

@Component({
  selector: 'app-hotel',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule],
  templateUrl: './hotel.component.html',
  styleUrl: './hotel.component.scss',
})
export class HotelComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private seo = inject(SeoService);

  hotel = signal<HotelDto | null>(null);
  roomTypes = signal<RoomTypeResponse[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.api.getHotels().subscribe({
      next: (hotels) => {
        const found = hotels.find((h) => h.id === id);
        if (found) {
          this.hotel.set(found);
          this.seo.setTags(
            found.name,
            `Забронируйте номер в ${found.name}. ${found.address}`
          );
        }
        this.isLoading.set(false);
      },
    });

    this.api.getRoomTypes(id).subscribe({
      next: (rt) => this.roomTypes.set(rt),
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  }
}