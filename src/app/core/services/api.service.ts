import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HotelDto } from '../../shared/models/hotel.model';
import { RoomTypeResponse } from '../../shared/models/room-type.model';
import { AvailableRoomDto } from '../../shared/models/availability.model';
import { PublicBookingRequest, PublicBookingResponse, GuestBookingInfo } from '../../shared/models/booking.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getHotels(): Observable<HotelDto[]> {
    return this.http.get<HotelDto[]>(`${this.apiUrl}/hotels`);
  }

  getHotel(id: number): Observable<HotelDto> {
    return this.http.get<HotelDto>(`${this.apiUrl}/hotels/${id}`);
  }

  getRoomTypes(hotelId?: number): Observable<RoomTypeResponse[]> {
    let params = new HttpParams();
    if (hotelId) {
      params = params.set('hotelId', hotelId.toString());
    }
    return this.http.get<RoomTypeResponse[]>(`${this.apiUrl}/room-types`, { params });
  }

  getRatePlans(hotelId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (hotelId) {
      params = params.set('hotelId', hotelId.toString());
    }
    return this.http.get<any[]>(`${this.apiUrl}/rate-plans`, { params });
  }

  getAvailableRooms(hotelId: number, checkInDate: string, checkOutDate: string): Observable<AvailableRoomDto[]> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString())
      .set('checkInDate', checkInDate)
      .set('checkOutDate', checkOutDate);
    return this.http.get<AvailableRoomDto[]>(`${this.apiUrl}/reservations/availability`, { params });
  }

  createBooking(request: PublicBookingRequest): Observable<PublicBookingResponse> {
    return this.http.post<PublicBookingResponse>(`${this.apiUrl}/reservations/public`, request);
  }

  createGuest(guest: GuestBookingInfo): Observable<any> {
    return this.http.post(`${this.apiUrl}/guests`, guest);
  }

  getGuestHistory(guestId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/guests/${guestId}/history`);
  }
}