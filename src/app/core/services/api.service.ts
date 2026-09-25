import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HotelDto } from '../../shared/models/hotel.model';
import { RoomTypeResponse } from '../../shared/models/room-type.model';
import { AvailableRoomDto } from '../../shared/models/availability.model';
import { PublicBookingRequest, PublicBookingResponse, GuestBookingInfo } from '../../shared/models/booking.model';
import { CacheService } from './cache.service'; // <-- ИМПОРТ

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private cache = inject(CacheService); // <-- ИНЪЕКЦИЯ
  private apiUrl = environment.apiUrl;

  // 🟢 КЭШИРУЕМ: Список отелей (TTL 24 часа)
  getHotels(): Observable<HotelDto[]> {
    const cacheKey = 'cache:hotels:all';
    const cached = this.cache.get<HotelDto[]>(cacheKey);
    if (cached) {
      return of(cached); // Мгновенный возврат из кэша
    }

    return this.http.get<HotelDto[]>(`${this.apiUrl}/hotels`).pipe(
      tap(data => this.cache.set(cacheKey, data, 86400000)) // 24 часа
    );
  }

  // 🟢 КЭШИРУЕМ: Типы номеров (TTL 1 час)
  getRoomTypes(hotelId?: number): Observable<RoomTypeResponse[]> {
    const cacheKey = hotelId ? `cache:roomTypes:${hotelId}` : 'cache:roomTypes:all';
    const cached = this.cache.get<RoomTypeResponse[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    let params = new HttpParams();
    if (hotelId) params = params.set('hotelId', hotelId.toString());

    return this.http.get<RoomTypeResponse[]>(`${this.apiUrl}/room-types`, { params }).pipe(
      tap(data => this.cache.set(cacheKey, data, 3600000)) // 1 час
    );
  }

  // 🔴 НЕ КЭШИРУЕМ: Доступные номера (Инвентарь и цены должны быть реальтайм!)
  getAvailableRooms(hotelId: number, checkInDate: string, checkOutDate: string): Observable<AvailableRoomDto[]> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString())
      .set('checkInDate', checkInDate)
      .set('checkOutDate', checkOutDate);
    return this.http.get<AvailableRoomDto[]>(`${this.apiUrl}/reservations/availability`, { params });
  }

  // 🟡 КЭШИРУЕМ: История бронирований (TTL 5 минут)
  getGuestHistory(guestId: number): Observable<any[]> {
    const cacheKey = `cache:guest:${guestId}:history`;
    const cached = this.cache.get<any[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.http.get<any[]>(`${this.apiUrl}/guests/${guestId}/history`).pipe(
      tap(data => this.cache.set(cacheKey, data, 300000)) // 5 минут
    );
  }

  // ⚡ СОБЫТИЙНЫЙ СБРОС: При создании бронирования чистим историю
  createBooking(request: PublicBookingRequest): Observable<PublicBookingResponse> {
    return this.http.post<PublicBookingResponse>(`${this.apiUrl}/reservations/public`, request).pipe(
      tap(() => {
        // Как только бронь создана, сбрасываем кэш истории, 
        // чтобы при следующем заходе в профиль подтянулись свежие данные
        this.cache.removeByPrefix(`cache:guest:${request.guestId}:history`);
      })
    );
  }

  // ⚡ СОБЫТИЙНЫЙ СБРОС: При обновлении профиля чистим кэш данных
  updateGuest(guestId: number, guest: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/guests/${guestId}`, guest).pipe(
      tap(() => {
        // Сбрасываем кэш истории, так как данные могли повлиять на отображение
        this.cache.removeByPrefix(`cache:guest:${guestId}`);
      })
    );
  }

  // Остальные методы (getHotel, getRatePlans, createGuest и т.д.) оставляем без изменений
  getHotel(id: number): Observable<HotelDto> {
    return this.http.get<HotelDto>(`${this.apiUrl}/hotels/${id}`);
  }

  getRatePlans(hotelId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (hotelId) params = params.set('hotelId', hotelId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/rate-plans`, { params });
  }

  createGuest(guest: GuestBookingInfo): Observable<any> {
    return this.http.post(`${this.apiUrl}/guests`, guest);
  }

  getGuestByDocument(documentNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/guests/by-document/${documentNumber}`);
  }

  getGuestById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/guests/${id}`);
  }
}