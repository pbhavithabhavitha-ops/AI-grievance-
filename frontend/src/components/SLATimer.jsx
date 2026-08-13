import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function SLATimer({ createdAt, priority = 'Medium', status = 'Submitted' }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });
  const slaTargetHours = priority === 'High' ? 24 : priority === 'Medium' ? 48 : 72;

  useEffect(() => {
    const calculateSLA = () => {
      // Ensure UTC ISO parsing if string doesn't end with Z
      const rawStr = typeof createdAt === 'string' ? createdAt : createdAt?.toISOString?.();
      const isoStr = rawStr && !rawStr.endsWith('Z') && !rawStr.includes('+') ? `${rawStr}Z` : rawStr;
      const createdDate = new Date(isoStr);
      
      const slaDeadline = new Date(createdDate.getTime() + slaTargetHours * 60 * 60 * 1000);
      const now = new Date();
      const diffMs = slaDeadline - now;

      if (status === 'Resolved') {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: false, resolved: true });
        return;
      }

      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true, resolved: false });
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, expired: false, resolved: false });
      }
    };

    calculateSLA();
    const interval = setInterval(calculateSLA, 1000);
    return () => clearInterval(interval);
  }, [createdAt, priority, status, slaTargetHours]);

  if (status === 'Resolved') {
    return (
      <div className="border border-primary/20 bg-surface p-4 flex items-center justify-between text-xs font-mono">
        <span className="mono-meta text-muted">SLA Compliance:</span>
        <span className="font-bold text-primary">✓ RESOLVED WITHIN SLA TARGET ({slaTargetHours}h)</span>
      </div>
    );
  }

  if (timeLeft.expired) {
    return (
      <div className="border-2 border-primary bg-primary text-white p-4 space-y-2 animate-fadeIn">
        <div className="flex items-center justify-between">
          <span className="mono-meta text-xs tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-white animate-pulse inline mr-1" />
            <span>SLA TARGET BREACHED</span>
          </span>
          <span className="mono-meta text-[10px] bg-white text-primary font-bold px-2 py-0.5 uppercase">
            ESCALATED TO MUNICIPAL COMMISSIONER
          </span>
        </div>
        <p className="text-xs body-text leading-relaxed text-white/90">
          This grievance exceeded the mandatory {slaTargetHours}-hour SLA threshold. It has been automatically escalated to the <strong>Zonal Municipal Commissioner</strong> for immediate intervention.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-primary/20 p-4 space-y-2 bg-surface">
      <div className="flex items-center justify-between text-xs">
        <span className="mono-meta text-muted flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 inline mr-1" />
          <span>Resolution SLA Timer ({priority} Priority — {slaTargetHours}h Target)</span>
        </span>
        <span className="mono-meta font-bold text-primary font-mono text-sm">
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')} Remaining
        </span>
      </div>

      <div className="w-full bg-primary/10 h-1 overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-1000"
          style={{ width: `${Math.min(100, (timeLeft.hours / slaTargetHours) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function SLABadge({ createdAt, priority = 'Medium', status = 'Submitted' }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });
  const slaTargetHours = priority === 'High' ? 24 : priority === 'Medium' ? 48 : 72;

  useEffect(() => {
    const calculateSLA = () => {
      const rawStr = typeof createdAt === 'string' ? createdAt : createdAt?.toISOString?.();
      const isoStr = rawStr && !rawStr.endsWith('Z') && !rawStr.includes('+') ? `${rawStr}Z` : rawStr;
      const createdDate = new Date(isoStr);
      
      const slaDeadline = new Date(createdDate.getTime() + slaTargetHours * 60 * 60 * 1000);
      const now = new Date();
      const diffMs = slaDeadline - now;

      if (status === 'Resolved') {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: false, resolved: true });
        return;
      }

      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true, resolved: false });
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, expired: false, resolved: false });
      }
    };

    calculateSLA();
    const interval = setInterval(calculateSLA, 1000);
    return () => clearInterval(interval);
  }, [createdAt, priority, status, slaTargetHours]);

  if (status === 'Resolved') {
    return <span className="mono-meta text-[10px] text-muted">✓ Resolved</span>;
  }

  if (timeLeft.expired) {
    return (
      <span className="mono-meta text-[9px] bg-primary text-white px-2 py-0.5 font-bold animate-pulse">
        ⚠️ SLA BREACHED
      </span>
    );
  }

  return (
    <span className="mono-meta text-[10px] font-mono font-bold text-primary whitespace-nowrap">
      ⏳ {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')} Left
    </span>
  );
}

// Helper to format ISO timestamp in Indian Standard Time (IST)
export function formatLocalTimestamp(dateStr) {
  if (!dateStr) return '—';
  const rawStr = typeof dateStr === 'string' ? dateStr : dateStr?.toISOString?.();
  const isoStr = rawStr && !rawStr.endsWith('Z') && !rawStr.includes('+') ? `${rawStr}Z` : rawStr;
  const d = new Date(isoStr);
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
