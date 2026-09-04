export type ObservationStatus = 'À faire' | 'En cours' | 'Urgent' | 'Ouvert' | 'Terminé' | 'Achevé';

export type WeatherType = 'Ensoleillé' | 'Nuageux' | 'Pluvieux' | 'Venteux' | 'Brouillard';

export type ProjectStatus = 'En cours' | 'En réception' | 'Achevé' | 'Archivé';

export interface LotCompany {
  id: string;
  lotName: string; // ex: Gros Œuvre, Étanchéité, Plomberie
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export interface Project {
  id: string;
  code: string; // ex: PRJ-2026-01
  name: string; // Nom du Chantier
  client: string; // Maître d'Ouvrage
  address: string;
  city: string;
  status: ProjectStatus;
  progress: number; // 0 to 100
  startDate: string;
  estimatedEndDate?: string;
  lots: LotCompany[];
  notes?: string;
}

export interface Observation {
  id: string;
  number: number;
  lot: string; // Corps d'état
  location: string; // Localisation (ex: RDC, Appart B1, Façade)
  text: string;
  assignedTo: string; // Entreprise responsable
  dueDate?: string;
  status: ObservationStatus;
  photoUrl?: string; // Base64 or image URL
  resolvedDate?: string;
}

export interface Participant {
  id: string;
  name: string;
  role: string; // ex: Architecte, Maître d'Ouvrage, Chef de Chantier
  organization: string; // Entreprise / Organisme
  status: 'Présent' | 'Excusé' | 'Absent';
  email?: string;
  phone?: string;
}

export interface SignatureEntry {
  roleName: string; // ex: "L'Architecte", "Le Maître d'Ouvrage", "L'Entrepreneur"
  signerName: string;
  dataUrl?: string;
  date?: string;
}

export interface PhotoArrowAnnotation {
  id: string;
  startX: number; // percentage 0-100 (origin of comment bubble/arrow tail)
  startY: number; // percentage 0-100
  targetX: number; // percentage 0-100 (where the arrow points to)
  targetY: number; // percentage 0-100
  text: string; // the comment text
  color?: string; // hex color (e.g. #DC2626)
  author?: string;
  date?: string;
}

export interface PVPhoto {
  id: string;
  url: string;
  caption?: string;
  lot?: string;
  date?: string;
  annotations?: PhotoArrowAnnotation[];
}

export interface UserProfile {
  id: string;
  name: string;
  title: string;          // ex: Dessinateur-Projeteur, Architecte DPLG, Conducteur de Travaux
  organization: string;   // ex: ARCHITEXPERT, BATI-MAROC, Cabinet d'Études
  email: string;
  phone: string;
  roleTag: 'Architecte' | 'Conducteur de Travaux' | 'Ingénieur' | 'Maître d\'Ouvrage' | 'Inspecteur' | 'Autre';
  avatarUrl?: string;     // Base64 or URL profile picture
  color: string;          // Badge theme color
  isDefault?: boolean;
}

export interface SitePV {
  id: string;
  number: string; // ex: PV-001
  projectId: string;
  date: string;
  time?: string;
  weather: WeatherType;
  overallProgress: number; // Percentage
  nextMeetingDate?: string;
  nextMeetingTime?: string;
  generalNotes?: string;
  participants: Participant[];
  observations: Observation[];
  galleryPhotos?: PVPhoto[];
  signatures: Record<string, SignatureEntry>; // key: role ID or index
  authorId?: string;
  authorName?: string;
  authorTitle?: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeSettings {
  name: string;
  title: string;
  brand: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  logoUrl?: string;
  legalMention?: string;
}

export type ViewType = 'dashboard' | 'projects' | 'pvs' | 'new_pv' | 'edit_pv' | 'pv_detail' | 'settings';
