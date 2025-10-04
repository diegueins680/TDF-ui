
export type PartyDTO = {
  partyId: number;
  legalName?: string | null;
  displayName: string;
  isOrg: boolean;
  taxId?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  emergencyContact?: string | null;
  notes?: string | null;
};

export type PartyCreate = {
  cDisplayName: string;
  cIsOrg: boolean;
  cLegalName?: string | null;
  cPrimaryEmail?: string | null;
  cPrimaryPhone?: string | null;
  cWhatsapp?: string | null;
  cInstagram?: string | null;
  cTaxId?: string | null;
  cEmergencyContact?: string | null;
  cNotes?: string | null;
  cRoles?: RoleKey[];
};

export type PartyUpdate = Partial<{
  uDisplayName: string;
  uIsOrg: boolean;
  uLegalName: string | null;
  uPrimaryEmail: string | null;
  uPrimaryPhone: string | null;
  uWhatsapp: string | null;
  uInstagram: string | null;
  uTaxId: string | null;
  uEmergencyContact: string | null;
  uNotes: string | null;
}>;

export type BookingDTO = {
  bookingId: number;
  title: string;
  startsAt: string; // ISO
  endsAt: string;   // ISO
  status: string;
  notes?: string | null;
  partyId?: number | null;
  serviceOrderId?: number | null;
};

export type PipelineType = 'Mixing' | 'Mastering';
export type PipelineStage =
  | 'Brief' | 'Prep' | 'v1 Sent' | 'Revisions' | 'Approved' | 'Delivered' // Mixing
  | 'v1' | 'DDP Delivered'; // Mastering extras
export type PipelineCard = { id: string; title: string; artist?: string; type: PipelineType; stage: string };

export type RoleKey =
  | 'Admin'
  | 'Manager'
  | 'Engineer'
  | 'Teacher'
  | 'Reception'
  | 'Accounting'
  | 'Artist'
  | 'Student'
  | 'Vendor'
  | 'ReadOnly'
  | 'Customer';

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  partyId: number;
  roles: string[];
  modules: string[];
};

export type Page<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type RoomDTO = {
  roomId: string;
  rName: string;
  rBookable: boolean;
};

export type RoomCreate = {
  rcName: string;
};

export type RoomUpdate = Partial<{
  ruName: string;
  ruIsBookable: boolean;
}>;

export type SessionDTO = {
  sessionId: string;
  sStartAt: string;
  sEndAt: string;
  sStatus: string;
};

export type SessionCreate = {
  scBookingRef?: string | null;
  scStartAt: string;
  scEndAt: string;
  scEngineerRef: string;
  scRoomIds: string[];
};

export type SessionUpdate = Partial<{
  suStatus: string;
  suNotes: string | null;
}>;

export type AssetDTO = {
  assetId: string;
  name: string;
  category: string;
  status: string;
  location?: string | null;
};

export type AssetCreate = {
  cName: string;
  cCategory: string;
};

export type AssetUpdate = Partial<{
  uName: string;
  uCategory: string;
  uStatus: string;
  uLocationId: string | null;
  uNotes: string | null;
}>;

export type InvoiceDTO = {
  invId: number;
  number?: string | null;
  statusI: string;
  subtotalC: number;
  taxC: number;
  totalC: number;
  customerId?: number;
};

export type CreateInvoiceReq = {
  ciCustomerId: number;
  ciSubtotalCents: number;
  ciTaxCents: number;
  ciTotalCents: number;
  ciNumber?: string | null;
};

export type PackageProductDTO = {
  ppId: number;
  ppName: string;
  ppService: string;
  ppUnitsKind: string;
  ppUnitsQty: number;
  ppPriceCents: number;
};

export type PackagePurchaseReq = {
  buyerId: number;
  productId: number;
};

export type PackageProductCreate = {
  name: string;
  serviceKind: string;
  unitsKind: string;
  unitsQty: number;
  priceCents: number;
  taxBps?: number;
  active?: boolean;
};

export type PackageProductUpdate = Partial<PackageProductCreate> & {
  active?: boolean;
};

export type AuditLogEntry = {
  auditId?: string;
  actorId?: number | null;
  entity: string;
  entityId: string;
  action: string;
  diff?: string | null;
  createdAt: string;
};
