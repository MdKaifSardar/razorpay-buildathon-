import { AuditEvent, AuditEventType } from '../models/audit.model';

// In-Memory store for transaction audit logs
const AUDIT_EVENTS: AuditEvent[] = [];

/**
 * Record an audit event in the transaction timeline
 */
export function logAuditEvent(
  referenceId: string,
  eventType: AuditEventType,
  title: string,
  description: string,
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO' = 'INFO',
  metadata?: Record<string, unknown>
): AuditEvent {
  const event: AuditEvent = {
    id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
    referenceId,
    eventType,
    title,
    description,
    timestamp: new Date().toISOString(),
    status,
    metadata,
  };

  AUDIT_EVENTS.push(event);
  return event;
}

/**
 * Retrieve audit trail for a specific reference ID
 */
export function getAuditEvents(referenceId: string): AuditEvent[] {
  return AUDIT_EVENTS.filter((e) => e.referenceId === referenceId).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Get all logged audit events
 */
export function getAllAuditEvents(): AuditEvent[] {
  return [...AUDIT_EVENTS].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}
