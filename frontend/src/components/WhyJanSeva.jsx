import React from 'react';

const benefits = [
  { title: 'Breaks Language Barriers', desc: 'Citizens lodge complaints in their native regional script without needing English.' },
  { title: 'Reduces Manual Routing', desc: 'Eliminates paper bottleneck by instantly dispatching to correct departments.' },
  { title: 'Prioritizes Urgent Issues', desc: 'Identifies high-risk power, water, and safety issues for immediate action.' },
  { title: 'Detects Duplicates', desc: 'TF-IDF similarity algorithm merges repeated grievances, saving bandwidth.' },
  { title: 'Improves Transparency', desc: 'Citizens receive live audit timelines from submission to verified resolution.' },
  { title: 'Identifies Patterns', desc: 'Aggregates analytics to spot recurring infrastructure failures across wards.' },
];

export default function WhyJanSeva() {
  return (
    <section className="py-24 border-t-editorial">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">

        <div className="mb-16 max-w-xl">
          <span className="mono-meta text-muted block mb-3">Impact</span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-display">
            <span className="reveal-wrap"><span className="reveal-inner">Why JanSeva AI?</span></span>
          </h2>
          <p className="body-text text-secondary mt-4 text-sm">
            Transforming Indian public grievance redressing with AI-driven speed, accessibility, and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-primary/10">
          {benefits.map((item, i) => (
            <div key={i} className="bg-surface p-8 space-y-3 group hover:bg-primary hover-smooth">
              <span className="mono-meta text-muted group-hover:text-white/40 hover-smooth text-[10px]">
                0{i + 1}
              </span>
              <h4 className="text-lg font-bold tracking-body group-hover:text-white hover-smooth">
                {item.title}
              </h4>
              <p className="body-text text-sm text-secondary group-hover:text-white/60 hover-smooth">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
