import React, { useState, useEffect } from 'react';
import { MapPin, ShieldAlert, Check } from 'lucide-react';

export default function WardHeatmap({ 
  wardStats = [], 
  onSelectWard, 
  activeWardFilter, 
  selectedState = 'All', 
  selectedCity = 'All' 
}) {

  // Generate 100% DYNAMIC heatmap tiles strictly from backend DB wardStats!
  const getDynamicWardList = () => {
    if (!wardStats || wardStats.length === 0) {
      return [
        {
          id: 'Ward 01 - Default',
          name: 'No Active Regional Wards',
          zone: 'Municipal Division',
          city: selectedCity !== 'All' ? selectedCity : 'District',
          state: selectedState !== 'All' ? selectedState : 'State',
          officer: 'Zonal Commissioner',
          primaryIssue: 'No Open Complaints',
          count: 0,
          high: 0
        }
      ];
    }

    return wardStats.map((st) => {
      const rawName = st.ward || 'Municipal Ward';
      const cleanName = rawName.replace(/^Ward \d+ - /, '');
      return {
        id: st.ward,
        name: cleanName,
        zone: st.area || 'Zonal Ward Division',
        city: st.city || 'District City',
        state: st.state || (selectedState !== 'All' ? selectedState : 'Regional'),
        officer: `Zonal Officer (${st.city || 'Municipal'})`,
        primaryIssue: `${st.category || 'Civic Infrastructure'} Maintenance`,
        count: st.count || 0,
        high: st.high_priority || 0
      };
    });
  };

  const wardList = getDynamicWardList();
  const [selectedWardId, setSelectedWardId] = useState(wardList[0]?.id);

  useEffect(() => {
    if (wardList.length > 0) {
      if (!wardList.some(w => w.id === selectedWardId)) {
        setSelectedWardId(wardList[0]?.id);
      }
    }
  }, [wardStats, selectedState, selectedCity]);

  const currentDisplayedWard = wardList.find(w => w.id === (activeWardFilter !== 'All' ? activeWardFilter : selectedWardId)) || wardList[0];

  const handleWardClick = (w) => {
    setSelectedWardId(w.id);
    if (onSelectWard) {
      onSelectWard(w.id === activeWardFilter ? 'All' : w.id);
    }
  };

  return (
    <div className="border border-primary/10 bg-surface p-6 md:p-8 space-y-6 animate-fadeIn">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-editorial pb-6 gap-2">
        <div>
          <span className="mono-meta text-muted text-[10px] block">Real-Time Database Spatial Intelligence</span>
          <h3 className="text-xl md:text-2xl font-bold tracking-display mt-0.5">
            Municipal Ward Heatmap — {selectedState === 'All' ? 'All India Data' : selectedState} {selectedCity !== 'All' ? `(${selectedCity})` : ''}
          </h3>
        </div>
        <div className="flex items-center space-x-4 text-xs mono-meta text-muted">
          <span className="inline-flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-primary inline-block"></span>
            <span>Selected Ward</span>
          </span>
          <span className="inline-flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 border border-primary/40 inline-block"></span>
            <span>Normal</span>
          </span>
        </div>
      </div>

      {/* Grid Map + Inspector Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Dynamic Database Matrix Cards */}
        <div className="lg:col-span-2 border border-primary/10 p-6 flex flex-col justify-between space-y-4 bg-surface">
          <div className="flex justify-between items-center text-[10px] mono-meta text-muted border-b border-primary/5 pb-3">
            <span>DYNAMIC DATABASE WARD MATRIX ({wardList.length} WARDS FOUND)</span>
            <span className="text-muted">CLICK WARD TILE TO FILTER TABLE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {wardList.map((w) => {
              const isFilterActive = activeWardFilter === w.id;
              const isSelected = currentDisplayedWard?.id === w.id;
              const isHighDensity = w.high >= 1;

              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleWardClick(w)}
                  data-hover
                  className={`p-4 text-left border hover-smooth flex flex-col justify-between h-28 transition-all relative ${
                    isFilterActive || isSelected
                      ? 'bg-primary text-white border-primary shadow-md'
                      : isHighDensity
                      ? 'border-primary bg-primary/5 text-primary hover:border-primary/80'
                      : 'border-primary/10 bg-surface text-primary hover:border-primary/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`mono-meta text-[9px] truncate max-w-[110px] ${isFilterActive || isSelected ? 'text-white/70' : 'text-muted'}`}>
                      {w.city}
                    </span>
                    {isHighDensity && (
                      <span className={`text-[8px] mono-meta font-bold px-1 py-0.2 ${isFilterActive || isSelected ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        HOTSPOT
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className={`font-bold text-sm tracking-body truncate ${isFilterActive || isSelected ? 'text-white' : 'text-primary'}`}>
                      {w.name}
                    </h4>
                    <p className={`text-[11px] mono-meta mt-1 ${isFilterActive || isSelected ? 'text-white/80' : 'text-secondary'}`}>
                      {w.count} Grievance{w.count !== 1 ? 's' : ''} ({w.high} High)
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Ward Inspector Detail Side Card */}
        <div className="border border-primary/20 p-6 space-y-5 bg-primary/[0.02] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-editorial pb-3 mb-4">
              <span className="mono-meta text-muted text-[10px]">Regional Ward Inspector</span>
              {currentDisplayedWard && (
                <span className="mono-meta text-[9px] bg-primary text-white px-2 py-0.5 font-bold">
                  SELECTED
                </span>
              )}
            </div>

            {currentDisplayedWard ? (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h4 className="text-2xl font-bold tracking-display">{currentDisplayedWard.name}</h4>
                  <p className="mono-meta text-xs text-muted mt-0.5 font-mono">{currentDisplayedWard.id}</p>
                </div>

                <div className="space-y-2.5 border-t-editorial pt-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="mono-meta text-muted">City / District:</span>
                    <span className="font-bold">{currentDisplayedWard.city}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="mono-meta text-muted">State:</span>
                    <span className="font-bold">{currentDisplayedWard.state}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="mono-meta text-muted">Active Complaints:</span>
                    <span className="font-bold font-mono text-sm">{currentDisplayedWard.count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="mono-meta text-muted">High Priority Urgent:</span>
                    <span className="font-bold font-mono text-sm text-primary">{currentDisplayedWard.high}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="mono-meta text-muted">Zonal Officer:</span>
                    <span className="font-medium">{currentDisplayedWard.officer}</span>
                  </div>
                  <div className="border-t-editorial pt-2">
                    <span className="mono-meta text-muted text-[10px] block">Primary Infrastructure Focus:</span>
                    <span className="font-bold text-xs text-primary block mt-0.5">{currentDisplayedWard.primaryIssue}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {currentDisplayedWard && (
            <button
              type="button"
              onClick={() => handleWardClick(currentDisplayedWard)}
              data-hover
              className="w-full py-3 bg-primary text-white font-bold mono-meta text-xs hover-smooth hover:bg-primary/80 transition-all mt-4"
            >
              {activeWardFilter === currentDisplayedWard.id ? 'Clear Ward Filter' : `Filter Table for ${currentDisplayedWard.name}`}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
