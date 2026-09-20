export interface AvailabilityRequest {
  hotelId: number;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
}

export interface AvailableRoomDto {
  roomTypeId: number;
  roomTypeName: string;
  availableCount: number;
  basePrice: number;
  capacity: number;
}
