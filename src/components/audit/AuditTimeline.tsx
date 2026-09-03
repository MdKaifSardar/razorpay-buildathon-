import React from 'react';
import { AuditEvent } from '@/lib/models/audit.model';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AuditTimelineProps {
  events: AuditEvent[];
}

export function AuditTimeline({ events }: AuditTimelineProps) {
  if (!events || events.length === 0) return null;

  const statusVariant = {
    SUCCESS: 'emerald' as const,
    WARNING: 'amber' as const,
    ERROR: 'rose' as const,
    INFO: 'blue' as const,
  };

  return (
    <Card className="mb-6 border-slate-800 bg-slate-900/90">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            📜 Transaction Audit Timeline
            <Badge variant="blue">{events.length} Events</Badge>
          </CardTitle>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Immutable Audit Trail</span>
      </CardHeader>

      <CardContent>
        <div className="relative border-l-2 border-slate-800 ml-3 pl-6 space-y-6 py-2">
          {events.map((event, idx) => {
            const dateStr = new Date(event.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div key={event.id || idx} className="relative group">
                {/* Status Dot */}
                <div
                  className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
                    event.status === 'SUCCESS'
                      ? 'bg-emerald-400'
                      : event.status === 'ERROR'
                      ? 'bg-rose-500'
                      : event.status === 'WARNING'
                      ? 'bg-amber-400'
                      : 'bg-blue-400'
                  }`}
                />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-white">{event.title}</span>
                      <Badge variant={statusVariant[event.status]}>{event.eventType}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>

                    {event.metadata && (
                      <div className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                        {JSON.stringify(event.metadata)}
                      </div>
                    )}
                  </div>

                  <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                    {dateStr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
