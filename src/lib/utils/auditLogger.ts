import { AuditEvent, AuditEventType } from '../models/audit.model';
import { supabase } from './supabase';

// In-Memory store for transaction audit logs
const AUDIT_EVENTS: AuditEvent[] = [];

/**
 * Record an audit event in the transaction timeline and persist to Supabase DB
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

  // Persist to Supabase hosted DB asynchronously if client is connected
  if (supabase) {
    supabase
      .from('audit_events')
      .insert({
        reference_id: referenceId,
        event_type: eventType,
        title,
        description,
        level: status,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .then(({ error }) => {
        if (error) console.warn('Failed to insert audit event into Supabase:', error.message);
      });
  }

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
