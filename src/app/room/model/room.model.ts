export interface RoomInterface {
  id: string;
  name: string;
  tKey: string;
  type: RoomTypes;
  order: number;
}
export interface RoomAvailableInterface {
  id: number;
  available: boolean;
}

export interface RoomTableInterface {
  id: string;
  name: string;
  order: number;
}

export type RoomTypes = 'mainHall' | 'auxiliaryRoom1' | 'auxiliaryRoom2' | 'other';
