export interface RoomTypeResponse {
  id: number;
  hotelId: number;
  code: string;
  name: string;
  description: string | null;
  capacity: number;
  basePrice: number;
  status: string;
}
