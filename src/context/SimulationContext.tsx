import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  UserRole,
  Reading,
  FormatRequest,
  ConversionTask,
  Delivery,
  AcceptanceReview,
  ActivityEvent,
  AccessibleFormatType,
  UrgencyLevel,
  GuidedDemoStep,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_EVENTS,
} from '../data/seedData';
import {
  SimulationState,
  generateUniqueId,
  validateStructuralState,
  submitFormatRequestAction,
  assignTaskAction,
  startConversionAction,
  submitForQualityCheckAction,
  passQualityCheckAction,
  failQualityCheckAction,
  returnTaskForRevisionByEditorAction,
  recordDeliveryAction,
  acceptDeliveryAction,
  requestRevisionByLearnerAction,
  calculateCompletionMetrics,
  getInitialSimulationState,
} from './workflowEngine';

export { generateUniqueId };

export const STORAGE_SCHEMA_VERSION = 'v2';

export const STORAGE_KEYS = {
  SCHEMA_VER: 'soa_s09_t17_schema_ver',
  CURRENT_USER: 'soa_s09_t17_currentUser_v2',
  READINGS: 'soa_s09_t17_readings_v2',
  REQUESTS: 'soa_s09_t17_requests_v2',
  TASKS: 'soa_s09_t17_tasks_v2',
  DELIVERIES: 'soa_s09_t17_deliveries_v2',
  REVIEWS: 'soa_s09_t17_reviews_v2',
  EVENTS: 'soa_s09_t17_events_v2',
  GUIDED_STEP: 'soa_s09_t17_guidedStep_v2',
  GUIDED_OPEN: 'soa_s09_t17_guidedOpen_v2',
};

export const GUIDED_DEMO_STEPS: GuidedDemoStep[] = [
  {
    step: 1,
    title: 'Login as Learner Maya Lin',
    targetRole: 'LEARNER',
    description: 'Sign in to the simulated Learner portal to inspect academic readings, review course materials, and track accessibility conversions.',
    actionHint: 'Log in as Maya Lin to enter the Learner Dashboard.',
    recommendedRoute: '/learner/dashboard',
    isComplete: false,
  },
  {
    step: 2,
    title: 'Select a Required Reading',
    targetRole: 'LEARNER',
    description: 'Inspect the 5 required course readings. Notice RDG-105 ("Graph Theory & Combinatorial Network Optimization") has status "Not Requested".',
    actionHint: 'Navigate to Reading List and click "Request Accessible Format" on RDG-105.',
    recommendedRoute: '/learner/readings',
    relatedReadingId: 'RDG-105',
    isComplete: false,
  },
  {
    step: 3,
    title: 'Submit Format Request (Large Print / EPUB)',
    targetRole: 'LEARNER',
    description: 'Submit an accessibility request with format parameters, high-contrast specs, and pedagogical notes.',
    actionHint: 'Fill in the form and click "Submit Accessibility Request".',
    recommendedRoute: '/learner/request/RDG-105',
    relatedReadingId: 'RDG-105',
    isComplete: false,
  },
  {
    step: 4,
    title: 'Switch to Accessibility Editor',
    targetRole: 'EDITOR',
    description: 'Switch persona to David Chen (Lead Conversion Specialist) to manage conversion pipelines and queue tasks.',
    actionHint: 'Use the top-bar role switcher to switch to Accessibility Editor.',
    recommendedRoute: '/editor/dashboard',
    isComplete: false,
  },
  {
    step: 5,
    title: 'Assign Conversion Task in Queue',
    targetRole: 'EDITOR',
    description: 'Locate the newly generated conversion task in the Conversion Queue and assign it to an editor.',
    actionHint: 'Open Conversion Queue and click "Assign Task" or view Task Details.',
    recommendedRoute: '/editor/queue',
    isComplete: false,
  },
  {
    step: 6,
    title: 'Start Conversion & Submit for QA',
    targetRole: 'EDITOR',
    description: 'Progress the state machine: REQUESTED → ASSIGNED → IN_CONVERSION → QUALITY_CHECK.',
    actionHint: 'In the Task Details view, click "Start Conversion" then "Submit for Quality Check".',
    recommendedRoute: '/editor/queue',
    isComplete: false,
  },
  {
    step: 7,
    title: 'Pass QA & Record Format Delivery',
    targetRole: 'EDITOR',
    description: 'Approve quality check standards and record file delivery. This triggers the simulated Kafka event AccessibleFormatDelivered.',
    actionHint: 'Click "Approve QC" and then "Record Delivery".',
    recommendedRoute: '/editor/queue',
    isComplete: false,
  },
  {
    step: 8,
    title: 'Switch Back to Learner Persona',
    targetRole: 'LEARNER',
    description: 'Return to Learner Maya Lin. Notice the delivery notification and the critical requirement for explicit acceptance.',
    actionHint: 'Switch back to Learner role via the top bar.',
    recommendedRoute: '/learner/dashboard',
    isComplete: false,
  },
  {
    step: 9,
    title: 'Review Delivered Document & Accept',
    targetRole: 'LEARNER',
    description: 'Inspect the delivered file preview, test font scaling and screen-reader tags, then submit an explicit 5-star acceptance review.',
    actionHint: 'Open Delivery Review for RDG-105 (or RDG-104) and click "Accept Accessible Format".',
    recommendedRoute: '/learner/review/RDG-105',
    relatedReadingId: 'RDG-105',
    isComplete: false,
  },
  {
    step: 10,
    title: 'Verify Critical Completion Rule',
    targetRole: 'LEARNER',
    description: 'Inspect the overall completion counter. When all 5 readings are delivered AND accepted, status transitions to COMPLETE!',
    actionHint: 'Check the Learner Dashboard progress indicator: "5 of 5 readings accepted — Workflow Complete".',
    recommendedRoute: '/learner/dashboard',
    isComplete: false,
  },
];

interface SimulationContextType {
  currentUser: User | null;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  readings: Reading[];
  requests: FormatRequest[];
  tasks: ConversionTask[];
  deliveries: Delivery[];
  reviews: AcceptanceReview[];
  events: ActivityEvent[];

  // Critical Completion Metrics
  totalRequiredReadings: number;
  acceptedReadingsCount: number;
  deliveredAwaitingAcceptanceCount: number;
  inProgressOrRequestedCount: number;
  notRequestedCount: number;
  isOverallComplete: boolean;
  completionPercentage: number;
  completionSummaryText: string;

  // State Machine and Actions
  submitFormatRequest: (params: {
    readingId: string;
    format: AccessibleFormatType;
    additionalRequirements: string[];
    notes?: string;
    urgency: UrgencyLevel;
  }) => { success: boolean; requestId: string; taskId: string; message?: string };

  assignTask: (taskId: string, editorId?: string, editorName?: string) => { success: boolean; message: string };
  startConversion: (taskId: string) => { success: boolean; message: string };
  submitForQualityCheck: (taskId: string, notes?: string) => { success: boolean; message: string };
  passQualityCheck: (taskId: string, notes?: string) => { success: boolean; message: string };
  failQualityCheck: (taskId: string, reason: string) => { success: boolean; message: string };
  returnTaskForRevisionByEditor: (taskId: string, reason: string) => { success: boolean; message: string };
  recordDelivery: (taskId: string, customDeliveryData?: Partial<Delivery>) => { success: boolean; deliveryId: string; message: string };
  acceptDelivery: (readingId: string, rating?: number, feedback?: string) => { success: boolean; message: string };
  requestRevisionByLearner: (readingId: string, reason: string) => { success: boolean; message: string };

  resetToDefaultData: () => void;

  // Guided Demo Flow
  guidedDemoStep: number;
  setGuidedDemoStep: (step: number) => void;
  isGuidedDemoOpen: boolean;
  setIsGuidedDemoOpen: (open: boolean) => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  performAutoStepAction: (stepNumber: number) => void;

  // Toast / System message
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  clearToast: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Failed reading storage key "${key}". Reverting to fallback.`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving to localStorage key "${key}":`, err);
  }
}

/**
 * Loads and structurally validates simulation state from localStorage.
 * If data is absent, corrupt, or fails structural integrity checks,
 * it returns a fresh, verified baseline seed state.
 */
function loadValidatedSimulationState(): SimulationState {
  try {
    const rawReadings = getFromStorage<Reading[] | null>(STORAGE_KEYS.READINGS, null);
    const rawRequests = getFromStorage<FormatRequest[] | null>(STORAGE_KEYS.REQUESTS, null);
    const rawTasks = getFromStorage<ConversionTask[] | null>(STORAGE_KEYS.TASKS, null);
    const rawDeliveries = getFromStorage<Delivery[] | null>(STORAGE_KEYS.DELIVERIES, null);
    const rawReviews = getFromStorage<AcceptanceReview[] | null>(STORAGE_KEYS.REVIEWS, null);
    const rawEvents = getFromStorage<ActivityEvent[] | null>(STORAGE_KEYS.EVENTS, null);

    // If any core collection is missing from localStorage, use baseline seed data
    if (!rawReadings || !rawRequests || !rawTasks || !rawDeliveries || !rawReviews) {
      return getInitialSimulationState();
    }

    const validation = validateStructuralState({
      readings: rawReadings,
      requests: rawRequests,
      tasks: rawTasks,
      deliveries: rawDeliveries,
      reviews: rawReviews,
    });

    if (!validation.isValid) {
      console.warn('Persisted simulation state failed structural validation:', validation.error);
      console.warn('Recovering safely to baseline seed data.');
      return getInitialSimulationState();
    }

    return {
      readings: rawReadings,
      requests: rawRequests,
      tasks: rawTasks,
      deliveries: rawDeliveries,
      reviews: rawReviews,
      events: Array.isArray(rawEvents) ? rawEvents : INITIAL_EVENTS,
    };
  } catch (err) {
    console.warn('Storage read exception. Recovering safely to baseline seed data.', err);
    return getInitialSimulationState();
  }
}

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Validate schema version; clear outdated keys if schema changed
  useEffect(() => {
    try {
      const storedVersion = localStorage.getItem(STORAGE_KEYS.SCHEMA_VER);
      if (storedVersion !== STORAGE_SCHEMA_VERSION) {
        localStorage.setItem(STORAGE_KEYS.SCHEMA_VER, STORAGE_SCHEMA_VERSION);
      }
    } catch (_) {}
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const u = getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, DEMO_USERS.LEARNER);
    return u && typeof u === 'object' && 'role' in u ? u : DEMO_USERS.LEARNER;
  });

  const [state, setState] = useState<SimulationState>(loadValidatedSimulationState);

  const [guidedDemoStep, setGuidedDemoStepState] = useState<number>(() => {
    const s = getFromStorage<number>(STORAGE_KEYS.GUIDED_STEP, 1);
    return typeof s === 'number' && s >= 1 && s <= 10 ? s : 1;
  });

  const [isGuidedDemoOpen, setIsGuidedDemoOpenState] = useState<boolean>(() => {
    const o = getFromStorage<boolean>(STORAGE_KEYS.GUIDED_OPEN, true);
    return typeof o === 'boolean' ? o : true;
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const clearToast = () => setToastMessage(null);

  // Sync state changes safely to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.READINGS, state.readings);
  }, [state.readings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REQUESTS, state.requests);
  }, [state.requests]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASKS, state.tasks);
  }, [state.tasks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DELIVERIES, state.deliveries);
  }, [state.deliveries]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REVIEWS, state.reviews);
  }, [state.reviews]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EVENTS, state.events);
  }, [state.events]);

  const setGuidedDemoStep = (step: number) => {
    const validStep = Math.max(1, Math.min(10, step));
    setGuidedDemoStepState(validStep);
    saveToStorage(STORAGE_KEYS.GUIDED_STEP, validStep);
  };

  const setIsGuidedDemoOpen = (open: boolean) => {
    setIsGuidedDemoOpenState(open);
    saveToStorage(STORAGE_KEYS.GUIDED_OPEN, open);
  };

  const nextDemoStep = () => {
    setGuidedDemoStep(guidedDemoStep + 1);
  };

  const prevDemoStep = () => {
    setGuidedDemoStep(guidedDemoStep - 1);
  };

  const loginAs = (role: UserRole) => {
    const user = DEMO_USERS[role];
    setCurrentUser(user);
    showToast(`Logged in as ${user.name} (${role === 'LEARNER' ? 'Learner' : 'Accessibility Editor'})`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Logged out of demo session.', 'info');
  };

  const switchRole = (role: UserRole) => {
    const user = DEMO_USERS[role];
    setCurrentUser(user);
    showToast(`Persona switched to ${user.name} (${role === 'LEARNER' ? 'Learner' : 'Accessibility Editor'})`, 'info');
  };

  // Helper to record activity events ONLY on successful operations
  const createEvent = (
    eventType: ActivityEvent['eventType'],
    title: string,
    description: string,
    actor: string,
    readingTitle: string,
    readingId: string,
    producerService: string,
    consumerServices: string[],
    payload: Record<string, unknown>
  ): ActivityEvent => {
    const now = new Date().toISOString();
    const eventId = generateUniqueId('EVT');
    const kafkaId = generateUniqueId('KFK-EVT');

    return {
      id: eventId,
      timestamp: now,
      eventType,
      title,
      description,
      actor,
      readingTitle,
      readingId,
      kafkaMessage: {
        eventId: kafkaId,
        eventType,
        topic: 'soa.s09.t17.events',
        aggregateId: readingId,
        timestamp: now,
        producerService,
        consumerServices,
        payload,
      },
    };
  };

  // Critical Completion Metrics calculation
  const {
    totalRequiredReadings,
    acceptedReadingsCount,
    deliveredAwaitingAcceptanceCount,
    inProgressOrRequestedCount,
    notRequestedCount,
    isOverallComplete,
    completionPercentage,
    completionSummaryText,
  } = useMemo(() => calculateCompletionMetrics(state.readings), [state.readings]);

  // Submit format request with state machine & duplicate prevention
  const submitFormatRequest = (params: {
    readingId: string;
    format: AccessibleFormatType;
    additionalRequirements: string[];
    notes?: string;
    urgency: UrgencyLevel;
  }) => {
    const learner = currentUser?.role === 'LEARNER' ? currentUser : DEMO_USERS.LEARNER;
    const result = submitFormatRequestAction(state, { ...params, learner });

    if (!result.success || !result.state || !result.data) {
      showToast(result.message, 'error');
      return { success: false, requestId: '', taskId: '', message: result.message };
    }

    const { requestId, taskId } = result.data;
    const targetReading = state.readings.find((r) => r.id === params.readingId);
    const readingTitle = targetReading?.title || params.readingId;

    const newEvent = createEvent(
      'REQUEST_SUBMITTED',
      `Accessibility Request Submitted: ${readingTitle}`,
      `Learner ${learner.name} submitted request ${requestId} for format ${params.format} (${params.urgency} urgency).`,
      `${learner.name} (Learner)`,
      readingTitle,
      params.readingId,
      'Format Need Service',
      ['Conversion Service', 'Reading List Service'],
      {
        requestId,
        taskId,
        readingId: params.readingId,
        format: params.format,
        urgency: params.urgency,
      }
    );

    setState({
      ...result.state,
      events: [newEvent, ...result.state.events],
    });

    showToast(`Request ${requestId} submitted successfully! Added to Conversion Service queue.`, 'success');
    return { success: true, requestId, taskId, message: result.message };
  };

  // State Machine: ASSIGN TASK
  const assignTask = (taskId: string, editorId?: string, editorName?: string) => {
    const editor = editorName || (currentUser?.role === 'EDITOR' ? currentUser.name : DEMO_USERS.EDITOR.name);
    const id = editorId || (currentUser?.role === 'EDITOR' ? currentUser.id : DEMO_USERS.EDITOR.id);

    const result = assignTaskAction(state, { taskId, editorId: id, editorName: editor });
    if (!result.success || !result.state) {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }

    const task = state.tasks.find((t) => t.id === taskId);
    const readingTitle = task?.readingTitle || taskId;
    const readingId = task?.readingId || '';

    const newEvent = createEvent(
      'TASK_ASSIGNED',
      `Conversion Task Assigned: ${readingTitle}`,
      `Editor ${editor} took ownership of task ${taskId}.`,
      `${editor} (Editor)`,
      readingTitle,
      readingId,
      'Conversion Service',
      ['Reading List Service'],
      { taskId, assignedEditor: editor, status: 'ASSIGNED' }
    );

    setState({
      ...result.state,
      events: [newEvent, ...result.state.events],
    });

    showToast(`Task ${taskId} assigned to ${editor}. Ready to start conversion.`, 'success');
    return { success: true, message: result.message };
  };

  // State Machine: START CONVERSION
  const startConversion = (taskId: string) => {
    const actor = currentUser?.name || DEMO_USERS.EDITOR.name;
    const result = startConversionAction(state, { taskId, actorName: actor });
    if (!result.success || !result.state) {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }

    const task = state.tasks.find((t) => t.id === taskId);
    const readingTitle = task?.readingTitle || taskId;
    const readingId = task?.readingId || '';

    const newEvent = createEvent(
      'CONVERSION_STARTED',
      `Conversion Started: ${readingTitle}`,
      `Media conversion initiated for format ${task?.requestedFormat || 'accessible'}.`,
      `${actor} (Editor)`,
      readingTitle,
      readingId,
      'Conversion Service',
      ['Reading List Service', 'Notification Service'],
      { taskId, status: 'IN_CONVERSION' }
    );

    setState({
      ...result.state,
      events: [newEvent, ...result.state.events],
    });

    showToast(`Conversion started for task ${taskId}. Progress updated to 50%.`, 'success');
    return { success: true, message: result.message };
  };

  // State Machine: SUBMIT FOR QUALITY CHECK
  const submitForQualityCheck = (taskId: string, notes?: string) => {
    const actor = currentUser?.name || DEMO_USERS.EDITOR.name;
    const result = submitForQualityCheckAction(state, { taskId, notes, actorName: actor });
    if (!result.success || !result.state) {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }

    const task = state.tasks.find((t) => t.id === taskId);
    const readingTitle = task?.readingTitle || taskId;
    const readingId = task?.readingId || '';

    const newEvent = createEvent(
      'QUALITY_CHECK_SUBMITTED',
      `Submitted for QC: ${readingTitle}`,
      `Document submitted for accessibility compliance verification (${notes || 'Standard QA'}).`,
      `${actor} (Editor)`,
      readingTitle,
      readingId,
      'Conversion Service',
      ['Quality Check Subsystem'],
      { taskId, status: 'QUALITY_CHECK' }
    );

    setState({
      ...result.state,
      events: [newEvent, ...result.state.events],
    });

    showToast(`Task ${taskId} submitted for Quality Check. Verification underway.`, 'info');
    return { success: true, message: result.message };
  };

  // State Machine: PASS QUALITY CHECK
  const passQualityCheck = (taskId: string, notes?: string) => {
    const actor = currentUser?.name || DEMO_USERS.EDITOR.name;
    const result = passQualityCheckAction(state, { taskId, notes, actorName: actor });
    if (!result.success || !result.state) {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }

    const task = state.tasks.find((t) => t.id === taskId);
    const readingTitle = task?.readingTitle || taskId;
    const readingId = task?.readingId || '';

    const newEvent = createEvent(
      'QUALITY_CHECK_PASSED',
      `Quality Check Passed: ${readingTitle}`,
      `Accessibility audit successful: ${notes || 'Verified criteria satisfied.'}`,
      `${actor} (Editor QA)`,
      readingTitle,
      readingId,
      'Conversion Service',
      ['Reading List Service'],
      { taskId, result: 'PASSED' }
    );

    setState({
      ...result.state,
      events: [newEvent, ...result.state.events],
    });

    showToast(`Task ${taskId} passed Quality Check! Ready for format delivery.`, 'success');
    return { success: true, message: result.message };
  };

  // State Machine: FAIL QUALITY CHECK
  const failQualityCheck = (taskId: string, reason: string) => {
    const actor = currentUser?.name || DEMO_USERS.EDITOR.name;
    const result = failQualityCheckAction(state, { taskId, reason, actorName: actor });
    if (!result.success || !result.state) {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }

    const task = state.tasks.find((t) => t.id === taskId);
    const readingTitle = task?.readingTitle || taskId;
    const readingId = task?.readingId || '';

    const newEvent = createEvent(
      'QUALITY_CHECK_FAILED',
      `Quality Check Failed: ${readingTitle}`,
      `QC audit failed: ${reason}`,
      `${actor} (Editor QA)`,
      readingTitle,
      readingId,
      'Conversion Service',
      ['Conversion Service'],
      { taskId, reason }
    );

    setState({
      ...result.state,
      events: [newEvent, ...result.state.events],
    });

    showToast(`Task ${taskId} failed Quality Check and returned to IN_CONVERSION. Delivery is blocked.`, 'error');
    return { success: true, message: result.message };
  };

  // Editor returns task for revision
  const returnTaskForRevisionByEditor = (taskId: string, reason: string) => {
    const actor = currentUser?.name || DEMO_USERS.EDITOR.name;
    const result = returnTaskForRevisionByEditorAction(state, { taskId, reason, actorName: actor });
    if (!result.success || !result.state) {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }

    const task = state.tasks.find((t) => t.id === taskId);
    const readingTitle = task?.readingTitle || taskId;
    const readingId = task?.readingId || '';

    const newEvent = createEvent(
      'REVISION_REQUESTED',
      `Internal QC Revision: ${readingTitle}`,
      `QC audit returned task for revision: ${reason}`,
      `${actor} (Editor QA)`,
      readingTitle,
      readingId,
      'Conversion Service',
      ['Conversion Service'],
      { taskId, reason }
    );

    setState({
      ...result.state,
      events: [newEvent, ...result.state.events],
    });

    showToast(`Task ${taskId} returned to IN_CONVERSION for fixes.`, 'info');
    return { success: true, message: result.message };
  };

  // State Machine: RECORD DELIVERY (STRICT GUARDS & CONSISTENCY)
  const recordDelivery = (taskId: string, customDeliveryData?: Partial<Delivery>) => {
    const actor = currentUser?.name || DEMO_USERS.EDITOR.name;
    const result = recordDeliveryAction(state, { taskId, customDeliveryData, actorName: actor });
    if (!result.success || !result.state || !result.data) {
      showToast(result.message, 'error');
      return { success: false, deliveryId: '', message: result.message };
    }

    const { deliveryId, delivery } = result.data;
    const task = state.tasks.find((t) => t.id === taskId)!;

    const newEvent = createEvent(
      'FORMAT_DELIVERED',
      `Format Delivered: ${task.readingTitle}`,
      `Editor ${actor} delivered ${task.requestedFormat} format (${delivery.fileName}). Awaiting learner acceptance.`,
      `${actor} (Editor)`,
      task.readingTitle,
      task.readingId,
      'Conversion Service',
      ['Reading List Service', 'Acceptance Service', 'Notification Service'],
      {
        eventName: 'AccessibleFormatDelivered',
        readingId: task.readingId,
        requestId: task.requestId,
        taskId: task.id,
        deliveryId,
        deliveredFormat: task.requestedFormat,
        fileName: delivery.fileName,
        deliveryStatus: 'DELIVERED',
        acceptanceStatus: 'AWAITING_ACCEPTANCE',
      }
    );

    setState({
      ...result.state,
      events: [newEvent, ...result.state.events],
    });

    showToast('Format delivered! Simulated event AccessibleFormatDelivered published to Kafka topic soa.s09.t17.events', 'success');
    return { success: true, deliveryId, message: result.message };
  };

  // Learner: ACCEPT DELIVERY (STRICT VALIDATION)
  const acceptDelivery = (readingId: string, rating = 5, feedback?: string) => {
    const learner = currentUser?.role === 'LEARNER' ? currentUser : DEMO_USERS.LEARNER;
    const result = acceptDeliveryAction(state, { readingId, rating, feedback, learner });
    if (!result.success || !result.state || !result.data) {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }

    const reading = state.readings.find((r) => r.id === readingId)!;
    const newEvent = createEvent(
      'FORMAT_ACCEPTED',
      `Format Accepted: ${reading.title}`,
      `Learner ${learner.name} explicitly accepted the converted format (${rating}/5 stars).`,
      `${learner.name} (Learner)`,
      reading.title,
      reading.id,
      'Acceptance Service',
      ['Reading List Service', 'Conversion Service', 'Analytics Service'],
      {
        eventName: 'AccessibleFormatAccepted',
        readingId: reading.id,
        deliveryId: reading.currentDeliveryId,
        reviewId: result.data.reviewId,
        rating,
        status: 'ACCEPTED',
      }
    );

    setState({
      ...result.state,
      events: [newEvent, ...result.state.events],
    });

    showToast(`Format accepted for "${reading.title}". Acceptance recorded.`, 'success');
    return { success: true, message: result.message };
  };

  // Learner: REQUEST REVISION (STRICT: PERMITTED ONLY FOR AWAITING ACCEPTANCE)
  const requestRevisionByLearner = (readingId: string, reason: string) => {
    const learner = currentUser?.role === 'LEARNER' ? currentUser : DEMO_USERS.LEARNER;
    const result = requestRevisionByLearnerAction(state, { readingId, reason, learner });
    if (!result.success || !result.state || !result.data) {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }

    const reading = state.readings.find((r) => r.id === readingId)!;
    const trimmedReason = reason.trim();

    const newEvent = createEvent(
      'REVISION_REQUESTED',
      `Revision Requested: ${reading.title}`,
      `Learner ${learner.name} rejected delivery and requested revision: "${trimmedReason}"`,
      `${learner.name} (Learner)`,
      reading.title,
      reading.id,
      'Acceptance Service',
      ['Conversion Service', 'Notification Service'],
      {
        eventName: 'AccessibleFormatRevisionRequested',
        readingId: reading.id,
        reason: trimmedReason,
        status: 'REVISION_REQUESTED',
      }
    );

    setState({
      ...result.state,
      events: [newEvent, ...result.state.events],
    });

    showToast('Revision request logged. Task returned to editor queue.', 'info');
    return { success: true, message: result.message };
  };

  // Reset all state to clean initial seed data
  const resetToDefaultData = () => {
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (_) {}
    });

    const freshState = getInitialSimulationState();
    setState(freshState);
    setGuidedDemoStepState(1);
    setIsGuidedDemoOpenState(true);
    setCurrentUser(DEMO_USERS.LEARNER);

    showToast('Simulation state successfully reset to initial seed data.', 'success');
  };

  // Auto-action helper for quick 1-click evaluation
  const performAutoStepAction = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        loginAs('LEARNER');
        nextDemoStep();
        break;
      case 2:
        nextDemoStep();
        break;
      case 3: {
        const targetReading = state.readings.find((r) => r.id === 'RDG-105');
        if (targetReading && targetReading.status === 'NOT_REQUESTED') {
          submitFormatRequest({
            readingId: 'RDG-105',
            format: 'LARGE_PRINT',
            additionalRequirements: ['High contrast 32pt typography', 'Simplified vector graphs'],
            notes: 'Required for visual accessibility in midterm revision.',
            urgency: 'HIGH',
          });
        }
        nextDemoStep();
        break;
      }
      case 4:
        switchRole('EDITOR');
        nextDemoStep();
        break;
      case 5: {
        const task = state.tasks.find((t) => t.readingId === 'RDG-105');
        if (task && (task.status === 'REQUESTED' || task.status === 'REVISION_REQUESTED')) {
          assignTask(task.id);
        }
        nextDemoStep();
        break;
      }
      case 6: {
        const task = state.tasks.find((t) => t.readingId === 'RDG-105');
        if (task) {
          if (task.status === 'ASSIGNED') {
            startConversion(task.id);
          }
          submitForQualityCheck(task.id, 'WCAG 2.1 AA text scaling verified.');
        }
        nextDemoStep();
        break;
      }
      case 7: {
        const task = state.tasks.find((t) => t.readingId === 'RDG-105');
        if (task) {
          passQualityCheck(task.id);
          recordDelivery(task.id);
        }
        nextDemoStep();
        break;
      }
      case 8:
        switchRole('LEARNER');
        nextDemoStep();
        break;
      case 9: {
        const r104 = state.readings.find((r) => r.id === 'RDG-104');
        if (r104 && r104.deliveryStatus === 'DELIVERED' && r104.acceptanceStatus !== 'ACCEPTED') {
          acceptDelivery('RDG-104', 5, 'Verified formulas and EPUB reflowable typography.');
        }
        const r105 = state.readings.find((r) => r.id === 'RDG-105');
        if (r105 && r105.deliveryStatus === 'DELIVERED' && r105.acceptanceStatus !== 'ACCEPTED') {
          acceptDelivery('RDG-105', 5, 'Excellent large print conversion and high contrast layout.');
        }
        nextDemoStep();
        break;
      }
      case 10:
        showToast('All 5 readings are now delivered and accepted! Workflow is COMPLETE!', 'success');
        break;
    }
  };

  return (
    <SimulationContext.Provider
      value={{
        currentUser,
        loginAs,
        logout,
        switchRole,
        readings: state.readings,
        requests: state.requests,
        tasks: state.tasks,
        deliveries: state.deliveries,
        reviews: state.reviews,
        events: state.events,

        totalRequiredReadings,
        acceptedReadingsCount,
        deliveredAwaitingAcceptanceCount,
        inProgressOrRequestedCount,
        notRequestedCount,
        isOverallComplete,
        completionPercentage,
        completionSummaryText,

        submitFormatRequest,
        assignTask,
        startConversion,
        submitForQualityCheck,
        passQualityCheck,
        failQualityCheck,
        returnTaskForRevisionByEditor,
        recordDelivery,
        acceptDelivery,
        requestRevisionByLearner,

        resetToDefaultData,

        guidedDemoStep,
        setGuidedDemoStep,
        isGuidedDemoOpen,
        setIsGuidedDemoOpen,
        nextDemoStep,
        prevDemoStep,
        performAutoStepAction,

        toastMessage,
        showToast,
        clearToast,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
