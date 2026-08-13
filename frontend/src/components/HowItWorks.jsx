import React from 'react';

const steps = [
  { num: '01', title: 'Citizen Complaint', desc: 'Text or voice input in native language' },
  { num: '02', title: 'Language Detection', desc: 'Identifies Indic script automatically' },
  { num: '03', title: 'AI Understanding', desc: 'NLP translation to standard English' },
  { num: '04', title: 'Translation', desc: 'Cross-lingual semantic comprehension' },
  { num: '05', title: 'Category & Priority', desc: 'Urgency evaluation & duplicate scan' },
  { num: '06', title: 'Department Routing', desc: 'Automated municipal dispatch' },
  { num: '07', title: 'Resolution Tracking', desc: 'Real-time citizen transparency' },
];

export default function HowItWorks() {
  return (
    <section className="py-24 border-t-editorial">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">

        <div className="mb-16">
          <span className="mono-meta text-muted block mb-3">Process</span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-display">
            <span className="reveal-wrap"><span className="reveal-inner">How JanSeva</span></span><br />
            <span className="reveal-wrap"><span className="reveal-inner d3">AI Works</span></span>
          </h2>
        </div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={i} className="group border-t-editorial py-6 flex items-start justify-between hover:bg-primary/[0.02] hover-smooth px-4 -mx-4">
              <div className="flex items-start space-x-6 md:space-x-12">
                <span className="mono-meta text-muted text-sm pt-1">{step.num}</span>
                <div>
                  <h4 className="text-lg md:text-xl font-bold tracking-body">{step.title}</h4>
                  <p className="body-text text-sm text-secondary mt-0.5">{step.desc}</p>
                </div>
              </div>
              <span className="mono-meta text-primary/10 group-hover:text-primary hover-smooth text-2xl hidden md:block">→</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
