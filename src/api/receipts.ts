import { get, post } from './client';
import type { CreateReceiptReq, ReceiptDTO } from './types';

export const Receipts = {
  list: () => get<ReceiptDTO[]>('/receipts'),
  get: (id: number | string) => get<ReceiptDTO>(`/receipts/${id}`),
  create: (body: CreateReceiptReq) => post<ReceiptDTO>('/receipts', body),
};
