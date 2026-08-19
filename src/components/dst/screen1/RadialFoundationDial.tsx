import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ChevronRight, Layers, Info } from 'lucide-react';

export interface FoundationTypeItem {
  id: string;
  code: string;
  name: string;
  category: string;
  iconType: 'isolated' | 'pedestal' | 'combined' | 'eccentric' | 'corner' | 'piez' | 'pile' | 'custom';
  description: string;
  rebarMesh: string;
  bearingCapacityKPa: number;
}

export const FOUNDATION_CATALOG: FoundationTypeItem[] = [
  {
    id: 'F-01',
    code: 'F-01',
    name: 'ISOLATED FOOTING',
    category: 'SPREAD',
    iconType: 'isolated',
    description: 'Zapata aislada centrada de concreto armado f\'c=250 kg/cm²',
    rebarMesh: '#4 @ 15cm A.D.',
    bearingCapacityKPa: 220
  },
  {
    id: 'F-02',
    code: 'F-02',
    name: 'ISOLATED + PEDESTAL',
    category: 'SPREAD & PEDESTAL',
    iconType: 'pedestal',
    description: 'Zapata aislada con pedestal peraltado para anclas de columna',
    rebarMesh: '#5 @ 12cm + 8#6 Pedestal',
    bearingCapacityKPa: 280
  },
  {
    id: 'F-04',
    code: 'F-04',
    name: 'COMBINED FOOTING',
    category: 'MULTI-COLUMN',
    iconType: 'combined',
    description: 'Zapata combinada corrida para dos o más columnas adyacentes',
    rebarMesh: '#6 @ 15cm superior/inferior',
    bearingCapacityKPa: 310
  },
  {
    id: 'F-05',
    code: 'F-05',
    name: 'ECCENTRIC FOOTINGS',
    category: 'BOUNDARY',
    iconType: 'eccentric',
    description: 'Zapata de lindero con viga de liga para contrarrestar momento',
    rebarMesh: '#5 @ 12cm + Viga Liga 4#8',
    bearingCapacityKPa: 190
  },
  {
    id: 'F-06',
    code: 'F-06',
    name: 'CORNER FOOTINGS',
    category: 'CORNER',
    iconType: 'corner',
    description: 'Zapata de esquina con doble excentricidad biaxial',
    rebarMesh: '#6 @ 12cm bidireccional',
    bearingCapacityKPa: 180
  },
  {
    id: 'F-08',
    code: 'F-08',
    name: 'PIEZ FOUNDATION',
    category: 'DEEP',
    iconType: 'piez',
    description: 'Cimentación con pila de cimentación colada in-situ',
    rebarMesh: 'Espiral #3 + 12#8 longitudinal',
    bearingCapacityKPa: 450
  },
  {
    id: 'F-12',
    code: 'F-12',
    name: 'PILE CAP',
    category: 'DEEP / PILES',
    iconType: 'pile',
    description: 'Cabezal de pilotes prefabricados hincados',
    rebarMesh: '#8 @ 10cm parrilla doble',
    bearingCapacityKPa: 600
  },
  {
    id: 'F-11',
    code: 'F-11',
    name: 'CUSTOM FOUNDATION',
    category: 'PARAMETRIC',
    iconType: 'custom',
    description: 'Configuración personalizada con contratrabes de rigidez',
    rebarMesh: 'Configuración paramétrica libre',
    bearingCapacityKPa: 350
  }
];

interface RadialFoundationDialProps {
  selectedFoundationId: string;
  onSelectFoundation: (found: FoundationTypeItem) => void;
}

export const RadialFoundationDial: React.FC<RadialFoundationDialProps> = ({
  selectedFoundationId,
  onSelectFoundation
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeFound = FOUNDATION_CATALOG.find((f) => f.id === selectedFoundationId) || FOUNDATION_CATALOG[1];
  const activeIdx = FOUNDATION_CATALOG.findIndex((f) => f.id === activeFound.id);

  // 8 quadrants = 45 degrees each
  const getQuadrantAngle = (index: number) => {
    return index * 45 - 90; // Start at top
  };

  const activeAngle = getQuadrantAngle(activeIdx >= 0 ? activeIdx : 1);

  return (
    <div className="relative select-none flex flex-col items-center">
      {/* 1. Main Glowing Multi-Ring Circular HUD Dial */}
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
        {/* Outer Rotating Cyan Tick Ring */}
        <svg className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke="rgba(0, 229, 255, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="rgba(0, 229, 255, 0.45)"
            strokeWidth="1"
            strokeDasharray="2 12"
          />
        </svg>

        {/* Outer Yellow Indicator Ring */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="rgba(255, 214, 0, 0.35)"
            strokeWidth="1.5"
          />
          {/* Active Sector Arc Indicator */}
          <g transform={`rotate(${activeAngle} 100 100)`}>
            <path
              d="M 100 18 A 82 82 0 0 1 158 42"
              fill="none"
              stroke="#FFD600"
              strokeWidth="4"
              strokeLinecap="round"
              filter="drop-shadow(0 0 6px #FFD600)"
            />
            <circle cx="100" cy="18" r="3.5" fill="#FFD600" />
            <circle cx="158" cy="42" r="3.5" fill="#FFD600" />
          </g>
        </svg>

        {/* Inner Radial Quadrants with Icons */}
        <div className="relative w-36 h-36 rounded-full bg-[#03080E]/90 border border-[#00E5FF]/40 backdrop-blur-md shadow-[0_0_25px_rgba(0,229,255,0.18)] flex items-center justify-center p-2">
          {/* Radial item buttons placed around circle */}
          {FOUNDATION_CATALOG.map((found, idx) => {
            const angle = (idx * (360 / FOUNDATION_CATALOG.length) - 90) * (Math.PI / 180);
            const radius = 50; // px from center
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isSelected = found.id === activeFound.id;
            const isHovered = hoveredIndex === idx;

            return (
              <button
                key={found.id}
                type="button"
                onClick={() => onSelectFoundation(found)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
                className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full flex flex-col items-center justify-center transition-all duration-200 z-10 ${
                  isSelected
                    ? 'bg-[#FFD600] text-[#020307] shadow-[0_0_12px_#FFD600] scale-110'
                    : isHovered
                    ? 'bg-[#00E5FF] text-[#020307] shadow-[0_0_8px_#00E5FF] scale-105'
                    : 'bg-[#06121C] text-[#8CFFFF] border border-[#00E5FF]/40 hover:border-[#00E5FF]'
                }`}
                title={`${found.code}: ${found.name}`}
              >
                {renderFoundationIcon(found.iconType, isSelected || isHovered ? '#020307' : '#8CFFFF')}
              </button>
            );
          })}

          {/* Center Hub Display */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-16 h-16 rounded-full bg-[#02050A] border border-[#00E5FF]/60 flex flex-col items-center justify-center cursor-pointer hover:border-[#FFD600] transition-colors z-20 group text-center p-1"
          >
            <span className="text-[10px] font-orbitron font-bold text-[#FFD600] tracking-wider leading-none">
              {activeFound.code}
            </span>
            <span className="text-[8px] font-mono-tech text-[#8CFFFF] line-clamp-1 leading-tight mt-0.5 group-hover:text-white">
              {activeFound.category}
            </span>
            <span className="text-[6px] text-[#5E6872] tracking-tighter uppercase mt-0.5">
              TAP DETAILS
            </span>
          </div>
        </div>
      </div>

      {/* 2. Active Foundation Label & Metric Pill */}
      <div className="mt-2 text-center w-full max-w-[240px]">
        <div className="flex items-center justify-center gap-1.5 text-xs font-orbitron font-bold text-[#F2F7F7] tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span>{activeFound.name}</span>
        </div>
        <div className="text-[10px] font-mono-tech text-[#8A949D] flex items-center justify-center gap-2 mt-0.5">
          <span>CAPACIDAD: <strong className="text-[#00E5FF]">{activeFound.bearingCapacityKPa} kPa</strong></span>
          <span>•</span>
          <span>{activeFound.rebarMesh}</span>
        </div>
      </div>

      {/* 3. Flyout Expanded Detail Modal / Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -10 }}
            className="absolute top-52 right-0 w-80 bg-[#030911]/95 border border-[#00E5FF]/40 backdrop-blur-xl p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-50 rounded-sm"
          >
            <div className="flex items-center justify-between border-b border-[#0D1C2A] pb-2 mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFD600]" />
                <span className="font-orbitron text-xs font-bold text-[#00E5FF] tracking-wider">
                  CATÁLOGO DE CIMENTACIONES
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-[#5E6872] hover:text-white text-xs px-1.5 py-0.5 border border-[#0D1C2A]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {FOUNDATION_CATALOG.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    onSelectFoundation(f);
                    setIsExpanded(false);
                  }}
                  className={`w-full text-left p-2 border transition-all flex items-center justify-between ${
                    f.id === activeFound.id
                      ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white'
                      : 'bg-[#050C16] border-[#0D1C2A] text-[#8A949D] hover:border-[#00E5FF]/40 hover:text-[#F2F7F7]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-orbitron text-xs font-bold text-[#FFD600]">{f.code}</span>
                      <span className="text-xs font-bold">{f.name}</span>
                    </div>
                    <p className="text-[10px] text-[#5E6872] mt-0.5 font-mono-tech">{f.description}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Vector icons matching structural blueprint styles
function renderFoundationIcon(type: FoundationTypeItem['iconType'], stroke: string) {
  switch (type) {
    case 'isolated':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M12 3v11M8 14h8M4 18h16v3H4z" />
        </svg>
      );
    case 'pedestal':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M12 2v6M9 8h6v7H9zM4 19h16v3H4z" />
        </svg>
      );
    case 'combined':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M7 3v10M17 3v10M2 17h20v4H2z" />
        </svg>
      );
    case 'eccentric':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M6 3v11M3 14h18M3 18h18v3H3z" />
        </svg>
      );
    case 'corner':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M4 3v11h11M4 18h16v3H4z" />
        </svg>
      );
    case 'piez':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M12 2v5M8 7h8v4H8zM10 11v10M14 11v10" />
        </svg>
      );
    case 'pile':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M5 4h14v5H5zM8 9v12M12 9v12M16 9v12" />
        </svg>
      );
    case 'custom':
    default:
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
  }
}
