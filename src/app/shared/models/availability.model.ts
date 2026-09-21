export interface AvailableRoomDto {
  roomId: number;
  roomNumber: string;
  floor: number | null;
  hotelId: number;
  hotelName: string;
  roomTypeId: number;
  roomTypeName: string;
  capacity: number;
  basePrice: number;
  roomStatus: string;
  housekeepingStatus: string;
}

export interface AvailabilityRequest {
  hotelId: number;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
}