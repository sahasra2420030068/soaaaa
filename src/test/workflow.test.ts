import { describe, it, expect, beforeEach } from 'vitest';
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
  recordDeliveryAction,
  acceptDeliveryAction,
  requestRevisionByLearnerAction,
  calculateCompletionMetrics,
  getInitialSimulationState,
  VALID_FORMATS,
  VALID_READING_STATUSES,
  VALID_DELIVERY_STATUSES,
  VALID_ACCEPTANCE_STATUSES,
  VALID_TASK_STATUSES,
  VALID_QC_STATUSES,
} from '../context/workflowEngine';
import { STORAGE_KEYS, STORAGE_SCHEMA_VERSION } from '../context/SimulationContext';
import { DEMO_USERS, INITIAL_READINGS, INITIAL_TASKS } from '../data/seedData';
import { Reading, ConversionTask, Delivery, FormatRequest } from '../types';

describe('SOA-S09-T17 Group 17: Accessible Learning Format Request Workflow Engine', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = getInitialSimulationState();
    if (typeof globalThis.localStorage === 'undefined') {
      const store: Record<string, string> = {};
      globalThis.localStorage = {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = String(v);
        },
        removeItem: (k: string) => {
          delete store[k];
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k]);
        },
        key: (i: number) => Object.keys(store)[i] ?? null,
        length: 0,
      } as Storage;
    } else {
      globalThis.localStorage.clear();
    }
  });

  describe('1. Collision-Proof Unique ID Generation', () => {
    it('generates IDs with expected prefixes', () => {
      expect(generateUniqueId('REQ').startsWith('REQ-')).toBe(true);
      expect(generateUniqueId('TSK').startsWith('TSK-')).toBe(true);
      expect(generateUniqueId('DEL').startsWith('DEL-')).toBe(true);
      expect(generateUniqueId('REV').startsWith('REV-')).toBe(true);
      expect(generateUniqueId('EVT').startsWith('EVT-')).toBe(true);
    });

    it('generates 1,000 distinct IDs without a single collision', () => {
      const ids = new Set<string>();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const id = generateUniqueId('SOA');
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
      expect(ids.size).toBe(count);
    });
  });

  describe('2. State Machine Transitions & Strict QA Gates', () => {
    it('rejects recording delivery directly from IN_CONVERSION state', () => {
      // Find or create task in IN_CONVERSION
      const inConvTask: ConversionTask = {
        id: 'TSK-TEST-CONV',
        requestId: 'REQ-TEST-CONV',
        readingId: 'RDG-105',
        readingTitle: 'Test Reading',
        learnerId: 'USR-LN-01',
        learnerName: 'Maya Lin',
        requestedFormat: 'LARGE_PRINT',
        priority: 'HIGH',
        status: 'IN_CONVERSION',
        progressPercent: 50,
        qualityCheckStatus: 'NOT_STARTED',
        lastUpdated: new Date().toISOString(),
        history: [],
      };
      const testState: SimulationState = {
        ...state,
        tasks: [inConvTask, ...state.tasks],
      };

      const result = recordDeliveryAction(testState, { taskId: 'TSK-TEST-CONV' });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot record delivery from status "IN_CONVERSION"');
    });

    it('rejects recording delivery when task is in QUALITY_CHECK but qualityCheckStatus is PENDING', () => {
      const qcPendingTask: ConversionTask = {
        id: 'TSK-TEST-QC-PENDING',
        requestId: 'REQ-TEST-QC',
        readingId: 'RDG-105',
        readingTitle: 'Test Reading',
        learnerId: 'USR-LN-01',
        learnerName: 'Maya Lin',
        requestedFormat: 'LARGE_PRINT',
        priority: 'HIGH',
        status: 'QUALITY_CHECK',
        progressPercent: 75,
        qualityCheckStatus: 'PENDING',
        lastUpdated: new Date().toISOString(),
        history: [],
      };
      const testState: SimulationState = {
        ...state,
        tasks: [qcPendingTask, ...state.tasks],
      };

      const result = recordDeliveryAction(testState, { taskId: 'TSK-TEST-QC-PENDING' });
      expect(result.success).toBe(false);
      expect(result.message).toContain('quality check status is "PENDING"');
    });

    it('rejects recording delivery when task has FAILED quality check', () => {
      const qcFailedTask: ConversionTask = {
        id: 'TSK-TEST-QC-FAILED',
        requestId: 'REQ-TEST-FAIL',
        readingId: 'RDG-105',
        readingTitle: 'Test Reading',
        learnerId: 'USR-LN-01',
        learnerName: 'Maya Lin',
        requestedFormat: 'LARGE_PRINT',
        priority: 'HIGH',
        status: 'QUALITY_CHECK',
        progressPercent: 75,
        qualityCheckStatus: 'FAILED',
        lastUpdated: new Date().toISOString(),
        history: [],
      };
      const testState: SimulationState = {
        ...state,
        tasks: [qcFailedTask, ...state.tasks],
      };

      const result = recordDeliveryAction(testState, { taskId: 'TSK-TEST-QC-FAILED' });
      expect(result.success).toBe(false);
      expect(result.message).toContain('quality check status is "FAILED"');
    });

    it('executes failQualityCheckAction and transitions task back to IN_CONVERSION with FAILED status', () => {
      const task: ConversionTask = {
        id: 'TSK-TEST-QC-REVISE',
        requestId: 'REQ-TEST-1',
        readingId: 'RDG-105',
        readingTitle: 'Test Reading',
        learnerId: 'USR-LN-01',
        learnerName: 'Maya Lin',
        requestedFormat: 'LARGE_PRINT',
        priority: 'HIGH',
        status: 'QUALITY_CHECK',
        progressPercent: 75,
        qualityCheckStatus: 'PENDING',
        lastUpdated: new Date().toISOString(),
        history: [],
      };
      const testState: SimulationState = {
        ...state,
        tasks: [task, ...state.tasks],
      };

      const result = failQualityCheckAction(testState, {
        taskId: 'TSK-TEST-QC-REVISE',
        reason: 'Contrast ratio 2.8:1 below WCAG AA 4.5:1 threshold.',
      });

      expect(result.success).toBe(true);
      const updatedTask = result.state?.tasks.find((t) => t.id === 'TSK-TEST-QC-REVISE');
      expect(updatedTask?.status).toBe('IN_CONVERSION');
      expect(updatedTask?.qualityCheckStatus).toBe('FAILED');
      expect(updatedTask?.progressPercent).toBe(40);
    });
  });

  describe('3. Hardened Delivery & Duplicate Prevention', () => {
    it('rejects duplicate delivery when task status is already DELIVERED', () => {
      const deliveredTask: ConversionTask = {
        id: 'TSK-ALREADY-DELIVERED',
        requestId: 'REQ-DEL-1',
        readingId: 'RDG-104',
        readingTitle: 'Cloud Computing Systems',
        learnerId: 'USR-LN-01',
        learnerName: 'Maya Lin',
        requestedFormat: 'EPUB',
        priority: 'HIGH',
        status: 'DELIVERED',
        progressPercent: 100,
        qualityCheckStatus: 'PASSED',
        lastUpdated: new Date().toISOString(),
        history: [],
      };
      const testState: SimulationState = {
        ...state,
        tasks: [deliveredTask, ...state.tasks],
      };

      const result = recordDeliveryAction(testState, { taskId: 'TSK-ALREADY-DELIVERED' });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Duplicate delivery rejected: Task TSK-ALREADY-DELIVERED has already been delivered');
    });

    it('rejects duplicate delivery when a delivery record already exists for the task', () => {
      // TSK-2026-104 is already linked to DEL-2026-104 in seedData
      const task104 = state.tasks.find((t) => t.id === 'TSK-2026-104')!;
      // Artificially change status to QUALITY_CHECK and PASSED to test delivery uniqueness check
      const modifiedTask = { ...task104, status: 'QUALITY_CHECK' as const, qualityCheckStatus: 'PASSED' as const };
      const testState: SimulationState = {
        ...state,
        tasks: state.tasks.map((t) => (t.id === 'TSK-2026-104' ? modifiedTask : t)),
      };

      const result = recordDeliveryAction(testState, { taskId: 'TSK-2026-104' });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Duplicate delivery rejected: A delivery record');
    });

    it('rejects delivery if target reading does not exist in state', () => {
      const orphanTask: ConversionTask = {
        id: 'TSK-ORPHAN',
        requestId: 'REQ-1',
        readingId: 'RDG-NONEXISTENT',
        readingTitle: 'Orphaned Reading',
        learnerId: 'USR-LN-01',
        learnerName: 'Maya Lin',
        requestedFormat: 'EPUB',
        priority: 'NORMAL',
        status: 'QUALITY_CHECK',
        progressPercent: 90,
        qualityCheckStatus: 'PASSED',
        lastUpdated: new Date().toISOString(),
        history: [],
      };
      const testState: SimulationState = {
        ...state,
        tasks: [orphanTask, ...state.tasks],
      };

      const result = recordDeliveryAction(testState, { taskId: 'TSK-ORPHAN' });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Consistent reading relationship missing');
    });
  });

  describe('4. Learner Acceptance & Rating Validation', () => {
    it('rejects acceptance for an undelivered reading', () => {
      // RDG-105 is NOT_REQUESTED / NOT_DELIVERED
      const result = acceptDeliveryAction(state, { readingId: 'RDG-105', rating: 5 });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot accept a format that has not been delivered');
    });

    it('rejects acceptance if reading is already accepted (duplicate acceptance prevention)', () => {
      // RDG-101 is already ACCEPTED
      const result = acceptDeliveryAction(state, { readingId: 'RDG-101', rating: 5 });
      expect(result.success).toBe(false);
      expect(result.message).toContain('is already accepted. Duplicate acceptance is prevented');
    });

    it('accepts reading RDG-104 awaiting acceptance with valid 5-star rating', () => {
      // RDG-104 is DELIVERED and AWAITING_ACCEPTANCE
      const result = acceptDeliveryAction(state, {
        readingId: 'RDG-104',
        rating: 5,
        feedback: 'MathML audio rendering is pristine.',
      });
      expect(result.success).toBe(true);
      const updatedReading = result.state?.readings.find((r) => r.id === 'RDG-104');
      expect(updatedReading?.status).toBe('ACCEPTED');
      expect(updatedReading?.acceptanceStatus).toBe('ACCEPTED');
    });

    it('validates rating strictly as integer between 1 and 5', () => {
      // Testing invalid ratings on RDG-104
      const invalidRatings = [0, 6, -2, 3.5, 4.8];
      for (const r of invalidRatings) {
        const res = acceptDeliveryAction(state, { readingId: 'RDG-104', rating: r });
        expect(res.success).toBe(false);
        expect(res.message).toContain('Rating must be an integer between 1 and 5');
      }

      // Valid ratings
      for (const r of [1, 2, 3, 4, 5]) {
        const res = acceptDeliveryAction(state, { readingId: 'RDG-104', rating: r });
        expect(res.success).toBe(true);
      }
    });
  });

  describe('5. Learner Revision Eligibility (Requirement 1)', () => {
    it('permits revision request ONLY for an existing delivery awaiting learner acceptance', () => {
      // RDG-104 is DELIVERED and AWAITING_ACCEPTANCE -> MUST SUCCEED
      const result = requestRevisionByLearnerAction(state, {
        readingId: 'RDG-104',
        reason: 'Formula tags in chapter 3 do not scale properly in 24pt view.',
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain('Revision request logged');

      const updatedReading = result.state?.readings.find((r) => r.id === 'RDG-104');
      expect(updatedReading?.status).toBe('REVISION_REQUESTED');
      expect(updatedReading?.acceptanceStatus).toBe('REVISION_REQUESTED');

      // Task must be reset to REVISION_REQUESTED and qualityCheckStatus to NOT_STARTED
      const updatedTask = result.state?.tasks.find((t) => t.id === 'TSK-2026-104');
      expect(updatedTask?.status).toBe('REVISION_REQUESTED');
      expect(updatedTask?.qualityCheckStatus).toBe('NOT_STARTED');
    });

    it('rejects revision requests for undelivered readings', () => {
      // RDG-105 is NOT_REQUESTED / NOT_DELIVERED
      const result = requestRevisionByLearnerAction(state, {
        readingId: 'RDG-105',
        reason: 'Please increase font size on all chapter headers.',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot request revision for a reading that has not been delivered');
    });

    it('rejects revision requests for already accepted readings', () => {
      // RDG-101 is already ACCEPTED
      const result = requestRevisionByLearnerAction(state, {
        readingId: 'RDG-101',
        reason: 'Need further adjustments to the high-contrast color scheme.',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot request revision for a reading that has already been accepted');
    });

    it('requires a meaningful revision reason of at least 10 characters', () => {
      const shortReasons = ['', '   ', 'Fix it', 'Bad font'];
      for (const shortReason of shortReasons) {
        const result = requestRevisionByLearnerAction(state, {
          readingId: 'RDG-104',
          reason: shortReason,
        });
        expect(result.success).toBe(false);
        expect(result.message).toContain('at least 10 characters');
      }

      const validReason = 'The headings in section 2 skip level 2 and jump to level 4.';
      const validResult = requestRevisionByLearnerAction(state, {
        readingId: 'RDG-104',
        reason: validReason,
      });
      expect(validResult.success).toBe(true);
    });
  });

  describe('6. Critical Completion Rule', () => {
    it('calculates course status as strictly INCOMPLETE unless all 5 readings are accepted', () => {
      // Initial state: 3 of 5 readings accepted (RDG-101, RDG-102, RDG-103)
      const metrics1 = calculateCompletionMetrics(state.readings);
      expect(metrics1.totalRequiredReadings).toBe(5);
      expect(metrics1.acceptedReadingsCount).toBe(3);
      expect(metrics1.isOverallComplete).toBe(false);
      expect(metrics1.completionPercentage).toBe(60);

      // Accept RDG-104: 4 of 5 accepted (RDG-105 still not requested)
      const accept104 = acceptDeliveryAction(state, { readingId: 'RDG-104', rating: 5 });
      expect(accept104.success).toBe(true);
      const metrics2 = calculateCompletionMetrics(accept104.state!.readings);
      expect(metrics2.acceptedReadingsCount).toBe(4);
      expect(metrics2.isOverallComplete).toBe(false); // MUST REMAIN FALSE
      expect(metrics2.completionPercentage).toBe(80);

      // Now deliver and accept RDG-105
      const allReadingsAccepted = accept104.state!.readings.map((r) =>
        r.id === 'RDG-105'
          ? {
              ...r,
              status: 'ACCEPTED' as const,
              deliveryStatus: 'DELIVERED' as const,
              acceptanceStatus: 'ACCEPTED' as const,
            }
          : r
      );
      const metrics3 = calculateCompletionMetrics(allReadingsAccepted);
      expect(metrics3.acceptedReadingsCount).toBe(5);
      expect(metrics3.isOverallComplete).toBe(true); // NOW TRUE
      expect(metrics3.completionPercentage).toBe(100);
    });

    it('confirms delivered package awaiting acceptance does not count as completed', () => {
      // RDG-104 is delivered awaiting acceptance; verify it is NOT in acceptedReadingsCount
      const metrics = calculateCompletionMetrics(state.readings);
      expect(metrics.deliveredAwaitingAcceptanceCount).toBe(1);
      expect(metrics.acceptedReadingsCount).toBe(3);
      expect(metrics.isOverallComplete).toBe(false);
    });
  });

  describe('7. End-to-End Integration Workflow (Request → Assign → Convert → QA → Fail QA → Remediation → Delivery → Revision → Re-delivery → Acceptance)', () => {
    it('executes full multi-step workflow including failed QA and revision recovery seamlessly', () => {
      let currentState = getInitialSimulationState();

      // Step 1: Learner Maya Lin requests Large Print for RDG-105
      const reqResult = submitFormatRequestAction(currentState, {
        readingId: 'RDG-105',
        format: 'LARGE_PRINT',
        additionalRequirements: ['High contrast 32pt typography', 'Simplified vector graphs'],
        urgency: 'HIGH',
      });
      expect(reqResult.success).toBe(true);
      currentState = reqResult.state!;
      const taskId = reqResult.data!.taskId;

      // Verify duplicate request for RDG-105 is immediately blocked
      const dupReq = submitFormatRequestAction(currentState, {
        readingId: 'RDG-105',
        format: 'EPUB',
        additionalRequirements: [],
        urgency: 'NORMAL',
      });
      expect(dupReq.success).toBe(false);
      expect(dupReq.message).toContain('already has an active request');

      // Step 2: Editor David Chen claims and assigns task
      const assignResult = assignTaskAction(currentState, { taskId });
      expect(assignResult.success).toBe(true);
      currentState = assignResult.state!;
      expect(currentState.tasks.find((t) => t.id === taskId)?.status).toBe('ASSIGNED');

      // Step 3: Editor starts conversion pipeline
      const startResult = startConversionAction(currentState, { taskId });
      expect(startResult.success).toBe(true);
      currentState = startResult.state!;
      expect(currentState.tasks.find((t) => t.id === taskId)?.status).toBe('IN_CONVERSION');

      // Step 4: Editor submits for Quality Check
      const submitQcResult = submitForQualityCheckAction(currentState, {
        taskId,
        notes: 'Initial typography rendering completed.',
      });
      expect(submitQcResult.success).toBe(true);
      currentState = submitQcResult.state!;
      expect(currentState.tasks.find((t) => t.id === taskId)?.status).toBe('QUALITY_CHECK');
      expect(currentState.tasks.find((t) => t.id === taskId)?.qualityCheckStatus).toBe('PENDING');

      // Step 5: FAILED QA SCENARIO
      // QA audit fails due to contrast defect
      const failQcResult = failQualityCheckAction(currentState, {
        taskId,
        reason: 'Mathematical formula vectors have insufficient color contrast (3.1:1).',
      });
      expect(failQcResult.success).toBe(true);
      currentState = failQcResult.state!;
      const failedTask = currentState.tasks.find((t) => t.id === taskId)!;
      expect(failedTask.status).toBe('IN_CONVERSION');
      expect(failedTask.qualityCheckStatus).toBe('FAILED');

      // Verify that delivery is strictly FORBIDDEN in this failed QA state
      const blockedDelivery = recordDeliveryAction(currentState, { taskId });
      expect(blockedDelivery.success).toBe(false);
      expect(blockedDelivery.message).toContain('Cannot record delivery from status "IN_CONVERSION"');

      // Step 6: Editor remediates defect and submits for QC again
      const reSubmitQc = submitForQualityCheckAction(currentState, {
        taskId,
        notes: 'Applied dark indigo theme with 7.2:1 contrast ratio.',
      });
      expect(reSubmitQc.success).toBe(true);
      currentState = reSubmitQc.state!;

      // QA passes
      const passQcResult = passQualityCheckAction(currentState, {
        taskId,
        notes: 'All WCAG 2.1 AA criteria satisfied.',
      });
      expect(passQcResult.success).toBe(true);
      currentState = passQcResult.state!;
      expect(currentState.tasks.find((t) => t.id === taskId)?.qualityCheckStatus).toBe('PASSED');

      // Step 7: Editor records delivery
      const delResult = recordDeliveryAction(currentState, { taskId });
      expect(delResult.success).toBe(true);
      currentState = delResult.state!;
      const rdg105 = currentState.readings.find((r) => r.id === 'RDG-105')!;
      expect(rdg105.status).toBe('DELIVERED');
      expect(rdg105.deliveryStatus).toBe('DELIVERED');
      expect(rdg105.acceptanceStatus).toBe('AWAITING_ACCEPTANCE');

      // Verify duplicate delivery attempt is immediately rejected
      const dupDelivery = recordDeliveryAction(currentState, { taskId });
      expect(dupDelivery.success).toBe(false);
      expect(dupDelivery.message).toContain('Duplicate delivery rejected');

      // Step 8: REVISION RECOVERY SCENARIO
      // Learner reviews delivered artifact and requests revision
      const revResult = requestRevisionByLearnerAction(currentState, {
        readingId: 'RDG-105',
        reason: 'Equations in section 4.2 require larger vector rendering for screen magnification.',
      });
      expect(revResult.success).toBe(true);
      currentState = revResult.state!;

      // Reading is in REVISION_REQUESTED and task qualityCheckStatus is reset to NOT_STARTED
      const rdgAfterRev = currentState.readings.find((r) => r.id === 'RDG-105')!;
      expect(rdgAfterRev.status).toBe('REVISION_REQUESTED');
      const taskAfterRev = currentState.tasks.find((t) => t.id === taskId)!;
      expect(taskAfterRev.status).toBe('REVISION_REQUESTED');
      expect(taskAfterRev.qualityCheckStatus).toBe('NOT_STARTED');

      // Attempting to deliver now MUST fail because task is in REVISION_REQUESTED and QC is NOT_STARTED
      const blockedPostRevDelivery = recordDeliveryAction(currentState, { taskId });
      expect(blockedPostRevDelivery.success).toBe(false);

      // Re-assign, re-convert, re-QC pass, and re-deliver
      const reAssign = assignTaskAction(currentState, { taskId });
      expect(reAssign.success).toBe(true);
      currentState = reAssign.state!;

      const reConvert = startConversionAction(currentState, { taskId });
      expect(reConvert.success).toBe(true);
      currentState = reConvert.state!;

      const reQCSubmit = submitForQualityCheckAction(currentState, { taskId, notes: 'Vector equations enlarged.' });
      expect(reQCSubmit.success).toBe(true);
      currentState = reQCSubmit.state!;

      const reQCPass = passQualityCheckAction(currentState, { taskId, notes: 'Vectors verified in 400% zoom.' });
      expect(reQCPass.success).toBe(true);
      currentState = reQCPass.state!;

      // Remove prior delivery for this task before re-delivery
      const testStateCleanDel: SimulationState = {
        ...currentState,
        deliveries: currentState.deliveries.filter((d) => d.taskId !== taskId),
      };
      const reDeliver = recordDeliveryAction(testStateCleanDel, { taskId });
      expect(reDeliver.success).toBe(true);
      currentState = reDeliver.state!;

      // Step 9: Learner explicitly accepts format with 5-star rating
      const acceptResult = acceptDeliveryAction(currentState, {
        readingId: 'RDG-105',
        rating: 5,
        feedback: 'Large print vectors are crisp and easy to navigate.',
      });
      expect(acceptResult.success).toBe(true);
      currentState = acceptResult.state!;
      expect(currentState.readings.find((r) => r.id === 'RDG-105')?.acceptanceStatus).toBe('ACCEPTED');

      // Accept RDG-104 to complete all 5 readings
      const accept104 = acceptDeliveryAction(currentState, {
        readingId: 'RDG-104',
        rating: 5,
        feedback: 'EPUB reflow confirmed.',
      });
      expect(accept104.success).toBe(true);
      currentState = accept104.state!;

      // Step 10: Critical Completion Rule Verification
      const finalMetrics = calculateCompletionMetrics(currentState.readings);
      expect(finalMetrics.acceptedReadingsCount).toBe(5);
      expect(finalMetrics.totalRequiredReadings).toBe(5);
      expect(finalMetrics.isOverallComplete).toBe(true); // WORKFLOW IS FULLY COMPLETE!
      expect(finalMetrics.completionPercentage).toBe(100);
    });
  });

  describe('8. Structural Storage Validation & Recovery (Requirement 4 & 9)', () => {
    it('validates a clean baseline state successfully', () => {
      const result = validateStructuralState(state);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects state where a reading has an invalid workflow status', () => {
      const corruptReadings = [
        ...state.readings.map((r) =>
          r.id === 'RDG-101' ? { ...r, status: 'INVALID_STATUS' as any } : r
        ),
      ];
      const result = validateStructuralState({ ...state, readings: corruptReadings });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid reading item schema');
    });

    it('rejects state where a task references a non-existent reading ID', () => {
      const orphanTask: ConversionTask = {
        ...state.tasks[0],
        id: 'TSK-GHOST',
        readingId: 'RDG-GHOST-999',
      };
      const result = validateStructuralState({
        ...state,
        tasks: [orphanTask, ...state.tasks],
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('references non-existent reading ID');
    });

    it('rejects state where a delivery references a non-existent task ID', () => {
      const orphanDelivery: Delivery = {
        ...state.deliveries[0],
        id: 'DEL-GHOST',
        taskId: 'TSK-GHOST-999',
      };
      const result = validateStructuralState({
        ...state,
        deliveries: [orphanDelivery, ...state.deliveries],
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('references non-existent task ID');
    });

    it('restores all initial seed data and resets state consistently on reset', () => {
      const resetState = getInitialSimulationState();
      expect(resetState.readings.length).toBe(INITIAL_READINGS.length);
      expect(resetState.tasks.length).toBe(INITIAL_TASKS.length);
      expect(resetState.readings.filter((r) => r.acceptanceStatus === 'ACCEPTED').length).toBe(3);

      const metrics = calculateCompletionMetrics(resetState.readings);
      expect(metrics.isOverallComplete).toBe(false);
      expect(metrics.completionPercentage).toBe(60);
    });
  });
});
