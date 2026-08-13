import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const samples = [
  { label: 'Telugu', lang: 'Telugu', text: 'మా ప్రాంతంలో గత మూడు రోజులుగా వీధి దీపాలు పనిచేయడం లేదు.' },
  { label: 'Hindi', lang: 'Hindi', text: 'हमारे इलाके में पिछले तीन दिनों से पानी नहीं आ रहा है।' },
  { label: 'Tamil', lang: 'Tamil', text: 'எங்கள் பகுதியில் சாலை மிகவும் மோசமாக உள்ளது.' },
  { label: 'English', lang: 'English', text: 'The garbage has not been collected for five days.' },
];

export default function SampleGrievances({ onSelectSample }) {
  return (
    <div className="border-b-editorial pb-8 mb-8">
      <span className="mono-meta text-muted block mb-4">Try a sample grievance</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {samples.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectSample(s.text, s.lang)}
            data-hover
            className="group text-left p-4 border border-primary/10 hover:border-primary hover-smooth flex items-start justify-between"
          >
            <div className="space-y-1 flex-1 mr-3">
              <span className="mono-meta text-muted text-[10px]">{s.label}</span>
              <p className="text-xs body-text text-primary/80 line-clamp-2">"{s.text}"</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-primary/20 group-hover:text-primary hover-smooth flex-shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </div>
  );
}
