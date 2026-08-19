// ============================================================
// STV CLOSER — GEOMETRY CONTROL HUB (SCREEN 02)
// GeometryControlHub.tsx
// Concentric Orbital Dials & Parametric Geometry Grammar Controls
// Parameter States: LOCKED, EDITABLE, DERIVED
// ============================================================

import React from 'react';
import { Lock, Unlock, RefreshCw, Compass, Sliders, ShieldAlert, Sparkles } from 'lucide-react';
import { ParameterState } from '../../../dst/truss-typologies';

interface GeometryControlHubProps {
  spanM: number;
  riseM: number;
  depthM: number;
  panelCount: number;
  roofSlopeDeg: number;
  lockedParams: Record<string, boolean>;
  onToggleLock: (key: string) => void;
  onChangeParam: (key: string, value: number) => void;
  onResetDefaults: () => void;
}

export const GeometryControlHub: React.FC<GeometryControlHubProps> = ({
  spanM,
  riseM,
  depthM,
  panelCount,
  roofSlopeDeg,
  lockedParams,
  onToggleLock,
  onChangeParam,
  onResetDefaults
}) => {
  const panelLengthM = spanM / Math.max(1, panelCount);
  const spanDepthRatio = (riseM > 0 ? spanM / riseM : spanM / depthM).toFixed(1);

  return (
    <div className="flex flex-col bg-[#030911]/90 border-l border-[#00E5FF]/30 backdrop-blur-xl p-3 select-none w-80 sm:w-96 text-[#F2F7F7] font-mono-tech overflow-y-auto">
      {/* 1. TOP HEADER & RESET */}
      <div className="flex items-center justify-between mb-3 border-b border-[#0D2235] pb-2">
        <div className="flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#00E5FF]" />
          <span className="font-orbitron font-bold text-xs tracking-wider text-white">
            GEOMETRY CONTROL HUB
          </span>
        </div>
        <button
          type="button"
          onClick={onResetDefaults}
          className="text-[8px] font-orbitron text-[#8A949D] hover:text-[#00E5FF] flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          RESET
        </button>
      </div>

      {/* 2. CONCENTRIC ORBITAL DIALS SUMMARY DISPLAY */}
      <div className="relative w-full h-32 bg-[#02050A] border border-[#00E5FF]/20 rounded p-2 flex items-center justify-between mb-3">
        {/* SVG Orbital Compass Graphic */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {/* Outer Dial: SPAN */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="opacity-70"
            />
            {/* Middle Dial: RISE */}
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="none"
              stroke="#FFD600"
              strokeWidth="2"
              strokeDasharray="4 3"
              className="opacity-80"
            />
            {/* Inner Dial: SLOPE */}
            <circle
              cx="50"
              cy="50"
              r="24"
              fill="none"
              stroke="#FF3366"
              strokeWidth="1.5"
              strokeDasharray="2 3"
            />
          </svg>

          {/* Central Ratio Indicator */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[7px] text-[#8A949D] font-orbitron">L / d</span>
            <span className="text-sm font-orbitron font-bold text-white leading-none">
              {spanDepthRatio}
            </span>
            <span className="text-[6px] text-[#00E5FF]">RATIO</span>
          </div>
        </div>

        {/* Live Readout Values */}
        <div className="flex-1 pl-3 flex flex-col justify-center gap-1.5 text-[9px]">
          <div className="flex items-center justify-between border-b border-[#0D2235] pb-0.5">
            <span className="text-[#00E5FF]">CLARO (L):</span>
            <span className="font-orbitron font-bold text-white">{spanM.toFixed(2)} m</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#0D2235] pb-0.5">
            <span className="text-[#FFD600]">FLECHA (f):</span>
            <span className="font-orbitron font-bold text-white">{riseM.toFixed(2)} m</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#0D2235] pb-0.5">
            <span className="text-[#FF3366]">PENDIENTE (θ):</span>
            <span className="font-orbitron font-bold text-white">{roofSlopeDeg.toFixed(1)}°</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8A949D]">LONG. PANEL (p):</span>
            <span className="font-orbitron font-bold text-[#00E5FF]">{panelLengthM.toFixed(2)} m</span>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE PARAMETER GRAMMAR CONTROLS */}
      <div className="flex flex-col gap-3 flex-1">
        {/* SPAN (Claro) Control */}
        <div className="p-2 bg-[#02050A] border border-[#00E5FF]/30 rounded">
          <div className="flex items-center justify-between mb-1 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron font-bold text-white">SPAN / CLARO</span>
              <span className="text-[8px] text-[#00E5FF] bg-[#00E5FF]/10 px-1 rounded">L (m)</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleLock('span')}
              className="text-[#8A949D] hover:text-white"
            >
              {lockedParams.span ? <Lock className="w-3 h-3 text-[#FFD600]" /> : <Unlock className="w-3 h-3 text-[#8A949D]" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="4"
              max="50"
              step="0.5"
              disabled={lockedParams.span}
              value={spanM}
              onChange={(e) => onChangeParam('span', parseFloat(e.target.value))}
              className="flex-1 accent-[#00E5FF] h-1.5 bg-[#0D2235] rounded cursor-pointer"
            />
            <span className="font-orbitron font-bold text-xs text-[#00E5FF] w-12 text-right">
              {spanM.toFixed(1)}m
            </span>
          </div>
        </div>

        {/* RISE / FLECHA Control */}
        <div className="p-2 bg-[#02050A] border border-[#00E5FF]/30 rounded">
          <div className="flex items-center justify-between mb-1 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron font-bold text-white">RISE / FLECHA CUMBRERA</span>
              <span className="text-[8px] text-[#FFD600] bg-[#FFD600]/10 px-1 rounded">f (m)</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleLock('rise')}
              className="text-[#8A949D] hover:text-white"
            >
              {lockedParams.rise ? <Lock className="w-3 h-3 text-[#FFD600]" /> : <Unlock className="w-3 h-3 text-[#8A949D]" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.4"
              max="6.0"
              step="0.1"
              disabled={lockedParams.rise}
              value={riseM}
              onChange={(e) => onChangeParam('rise', parseFloat(e.target.value))}
              className="flex-1 accent-[#FFD600] h-1.5 bg-[#0D2235] rounded cursor-pointer"
            />
            <span className="font-orbitron font-bold text-xs text-[#FFD600] w-12 text-right">
              {riseM.toFixed(2)}m
            </span>
          </div>
        </div>

        {/* DEPTH / PERALTE Control */}
        <div className="p-2 bg-[#02050A] border border-[#00E5FF]/30 rounded">
          <div className="flex items-center justify-between mb-1 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron font-bold text-white">DEPTH / PERALTE APOYO</span>
              <span className="text-[8px] text-[#00E5FF] bg-[#00E5FF]/10 px-1 rounded">d (m)</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleLock('depth')}
              className="text-[#8A949D] hover:text-white"
            >
              {lockedParams.depth ? <Lock className="w-3 h-3 text-[#FFD600]" /> : <Unlock className="w-3 h-3 text-[#8A949D]" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.3"
              max="4.0"
              step="0.05"
              disabled={lockedParams.depth}
              value={depthM}
              onChange={(e) => onChangeParam('depth', parseFloat(e.target.value))}
              className="flex-1 accent-[#00E5FF] h-1.5 bg-[#0D2235] rounded cursor-pointer"
            />
            <span className="font-orbitron font-bold text-xs text-[#00E5FF] w-12 text-right">
              {depthM.toFixed(2)}m
            </span>
          </div>
        </div>

        {/* PANEL COUNT Control */}
        <div className="p-2 bg-[#02050A] border border-[#00E5FF]/30 rounded">
          <div className="flex items-center justify-between mb-1 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron font-bold text-white">PANEL COUNT / DIVISIONES</span>
              <span className="text-[8px] text-[#FF3366] bg-[#FF3366]/10 px-1 rounded">N</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleLock('panels')}
              className="text-[#8A949D] hover:text-white"
            >
              {lockedParams.panels ? <Lock className="w-3 h-3 text-[#FFD600]" /> : <Unlock className="w-3 h-3 text-[#8A949D]" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="4"
              max="24"
              step="2"
              disabled={lockedParams.panels}
              value={panelCount}
              onChange={(e) => onChangeParam('panelCount', parseInt(e.target.value, 10))}
              className="flex-1 accent-[#FF3366] h-1.5 bg-[#0D2235] rounded cursor-pointer"
            />
            <span className="font-orbitron font-bold text-xs text-[#FF3366] w-12 text-right">
              {panelCount} uds
            </span>
          </div>
        </div>

        {/* DERIVED METRICS HUD */}
        <div className="p-2 bg-[#051829] border border-[#00E5FF]/40 rounded text-[9px] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#00E5FF] font-orbitron font-bold">
            <span>PARÁMETROS DERIVADOS</span>
            <span className="text-[7px] text-[#FFD600]">AUTO-CALCULATED</span>
          </div>
          <div className="flex items-center justify-between text-[#8A949D]">
            <span>Longitud de panel en base (p):</span>
            <span className="text-white font-bold">{panelLengthM.toFixed(2)} m</span>
          </div>
          <div className="flex items-center justify-between text-[#8A949D]">
            <span>Inclinación de vertiente (θ):</span>
            <span className="text-white font-bold">{roofSlopeDeg.toFixed(1)}°</span>
          </div>
          <div className="flex items-center justify-between text-[#8A949D]">
            <span>Relación de esbeltez (L/d):</span>
            <span className="text-[#FFD600] font-bold">{spanDepthRatio}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
