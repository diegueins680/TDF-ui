
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
