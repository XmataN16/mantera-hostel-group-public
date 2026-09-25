import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { HotelDto } from '../../shared/models/hotel.model';
import { AvailableRoomDto } from '../../shared/models/availability.model';
import { RoomTypeResponse } from '../../shared/models/room-type.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, DropdownModule, 
    InputNumberModule, TagModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private seo = inject(SeoService);

  hotels = signal<HotelDto[]>([]);
  rooms = signal<AvailableRoomDto[]>([]);
  private allFetchedRooms = signal<AvailableRoomDto[]>([]); // Оригинальный список для фильтрации
  
  isLoading = signal(false);
  hasSearched = signal(false);
  
  hotelId = signal<number | null>(null);
  checkIn = signal('');
  checkOut = signal('');
  adults = signal(2);
  children = signal(0);

  // НОВЫЕ ФИЛЬТРЫ
  roomTypes = signal<RoomTypeResponse[]>([]);
  selectedRoomTypeId = signal<number | null>(null);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);

  ngOnInit(): void {
    this.seo.setTags('Поиск номеров', 'Найдите свободный номер в отелях Mantera');
    this.api.getHotels().subscribe((h) => this.hotels.set(h));

    this.route.queryParams.subscribe((qp) => {
      if (qp['hotelId']) this.hotelId.set(Number(qp['hotelId']));
      if (qp['checkIn']) this.checkIn.set(qp['checkIn']);
      if (qp['checkOut']) this.checkOut.set(qp['checkOut']);
      if (qp['adults']) this.adults.set(Number(qp['adults']));
      if (qp['children']) this.children.set(Number(qp['children']));
      
      if (this.hotelId() && this.checkIn() && this.checkOut()) {
        this.loadRoomTypesForHotel(this.hotelId()!);
        this.search();
      }
    });
  }

  // Загрузка типов номеров при выборе отеля
  onHotelChange(): void {
    const id = this.hotelId();
    this.selectedRoomTypeId.set(null); // Сбрасываем фильтр типа номера
    if (id) {
      this.loadRoomTypesForHotel(id);
    } else {
      this.roomTypes.set([]);
    }
  }

  private loadRoomTypesForHotel(hotelId: number): void {
    this.api.getRoomTypes(hotelId).subscribe(rt => this.roomTypes.set(rt));
  }

  search(): void {
    if (!this.hotelId() || !this.checkIn() || !this.checkOut()) return;
    
    this.isLoading.set(true);
    this.hasSearched.set(true);
    
    // Обновляем URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        hotelId: this.hotelId(), checkIn: this.checkIn(), checkOut: this.checkOut(),
        adults: this.adults(), children: this.children()
      },
    });

    this.api.getAvailableRooms(this.hotelId()!, this.checkIn(), this.checkOut()).subscribe({
      next: (rooms) => {
        this.allFetchedRooms.set(rooms);
        this.applyFilters(); // Применяем фильтры сразу после получения
        this.isLoading.set(false);
      },
      error: () => {
        this.rooms.set([]);
        this.allFetchedRooms.set([]);
        this.isLoading.set(false);
      },
    });
  }

  // Метод клиентской фильтрации
  applyFilters(): void {
    let filtered = [...this.allFetchedRooms()];

    if (this.selectedRoomTypeId()) {
      filtered = filtered.filter(r => r.roomTypeId === this.selectedRoomTypeId());
    }
    if (this.minPrice() !== null && this.minPrice()! > 0) {
      filtered = filtered.filter(r => r.basePrice >= this.minPrice()!);
    }
    if (this.maxPrice() !== null && this.maxPrice()! > 0) {
      filtered = filtered.filter(r => r.basePrice <= this.maxPrice()!);
    }

    this.rooms.set(filtered);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);
  }

  getNights(): number {
    if (!this.checkIn() || !this.checkOut()) return 0;
    const a = new Date(this.checkIn());
    const b = new Date(this.checkOut());
    return Math.max(Math.round((b.getTime() - a.getTime()) / 86400000), 0);
  }

  bookRoom(room: AvailableRoomDto): void {
    this.router.navigate(['/booking'], {
      queryParams: {
        hotelId: this.hotelId(), roomId: room.roomId, roomTypeId: room.roomTypeId,
        checkIn: this.checkIn(), checkOut: this.checkOut(),
        adults: this.adults(), children: this.children(),
        pricePerNight: room.basePrice, roomTypeName: room.roomTypeName, roomNumber: room.roomNumber,
      },
    });
  }
}