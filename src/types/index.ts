export type UserRole = 'LEARNER' | 'EDITOR';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  title: string;
  departmentOrStudentId: string;
}

export type AccessibleFormatType =
  | 'ACCESSIBLE_PDF'
  | 'EPUB'
  | 'SCREEN_READER_HTML'
  | 'AUDIO_MP3'
  | 'LARGE_PRINT'
  | 'BRAILLE_READY_BRF';

export type ReadingWorkflowStatus =
  | 'NOT_REQUESTED'
  | 'REQUEST_SUBMITTED'
  | 'IN_CONVERSION'
  | 'QUALITY_CHECK'
  | 'DELIVERED'
  | 'ACCEPTED'
  | 'REVISION_REQUESTED';

export type DeliveryStatus = 'NOT_DELIVERED' | 'DELIVERED';

export type AcceptanceStatus =
  | 'NOT_APPLICABLE'
  | 'AWAITING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'REVISION_REQUESTED';

export interface Reading {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  author: string;
  year: number;
  pages: number;
  originalFormat: string;
  shortDescription: string;
  requiredFormat: AccessibleFormatType;
  status: ReadingWorkflowStatus;
  deliveryStatus: DeliveryStatus;
  acceptanceStatus: AcceptanceStatus;
  currentRequestId?: string;
  currentTaskId?: string;
  currentDeliveryId?: string;
}

export type UrgencyLevel = 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface FormatRequest {
  id: string;
  readingId: string;
  readingTitle: string;
  courseCode: string;
  learnerId: string;
  learnerName: string;
  format: AccessibleFormatType;
  additionalRequirements: string[];
  notes?: string;
  urgency: UrgencyLevel;
  createdAt: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_CONVERSION' | 'QUALITY_CHECK' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
}

export type TaskStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'IN_CONVERSION'
  | 'QUALITY_CHECK'
  | 'DELIVERED'
  | 'REVISION_REQUESTED';

export interface TaskHistoryEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  notes?: string;
}

export type QualityCheckStatus = 'NOT_STARTED' | 'PENDING' | 'PASSED' | 'FAILED';

export interface ConversionTask {
  id: string;
  requestId: string;
  readingId: string;
  readingTitle: string;
  requestedFormat: AccessibleFormatType;
  learnerName: string;
  learnerId: string;
  assignedEditorId?: string;
  assignedEditorName?: string;
  priority: UrgencyLevel;
  status: TaskStatus;
  progressPercent: number;
  qualityCheckStatus: QualityCheckStatus;
  history: TaskHistoryEntry[];
  qualityCheckNotes?: string;
  assignedAt?: string;
  lastUpdated: string;
  estimatedDeliveryDate?: string;
}

export interface Delivery {
  id: string;
  taskId: string;
  requestId: string;
  readingId: string;
  deliveredFormat: AccessibleFormatType;
  fileName: string;
  fileSize: string;
  deliveryTimestamp: string;
  deliveredBy: string;
  downloadUrlSimulated: string;
  checksum: string;
  verificationReport: {
    wcagLevel: 'WCAG 2.1 AA' | 'WCAG 2.2 AAA';
    accessibleCheckPassed: boolean;
    structuredHeadings: number;
    altTextElements: number;
    readabilityScore: string;
    isSimulatedAudit: boolean;
  };
}

export interface AcceptanceReview {
  id: string;
  deliveryId: string;
  readingId: string;
  learnerId: string;
  decision: 'ACCEPTED' | 'REVISION_REQUESTED';
  rating?: number;
  feedback?: string;
  revisionReason?: string;
  reviewedAt: string;
}

export type EventType =
  | 'REQUEST_SUBMITTED'
  | 'TASK_ASSIGNED'
  | 'CONVERSION_STARTED'
  | 'QUALITY_CHECK_SUBMITTED'
  | 'QUALITY_CHECK_PASSED'
  | 'QUALITY_CHECK_FAILED'
  | 'FORMAT_DELIVERED'
  | 'FORMAT_ACCEPTED'
  | 'REVISION_REQUESTED'
  | 'SYSTEM_RESET';

export interface KafkaSimulatedPayload {
  eventId: string;
  eventType: EventType;
  topic: 'soa.s09.t17.events';
  aggregateId: string;
  timestamp: string;
  producerService: string;
  consumerServices: string[];
  payload: Record<string, unknown>;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  eventType: EventType;
  title: string;
  description: string;
  actor: string;
  readingTitle: string;
  readingId: string;
  kafkaMessage: KafkaSimulatedPayload;
}

export interface GuidedDemoStep {
  step: number;
  title: string;
  targetRole: UserRole;
  description: string;
  actionHint: string;
  recommendedRoute: string;
  relatedReadingId?: string;
  isComplete: boolean;
}
