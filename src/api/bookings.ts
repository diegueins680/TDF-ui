
import { get, post } from './client';
import type { BookingDTO } from './types';

export type CreateBookingReq = {
  cbTitle: string;
  cbStartsAt: string;
  cbEndsAt: string;
  cbStatus: string;
  cbNotes?: string | null;
};

export const Bookings = {
  list: () => get<BookingDTO[]>('/bookings'),
  create: (body: CreateBookingReq) => post<BookingDTO>('/bookings', body),
};
