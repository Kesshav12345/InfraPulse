import React, { useState } from 'react';
import { MapPin, ShieldAlert, Layers } from 'lucide-react';

// Representative coordinate regions for Indian States and UTs
const INDIA_REGIONS = [
  { id: 'JK', name: 'Jammu and Kashmir', x: 26, y: 15, w: 14, h: 10 },
  { id: 'HP', name: 'Himachal Pradesh', x: 30, y: 26, w: 10, h: 7 },
  { id: 'PB', name: 'Punjab', x: 22, y: 28, w: 8, h: 7 },
  { id: 'UK', name: 'Uttarakhand', x: 38, y: 30, w: 10, h: 7 },
  { id: 'HR', name: 'Haryana', x: 26, y: 35, w: 8, h: 6 },
  { id: 'DL', name: 'Delhi', x: 34, y: 36, w: 5, h: 5 },
  { id: 'RJ', name: 'Rajasthan', x: 14, y: 37, w: 18, h: 15 },
  { id: 'UP', name: 'Uttar Pradesh', x: 37, y: 38, w: 18, h: 12 },
  { id: 'BR', name: 'Bihar', x: 57, y: 41, w: 12, h: 10 },
  { id: 'SK', name: 'Sikkim', x: 67, y: 36, w: 6, h: 5 },
  { id: 'WB', name: 'West Bengal', x: 65, y: 48, w: 10, h: 12 },
  { id: 'JH', name: 'Jharkhand', x: 56, y: 51, w: 10, h: 9 },
  { id: 'OD', name: 'Odisha', x: 54, y: 61, w: 12, h: 11 },
  { id: 'CG', name: 'Chhattisgarh', x: 44, y: 53, w: 10, h: 12 },
  { id: 'MP', name: 'Madhya Pradesh', x: 30, y: 49, w: 16, h: 12 },
  { id: 'GJ', name: 'Gujarat', x: 8, y: 51, w: 16, h: 14 },
  { id: 'MH', name: 'Maharashtra', x: 24, y: 64, w: 18, h: 13 },
  { id: 'TG', name: 'Telangana', x: 38, y: 68, w: 12, h: 10 },
  { id: 'AP', name: 'Andhra Pradesh', x: 42, y: 78, w: 14, h: 11 },
  { id: 'KA', name: 'Karnataka', x: 25, y: 78, w: 13, h: 13 },
  { id: 'GA', name: 'Goa', x: 20, y: 78, w: 5, h: 4 },
  { id: 'KL', name: 'Kerala', x: 27, y: 91, w: 8, h: 11 },
  { id: 'TN', name: 'Tamil Nadu', x: 35, y: 89, w: 12, h: 12 },
  { id: 'AS', name: 'Assam', x: 77, y: 40, w: 12, h: 8 },
  { id: 'AR', name: 'Arunachal Pradesh', x: 85, y: 33, w: 12, h: 7 },
  { id: 'ML', name: 'Meghalaya', x: 76, y: 48, w: 8, h: 5 },
  { id: 'NL', name: 'Nagaland', x: 90, y: 41, w: 6, h: 5 },
  { id: 'MN', name: 'Manipur', x: 89, y: 47, w: 6, h: 5 },
  { id: 'MZ', name: 'Mizoram', x: 87, y: 53, w: 6, h: 6 },
  { id: 'TR', name: 'Tripura', x: 80, y: 53, w: 6, h: 5 },
  { id: 'PAN', name: 'Multi-State / PAN India', x: 5, y: 8, w: 18, h: 8 }
];

export default function IndiaRiskMap({
  stateSummaries = [],
  selectedState = null,
  onSelectState = () => {}
}) {
  const [hoveredState, setHoveredState] = useState(null);

  // Map state summaries for quick lookup
  const summaryMap = {};
  stateSummaries.forEach((s) => {
    summaryMap[s.state.toLowerCase()] = s;
  });

  const getStateColor = (stateName) => {
    const s = summaryMap[stateName.toLowerCase()];
    if (!s) return '#E2E8F0'; // Default gray
    if (s.critical_count > 10 || s.avg_risk_score >= 60) return '#FCA5A5'; // Soft Critical Red
    if (s.high_count > 15 || s.avg_risk_score >= 45) return '#FDE68A'; // Soft High Amber
    if (s.avg_risk_score >= 30) return '#FEF08A'; // Soft Moderate Yellow
    return '#A7F3D0'; // Soft Low Green
  };

  const getBorderColor = (stateName) => {
    const s = summaryMap[stateName.toLowerCase()];
    if (!s) return '#CBD5E1';
    if (s.critical_count > 10 || s.avg_risk_score >= 60) return '#DC2626';
    if (s.high_count > 15 || s.avg_risk_score >= 45) return '#D97706';
    return '#059669';
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-6 p-2">
      {/* Interactive Grid Map */}
      <div className="relative w-full max-w-lg aspect-[1/1] bg-[#E9F2FA] border border-[#CBDCEB] rounded-xl p-3 shadow-inner overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 105" className="w-full h-full drop-shadow-xs">
          {INDIA_REGIONS.map((region) => {
            const isSelected = selectedState && selectedState.toLowerCase() === region.name.toLowerCase();
            const isHovered = hoveredState && hoveredState.name === region.name;
            const fillColor = getStateColor(region.name);
            const strokeColor = isSelected ? '#102A72' : (isHovered ? '#13A8E0' : getBorderColor(region.name));
            const strokeWidth = isSelected ? 1.8 : (isHovered ? 1.4 : 0.4);

            return (
              <g
                key={region.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectState(isSelected ? null : region.name)}
                onMouseEnter={() => setHoveredState({ ...region, ...summaryMap[region.name.toLowerCase()] })}
                onMouseLeave={() => setHoveredState(null)}
              >
                <rect
                  x={region.x}
                  y={region.y}
                  width={region.w}
                  height={region.h}
                  rx={2.5}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-opacity hover:opacity-90"
                />
                <text
                  x={region.x + region.w / 2}
                  y={region.y + region.h / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-bold pointer-events-none select-none text-[#10213D]"
                  style={{ fontSize: region.id === 'PAN' ? '2.4px' : '2.8px' }}
                >
                  {region.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-2 text-[10px] bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] shadow-xs font-medium">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-300 border border-red-600" /> Critical</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-200 border border-amber-600" /> Elevated</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 border border-emerald-600" /> Low Risk</div>
        </div>
      </div>

      {/* State Detail Side Panel */}
      <div className="flex-1 w-full flex flex-col justify-between self-stretch bg-white border border-[#C8DAEB] rounded-xl p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EDF7] mb-3.5">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#13A8E0]" />
              <h3 className="font-bold text-[#10213D] text-sm">
                {hoveredState?.name || selectedState || 'National Infrastructure Spread'}
              </h3>
            </div>
            {selectedState && (
              <button
                onClick={() => onSelectState(null)}
                className="text-[11px] text-[#102A72] hover:text-[#13A8E0] hover:underline font-bold"
              >
                Clear Selection
              </button>
            )}
          </div>

          {hoveredState || selectedState ? (
            <div className="space-y-3.5">
              {(() => {
                const sName = (hoveredState?.name || selectedState).toLowerCase();
                const data = summaryMap[sName] || {
                  project_count: 0,
                  total_cost_cr: 0,
                  avg_risk_score: 0,
                  critical_count: 0,
                  high_count: 0
                };
                return (
                  <>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 bg-[#F2F7FD] rounded-lg border border-[#D5E3F0]">
                        <span className="text-[#475569] block text-[10px] uppercase font-bold tracking-wider">Monitored Projects</span>
                        <strong className="text-base text-[#10213D] font-mono font-bold mt-0.5 block">{data.project_count.toLocaleString()}</strong>
                      </div>
                      <div className="p-3 bg-[#F2F7FD] rounded-lg border border-[#D5E3F0]">
                        <span className="text-[#475569] block text-[10px] uppercase font-bold tracking-wider">Total Sanctioned</span>
                        <strong className="text-base text-[#10213D] font-mono font-bold mt-0.5 block">₹{data.total_cost_cr.toLocaleString()} Cr</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F2F7FD] rounded-lg border border-[#D5E3F0] text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#334155] font-medium">Average Risk Score:</span>
                        <strong className="text-[#10213D] font-mono">{data.avg_risk_score ? data.avg_risk_score.toFixed(1) : 'N/A'}/100</strong>
                      </div>
                      <div className="flex justify-between items-center text-red-700 font-medium">
                        <span>Critical Risk Projects:</span>
                        <strong className="font-mono">{data.critical_count}</strong>
                      </div>
                      <div className="flex justify-between items-center text-amber-700 font-medium">
                        <span>High Risk Projects:</span>
                        <strong className="font-mono">{data.high_count}</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      Click any state block to filter the portfolio explorer and project directory by that jurisdiction.
                    </p>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              <Layers size={32} className="mx-auto mb-2 text-slate-300" />
              Hover over or click any state block on the map to inspect regional infrastructure density and risk concentrations.
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span>Source: MoSPI Flash Report Ingestion</span>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">28 States & UTs</span>
        </div>
      </div>
    </div>
  );
}
