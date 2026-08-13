import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ArrowRight } from 'lucide-react';

export default function TicketCard({ ticketData }) {
  const [copied, setCopied] = useState(false);
  if (!ticketData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketData.ticket_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-primary animate-fadeIn max-w-2xl mx-auto my-12">

      {/* Header */}
      <div className="bg-primary text-white p-8 text-center space-y-3">
        <span className="mono-meta text-white/40 text-[10px]">Confirmation</span>
        <h3 className="text-2xl md:text-3xl font-bold tracking-display">Grievance Registered</h3>
      </div>

      {/* Body */}
      <div className="p-8 space-y-6">

        {/* Ticket ID */}
        <div className="flex items-center justify-between border-b-editorial pb-6">
          <div>
            <span className="mono-meta text-muted text-[10px] block">Ticket ID</span>
            <p className="text-2xl font-bold font-mono tracking-display mt-1">{ticketData.ticket_id}</p>
          </div>
          <button type="button" onClick={handleCopy} data-hover
            className="border border-primary/10 px-3 py-2 mono-meta text-[10px] hover:bg-primary hover:text-white hover-smooth">
            {copied ? <Check className="w-3.5 h-3.5 inline mr-1" /> : <Copy className="w-3.5 h-3.5 inline mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-primary/10">
          {[
            { label: 'Status', value: ticketData.status || 'Submitted' },
            { label: 'Priority', value: ticketData.priority },
            { label: 'Department', value: ticketData.department },
            { label: 'Est. Resolution', value: '48 Hours' },
          ].map((item, i) => (
            <div key={i} className="bg-surface p-4 space-y-1">
              <span className="mono-meta text-muted text-[10px]">{item.label}</span>
              <p className="text-xs font-bold truncate">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-t-editorial pt-5">
          <span className="mono-meta text-muted text-[10px]">AI Summary</span>
          <p className="body-text text-sm text-secondary mt-1">"{ticketData.summary}"</p>
        </div>

        {/* Action */}
        <Link to={`/track?ticket=${ticketData.ticket_id}`} data-hover
          className="w-full py-4 bg-primary text-white font-bold text-sm tracking-display hover-smooth hover:bg-primary/80 flex items-center justify-center space-x-2">
          <span>Track Grievance</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
