import React from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function AIAnalysisModal({
  isOpen, isLoading, analysisData, onClose, onConfirmSubmit, isSubmitting
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface max-w-2xl w-full border border-primary/10 overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-primary text-white px-8 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-display">AI Analysis</h3>
            <p className="mono-meta text-white/40 text-[10px] mt-0.5">JanSeva NLP Engine</p>
          </div>
          {!isLoading && (
            <button onClick={onClose} data-hover className="text-white/40 hover:text-white hover-smooth">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-6">
              <div className="w-16 h-16 mx-auto border border-primary/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
              </div>
              <div>
                <h4 className="text-xl font-bold tracking-display">AI is analyzing your grievance…</h4>
                <p className="mono-meta text-muted mt-2">Detecting Language · Translating · Classifying · Scanning Duplicates</p>
              </div>
            </div>
          ) : analysisData ? (
            <>
              {/* Duplicate Warning */}
              {analysisData.duplicate?.is_duplicate && (
                <div className="border border-primary p-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="mono-meta text-xs">Possible Duplicate</span>
                    <span className="mono-meta text-xs bg-primary text-white px-2 py-0.5">
                      {analysisData.duplicate.similarity}% match
                    </span>
                  </div>
                  <p className="text-xs body-text text-secondary">
                    Similar to <strong className="font-mono text-primary">{analysisData.duplicate.matched_ticket_id}</strong>
                  </p>
                </div>
              )}

              {/* Analysis Grid */}
              <div className="grid grid-cols-2 gap-px bg-primary/10">
                {[
                  { label: 'Detected Language', value: analysisData.language },
                  { label: 'Priority', value: analysisData.priority },
                  { label: 'Category', value: analysisData.category },
                  { label: 'Assigned Department', value: analysisData.department },
                ].map((item, i) => (
                  <div key={i} className="bg-surface p-5 space-y-1">
                    <span className="mono-meta text-muted text-[10px]">{item.label}</span>
                    <p className="text-sm font-bold tracking-body">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Translation */}
              <div className="border-t-editorial pt-5 space-y-1">
                <span className="mono-meta text-muted text-[10px]">English Translation</span>
                <p className="body-text text-sm text-secondary">"{analysisData.translation}"</p>
              </div>

              {/* Summary */}
              <div className="border-t-editorial pt-5 space-y-1">
                <span className="mono-meta text-muted text-[10px]">AI Summary</span>
                <p className="body-text text-sm text-primary">{analysisData.summary}</p>
              </div>

              {/* Suggested Action */}
              <div className="border-t-editorial pt-5 space-y-1">
                <span className="mono-meta text-muted text-[10px]">Suggested Action</span>
                <p className="body-text text-sm text-primary font-medium">{analysisData.suggested_action}</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        {!isLoading && analysisData && (
          <div className="border-t-editorial px-8 py-5 flex items-center justify-between">
            <button type="button" onClick={onClose} data-hover
              className="mono-meta text-muted hover:text-primary hover-smooth text-xs">
              Modify
            </button>
            <button type="button" onClick={onConfirmSubmit} disabled={isSubmitting} data-hover
              className="px-6 py-3 bg-primary text-white font-bold text-sm tracking-display hover-smooth hover:bg-primary/80 flex items-center space-x-2 disabled:opacity-50">
              <span>{isSubmitting ? 'Registering…' : 'Register Grievance'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
