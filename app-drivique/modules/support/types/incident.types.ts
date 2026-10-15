export type IncidentCategory = "RESERVATION" | "VEHICLE" | "PAYMENT" | "OTHER";
export type IncidentStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface IncidentAttachment {
  id: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface IncidentTimelineItem {
  type: "MESSAGE" | "STATUS" | "ASSIGNMENT";
  authorName: string;
  authorRole: "CUSTOMER" | "STAFF";
  message: string | null;
  fromStatus: IncidentStatus | null;
  toStatus: IncidentStatus | null;
  attachments: IncidentAttachment[];
  createdAt: string;
}

export interface Incident {
  id: string;
  code: string;
  category: IncidentCategory;
  status: IncidentStatus;
  priority: IncidentPriority;
  subject: string;
  description: string;
  vehicleId: string | null;
  vehiclePlate: string | null;
  vehicleModel: string | null;
  reservationId: string | null;
  reservationCode: string | null;
  branchId: string | null;
  branchName: string | null;
  reporterName: string;
  assignedToName: string | null;
  slaDueAt: string | null;
  slaBreached: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  allowedTransitions: IncidentStatus[];
  attachments?: IncidentAttachment[];
  timeline?: IncidentTimelineItem[];
}

export interface ArchivoAdjunto {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface NuevaIncidencia {
  category: IncidentCategory;
  subject: string;
  description: string;
  reservationId?: string;
  vehicleId?: string;
  branchId?: string;
}
