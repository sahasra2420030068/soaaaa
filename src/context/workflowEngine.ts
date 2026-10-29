/**
 * SOA-S09-T17 Group 17: Accessible Learning Format Request
 * Pure Workflow Transition Engine, State Machine Validation, and Structural Storage Verification
 */

import {
  Reading,
  FormatRequest,
  ConversionTask,
  Delivery,
  AcceptanceReview,
  ActivityEvent,
  AccessibleFormatType,
  UrgencyLevel,
  User,
  ReadingWorkflowStatus,
  DeliveryStatus,
  AcceptanceStatus,
  TaskStatus,
  QualityCheckStatus,
} from '../types';
import {
  INITIAL_READINGS,
  INITIAL_REQUESTS,
  INITIAL_TASKS,
  INITIAL_DELIVERIES,
  INITIAL_REVIEWS,
  INITIAL_EVENTS,
  DEMO_USERS,
} from '../data/seedData';

export interface SimulationState {
  readings: Reading[];
  requests: FormatRequest[];
  tasks: ConversionTask[];
  deliveries: Delivery[];
  reviews: AcceptanceReview[];
  events: ActivityEvent[];
}

export const VALID_FORMATS: AccessibleFormatType[] = [
  'ACCESSIBLE_PDF',
  'EPUB',
  'SCREEN_READER_HTML',
  'AUDIO_MP3',
  'LARGE_PRINT',
  'BRAILLE_READY_BRF',
];

export const VALID_READING_STATUSES: ReadingWorkflowStatus[] = [
  'NOT_REQUESTED',
  'REQUEST_SUBMITTED',
  'IN_CONVERSION',
  'QUALITY_CHECK',
  'DELIVERED',
  'ACCEPTED',
  'REVISION_REQUESTED',
];

export const VALID_DELIVERY_STATUSES: DeliveryStatus[] = ['NOT_DELIVERED', 'DELIVERED'];

export const VALID_ACCEPTANCE_STATUSES: AcceptanceStatus[] = [
  'NOT_APPLICABLE',
  'AWAITING_ACCEPTANCE',
  'ACCEPTED',
  'REVISION_REQUESTED',
];

export const VALID_TASK_STATUSES: TaskStatus[] = [
  'REQUESTED',
  'ASSIGNED',
  'IN_CONVERSION',
  'QUALITY_CHECK',
  'DELIVERED',
  'REVISION_REQUESTED',
];

export const VALID_QC_STATUSES: QualityCheckStatus[] = [
  'NOT_STARTED',
  'PENDING',
  'PASSED',
  'FAILED',
];

/**
 * Collision-proof unique ID generator using crypto.randomUUID() where supported.
 */
export const generateUniqueId = (prefix: string): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    }
  } catch (_) {}
  return `${prefix}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
};

// ==========================================
// 1. STRUCTURAL DATA VALIDATION & TYPE GUARDS
// ==========================================

export function isValidReading(r: unknown): r is Reading {
  if (!r || typeof r !== 'object') return false;
  const o = r as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    o.id.startsWith('RDG-') &&
    typeof o.title === 'string' &&
    o.title.length > 0 &&
    typeof o.courseCode === 'string' &&
    typeof o.author === 'string' &&
    typeof o.pages === 'number' &&
    VALID_FORMATS.includes(o.requiredFormat as AccessibleFormatType) &&
    VALID_READING_STATUSES.includes(o.status as ReadingWorkflowStatus) &&
    VALID_DELIVERY_STATUSES.includes(o.deliveryStatus as DeliveryStatus) &&
    VALID_ACCEPTANCE_STATUSES.includes(o.acceptanceStatus as AcceptanceStatus)
  );
}

export function isValidRequest(req: unknown): req is FormatRequest {
  if (!req || typeof req !== 'object') return false;
  const o = req as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    o.id.startsWith('REQ-') &&
    typeof o.readingId === 'string' &&
    typeof o.readingTitle === 'string' &&
    typeof o.learnerId === 'string' &&
    VALID_FORMATS.includes(o.format as AccessibleFormatType) &&
    Array.isArray(o.additionalRequirements) &&
    typeof o.createdAt === 'string'
  );
}

export function isValidTask(t: unknown): t is ConversionTask {
  if (!t || typeof t !== 'object') return false;
  const o = t as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    o.id.startsWith('TSK-') &&
    typeof o.requestId === 'string' &&
    typeof o.readingId === 'string' &&
    typeof o.readingTitle === 'string' &&
    VALID_FORMATS.includes(o.requestedFormat as AccessibleFormatType) &&
    VALID_TASK_STATUSES.includes(o.status as TaskStatus) &&
    VALID_QC_STATUSES.includes(o.qualityCheckStatus as QualityCheckStatus) &&
    typeof o.progressPercent === 'number' &&
    Array.isArray(o.history)
  );
}

export function isValidDelivery(d: unknown): d is Delivery {
  if (!d || typeof d !== 'object') return false;
  const o = d as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    o.id.startsWith('DEL-') &&
    typeof o.taskId === 'string' &&
    typeof o.readingId === 'string' &&
    VALID_FORMATS.includes(o.deliveredFormat as AccessibleFormatType) &&
    typeof o.fileName === 'string' &&
    typeof o.fileSize === 'string' &&
    typeof o.deliveryTimestamp === 'string' &&
    typeof o.checksum === 'string' &&
    Boolean(o.verificationReport && typeof o.verificationReport === 'object')
  );
}

export function isValidReview(rev: unknown): rev is AcceptanceReview {
  if (!rev || typeof rev !== 'object') return false;
  const o = rev as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    o.id.startsWith('REV-') &&
    typeof o.deliveryId === 'string' &&
    typeof o.readingId === 'string' &&
    typeof o.learnerId === 'string' &&
    (o.decision === 'ACCEPTED' || o.decision === 'REVISION_REQUESTED') &&
    typeof o.reviewedAt === 'string'
  );
}

/**
 * Validates complete structural consistency of simulation state,
 * including IDs, mandatory fields, allowed statuses, and foreign key relationships.
 */
export function validateStructuralState(state: {
  readings: unknown;
  requests: unknown;
  tasks: unknown;
  deliveries: unknown;
  reviews: unknown;
}): { isValid: boolean; error?: string } {
  if (!state || typeof state !== 'object') {
    return { isValid: false, error: 'State is not an object.' };
  }

  // 1. Validate readings collection
  if (!Array.isArray(state.readings) || state.readings.length === 0) {
    return { isValid: false, error: 'Readings collection is missing or empty.' };
  }
  for (const r of state.readings) {
    if (!isValidReading(r)) {
      return { isValid: false, error: `Invalid reading item schema: ${JSON.stringify(r)}` };
    }
  }
  const readingIds = new Set((state.readings as Reading[]).map((r) => r.id));

  // 2. Validate requests
  if (!Array.isArray(state.requests)) {
    return { isValid: false, error: 'Requests collection is not an array.' };
  }
  for (const req of state.requests) {
    if (!isValidRequest(req)) {
      return { isValid: false, error: `Invalid request item schema: ${JSON.stringify(req)}` };
    }
    if (!readingIds.has(req.readingId)) {
      return { isValid: false, error: `Request references non-existent reading ID: ${req.readingId}` };
    }
  }
  const requestIds = new Set((state.requests as FormatRequest[]).map((req) => req.id));

  // 3. Validate tasks
  if (!Array.isArray(state.tasks)) {
    return { isValid: false, error: 'Tasks collection is not an array.' };
  }
  for (const t of state.tasks) {
    if (!isValidTask(t)) {
      return { isValid: false, error: `Invalid task item schema: ${JSON.stringify(t)}` };
    }
    if (!readingIds.has(t.readingId)) {
      return { isValid: false, error: `Task references non-existent reading ID: ${t.readingId}` };
    }
    if (t.requestId && !requestIds.has(t.requestId)) {
      return { isValid: false, error: `Task references non-existent request ID: ${t.requestId}` };
    }
  }
  const taskIds = new Set((state.tasks as ConversionTask[]).map((t) => t.id));

  // 4. Validate deliveries
  if (!Array.isArray(state.deliveries)) {
    return { isValid: false, error: 'Deliveries collection is not an array.' };
  }
  for (const d of state.deliveries) {
    if (!isValidDelivery(d)) {
      return { isValid: false, error: `Invalid delivery item schema: ${JSON.stringify(d)}` };
    }
    if (!readingIds.has(d.readingId)) {
      return { isValid: false, error: `Delivery references non-existent reading ID: ${d.readingId}` };
    }
    if (d.taskId && !taskIds.has(d.taskId)) {
      return { isValid: false, error: `Delivery references non-existent task ID: ${d.taskId}` };
    }
  }
  const deliveryIds = new Set((state.deliveries as Delivery[]).map((d) => d.id));

  // 5. Validate reviews
  if (!Array.isArray(state.reviews)) {
    return { isValid: false, error: 'Reviews collection is not an array.' };
  }
  for (const rev of state.reviews) {
    if (!isValidReview(rev)) {
      return { isValid: false, error: `Invalid review item schema: ${JSON.stringify(rev)}` };
    }
    if (!readingIds.has(rev.readingId)) {
      return { isValid: false, error: `Review references non-existent reading ID: ${rev.readingId}` };
    }
    if (rev.deliveryId !== 'N/A' && !deliveryIds.has(rev.deliveryId)) {
      return { isValid: false, error: `Review references non-existent delivery ID: ${rev.deliveryId}` };
    }
  }

  // 6. Cross-reference consistency on readings
  for (const r of state.readings as Reading[]) {
    if (r.currentTaskId && !taskIds.has(r.currentTaskId)) {
      return { isValid: false, error: `Reading ${r.id} references missing currentTaskId: ${r.currentTaskId}` };
    }
    if (r.currentDeliveryId && !deliveryIds.has(r.currentDeliveryId)) {
      return { isValid: false, error: `Reading ${r.id} references missing currentDeliveryId: ${r.currentDeliveryId}` };
    }
  }

  return { isValid: true };
}

// ==========================================
// 2. WORKFLOW STATE TRANSITION ENGINE
// ==========================================

export interface TransitionResult<T = unknown> {
  success: boolean;
  message: string;
  state?: SimulationState;
  data?: T;
}

/**
 * 1. Submit Format Request
 * Validates target reading, ensures no active request already exists, registers request & task.
 */
export function submitFormatRequestAction(
  state: SimulationState,
  params: {
    readingId: string;
    format: AccessibleFormatType;
    additionalRequirements: string[];
    notes?: string;
    urgency: UrgencyLevel;
    learner?: User;
  }
): TransitionResult<{ requestId: string; taskId: string }> {
  const reading = state.readings.find((r) => r.id === params.readingId);
  if (!reading) {
    return { success: false, message: 'Validation error: Target reading not found.' };
  }

  // Prevent duplicate active requests for the same reading
  if (
    reading.status === 'REQUEST_SUBMITTED' ||
    reading.status === 'IN_CONVERSION' ||
    reading.status === 'QUALITY_CHECK' ||
    reading.status === 'DELIVERED'
  ) {
    return {
      success: false,
      message: `Reading "${reading.title}" already has an active request (${reading.status}). Duplicate requests are prevented.`,
    };
  }

  if (reading.status === 'ACCEPTED') {
    return {
      success: false,
      message: `Reading "${reading.title}" has already been accepted and completed.`,
    };
  }

  if (!VALID_FORMATS.includes(params.format)) {
    return { success: false, message: `Validation error: Invalid format "${params.format}".` };
  }

  const now = new Date().toISOString();
  const requestId = generateUniqueId('REQ');
  const taskId = generateUniqueId('TSK');
  const learner = params.learner || DEMO_USERS.LEARNER;

  const newRequest: FormatRequest = {
    id: requestId,
    readingId: reading.id,
    readingTitle: reading.title,
    courseCode: reading.courseCode,
    learnerId: learner.id,
    learnerName: learner.name,
    format: params.format,
    additionalRequirements: params.additionalRequirements || [],
    notes: params.notes,
    urgency: params.urgency,
    createdAt: now,
    status: 'PENDING',
  };

  const newTask: ConversionTask = {
    id: taskId,
    requestId,
    readingId: reading.id,
    readingTitle: reading.title,
    learnerId: learner.id,
    learnerName: learner.name,
    requestedFormat: params.format,
    priority: params.urgency,
    status: 'REQUESTED',
    progressPercent: 10,
    qualityCheckStatus: 'NOT_STARTED',
    lastUpdated: now,
    history: [
      {
        id: generateUniqueId('HIS'),
        timestamp: now,
        actor: `${learner.name} (Learner)`,
        action: 'Request Submitted',
        fromStatus: 'NONE',
        toStatus: 'REQUESTED',
        notes: `Requested format: ${params.format} with ${(params.additionalRequirements || []).length} accessibility requirements.`,
      },
    ],
  };

  const updatedReadings = state.readings.map((r) =>
    r.id === reading.id
      ? {
          ...r,
          requiredFormat: params.format,
          status: 'REQUEST_SUBMITTED' as ReadingWorkflowStatus,
          deliveryStatus: 'NOT_DELIVERED' as DeliveryStatus,
          acceptanceStatus: 'NOT_APPLICABLE' as AcceptanceStatus,
          currentRequestId: requestId,
          currentTaskId: taskId,
        }
      : r
  );

  const nextState: SimulationState = {
    ...state,
    requests: [newRequest, ...state.requests],
    tasks: [newTask, ...state.tasks],
    readings: updatedReadings,
  };

  return {
    success: true,
    message: `Request ${requestId} submitted successfully!`,
    state: nextState,
    data: { requestId, taskId },
  };
}

/**
 * 2. Assign Task to Editor
 * Validates task exists and is in REQUESTED or REVISION_REQUESTED state.
 */
export function assignTaskAction(
  state: SimulationState,
  params: {
    taskId: string;
    editorId?: string;
    editorName?: string;
  }
): TransitionResult {
  const task = state.tasks.find((t) => t.id === params.taskId);
  if (!task) return { success: false, message: 'Task not found' };

  if (task.status !== 'REQUESTED' && task.status !== 'REVISION_REQUESTED') {
    return {
      success: false,
      message: `Invalid state transition: Cannot assign task in "${task.status}" state. Must be in REQUESTED or REVISION_REQUESTED state.`,
    };
  }

  const assignedEditor = params.editorName || DEMO_USERS.EDITOR.name;
  const assignedId = params.editorId || DEMO_USERS.EDITOR.id;
  const now = new Date().toISOString();

  const historyEntry = {
    id: generateUniqueId('HIS'),
    timestamp: now,
    actor: `${assignedEditor} (Editor)`,
    action: 'Assigned Task to Specialist',
    fromStatus: task.status,
    toStatus: 'ASSIGNED',
    notes: `Task assigned to ${assignedEditor} for media conversion processing.`,
  };

  const updatedTasks = state.tasks.map((t) =>
    t.id === params.taskId
      ? {
          ...t,
          assignedEditorId: assignedId,
          assignedEditorName: assignedEditor,
          status: 'ASSIGNED' as TaskStatus,
          progressPercent: 25,
          assignedAt: now,
          lastUpdated: now,
          history: [...t.history, historyEntry],
        }
      : t
  );

  return {
    success: true,
    message: `Task ${params.taskId} assigned to ${assignedEditor}.`,
    state: { ...state, tasks: updatedTasks },
  };
}

/**
 * 3. Start Conversion Pipeline
 * Validates task is in ASSIGNED or REVISION_REQUESTED state.
 */
export function startConversionAction(
  state: SimulationState,
  params: {
    taskId: string;
    actorName?: string;
  }
): TransitionResult {
  const task = state.tasks.find((t) => t.id === params.taskId);
  if (!task) return { success: false, message: 'Task not found' };

  if (task.status !== 'ASSIGNED' && task.status !== 'REVISION_REQUESTED') {
    return {
      success: false,
      message: `Invalid state transition: Cannot start conversion from "${task.status}". Expected ASSIGNED or REVISION_REQUESTED state.`,
    };
  }

  const now = new Date().toISOString();
  const actor = params.actorName || DEMO_USERS.EDITOR.name;

  const historyEntry = {
    id: generateUniqueId('HIS'),
    timestamp: now,
    actor: `${actor} (Editor)`,
    action: task.status === 'REVISION_REQUESTED' ? 'Restarted Conversion for Revisions' : 'Started Conversion Pipeline',
    fromStatus: task.status,
    toStatus: 'IN_CONVERSION',
    notes: 'Text extraction, structure tagging, and MathML/audio synthesis in progress.',
  };

  const updatedTasks = state.tasks.map((t) =>
    t.id === params.taskId
      ? {
          ...t,
          status: 'IN_CONVERSION' as TaskStatus,
          progressPercent: 50,
          qualityCheckStatus: 'NOT_STARTED' as QualityCheckStatus,
          lastUpdated: now,
          history: [...t.history, historyEntry],
        }
      : t
  );

  const updatedReadings = state.readings.map((r) =>
    r.id === task.readingId
      ? { ...r, status: 'IN_CONVERSION' as ReadingWorkflowStatus }
      : r
  );

  return {
    success: true,
    message: `Conversion started for task ${params.taskId}.`,
    state: { ...state, tasks: updatedTasks, readings: updatedReadings },
  };
}

/**
 * 4. Submit Task for Quality Check
 * Validates task is IN_CONVERSION state.
 */
export function submitForQualityCheckAction(
  state: SimulationState,
  params: {
    taskId: string;
    notes?: string;
    actorName?: string;
  }
): TransitionResult {
  const task = state.tasks.find((t) => t.id === params.taskId);
  if (!task) return { success: false, message: 'Task not found' };

  if (task.status !== 'IN_CONVERSION') {
    return {
      success: false,
      message: `Invalid state transition: Cannot submit for QC from "${task.status}". Task must be IN_CONVERSION.`,
    };
  }

  const now = new Date().toISOString();
  const actor = params.actorName || DEMO_USERS.EDITOR.name;

  const historyEntry = {
    id: generateUniqueId('HIS'),
    timestamp: now,
    actor: `${actor} (Editor)`,
    action: 'Submitted for Quality Check',
    fromStatus: 'IN_CONVERSION',
    toStatus: 'QUALITY_CHECK',
    notes: params.notes || 'Submitting for WCAG compliance and semantic screen-reader testing.',
  };

  const updatedTasks = state.tasks.map((t) =>
    t.id === params.taskId
      ? {
          ...t,
          status: 'QUALITY_CHECK' as TaskStatus,
          qualityCheckStatus: 'PENDING' as QualityCheckStatus,
          progressPercent: 75,
          qualityCheckNotes: params.notes,
          lastUpdated: now,
          history: [...t.history, historyEntry],
        }
      : t
  );

  const updatedReadings = state.readings.map((r) =>
    r.id === task.readingId
      ? { ...r, status: 'QUALITY_CHECK' as ReadingWorkflowStatus }
      : r
  );

  return {
    success: true,
    message: `Task ${params.taskId} submitted for Quality Check.`,
    state: { ...state, tasks: updatedTasks, readings: updatedReadings },
  };
}

/**
 * 5. Pass Quality Check
 * Validates task is in QUALITY_CHECK state.
 */
export function passQualityCheckAction(
  state: SimulationState,
  params: {
    taskId: string;
    notes?: string;
    actorName?: string;
  }
): TransitionResult {
  const task = state.tasks.find((t) => t.id === params.taskId);
  if (!task) return { success: false, message: 'Task not found' };

  if (task.status !== 'QUALITY_CHECK') {
    return {
      success: false,
      message: `Invalid state transition: Cannot pass QC from "${task.status}". Must be in QUALITY_CHECK state.`,
    };
  }

  const now = new Date().toISOString();
  const actor = params.actorName || DEMO_USERS.EDITOR.name;

  const historyEntry = {
    id: generateUniqueId('HIS'),
    timestamp: now,
    actor: `${actor} (Editor QA)`,
    action: 'Quality Check Approved',
    fromStatus: 'QUALITY_CHECK',
    toStatus: 'QUALITY_CHECK',
    notes: params.notes || 'Simulated WCAG 2.1 AA audit passed. Heading levels and contrast verified.',
  };

  const updatedTasks = state.tasks.map((t) =>
    t.id === params.taskId
      ? {
          ...t,
          progressPercent: 90,
          qualityCheckStatus: 'PASSED' as QualityCheckStatus,
          qualityCheckNotes: params.notes || 'Passed simulated automated and manual accessibility audits.',
          lastUpdated: now,
          history: [...t.history, historyEntry],
        }
      : t
  );

  return {
    success: true,
    message: `Task ${params.taskId} passed Quality Check! Ready for format delivery.`,
    state: { ...state, tasks: updatedTasks },
  };
}

/**
 * 6. Fail Quality Check
 * Validates task is in QUALITY_CHECK state.
 * Returns task to IN_CONVERSION with status FAILED, blocking delivery.
 */
export function failQualityCheckAction(
  state: SimulationState,
  params: {
    taskId: string;
    reason: string;
    actorName?: string;
  }
): TransitionResult {
  const task = state.tasks.find((t) => t.id === params.taskId);
  if (!task) return { success: false, message: 'Task not found' };

  if (task.status !== 'QUALITY_CHECK') {
    return {
      success: false,
      message: `Invalid state transition: Cannot fail QC from "${task.status}". Must be in QUALITY_CHECK state.`,
    };
  }

  const trimmedReason = (params.reason || '').trim() || 'Accessibility compliance criteria not met.';
  const now = new Date().toISOString();
  const actor = params.actorName || DEMO_USERS.EDITOR.name;

  const historyEntry = {
    id: generateUniqueId('HIS'),
    timestamp: now,
    actor: `${actor} (Editor QA)`,
    action: 'Quality Check Failed',
    fromStatus: 'QUALITY_CHECK',
    toStatus: 'IN_CONVERSION',
    notes: `QC audit failed: ${trimmedReason}. Returning to conversion for remediation.`,
  };

  const updatedTasks = state.tasks.map((t) =>
    t.id === params.taskId
      ? {
          ...t,
          status: 'IN_CONVERSION' as TaskStatus,
          qualityCheckStatus: 'FAILED' as QualityCheckStatus,
          progressPercent: 40,
          qualityCheckNotes: `FAILED: ${trimmedReason}`,
          lastUpdated: now,
          history: [...t.history, historyEntry],
        }
      : t
  );

  const updatedReadings = state.readings.map((r) =>
    r.id === task.readingId
      ? { ...r, status: 'IN_CONVERSION' as ReadingWorkflowStatus }
      : r
  );

  return {
    success: true,
    message: `Task ${params.taskId} failed Quality Check and returned to IN_CONVERSION. Delivery is blocked.`,
    state: { ...state, tasks: updatedTasks, readings: updatedReadings },
  };
}

/**
 * Editor returns task for internal revision
 */
export function returnTaskForRevisionByEditorAction(
  state: SimulationState,
  params: {
    taskId: string;
    reason: string;
    actorName?: string;
  }
): TransitionResult {
  const task = state.tasks.find((t) => t.id === params.taskId);
  if (!task) return { success: false, message: 'Task not found' };

  const trimmedReason = (params.reason || '').trim() || 'Internal adjustments required.';
  const now = new Date().toISOString();
  const actor = params.actorName || DEMO_USERS.EDITOR.name;

  const historyEntry = {
    id: generateUniqueId('HIS'),
    timestamp: now,
    actor: `${actor} (Editor QA)`,
    action: 'Returned for Internal Revision',
    fromStatus: task.status,
    toStatus: 'IN_CONVERSION',
    notes: `Revision reason: ${trimmedReason}`,
  };

  const updatedTasks = state.tasks.map((t) =>
    t.id === params.taskId
      ? {
          ...t,
          status: 'IN_CONVERSION' as TaskStatus,
          qualityCheckStatus: 'NOT_STARTED' as QualityCheckStatus,
          progressPercent: 40,
          lastUpdated: now,
          history: [...t.history, historyEntry],
        }
      : t
  );

  const updatedReadings = state.readings.map((r) =>
    r.id === task.readingId
      ? { ...r, status: 'IN_CONVERSION' as ReadingWorkflowStatus }
      : r
  );

  return {
    success: true,
    message: `Task ${params.taskId} returned to IN_CONVERSION for fixes.`,
    state: { ...state, tasks: updatedTasks, readings: updatedReadings },
  };
}

/**
 * 7. Record Delivery (STRICT GUARDS & CONSISTENCY)
 * - Cannot deliver directly from IN_CONVERSION
 * - Delivery allowed ONLY after qualityCheckStatus === 'PASSED'
 * - Prevents duplicate deliveries for the same task
 * - Validates consistent relationships between task, request, and reading
 */
export function recordDeliveryAction(
  state: SimulationState,
  params: {
    taskId: string;
    customDeliveryData?: Partial<Delivery>;
    actorName?: string;
  }
): TransitionResult<{ deliveryId: string; delivery: Delivery }> {
  const task = state.tasks.find((t) => t.id === params.taskId);
  if (!task) {
    return { success: false, message: 'Task not found' };
  }

  // Duplicate delivery guard 1: Task status already delivered
  if (task.status === 'DELIVERED') {
    return {
      success: false,
      message: `Duplicate delivery rejected: Task ${task.id} has already been delivered.`,
    };
  }

  // Duplicate delivery guard 2: A delivery record already exists for this task
  const existingDelivery = state.deliveries.find((d) => d.taskId === task.id);
  if (existingDelivery) {
    return {
      success: false,
      message: `Duplicate delivery rejected: A delivery record (${existingDelivery.id}) already exists for task ${task.id}.`,
    };
  }

  // State machine guard: Must be in QUALITY_CHECK state
  if (task.status !== 'QUALITY_CHECK') {
    return {
      success: false,
      message: `Invalid state transition: Cannot record delivery from status "${task.status}". Task must complete Quality Check before delivery is permitted.`,
    };
  }

  // Quality check approval gate: Must be PASSED
  if (task.qualityCheckStatus !== 'PASSED') {
    return {
      success: false,
      message: `Quality check required: Cannot deliver format because quality check status is "${task.qualityCheckStatus}". A successful quality check approval is required before delivery.`,
    };
  }

  // Relational consistency check 1: Target reading must exist
  const reading = state.readings.find((r) => r.id === task.readingId);
  if (!reading) {
    return {
      success: false,
      message: `Validation error: Consistent reading relationship missing. Target reading ${task.readingId} not found.`,
    };
  }

  // Relational consistency check 2: If task references a request, verify consistency
  if (task.requestId) {
    const request = state.requests.find((req) => req.id === task.requestId);
    if (!request) {
      return {
        success: false,
        message: `Validation error: Consistent request relationship missing. Associated request ${task.requestId} not found.`,
      };
    }
    if (request.readingId !== task.readingId) {
      return {
        success: false,
        message: `Validation error: Request ${task.requestId} does not match task reading ID ${task.readingId}.`,
      };
    }
  }

  const now = new Date().toISOString();
  const deliveryId = generateUniqueId('DEL');
  const actor = params.actorName || DEMO_USERS.EDITOR.name;

  const formatExtMap: Record<AccessibleFormatType, string> = {
    ACCESSIBLE_PDF: 'pdf',
    EPUB: 'epub',
    SCREEN_READER_HTML: 'html',
    AUDIO_MP3: 'zip',
    LARGE_PRINT: 'pdf',
    BRAILLE_READY_BRF: 'brf',
  };

  const ext = formatExtMap[task.requestedFormat] || 'dat';
  const cleanTitle = task.readingTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 24);
  const generatedFileName = `${task.readingId}_${cleanTitle}_Accessible.${ext}`;

  const newDelivery: Delivery = {
    id: deliveryId,
    taskId: task.id,
    requestId: task.requestId,
    readingId: task.readingId,
    deliveredFormat: task.requestedFormat,
    fileName: params.customDeliveryData?.fileName || generatedFileName,
    fileSize: params.customDeliveryData?.fileSize || '6.8 MB',
    deliveryTimestamp: now,
    deliveredBy: `${actor} (Editor)`,
    downloadUrlSimulated: `#download-${deliveryId}`,
    checksum: `sha256:${generateUniqueId('HASH')}`,
    verificationReport: {
      wcagLevel: 'WCAG 2.1 AA',
      accessibleCheckPassed: true,
      structuredHeadings: 22,
      altTextElements: 14,
      readabilityScore: 'Grade 12.0 (Academic Accessible)',
      isSimulatedAudit: true,
      ...(params.customDeliveryData?.verificationReport || {}),
    },
  };

  const historyEntry = {
    id: generateUniqueId('HIS'),
    timestamp: now,
    actor: `${actor} (Editor)`,
    action: 'Recorded Format Delivery',
    fromStatus: task.status,
    toStatus: 'DELIVERED',
    notes: `Format delivered: ${newDelivery.fileName}. Awaiting explicit learner acceptance.`,
  };

  const updatedTasks = state.tasks.map((t) =>
    t.id === params.taskId
      ? {
          ...t,
          status: 'DELIVERED' as TaskStatus,
          progressPercent: 100,
          lastUpdated: now,
          history: [...t.history, historyEntry],
        }
      : t
  );

  const updatedReadings = state.readings.map((r) =>
    r.id === task.readingId
      ? {
          ...r,
          status: 'DELIVERED' as ReadingWorkflowStatus,
          deliveryStatus: 'DELIVERED' as DeliveryStatus,
          acceptanceStatus: 'AWAITING_ACCEPTANCE' as AcceptanceStatus,
          currentDeliveryId: deliveryId,
        }
      : r
  );

  return {
    success: true,
    message: 'Delivery recorded successfully',
    state: {
      ...state,
      deliveries: [newDelivery, ...state.deliveries],
      tasks: updatedTasks,
      readings: updatedReadings,
    },
    data: { deliveryId, delivery: newDelivery },
  };
}

/**
 * 8. Accept Delivery by Learner
 * - Only permitted for delivered readings awaiting acceptance
 * - Rejects undelivered or already accepted readings
 * - Validates rating: integer between 1 and 5
 * - Prevents duplicate acceptance
 */
export function acceptDeliveryAction(
  state: SimulationState,
  params: {
    readingId: string;
    rating?: number;
    feedback?: string;
    learner?: User;
  }
): TransitionResult<{ reviewId: string }> {
  const reading = state.readings.find((r) => r.id === params.readingId);
  if (!reading) {
    return { success: false, message: 'Reading not found' };
  }

  // Reject undelivered readings
  if (reading.deliveryStatus !== 'DELIVERED' || !reading.currentDeliveryId) {
    return {
      success: false,
      message: 'Validation error: Cannot accept a format that has not been delivered.',
    };
  }

  // Reject already accepted readings (duplicate acceptance guard)
  if (reading.acceptanceStatus === 'ACCEPTED') {
    return {
      success: false,
      message: `Reading "${reading.title}" is already accepted. Duplicate acceptance is prevented.`,
    };
  }

  // Reject if not awaiting acceptance
  if (reading.acceptanceStatus !== 'AWAITING_ACCEPTANCE') {
    return {
      success: false,
      message: `Validation error: Cannot accept reading in acceptance status "${reading.acceptanceStatus}". Must be AWAITING_ACCEPTANCE.`,
    };
  }

  // Validate rating: integer 1 to 5
  const rating = params.rating === undefined ? 5 : params.rating;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      success: false,
      message: 'Validation error: Rating must be an integer between 1 and 5.',
    };
  }

  // Verify delivery record exists
  const delivery = state.deliveries.find((d) => d.id === reading.currentDeliveryId);
  if (!delivery) {
    return {
      success: false,
      message: 'Validation error: Associated delivery record not found.',
    };
  }

  const now = new Date().toISOString();
  const reviewId = generateUniqueId('REV');
  const learner = params.learner || DEMO_USERS.LEARNER;

  const newReview: AcceptanceReview = {
    id: reviewId,
    deliveryId: reading.currentDeliveryId,
    readingId: reading.id,
    learnerId: learner.id,
    decision: 'ACCEPTED',
    rating,
    feedback: params.feedback || 'Format satisfies all accessibility and pedagogical requirements.',
    reviewedAt: now,
  };

  const updatedReadings = state.readings.map((r) =>
    r.id === params.readingId
      ? {
          ...r,
          status: 'ACCEPTED' as ReadingWorkflowStatus,
          acceptanceStatus: 'ACCEPTED' as AcceptanceStatus,
        }
      : r
  );

  let updatedTasks = state.tasks;
  if (reading.currentTaskId) {
    const historyEntry = {
      id: generateUniqueId('HIS'),
      timestamp: now,
      actor: `${learner.name} (Learner)`,
      action: 'Format Explicitly Accepted',
      fromStatus: 'DELIVERED',
      toStatus: 'DELIVERED',
      notes: `Learner accepted with ${rating} stars. Feedback: "${newReview.feedback}"`,
    };

    updatedTasks = state.tasks.map((t) =>
      t.id === reading.currentTaskId
        ? {
            ...t,
            lastUpdated: now,
            history: [...t.history, historyEntry],
          }
        : t
    );
  }

  return {
    success: true,
    message: `Format accepted for "${reading.title}". Acceptance recorded.`,
    state: {
      ...state,
      reviews: [newReview, ...state.reviews],
      readings: updatedReadings,
      tasks: updatedTasks,
    },
    data: { reviewId },
  };
}

/**
 * 9. Request Revision by Learner
 * - Permitted ONLY for an existing delivery awaiting learner acceptance
 * - Rejects revisions for undelivered or already accepted readings
 * - Requires meaningful reason (>= 10 characters)
 * - Resets task qualityCheckStatus to NOT_STARTED and status to REVISION_REQUESTED
 */
export function requestRevisionByLearnerAction(
  state: SimulationState,
  params: {
    readingId: string;
    reason: string;
    learner?: User;
  }
): TransitionResult<{ reviewId: string }> {
  const reading = state.readings.find((r) => r.id === params.readingId);
  if (!reading) {
    return { success: false, message: 'Reading not found' };
  }

  // Reject undelivered readings
  if (reading.deliveryStatus !== 'DELIVERED' || !reading.currentDeliveryId) {
    return {
      success: false,
      message: 'Validation error: Cannot request revision for a reading that has not been delivered.',
    };
  }

  // Reject already accepted readings
  if (reading.acceptanceStatus === 'ACCEPTED') {
    return {
      success: false,
      message: 'Validation error: Cannot request revision for a reading that has already been accepted.',
    };
  }

  // Permitted ONLY when awaiting acceptance
  if (reading.acceptanceStatus !== 'AWAITING_ACCEPTANCE') {
    return {
      success: false,
      message: `Validation error: Revision requests are permitted only for an existing delivery awaiting learner acceptance (current: "${reading.acceptanceStatus}").`,
    };
  }

  // Reason must be meaningful (>= 10 chars)
  const trimmedReason = (params.reason || '').trim();
  if (trimmedReason.length < 10) {
    return {
      success: false,
      message: 'Validation error: Please provide a meaningful revision reason (at least 10 characters) explaining what adjustments are needed.',
    };
  }

  const now = new Date().toISOString();
  const reviewId = generateUniqueId('REV');
  const learner = params.learner || DEMO_USERS.LEARNER;

  const newReview: AcceptanceReview = {
    id: reviewId,
    deliveryId: reading.currentDeliveryId,
    readingId: reading.id,
    learnerId: learner.id,
    decision: 'REVISION_REQUESTED',
    revisionReason: trimmedReason,
    reviewedAt: now,
  };

  const updatedReadings = state.readings.map((r) =>
    r.id === params.readingId
      ? {
          ...r,
          status: 'REVISION_REQUESTED' as ReadingWorkflowStatus,
          acceptanceStatus: 'REVISION_REQUESTED' as AcceptanceStatus,
        }
      : r
  );

  let updatedTasks = state.tasks;
  if (reading.currentTaskId) {
    const historyEntry = {
      id: generateUniqueId('HIS'),
      timestamp: now,
      actor: `${learner.name} (Learner)`,
      action: 'Revision Requested by Learner',
      fromStatus: 'DELIVERED',
      toStatus: 'REVISION_REQUESTED',
      notes: `Learner feedback: ${trimmedReason}`,
    };

    updatedTasks = state.tasks.map((t) =>
      t.id === reading.currentTaskId
        ? {
            ...t,
            status: 'REVISION_REQUESTED' as TaskStatus,
            qualityCheckStatus: 'NOT_STARTED' as QualityCheckStatus,
            progressPercent: 45,
            lastUpdated: now,
            history: [...t.history, historyEntry],
          }
        : t
    );
  }

  return {
    success: true,
    message: 'Revision request logged. Task returned to editor queue.',
    state: {
      ...state,
      reviews: [newReview, ...state.reviews],
      readings: updatedReadings,
      tasks: updatedTasks,
    },
    data: { reviewId },
  };
}

/**
 * 10. Critical Completion Calculation
 * Strictly enforces that overall course status remains INCOMPLETE until
 * every required reading has an accepted format (all 5 readings accepted).
 */
export function calculateCompletionMetrics(readings: Reading[]) {
  const total = readings.length;
  const accepted = readings.filter((r) => r.acceptanceStatus === 'ACCEPTED').length;
  const awaitingAcceptance = readings.filter(
    (r) => r.deliveryStatus === 'DELIVERED' && r.acceptanceStatus === 'AWAITING_ACCEPTANCE'
  ).length;
  const inProgress = readings.filter(
    (r) =>
      r.status === 'REQUEST_SUBMITTED' ||
      r.status === 'IN_CONVERSION' ||
      r.status === 'QUALITY_CHECK' ||
      r.status === 'REVISION_REQUESTED'
  ).length;
  const notReq = readings.filter((r) => r.status === 'NOT_REQUESTED').length;

  // STRICT RULE: Overall workflow MUST remain INCOMPLETE until EVERY required reading has a usable delivered format and explicit learner acceptance.
  const isComplete = total > 0 && accepted === total;
  const percentage = total > 0 ? Math.round((accepted / total) * 100) : 0;
  const summary = `${accepted} of ${total} readings accepted`;

  return {
    totalRequiredReadings: total,
    acceptedReadingsCount: accepted,
    deliveredAwaitingAcceptanceCount: awaitingAcceptance,
    inProgressOrRequestedCount: inProgress,
    notRequestedCount: notReq,
    isOverallComplete: isComplete,
    completionPercentage: percentage,
    completionSummaryText: summary,
  };
}

/**
 * 11. Reset Simulation State to Default Baseline
 */
export function getInitialSimulationState(): SimulationState {
  return {
    readings: INITIAL_READINGS,
    requests: INITIAL_REQUESTS,
    tasks: INITIAL_TASKS,
    deliveries: INITIAL_DELIVERIES,
    reviews: INITIAL_REVIEWS,
    events: INITIAL_EVENTS,
  };
}
