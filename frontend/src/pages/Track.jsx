import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Star, Check } from 'lucide-react';
import { getGrievanceByTicket, submitFeedback } from '../services/api';
import SLATimer, { formatLocalTimestamp } from '../components/SLATimer';

export default function Track() {
  const [searchParams] = useSearchParams();
  const initialTicket = searchParams.get('ticket') || '';
  const [ticketIdInput, setTicketIdInput] = useState(initialTicket);
  const [ticketData, setTicketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Rating & Feedback State
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const fetchGrievance = async (id) => {
    if (!id?.trim()) return;
    setIsLoading(true); setErrorMsg(''); setTicketData(null); setFeedbackSubmitted(false);
    try {
      const data = await getGrievanceByTicket(id.trim());
      setTicketData(data);
      if (data.rating) {
        setUserRating(data.rating);
        setFeedbackComment(data.feedback_comment || '');
        setFeedbackSubmitted(true);
      } else {
        setUserRating(0);
        setFeedbackComment('');
      }
    } catch {
      setErrorMsg(`No active ticket found for "${id}". Please verify ticket ID.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (initialTicket) fetchGrievance(initialTicket); }, [initialTicket]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!userRating) {
      alert("Please select a star rating between 1 and 5.");
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      const updated = await submitFeedback(ticketData.ticket_id, userRating, feedbackComment);
      setTicketData(updated);
      setFeedbackSubmitted(true);
    } catch (err) {
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const steps = [
    { key: 'Submitted', title: 'Submitted', desc: 'Logged in JanSeva AI' },
    { key: 'Assigned', title: 'AI Classified & Assigned', desc: 'Routed to department' },
    { key: 'Under Investigation', title: 'Under Investigation', desc: 'Field officer inspection' },
    { key: 'Resolved', title: 'Resolved', desc: 'Completed & verified' },
  ];

  const getStepState = (stepKey) => {
    if (!ticketData) return 'pending';
    const order = ['Submitted', 'Assigned', 'Under Investigation', 'Resolved'];
    const ci = order.indexOf(ticketData.status);
    const si = order.indexOf(stepKey);
    if (si < ci) return 'completed';
    if (si === ci) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 pt-12 pb-24 space-y-16">

      {/* Header */}
      <div>
        <span className="mono-meta text-muted block mb-3">Track & Feedback</span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-display">
          <span className="reveal-wrap"><span className="reveal-inner">Grievance</span></span><br />
          <span className="reveal-wrap"><span className="reveal-inner d3">Status</span></span>
        </h1>
        <p className="body-text text-secondary text-sm mt-4">
          Enter your ticket ID to view real-time department updates and resolution SLA timers.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); fetchGrievance(ticketIdInput); }} className="flex border border-primary/10 focus-within:border-primary hover-smooth">
        <input type="text" value={ticketIdInput} onChange={(e) => setTicketIdInput(e.target.value)}
          placeholder="GRV-2026-00101"
          className="flex-1 px-5 py-4 font-mono text-sm uppercase bg-transparent outline-none placeholder:text-primary/20" />
        <button type="submit" disabled={isLoading} data-hover
          className="px-6 bg-primary text-white mono-meta text-[10px] hover-smooth hover:bg-primary/80 disabled:opacity-50 flex items-center space-x-2">
          <Search className="w-4 h-4" />
          <span>{isLoading ? 'Searching…' : 'Track'}</span>
        </button>
      </form>

      {/* Demo Quick Links */}
      <div className="flex flex-wrap gap-2">
        <span className="mono-meta text-muted text-[10px] self-center mr-2">Demo Tickets:</span>
        {['GRV-2026-00101', 'GRV-2026-00102', 'GRV-2026-00104'].map((t) => (
          <button key={t} type="button" data-hover
            onClick={() => { setTicketIdInput(t); fetchGrievance(t); }}
            className="font-mono text-xs border border-primary/10 px-3 py-1.5 hover:bg-primary hover:text-white hover-smooth">
            {t}
          </button>
        ))}
      </div>

      {/* Error */}
      {errorMsg && <p className="mono-meta text-xs p-4 border border-primary/10 bg-primary/[0.02]">{errorMsg}</p>}

      {/* Results */}
      {ticketData && (
        <div className="animate-fadeIn space-y-12">

          {/* Ticket Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-editorial pb-8">
            <div>
              <span className="mono-meta text-muted text-[10px]">Ticket Number</span>
              <h2 className="text-3xl md:text-4xl font-bold font-mono tracking-display mt-1">{ticketData.ticket_id}</h2>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <span className={`mono-meta text-[10px] px-3 py-1 border ${
                ticketData.priority === 'High' ? 'bg-primary text-white border-primary' : 'border-primary/20'
              }`}>{ticketData.priority} Priority</span>
              <span className="mono-meta text-[10px] px-3 py-1 bg-primary text-white">{ticketData.status}</span>
            </div>
          </div>

          {/* Feature 2: SLA Timer & Countdown */}
          <SLATimer 
            createdAt={ticketData.created_at} 
            priority={ticketData.priority} 
            status={ticketData.status} 
          />

          {/* Timeline */}
          <div>
            <span className="mono-meta text-muted text-[10px] block mb-8">Resolution Timeline</span>
            <div className="space-y-0">
              {steps.map((step, i) => {
                const state = getStepState(step.key);
                return (
                  <div key={i} className="flex items-start border-t-editorial py-5">
                    <div className="flex-shrink-0 mr-6 md:mr-12 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold hover-smooth ${
                        state === 'completed'
                          ? 'bg-primary text-white border-primary'
                          : state === 'current'
                          ? 'bg-primary text-white border-primary animate-pulse'
                          : 'bg-transparent text-primary/30 border-primary/10'
                      }`}>
                        {state === 'completed' ? '✓' : i + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-base font-bold tracking-body ${
                        state === 'pending' ? 'text-primary/20' : 'text-primary'
                      }`}>{step.title}</h4>
                      <p className={`text-xs body-text mt-0.5 ${
                        state === 'pending' ? 'text-primary/10' : 'text-secondary'
                      }`}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-primary/10">
            <div className="bg-surface p-6 space-y-5">
              <div>
                <span className="mono-meta text-muted text-[10px]">Original ({ticketData.language})</span>
                <p className="text-sm body-text mt-1">"{ticketData.original_text}"</p>
              </div>
              <div className="border-t-editorial pt-4">
                <span className="mono-meta text-muted text-[10px]">Translation</span>
                <p className="text-sm body-text text-secondary mt-1">"{ticketData.translation}"</p>
              </div>
              {ticketData.summary && (
                <div className="border-t-editorial pt-4">
                  <span className="mono-meta text-muted text-[10px]">AI Summary</span>
                  <p className="text-sm body-text text-secondary mt-1">{ticketData.summary}</p>
                </div>
              )}
            </div>
            
            <div className="bg-surface p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="mono-meta text-muted text-[10px]">Category</span>
                  <p className="text-sm font-bold mt-1">{ticketData.category}</p>
                </div>
                <div>
                  <span className="mono-meta text-muted text-[10px]">Department</span>
                  <p className="text-sm font-bold mt-1">{ticketData.department}</p>
                </div>
              </div>
              <div className="border-t-editorial pt-4">
                <span className="mono-meta text-muted text-[10px]">Location & Ward</span>
                <p className="text-sm body-text font-bold mt-1">{ticketData.ward || 'Ward 12 - Central'}</p>
                <p className="text-xs text-muted mt-0.5">{ticketData.city || 'Hyderabad'}, {ticketData.area || 'Central'}</p>
                {ticketData.landmark && <p className="text-xs text-muted mt-0.5">{ticketData.landmark}</p>}
              </div>
            </div>
          </div>

          {/* Feature 4: Citizen Rating & Feedback System */}
          <div className="border border-primary p-6 md:p-8 space-y-4 bg-surface">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-editorial pb-4 gap-2">
              <div>
                <span className="mono-meta text-muted text-[10px] block">Citizen Empowerment Loop</span>
                <h3 className="text-lg font-bold tracking-display">Rate Resolution Quality</h3>
              </div>
              {feedbackSubmitted && (
                <span className="mono-meta text-xs bg-primary text-white px-3 py-1 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 inline mr-1" />
                  <span>Feedback Recorded</span>
                </span>
              )}
            </div>

            {feedbackSubmitted ? (
              <div className="space-y-2 py-2 text-xs">
                <div className="flex items-center space-x-1">
                  <span className="mono-meta text-muted mr-2">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= (ticketData.rating || userRating) ? 'fill-primary text-primary' : 'text-primary/20'}`}
                    />
                  ))}
                  <span className="font-bold mono-meta ml-2">({ticketData.rating || userRating}/5 Stars)</span>
                </div>
                {ticketData.feedback_comment && (
                  <p className="body-text text-secondary bg-primary/5 p-3 border border-primary/10 mt-2">
                    "{ticketData.feedback_comment}"
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <span className="mono-meta text-muted text-[10px] block mb-2">Select Rating (1 to 5 Stars)</span>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        data-hover
                        className="p-1 hover-smooth focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || userRating)
                              ? 'fill-primary text-primary'
                              : 'text-primary/20'
                          }`}
                        />
                      </button>
                    ))}
                    {userRating > 0 && (
                      <span className="mono-meta text-xs font-bold text-primary ml-3">{userRating} / 5 Stars</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mono-meta text-muted text-[10px] block mb-1">Citizen Feedback Comment</label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Share comments on department response time and repair quality..."
                    className="w-full p-3 border border-primary/10 text-xs bg-transparent outline-none focus:border-primary hover-smooth"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingFeedback || !userRating}
                  data-hover
                  className="px-6 py-3 bg-primary text-white font-bold mono-meta text-xs hover-smooth hover:bg-primary/80 disabled:opacity-40"
                >
                  {isSubmittingFeedback ? 'Submitting Feedback...' : 'Submit Resolution Feedback'}
                </button>
              </form>
            )}
          </div>

          {/* Audit Log */}
          {ticketData.history?.length > 0 && (
            <div>
              <span className="mono-meta text-muted text-[10px] block mb-4">Audit Log</span>
              <div className="space-y-0">
                {ticketData.history.map((h) => (
                  <div key={h.id} className="border-t-editorial py-3 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-bold">{h.status}</span>
                      <span className="text-secondary ml-2">{h.comment}</span>
                    </div>
                    <span className="mono-meta text-muted text-[10px] whitespace-nowrap ml-4">
                      {formatLocalTimestamp(h.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
