import React, { useState } from 'react';
import { Compass, RotateCw, ChevronUp, ChevronDown, Sliders } from 'lucide-react';

interface ColumnCompassWidgetProps {
  inclinationDeg: number;
  rotationDeg?: number;
  onUpdateInclination: (deg: number) => void;
  onUpdateRotation?: (deg: number) => void;
}

export const ColumnCompassWidget: React.FC<ColumnCompassWidgetProps> = ({
  inclinationDeg = 0,
  rotationDeg = 0,
  onUpdateInclination,
  onUpdateRotation
}) => {
  const [internalRot, setInternalRot] = useState(rotationDeg);

  const handleRotate = (delta: number) => {
    const next = (internalRot + delta + 360) % 360;
    setInternalRot(next);
    onUpdateRotation?.(next);
  };

  return (
    <div className="relative select-none flex flex-col items-center pointer-events-auto">
      {/* 1. Main Circular Compass HUD Frame */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
        {/* Outer Rotating Degree Ring */}
        <svg
          className="absolute inset-0 w-full h-full transition-transform duration-300"
          style={{ transform: `rotate(${internalRot}deg)` }}
          viewBox="0 0 140 140"
        >
          <circle
            cx="70"
            cy="70"
            r="65"
            fill="none"
            stroke="rgba(0, 229, 255, 0.25)"
            strokeWidth="1.2"
            strokeDasharray="2 6"
          />
          <circle
            cx="70"
            cy="70"
            r="58"
            fill="none"
            stroke="rgba(0, 229, 255, 0.4)"
            strokeWidth="1"
          />

          {/* Cardinal Ticks */}
          <line x1="70" y1="5" x2="70" y2="14" stroke="#FFD600" strokeWidth="2" />
          <line x1="70" y1="126" x2="70" y2="135" stroke="#00E5FF" strokeWidth="1.5" />
          <line x1="5" y1="70" x2="14" y2="70" stroke="#00E5FF" strokeWidth="1.5" />
          <line x1="126" y1="70" x2="135" y2="70" stroke="#00E5FF" strokeWidth="1.5" />

          <text x="66" y="22" fill="#FFD600" fontSize="7" fontFamily="Orbitron" fontWeight="bold">N</text>
          <text x="120" y="73" fill="#8CFFFF" fontSize="6" fontFamily="monospace">E</text>
          <text x="67" y="124" fill="#8CFFFF" fontSize="6" fontFamily="monospace">S</text>
          <text x="16" y="73" fill="#8CFFFF" fontSize="6" fontFamily="monospace">W</text>
        </svg>

        {/* Inner 3D Column Isometric Glyph */}
        <div className="relative w-20 h-20 rounded-full bg-[#02050A]/90 border border-[#00E5FF]/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Base Pedestal Grid Lines */}
            <line x1="15" y1="55" x2="65" y2="55" stroke="rgba(0,229,255,0.2)" />
            <line x1="40" y1="35" x2="40" y2="75" stroke="rgba(0,229,255,0.2)" />
            <ellipse cx="40" cy="55" rx="25" ry="12" stroke="rgba(0,229,255,0.3)" strokeDasharray="2 3" />

            {/* 3D Column Extrusion with Inclination Lean */}
            <g
              transform={`rotate(${inclinationDeg} 40 55)`}
              className="transition-transform duration-300"
            >
              {/* Column Shaft Isometric */}
              <path
                d="M 34 52 L 40 55 L 46 52 L 40 49 Z"
                fill="rgba(0, 229, 255, 0.4)"
                stroke="#00E5FF"
                strokeWidth="1"
              />
              <path
                d="M 34 52 L 34 18 L 40 21 L 40 55 Z"
                fill="rgba(0, 229, 255, 0.3)"
                stroke="#00E5FF"
                strokeWidth="1.2"
              />
              <path
                d="M 40 55 L 40 21 L 46 18 L 46 52 Z"
                fill="rgba(0, 229, 255, 0.15)"
                stroke="#00E5FF"
                strokeWidth="1.2"
              />
              <path
                d="M 34 18 L 40 21 L 46 18 L 40 15 Z"
                fill="#FFD600"
                stroke="#FFD600"
                strokeWidth="1.2"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* 2. Interactive Angle & Inclination Slider Bar with Numbered Degree Scale 1-9 */}
      <div className="mt-1 flex flex-col items-center gap-1 bg-[#03080E]/90 border border-[#00E5FF]/30 px-3 py-1.5 rounded-sm text-[9px] font-orbitron">
        <div className="flex items-center gap-2">
          <span className="text-[#8A949D]">INCL:</span>
          <span className="text-[#FFD600] font-bold">{inclinationDeg}°</span>
          <input
            type="range"
            min={0}
            max={15}
            step={1}
            value={inclinationDeg}
            onChange={(e) => onUpdateInclination(parseFloat(e.target.value))}
            className="w-20 h-1 bg-[#06121C] accent-[#FFD600] cursor-pointer"
            title="Column Inclination"
          />
          <button
            type="button"
            onClick={() => handleRotate(45)}
            className="p-0.5 text-[#00E5FF] hover:text-white border border-[#00E5FF]/40 rounded hover:bg-[#00E5FF]/20"
            title="Rotate Column 45°"
          >
            <RotateCw className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Numbered Degree Ticks Scale 1 2 3 4 5 6 7 8 9 */}
        <div className="flex items-center justify-between w-full text-[7px] font-mono-tech text-[#00E5FF] px-1 pt-0.5 border-t border-[#0D1C2A]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              key={n}
              onClick={() => onUpdateInclination(n)}
              className={`cursor-pointer transition-colors ${
                Math.round(inclinationDeg) === n ? 'text-[#FFD600] font-bold' : 'hover:text-white'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
