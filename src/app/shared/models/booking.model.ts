export interface PublicBookingRequest {
  hotelId: number;
  guestId: number;
  reservationNumber: string | null;
  source: 'WEBSITE';
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  comment: string | null;
  rooms: BookingRoomRequest[];
}

export interface BookingRoomRequest {
  roomTypeId: number;
  roomId: number | null;
  ratePlanId: number | null;
  guestsCount: number;
  pricePerNight: number | null;
}

export interface PublicBookingResponse {
  id: number;
  hotelId: number;
  guestId: number;
  reservationNumber: string;
  source: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalAmount: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  rooms: BookingRoomResponse[];
}

export interface BookingRoomResponse {
  id: number;
  roomTypeId: number;
  roomId: number | null;
  ratePlanId: number | null;
  guestsCount: number;
  pricePerNight: number;
  status: string;
}

export interface GuestBookingInfo {
  lastName: string;
  firstName: string;
  middleName: string | null;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  citizenship: string;
  documentType: string;
  documentNumber: string;
}

export interface SearchParams {
  hotelId: number | null;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
}