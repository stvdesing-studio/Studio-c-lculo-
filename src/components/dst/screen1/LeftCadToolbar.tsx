import React, { useState } from 'react';
import {
  Maximize2
} from 'lucide-react';

export type CadToolMode =
  | 'BOX_SELECT'
  | 'NORTH_AXIS'
  | 'STAR_NODES'
  | 'SPATIAL_GRAPH'
  | 'POINTER'
  | 'NODE_CONNECT'
  | 'DIMENSION_PEN'
  | 'TRUSS_TRIANGLE'
  | 'HEX_PROFILE'
  | 'GRID_SLICE'
  | 'CUT_TOOL'
  | 'BOLT_FASTENER'
  | 'BASE_PEDESTAL';

interface LeftCadToolbarProps {
  activeTool: CadToolMode;
  onSelectTool: (tool: CadToolMode) => void;
  showHolograms: boolean;
  onToggleHolograms: () => void;
  onOpenCreationGateway?: () => void;
}

export const LeftCadToolbar: React.FC<LeftCadToolbarProps> = ({
  activeTool,
  onSelectTool,
  showHolograms,
  onToggleHolograms,
  onOpenCreationGateway
}) => {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const tools: { id: CadToolMode; label: string; shortcut: string; iconSvg: React.ReactNode }[] = [
    {
      id: 'BOX_SELECT',
      label: 'BOUNDING BOX / FRAME',
      shortcut: 'B',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      )
    },
    {
      id: 'NORTH_AXIS',
      label: 'NORTH ALIGNMENT AXIS',
      shortcut: 'N',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7l3 10-3-2-3 2 3-10z" fill="currentColor" fillOpacity="0.3" />
        </svg>
      )
    },
    {
      id: 'STAR_NODES',
      label: 'GRID INTERSECTION NODES',
      shortcut: 'G',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <circle cx="18" cy="6" r="2" fill="currentColor" />
          <circle cx="6" cy="18" r="2" fill="currentColor" />
          <circle cx="18" cy="18" r="2" fill="currentColor" />
          <line x1="6" y1="6" x2="18" y2="18" strokeDasharray="2 2" />
          <line x1="18" y1="6" x2="6" y2="18" strokeDasharray="2 2" />
        </svg>
      )
    },
    {
      id: 'SPATIAL_GRAPH',
      label: 'SPATIAL HOLOGRAPHIC GRAPH',
      shortcut: 'H',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <line x1="12" y1="3" x2="12" y2="9" />
          <line x1="12" y1="15" x2="12" y2="21" />
          <line x1="3" y1="12" x2="9" y2="12" />
          <line x1="15" y1="12" x2="21" y2="12" />
          <circle cx="12" cy="3" r="1" />
          <circle cx="12" cy="21" r="1" />
          <circle cx="3" cy="12" r="1" />
          <circle cx="21" cy="12" r="1" />
        </svg>
      )
    },
    {
      id: 'POINTER',
      label: 'PRECISION SELECTION ARROW',
      shortcut: 'V',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M5 3l6 17 2.5-6.5L20 11 5 3z" fill="currentColor" fillOpacity="0.2" />
        </svg>
      )
    },
    {
      id: 'NODE_CONNECT',
      label: 'STRUCTURAL GRAPH LINK',
      shortcut: 'L',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'DIMENSION_PEN',
      label: 'PARAMETRIC MEASUREMENT PEN',
      shortcut: 'D',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <line x1="4" y1="20" x2="20" y2="4" strokeWidth="2" strokeLinecap="round" />
          <circle cx="4" cy="20" r="2" fill="currentColor" />
          <circle cx="20" cy="4" r="2" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'TRUSS_TRIANGLE',
      label: 'TRUSS & WEBS GENERATOR',
      shortcut: 'T',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <polygon points="12,4 20,20 4,20" />
          <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="2 2" />
        </svg>
      )
    },
    {
      id: 'HEX_PROFILE',
      label: 'PROFILE GEOMETRY INSPECTOR',
      shortcut: 'P',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        </svg>
      )
    },
    {
      id: 'GRID_SLICE',
      label: 'SECTION CUT & BLUEPRINT SLICE',
      shortcut: 'S',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="3 2" />
          <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="3 2" />
        </svg>
      )
    },
    {
      id: 'CUT_TOOL',
      label: 'MITER & BEVEL PROFILE CUT',
      shortcut: 'X',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="8.5" y1="8.5" x2="20" y2="20" />
          <line x1="8.5" y1="15.5" x2="20" y2="4" />
        </svg>
      )
    },
    {
      id: 'BOLT_FASTENER',
      label: 'ANCHOR BOLT & FASTENERS',
      shortcut: 'A',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="4" x2="12" y2="7" />
          <line x1="12" y1="17" x2="12" y2="20" />
          <line x1="4" y1="12" x2="7" y2="12" />
          <line x1="17" y1="12" x2="20" y2="12" />
        </svg>
      )
    },
    {
      id: 'BASE_PEDESTAL',
      label: '3D COLUMN BASE & PEDESTAL',
      shortcut: 'C',
      iconSvg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <polygon points="12,3 21,8 12,13 3,8" />
          <polygon points="3,8 12,13 12,21 3,16" />
          <polygon points="12,13 21,8 21,16 12,21" />
        </svg>
      )
    }
  ];

  return (
    <div className="relative select-none z-30 pointer-events-auto">
      {/* Vertical Tool Dock Container */}
      <div className="flex flex-col items-center bg-[#02050B]/90 border border-[#00E5FF]/30 backdrop-blur-xl p-1.5 rounded-sm shadow-[0_0_25px_rgba(0,0,0,0.9)] space-y-1">
        {/* Creation Gateway Master Configurator Trigger */}
        {onOpenCreationGateway && (
          <div className="relative group">
            <button
              type="button"
              onClick={onOpenCreationGateway}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#FFD600]/20 border border-[#FFD600] text-[#FFD600] hover:bg-[#FFD600] hover:text-black flex items-center justify-center transition-all font-bold shadow-[0_0_12px_rgba(255,214,0,0.5)]"
              title="Creation Gateway: 3 Faces & Material Catalog"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <div className="hidden group-hover:block absolute left-10 top-1/2 -translate-y-1/2 bg-[#030911] border border-[#FFD600] px-2 py-1 rounded text-[9px] font-orbitron font-bold text-[#FFD600] whitespace-nowrap z-50 shadow-xl pointer-events-none">
              CREATION GATEWAY (3 FACES)
            </div>
          </div>
        )}

        {/* Divider */}
        {onOpenCreationGateway && <div className="w-5 h-[1px] bg-[#0D1C2A] my-0.5" />}

        {/* Tool Buttons */}
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <div key={t.id} className="relative group">
              <button
                type="button"
                onClick={() => onSelectTool(t.id)}
                onMouseEnter={() => setHoveredTool(t.label)}
                onMouseLeave={() => setHoveredTool(null)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_#00E5FF] font-bold'
                    : 'text-[#8CFFFF] hover:bg-[#00E5FF]/20 hover:text-white border border-transparent hover:border-[#00E5FF]/40'
                }`}
                title={`${t.label} (${t.shortcut})`}
              >
                {t.iconSvg}
              </button>

              {/* Tooltip on right */}
              <div className="hidden group-hover:block absolute left-10 top-1/2 -translate-y-1/2 bg-[#030911] border border-[#00E5FF] px-2 py-1 rounded text-[9px] font-orbitron font-bold text-white whitespace-nowrap z-50 shadow-xl pointer-events-none">
                <span className="text-[#FFD600] mr-1.5">[{t.shortcut}]</span>
                {t.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

