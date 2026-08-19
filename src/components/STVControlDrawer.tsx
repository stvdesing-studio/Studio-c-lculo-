/**
 * STV CLOSER SYSTEM — PARAMETRIC CONTROL DRAWER
 * Adjust structural span, length, clear height, roof pitch, load cases, and geotechnical profile.
 */

import React from 'react';
import { SynthesisRequest } from '../engine/STV_MotorSintesis';
import { STV_SSKC_DATABASE } from '../engine/database/STV_SSKC';
import { DEFAULT_SOIL_PRESETS } from '../engine/engines/STV_FoundationEngine';
import { X, Sliders, HardDrive, Compass, Layers, Sun, Eye, Sparkles } from 'lucide-react';

interface STVControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: SynthesisRequest;
  onChangeRequest: (updated: Partial<SynthesisRequest>) => void;
}

export const STVControlDrawer: React.FC<STVControlDrawerProps> = ({
  isOpen,
  onClose,
  request,
  onChangeRequest
}) => {
  if (!isOpen) return null;

  const whiteIntensity = request.whiteLightIntensity ?? 1.8;
  const colorTempK = request.colorTemperatureK ?? 5600;
  const aoDepth = request.aoDepth ?? 1.0;

  const getKelvinDescription = (k: number) => {
    if (k <= 5300) return 'WARM TECHNICAL (5200K)';
    if (k <= 5700) return 'D55 NEUTRAL SOLAR (5500K)';
    return 'CRISP INSPECTION WHITE (6000K)';
  };

  return (
    <div className="absolute top-12 left-4 z-40 w-96 max-h-[calc(100vh-4rem)] overflow-y-auto glass-panel-tech p-5 border border-[#00E6DE]/60 shadow-[0_0_25px_rgba(0,0,0,0.8)] font-orbitron text-[#F2F7F7] animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#006F73] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="text-[#00E6DE]" size={16} />
          <h3 className="text-xs font-bold tracking-widest text-[#8CFFFF]">PARAMETRIC SPECIFICATIONS</h3>
        </div>
        <button onClick={onClose} className="text-[#849492] hover:text-[#00E6DE] p-1 font-mono-tech">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-5 font-mono-tech text-xs">
        {/* 1. Geometry Section */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00E6DE] mb-2 font-orbitron">
            <Compass size={13} />
            <span>01. GEOMETRY & GRID SPACING</span>
          </div>

          <div className="space-y-3 bg-[#020607]/80 p-3 border border-[#006F73]/30">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#849492]">CLEAR SPAN (LUZ TRANSVERSAL X):</span>
                <span className="text-[#8CFFFF] font-bold">{request.spanM} m</span>
              </div>
              <input
                type="range"
                min={8.0}
                max={36.0}
                step={1.0}
                value={request.spanM}
                onChange={(e) => onChangeRequest({ spanM: parseFloat(e.target.value) })}
                className="w-full accent-[#00E6DE] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#849492]">BUILDING LENGTH (LONGITUD Z):</span>
                <span className="text-[#8CFFFF] font-bold">{request.lengthM} m</span>
              </div>
              <input
                type="range"
                min={10.0}
                max={60.0}
                step={2.0}
                value={request.lengthM}
                onChange={(e) => onChangeRequest({ lengthM: parseFloat(e.target.value) })}
                className="w-full accent-[#00E6DE] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#849492]">EAVE HEIGHT (ALTURA LIBRE Y):</span>
                <span className="text-[#8CFFFF] font-bold">{request.heightM} m</span>
              </div>
              <input
                type="range"
                min={3.5}
                max={12.0}
                step={0.5}
                value={request.heightM}
                onChange={(e) => onChangeRequest({ heightM: parseFloat(e.target.value) })}
                className="w-full accent-[#00E6DE] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#849492]">ROOF RISE / FLECHA (APEX):</span>
                <span className="text-[#8CFFFF] font-bold">{request.roofRiseM} m</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={7.0}
                step={0.25}
                value={request.roofRiseM}
                onChange={(e) => onChangeRequest({ roofRiseM: parseFloat(e.target.value) })}
                className="w-full accent-[#00E6DE] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#849492]">TRANSVERSE FRAMES (PÓRTICOS):</span>
                <span className="text-[#8CFFFF] font-bold">{request.framesCount}</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                step={1}
                value={request.framesCount}
                onChange={(e) => onChangeRequest({ framesCount: parseInt(e.target.value) })}
                className="w-full accent-[#00E6DE] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. Structural Column Profile Catalog */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8CFFFF] mb-2 font-orbitron">
            <HardDrive size={13} />
            <span>02. SSKC COLUMN SELECTION</span>
          </div>

          <select
            value={request.columnProfileId}
            onChange={(e) => onChangeRequest({ columnProfileId: e.target.value })}
            className="w-full bg-[#020607] border border-[#006F73] p-2 text-xs text-[#F2F7F7] focus:border-[#00E6DE] outline-none"
          >
            {Object.keys(STV_SSKC_DATABASE)
              .filter((k) => STV_SSKC_DATABASE[k].roles.includes('COLUMN'))
              .map((pId) => {
                const p = STV_SSKC_DATABASE[pId];
                return (
                  <option key={pId} value={pId}>
                    {p.designation} — {p.commercial.nombre}
                  </option>
                );
              })}
          </select>
        </div>

        {/* 3. Load Demand Parameters */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D7B52A] mb-2 font-orbitron">
            <Layers size={13} />
            <span>03. ASCE 7-16 LOAD DEMANDS</span>
          </div>

          <div className="space-y-3 bg-[#020607]/80 p-3 border border-[#006F73]/30">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#849492]">DEAD LOAD (D - CUBIERTA):</span>
                <span className="text-[#F2F7F7] font-bold">{request.roofDeadLoadKPa} kPa ({(request.roofDeadLoadKPa * 100).toFixed(0)} kg/m²)</span>
              </div>
              <input
                type="range"
                min={0.15}
                max={0.80}
                step={0.05}
                value={request.roofDeadLoadKPa}
                onChange={(e) => onChangeRequest({ roofDeadLoadKPa: parseFloat(e.target.value) })}
                className="w-full accent-[#D7B52A] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#849492]">LIVE LOAD (L - MANTENIMIENTO):</span>
                <span className="text-[#F2F7F7] font-bold">{request.roofLiveLoadKPa} kPa ({(request.roofLiveLoadKPa * 100).toFixed(0)} kg/m²)</span>
              </div>
              <input
                type="range"
                min={0.20}
                max={1.00}
                step={0.05}
                value={request.roofLiveLoadKPa}
                onChange={(e) => onChangeRequest({ roofLiveLoadKPa: parseFloat(e.target.value) })}
                className="w-full accent-[#D7B52A] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#849492]">WIND SPEED (VIENTO DE DISEÑO):</span>
                <span className="text-[#3CA9FF] font-bold">{request.windSpeedKmh} km/h</span>
              </div>
              <input
                type="range"
                min={80}
                max={200}
                step={5}
                value={request.windSpeedKmh}
                onChange={(e) => onChangeRequest({ windSpeedKmh: parseInt(e.target.value) })}
                className="w-full accent-[#3CA9FF] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Geotechnical Soil Classification */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#39E58C] mb-2 font-orbitron">
            <Layers size={13} />
            <span>04. GEOTECHNICAL SOIL PROFILE</span>
          </div>

          <select
            value={request.soilPresetKey}
            onChange={(e) => onChangeRequest({ soilPresetKey: e.target.value })}
            className="w-full bg-[#020607] border border-[#006F73] p-2 text-xs text-[#F2F7F7] focus:border-[#39E58C] outline-none"
          >
            {Object.keys(DEFAULT_SOIL_PRESETS).map((sKey) => {
              const soil = DEFAULT_SOIL_PRESETS[sKey];
              return (
                <option key={sKey} value={sKey}>
                  {soil.soilType} ({soil.bearingCapacityKPa} kPa)
                </option>
              );
            })}
          </select>
        </div>

        {/* 5. Global Lighting & Ambient Occlusion (AO) Engine */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8CFFFF] mb-2 font-orbitron">
            <div className="flex items-center gap-1.5">
              <Sun size={13} className="text-[#00E6DE]" />
              <span>05. GLOBAL LIGHTING & AO ENGINE</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 bg-[#00E6DE]/10 text-[#00E6DE] border border-[#00E6DE]/40">
              5200K-6000K
            </span>
          </div>

          <div className="space-y-3.5 bg-[#020607]/80 p-3 border border-[#006F73]/40">
            {/* White Light Intensity */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#849492]">TECHNICAL WHITE INTENSITY:</span>
                <span className="text-[#8CFFFF] font-bold">{whiteIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3.5}
                step={0.1}
                value={whiteIntensity}
                onChange={(e) => onChangeRequest({ whiteLightIntensity: parseFloat(e.target.value) })}
                className="w-full accent-[#00E6DE] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-[#849492] mt-0.5">
                <span>0.5x (Subdued)</span>
                <span>1.8x (Std)</span>
                <span>3.5x (Peak)</span>
              </div>
            </div>

            {/* Color Temperature (Kelvin 5200K - 6000K) */}
            <div>
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="text-[#849492]">SPECTRUM (KELVIN):</span>
                <span className="text-[#D7B52A] font-bold">{colorTempK}K</span>
              </div>
              <input
                type="range"
                min={5200}
                max={6000}
                step={50}
                value={colorTempK}
                onChange={(e) => onChangeRequest({ colorTemperatureK: parseInt(e.target.value) })}
                className="w-full accent-[#D7B52A] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[9px] mt-1 pt-1 border-t border-white/5">
                <span className="text-[#D7B52A]">{getKelvinDescription(colorTempK)}</span>
                <div 
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{
                    backgroundColor: colorTempK <= 5300 ? '#FFF1E0' : colorTempK <= 5700 ? '#F9FBFF' : '#F0F6FF'
                  }}
                  title={`Color Kelvin ${colorTempK}K`}
                />
              </div>
            </div>

            {/* AO Depth (Ambient Occlusion & Crevice Contrast) */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <div className="flex items-center gap-1">
                  <Eye size={11} className="text-[#00E6DE]" />
                  <span className="text-[#849492]">AO DEPTH / CREVICE CONTRAST:</span>
                </div>
                <span className="text-[#00E6DE] font-bold">{(aoDepth * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={2.0}
                step={0.05}
                value={aoDepth}
                onChange={(e) => onChangeRequest({ aoDepth: parseFloat(e.target.value) })}
                className="w-full accent-[#00E6DE] cursor-pointer"
              />
              <p className="text-[9px] text-[#849492] mt-1 leading-tight">
                Enhances shadow depth in complex nodes, gusset plates, weld seams & base anchors.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-[9px] font-bold text-[#8CFFFF] mb-1.5 flex items-center gap-1">
                <Sparkles size={10} className="text-[#00E6DE]" />
                <span>INSPECTION PRESETS:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <button
                  type="button"
                  onClick={() => onChangeRequest({ whiteLightIntensity: 2.4, colorTemperatureK: 6000, aoDepth: 1.8 })}
                  className="p-1.5 bg-[#041315] hover:bg-[#00E6DE]/20 text-[#8CFFFF] border border-[#00A8AA]/40 text-left transition-all"
                >
                  <div className="font-bold">INSPECTION</div>
                  <div className="text-[8px] text-[#849492]">6000K · AO 180%</div>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeRequest({ whiteLightIntensity: 1.8, colorTemperatureK: 5500, aoDepth: 1.0 })}
                  className="p-1.5 bg-[#041315] hover:bg-[#00E6DE]/20 text-[#F2F7F7] border border-[#00A8AA]/40 text-left transition-all"
                >
                  <div className="font-bold">STUDIO D55</div>
                  <div className="text-[8px] text-[#849492]">5500K · AO 100%</div>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeRequest({ whiteLightIntensity: 1.4, colorTemperatureK: 5200, aoDepth: 0.6 })}
                  className="p-1.5 bg-[#041315] hover:bg-[#00E6DE]/20 text-[#D7B52A] border border-[#00A8AA]/40 text-left transition-all"
                >
                  <div className="font-bold">LOW GLARE</div>
                  <div className="text-[8px] text-[#849492]">5200K · AO 60%</div>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeRequest({ whiteLightIntensity: 2.8, colorTemperatureK: 5800, aoDepth: 2.0 })}
                  className="p-1.5 bg-[#041315] hover:bg-[#00E6DE]/20 text-[#39E58C] border border-[#00A8AA]/40 text-left transition-all"
                >
                  <div className="font-bold">MAX DEPTH</div>
                  <div className="text-[8px] text-[#849492]">5800K · AO 200%</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
