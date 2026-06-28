import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { TICKET_STATUS_COLORS, PRIORITY_COLORS } from '@/types/common.types';
import type { SupportTicket } from '@/types/order.types';

interface SupportCardProps {
  ticket: SupportTicket;
  isExpanded: boolean;
  ticketDetail: any;
  ticketDetailLoading: boolean;
  resolving: boolean;
  onToggle: (id: number) => void;
  onResolve: (id: number) => void;
}

export function SupportCard({
  ticket,
  isExpanded,
  ticketDetail,
  ticketDetailLoading,
  resolving,
  onToggle,
  onResolve,
}: SupportCardProps) {
  const sc = TICKET_STATUS_COLORS[ticket.ticket_status] || { bg: 'bg-gray-50', text: 'text-gray-600' };

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
      <button
        type="button"
        onClick={() => onToggle(ticket.id)}
        className="w-full text-left p-3.5"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
          <span className={cn('text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full', sc.bg, sc.text)}>
            {(ticket.ticket_status || '').replace(/_/g, ' ')}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-800">{ticket.subject}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span className="capitalize">{(ticket.ticket_type || '').replace(/_/g, ' ')}</span>
          <span>•</span>
          <span className={PRIORITY_COLORS[ticket.priority] || 'text-gray-500'}>
            {ticket.priority} priority
          </span>
          {ticket.order_id && (
            <>
              <span>•</span>
              <span>Order #{ticket.order_id}</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-gray-400">
            {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          {ticket.resolved_at && (
            <span className="text-[10px] text-green-600">
              Resolved {new Date(ticket.resolved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 space-y-3">
          {ticketDetailLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-teal-600" size={20} /></div>
          ) : ticketDetail ? (
            <>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticketDetail.description}</p>
              </div>
              {ticketDetail.attachments && ticketDetail.attachments.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">Attachments</p>
                  <div className="flex gap-2 flex-wrap">
                    {ticketDetail.attachments.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline">
                        Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {ticketDetail.resolution_notes && (
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">Resolution Notes</p>
                  <p className="text-sm text-gray-700">{ticketDetail.resolution_notes}</p>
                </div>
              )}
              {ticketDetail.ticket_status !== 'resolved' && ticketDetail.ticket_status !== 'closed' && (
                <button
                  type="button"
                  onClick={() => onResolve(ticket.id)}
                  disabled={resolving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:bg-green-400"
                >
                  {resolving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Mark as Resolved
                </button>
              )}
              {ticketDetail.ticket_status === 'resolved' && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle2 size={16} /> This ticket is resolved
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">Failed to load details</p>
          )}
        </div>
      )}
    </div>
  );
}
