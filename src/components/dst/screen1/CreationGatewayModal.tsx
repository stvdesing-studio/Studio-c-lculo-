// ============================================================
// STV CLOSER — CREATION GATEWAY MODAL (3 FACES OF CREATION)
// CreationGatewayModal.tsx
// Implements Face 1 (Parametric), Face 2 (System), Face 3 (Custom)
// Single Source of Truth + Material Catalog Inspector
// ============================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Sliders,
  Workflow,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Box,
  Compass,
  Zap,
  ArrowRight,
  Info,
  FileText,
  Hammer,
  ShieldAlert,
  ChevronRight,
  Check,
  Eye,
  Settings2
} from 'lucide-react';
import { DSTProject, TrussType, SectionProfile } from '../../../dst/dst.schema';
import {
  MASTER_MATERIAL_CATALOG,
  MaterialCatalogItem,
  resolveSectionRepresentation
} from '../../../dst/material-catalog';

export type CreationFace = 'FACE_1_PARAMETRIC' | 'FACE_2_SYSTEM' | 'FACE_3_CUSTOM';

interface CreationGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DSTProject;
  params: {
    spanM: number;
    lengthM: number;
    heightM: number;
    framesCount: number;
    roofRiseM: number;
    trussType: TrussType;
    columnInclinationDeg: number;
    purlinSpacingM: number;
    columnProfile: SectionProfile;
    chordProfile: SectionProfile;
    webProfile: SectionProfile;
    purlinProfile: SectionProfile;
  };
  onUpdateParams: (updated: Partial<CreationGatewayModalProps['params']>) => void;
  onOpenDossier: () => void;
}

export const CreationGatewayModal: React.FC<CreationGatewayModalProps> = ({
  isOpen,
  onClose,
  project,
  params,
  onUpdateParams,
  onOpenDossier
}) => {
  const [activeFace, setActiveFace] = useState<CreationFace>('FACE_1_PARAMETRIC');
  const [activeSystemStep, setActiveSystemStep] = useState<number>(0);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('prod-mx-hss-6x4-14');
  const [inspectRole, setInspectRole] = useState<'COLUMN' | 'CHORD' | 'WEB' | 'PURLIN'>('COLUMN');

  // Active Catalog Item for Section Inspector
  const activeCatalogItem: MaterialCatalogItem = useMemo(() => {
    return MASTER_MATERIAL_CATALOG[selectedCatalogId] || MASTER_MATERIAL_CATALOG['prod-mx-hss-6x4-14'];
  }, [selectedCatalogId]);

  // Section representation data (2D Shape + SVG path)
  const sectionRep = useMemo(() => {
    return resolveSectionRepresentation(activeCatalogItem);
  }, [activeCatalogItem]);

  // Assign selected catalog item to structural role
  const handleAssignCatalogToRole = (role: 'COLUMN' | 'CHORD' | 'WEB' | 'PURLIN', item: MaterialCatalogItem) => {
    const newProfile: SectionProfile = {
      family: item.geometriaSeccion.tipoPerfil as any,
      designation: item.metadatos.nombreComercial,
      depth: { value: item.geometriaSeccion.altoTotal_mm / 1000, unit: 'm' },
      width: { value: item.geometriaSeccion.anchoTotal_mm / 1000, unit: 'm' },
      thickness: { value: item.geometriaSeccion.espesorPared_mm / 1000, unit: 'm' },
      catalogItemId: item.metadatos.id,
      weightKgM: item.geometriaSeccion.pesoLineal_kg_m
    };

    if (role === 'COLUMN') onUpdateParams({ columnProfile: newProfile });
    if (role === 'CHORD') onUpdateParams({ chordProfile: newProfile });
    if (role === 'WEB') onUpdateParams({ webProfile: newProfile });
    if (role === 'PURLIN') onUpdateParams({ purlinProfile: newProfile });
  };

  // Preset Typologies for Custom Mode
  const customPresets = [
    {
      id: 'PRESET-PERGOLA',
      name: 'Pérgola Arquitectónica Inclinada',
      desc: 'Marcos V-branch con 8° de inclinación, trabes tubulares HSS 6x4 y correas de sombra.',
      span: 14, length: 24, height: 6, frames: 5, rise: 0.8, type: 'WARREN' as TrussType, inc: 8
    },
    {
      id: 'PRESET-PORTAL',
      name: 'Nave Industrial de Gran Claro',
      desc: 'Pórtico a dos aguas con armadura Pratt optimizada y largueros Monten C a 1.25m.',
      span: 18, length: 36, height: 7.5, frames: 7, rise: 2.8, type: 'PRATT' as TrussType, inc: 0
    },
    {
      id: 'PRESET-CANTILEVER',
      name: 'Cubierta en Voladizo Especial',
      desc: 'Estructura asimétrica Howe para hangares y bahías de carga sin columnas frontales.',
      span: 12, length: 20, height: 5.5, frames: 4, rise: 1.8, type: 'HOWE' as TrussType, inc: 4
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-mono-tech select-none animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#02050A] border border-[#00E5FF]/60 rounded-sm shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden">
        {/* 1. TOP HEADER & FACE SWITCHER TABS */}
        <div className="p-3 sm:p-4 bg-[#030911] border-b border-[#0D1C2A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#FFD600] text-black font-orbitron font-black text-sm flex items-center justify-center shadow-[0_0_12px_#FFD600]">
              01
            </div>
            <div>
              <div className="text-[9px] font-orbitron text-[#8A949D] tracking-widest uppercase">
                STV CLOSER — CREATION GATEWAY
              </div>
              <div className="text-sm font-orbitron font-bold text-white tracking-wider flex items-center gap-2">
                CONFIGURACIÓN MAESTRA DEL DIGITAL STRUCTURAL TWIN
                <span className="text-[8px] font-orbitron px-1.5 py-0.5 bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 rounded">
                  AISC 360-22
                </span>
              </div>
            </div>
          </div>

          {/* Three Faces Navigation Pills */}
          <div className="flex items-center bg-[#050C16] border border-[#0D2235] p-1 rounded-sm gap-1">
            <button
              type="button"
              onClick={() => setActiveFace('FACE_1_PARAMETRIC')}
              className={`px-3 py-1 text-xs font-orbitron font-bold rounded-sm transition-all flex items-center gap-1.5 ${
                activeFace === 'FACE_1_PARAMETRIC'
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.6)]'
                  : 'text-[#8A949D] hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>1. PARAMÉTRICO</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFace('FACE_2_SYSTEM')}
              className={`px-3 py-1 text-xs font-orbitron font-bold rounded-sm transition-all flex items-center gap-1.5 ${
                activeFace === 'FACE_2_SYSTEM'
                  ? 'bg-[#FFD600] text-black shadow-[0_0_12px_rgba(255,214,0,0.6)]'
                  : 'text-[#8A949D] hover:text-white'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>2. POR SISTEMA</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFace('FACE_3_CUSTOM')}
              className={`px-3 py-1 text-xs font-orbitron font-bold rounded-sm transition-all flex items-center gap-1.5 ${
                activeFace === 'FACE_3_CUSTOM'
                  ? 'bg-[#4CC9FF] text-black shadow-[0_0_12px_rgba(76,201,255,0.6)]'
                  : 'text-[#8A949D] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. CUSTOM / PRESETS</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded border border-[#0D1C2A] text-[#8A949D] hover:text-white hover:border-[#00E5FF] flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 2. BODY CONTENT: WORKSPACE SPLIT (CONFIGURATOR + 2D SECTION INSPECTOR) */}
        <div className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT PANE: ACTIVE CREATION FACE */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 border-b lg:border-b-0 lg:border-r border-[#0D1C2A]">
            {/* FACE 01: CREACIÓN PARAMÉTRICA */}
            {activeFace === 'FACE_1_PARAMETRIC' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#0D1C2A] pb-2">
                  <div className="text-xs font-orbitron text-[#00E5FF] font-bold tracking-wider">
                    PARÁMETROS GLOBALES DEL PROYECTO
                  </div>
                  <span className="text-[9px] text-[#8A949D]">ENLACE GEOMÉTRICO DETERMINISTA</span>
                </div>

                {/* Grid Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Claro (Span) */}
                  <div className="p-3 bg-[#03080E] border border-[#0D1C2A] rounded-sm space-y-1.5">
                    <div className="flex justify-between text-xs font-orbitron">
                      <span className="text-[#8A949D]">CLARO TRANSVERSAL (L):</span>
                      <span className="text-[#00E5FF] font-bold">{params.spanM.toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={30}
                      step={0.5}
                      value={params.spanM}
                      onChange={(e) => onUpdateParams({ spanM: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#06121C] accent-[#00E5FF]"
                    />
                    <div className="flex justify-between text-[8px] text-[#5E6872]">
                      <span>8m (Mínimo)</span>
                      <span>30m (Máximo)</span>
                    </div>
                  </div>

                  {/* Longitud (Length) */}
                  <div className="p-3 bg-[#03080E] border border-[#0D1C2A] rounded-sm space-y-1.5">
                    <div className="flex justify-between text-xs font-orbitron">
                      <span className="text-[#8A949D]">LONGITUD TOTAL (Y):</span>
                      <span className="text-[#00E5FF] font-bold">{params.lengthM.toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={60}
                      step={1}
                      value={params.lengthM}
                      onChange={(e) => onUpdateParams({ lengthM: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#06121C] accent-[#00E5FF]"
                    />
                    <div className="flex justify-between text-[8px] text-[#5E6872]">
                      <span>12m</span>
                      <span>60m</span>
                    </div>
                  </div>

                  {/* Altura de Columnas */}
                  <div className="p-3 bg-[#03080E] border border-[#0D1C2A] rounded-sm space-y-1.5">
                    <div className="flex justify-between text-xs font-orbitron">
                      <span className="text-[#8A949D]">ALTURA COLUMNAS (H):</span>
                      <span className="text-[#FFD600] font-bold">{params.heightM.toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={12}
                      step={0.5}
                      value={params.heightM}
                      onChange={(e) => onUpdateParams({ heightM: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#06121C] accent-[#FFD600]"
                    />
                  </div>

                  {/* Cantidad de Marcos */}
                  <div className="p-3 bg-[#03080E] border border-[#0D1C2A] rounded-sm space-y-1.5">
                    <div className="flex justify-between text-xs font-orbitron">
                      <span className="text-[#8A949D]">CANTIDAD DE MARCOS:</span>
                      <span className="text-[#FFD600] font-bold">{params.framesCount} pórticos</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={10}
                      step={1}
                      value={params.framesCount}
                      onChange={(e) => onUpdateParams({ framesCount: parseInt(e.target.value) })}
                      className="w-full h-1 bg-[#06121C] accent-[#FFD600]"
                    />
                  </div>

                  {/* Flecha / Peralte de Cubierta */}
                  <div className="p-3 bg-[#03080E] border border-[#0D1C2A] rounded-sm space-y-1.5">
                    <div className="flex justify-between text-xs font-orbitron">
                      <span className="text-[#8A949D]">FLECHA DE CUBIERTA (F):</span>
                      <span className="text-white font-bold">{params.roofRiseM.toFixed(2)} m</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={4.0}
                      step={0.1}
                      value={params.roofRiseM}
                      onChange={(e) => onUpdateParams({ roofRiseM: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#06121C] accent-[#00E5FF]"
                    />
                  </div>

                  {/* Inclinación de Columnas */}
                  <div className="p-3 bg-[#03080E] border border-[#0D1C2A] rounded-sm space-y-1.5">
                    <div className="flex justify-between text-xs font-orbitron">
                      <span className="text-[#8A949D]">INCLINACIÓN COLUMNAS:</span>
                      <span className="text-[#00E5FF] font-bold">{params.columnInclinationDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      step={1}
                      value={params.columnInclinationDeg}
                      onChange={(e) => onUpdateParams({ columnInclinationDeg: parseInt(e.target.value) })}
                      className="w-full h-1 bg-[#06121C] accent-[#00E5FF]"
                    />
                  </div>
                </div>

                {/* Material Assignment by Structural Role */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-orbitron text-[#FFD600] font-bold">
                    ASIGNACIÓN DE PERFILES POR ROL ESTRUCTURAL
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { role: 'COLUMN' as const, label: 'COLUMNAS', profile: params.columnProfile, color: 'border-[#00E5FF]' },
                      { role: 'CHORD' as const, label: 'CUERDAS', profile: params.chordProfile, color: 'border-[#FFD600]' },
                      { role: 'WEB' as const, label: 'DIAGONALES', profile: params.webProfile, color: 'border-[#4CC9FF]' },
                      { role: 'PURLIN' as const, label: 'LARGUEROS', profile: params.purlinProfile, color: 'border-[#AAB3BD]' }
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => {
                          setInspectRole(item.role);
                          if (item.profile.catalogItemId) {
                            setSelectedCatalogId(item.profile.catalogItemId);
                          }
                        }}
                        className={`p-2.5 bg-[#03080E] border rounded-sm text-left transition-all hover:bg-[#050C16] ${
                          inspectRole === item.role ? 'border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.4)]' : 'border-[#0D1C2A]'
                        }`}
                      >
                        <div className="text-[8px] font-orbitron text-[#8A949D]">{item.label}</div>
                        <div className="text-[10px] font-orbitron font-bold text-white truncate mt-1">
                          {item.profile.designation}
                        </div>
                        <div className="text-[8px] font-mono-tech text-[#00E5FF] mt-0.5">
                          {item.profile.weightKgM ? `${item.profile.weightKgM} kg/m` : 'Catálogo Activo'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FACE 02: CREACIÓN POR SISTEMA (STEP-BY-STEP WORKFLOW) */}
            {activeFace === 'FACE_2_SYSTEM' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#0D1C2A] pb-2">
                  <div className="text-xs font-orbitron text-[#FFD600] font-bold tracking-wider">
                    CONSTRUCTOR POR SUBSISTEMAS ESTRUCTURALES
                  </div>
                  <span className="text-[9px] text-[#8A949D]">FLUJO SECUENCIAL 01 A 05</span>
                </div>

                {/* Subsystem Steps Tabs */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 0, code: '01', name: 'CIMENTACIÓN' },
                    { id: 1, code: '02', name: 'COLUMNAS' },
                    { id: 2, code: '03', name: 'ARMADURAS' },
                    { id: 3, code: '04', name: 'LARGUEROS' },
                    { id: 4, code: '05', name: 'CUBIERTA' }
                  ].map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveSystemStep(step.id)}
                      className={`p-2 rounded-sm border text-center transition-all ${
                        activeSystemStep === step.id
                          ? 'bg-[#FFD600]/20 border-[#FFD600] text-white shadow-[0_0_10px_rgba(255,214,0,0.3)]'
                          : 'bg-[#03080E] border-[#0D1C2A] text-[#8A949D] hover:text-white'
                      }`}
                    >
                      <div className="text-[8px] font-orbitron font-bold text-[#FFD600]">{step.code}</div>
                      <div className="text-[8px] font-orbitron font-bold truncate mt-0.5">{step.name}</div>
                    </button>
                  ))}
                </div>

                {/* Step Sub-panel */}
                <div className="p-4 bg-[#03080E] border border-[#0D1C2A] rounded-sm space-y-4">
                  {activeSystemStep === 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-orbitron font-bold text-white flex items-center gap-2">
                        <Box className="w-4 h-4 text-[#00E5FF]" />
                        <span>SUBSISTEMA 01: CIMENTACIÓN Y PLACAS BASE</span>
                      </div>
                      <p className="text-[10px] text-[#8A949D] leading-relaxed">
                        Zapatas aisladas de concreto f'c=250 kg/cm² con pedestales rectangulares y anclas ASTM F1554 Gr. 55 embebidas.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-[#02050A] border border-[#0D1C2A] rounded">
                          <span className="text-[#8A949D]">Dimensiones Zapata:</span>
                          <div className="text-white font-bold mt-1">1.40 x 1.40 x 0.50 m</div>
                        </div>
                        <div className="p-2.5 bg-[#02050A] border border-[#0D1C2A] rounded">
                          <span className="text-[#8A949D]">Placa Base:</span>
                          <div className="text-[#FFD600] font-bold mt-1">PL 400x400x25 mm (ASTM A36)</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSystemStep === 1 && (
                    <div className="space-y-3">
                      <div className="text-xs font-orbitron font-bold text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#FFD600]" />
                        <span>SUBSISTEMA 02: COLUMNAS PRINCIPALES</span>
                      </div>
                      <p className="text-[10px] text-[#8A949D] leading-relaxed">
                        Definición de perfiles tubulares HSS/PTR o perfiles IPR para soportar cargas axiales y momentos de viento/sismo.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAssignCatalogToRole('COLUMN', MASTER_MATERIAL_CATALOG['prod-mx-hss-6x4-14'])}
                          className="flex-1 p-2 bg-[#02050A] border border-[#00E5FF] rounded text-left text-xs"
                        >
                          <div className="text-[#00E5FF] font-bold">HSS 6" x 4" Cal. 1/4"</div>
                          <div className="text-[9px] text-[#8A949D]">19.5 kg/m — ASTM A500 Gr. B</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignCatalogToRole('COLUMN', MASTER_MATERIAL_CATALOG['prod-mx-hss-4x4-14'])}
                          className="flex-1 p-2 bg-[#02050A] border border-[#0D1C2A] rounded text-left text-xs hover:border-[#00E5FF]"
                        >
                          <div className="text-white font-bold">HSS 4" x 4" Cal. 1/4"</div>
                          <div className="text-[9px] text-[#8A949D]">18.2 kg/m — ASTM A500 Gr. B</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSystemStep === 2 && (
                    <div className="space-y-3">
                      <div className="text-xs font-orbitron font-bold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#00E5FF]" />
                        <span>SUBSISTEMA 03: ARMADURA Y CUERDAS ESTRUCTURALES</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['WARREN', 'PRATT', 'HOWE', 'FINK'] as TrussType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => onUpdateParams({ trussType: t })}
                            className={`p-2 border rounded text-xs font-orbitron font-bold text-center ${
                              params.trussType === t
                                ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                                : 'bg-[#02050A] border-[#0D1C2A] text-[#8A949D]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSystemStep === 3 && (
                    <div className="space-y-3">
                      <div className="text-xs font-orbitron font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#4CC9FF]" />
                        <span>SUBSISTEMA 04: LARGUEROS / POLINES MONTEN</span>
                      </div>
                      <div className="flex justify-between text-xs font-orbitron">
                        <span className="text-[#8A949D]">SEPARACIÓN ENTRE LARGUEROS:</span>
                        <span className="text-[#4CC9FF] font-bold">{params.purlinSpacingM.toFixed(2)} m</span>
                      </div>
                      <input
                        type="range"
                        min={0.8}
                        max={1.8}
                        step={0.05}
                        value={params.purlinSpacingM}
                        onChange={(e) => onUpdateParams({ purlinSpacingM: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-[#06121C] accent-[#4CC9FF]"
                      />
                    </div>
                  )}

                  {activeSystemStep === 4 && (
                    <div className="space-y-3">
                      <div className="text-xs font-orbitron font-bold text-white flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-[#FFD600]" />
                        <span>SUBSISTEMA 05: CUBIERTA METÁLICA Y LÁMINAS</span>
                      </div>
                      <div className="p-3 bg-[#02050A] border border-[#0D1C2A] rounded space-y-1 text-xs">
                        <div className="text-[#FFD600] font-bold">Lámina R-101 Calibre 22 Galvanizada</div>
                        <div className="text-[9px] text-[#8A949D]">Peso propio: 7.56 kg/m² — Cumple AISI S100-16</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FACE 03: CREACIÓN CUSTOM / PRESETS */}
            {activeFace === 'FACE_3_CUSTOM' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#0D1C2A] pb-2">
                  <div className="text-xs font-orbitron text-[#4CC9FF] font-bold tracking-wider">
                    TIPOLOGÍAS Y TOPOLOGÍAS PREDEFINIDAS
                  </div>
                  <span className="text-[9px] text-[#8A949D]">CONFIGURACIÓN RÁPIDA DE MODELO</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {customPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onUpdateParams({
                          spanM: preset.span,
                          lengthM: preset.length,
                          heightM: preset.height,
                          framesCount: preset.frames,
                          roofRiseM: preset.rise,
                          trussType: preset.type,
                          columnInclinationDeg: preset.inc
                        });
                      }}
                      className="p-3 bg-[#03080E] border border-[#0D1C2A] rounded-sm hover:border-[#00E5FF] transition-all text-left group space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron text-xs font-bold text-white group-hover:text-[#00E5FF]">
                          {preset.name}
                        </span>
                        <span className="text-[9px] font-orbitron px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 rounded">
                          {preset.span}m x {preset.length}m
                        </span>
                      </div>
                      <p className="text-[9px] text-[#8A949D] leading-relaxed">
                        {preset.desc}
                      </p>
                      <div className="flex items-center gap-3 text-[8px] font-orbitron text-[#5E6872] pt-1">
                        <span>H = {preset.height}m</span>
                        <span>{preset.frames} marcos</span>
                        <span>Inclinación: {preset.inc}°</span>
                        <span>Armadura: {preset.type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANE: 2D CROSS-SECTION INSPECTOR & MATERIAL MASTER CATALOG */}
          <div className="w-full lg:w-[420px] bg-[#020408] p-4 sm:p-6 overflow-y-auto space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#0D1C2A] pb-2">
                <div className="text-xs font-orbitron text-[#00E5FF] font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>INSPECTOR 2D DE SECCIÓN REAL</span>
                </div>
                <span className="text-[8px] font-orbitron text-[#FFD600] px-1 bg-[#FFD600]/10 border border-[#FFD600]/30">
                  {activeCatalogItem.geometriaSeccion.tipoPerfil}
                </span>
              </div>

              {/* Master Catalog Selector Dropdown */}
              <div className="space-y-1">
                <label className="text-[8px] font-orbitron text-[#8A949D]">
                  ELEMENTO DEL CATÁLOGO MAESTRO:
                </label>
                <select
                  value={selectedCatalogId}
                  onChange={(e) => setSelectedCatalogId(e.target.value)}
                  className="w-full bg-[#03080E] border border-[#00E5FF]/40 text-xs font-orbitron text-white p-2 rounded-sm outline-none focus:border-[#00E5FF]"
                >
                  {Object.values(MASTER_MATERIAL_CATALOG).map((item) => (
                    <option key={item.metadatos.id} value={item.metadatos.id}>
                      {item.metadatos.nombreComercial}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2D Geometric Cross-Section Blueprint Box */}
              <div className="w-full h-44 bg-[#03070E] border border-[#0D2235] rounded-sm relative flex items-center justify-center p-3 overflow-hidden shadow-inner">
                {/* Blueprint grid background */}
                <div className="absolute inset-0 bg-[radial-gradient(#0D2235_1px,transparent_1px)] [background-size:8px_8px] opacity-40" />

                {/* SVG Cross-Section Render */}
                <svg
                  viewBox="-120 -120 240 240"
                  className="w-full h-full max-h-36 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] z-10"
                >
                  {/* Outer & Inner Profile */}
                  <path
                    d={sectionRep.svgPath}
                    fill="rgba(0, 229, 255, 0.15)"
                    stroke="#00E5FF"
                    strokeWidth="2.5"
                    fillRule="evenodd"
                  />

                  {/* Centroid Crosshair */}
                  <line x1="-30" y1="0" x2="30" y2="0" stroke="#FFD600" strokeWidth="1" strokeDasharray="3 2" />
                  <line x1="0" y1="-30" x2="0" y2="30" stroke="#FFD600" strokeWidth="1" strokeDasharray="3 2" />
                  <circle cx="0" cy="0" r="2.5" fill="#FFD600" />
                </svg>

                {/* Dimension callouts */}
                <div className="absolute top-2 left-2 text-[8px] font-mono-tech text-[#8A949D]">
                  H: <span className="text-white font-bold">{activeCatalogItem.geometriaSeccion.altoTotal_mm} mm</span>
                </div>
                <div className="absolute top-2 right-2 text-[8px] font-mono-tech text-[#8A949D]">
                  B: <span className="text-white font-bold">{activeCatalogItem.geometriaSeccion.anchoTotal_mm} mm</span>
                </div>
                <div className="absolute bottom-2 left-2 text-[8px] font-mono-tech text-[#8A949D]">
                  t: <span className="text-white font-bold">{activeCatalogItem.geometriaSeccion.espesorPared_mm} mm</span>
                </div>
                <div className="absolute bottom-2 right-2 text-[8px] font-mono-tech text-[#00E5FF]">
                  A: <span className="font-bold">{activeCatalogItem.geometriaSeccion.areaSeccion_cm2} cm²</span>
                </div>
              </div>

              {/* Physical & Mechanical Telemetry Table */}
              <div className="bg-[#03080E] border border-[#0D1C2A] p-2.5 rounded-sm space-y-2 text-[9px]">
                <div className="flex justify-between border-b border-[#0D1C2A] pb-1 font-orbitron">
                  <span className="text-[#8A949D]">PESO LINEAL:</span>
                  <span className="text-white font-bold">{activeCatalogItem.geometriaSeccion.pesoLineal_kg_m} kg/m</span>
                </div>
                <div className="flex justify-between border-b border-[#0D1C2A] pb-1 font-orbitron">
                  <span className="text-[#8A949D]">LÍMITE FLUENCIA (Fy):</span>
                  <span className="text-[#00E5FF] font-bold">{activeCatalogItem.propiedadesMecanicas.limiteFluencia_Fy_MPa} MPa</span>
                </div>
                <div className="flex justify-between border-b border-[#0D1C2A] pb-1 font-orbitron">
                  <span className="text-[#8A949D]">INERCIA Ix / Iy:</span>
                  <span className="text-white font-bold">
                    {activeCatalogItem.propiedadesEstructuralesSeccion.momentoInercia_Ix_cm4} / {activeCatalogItem.propiedadesEstructuralesSeccion.momentoInercia_Iy_cm4} cm⁴
                  </span>
                </div>
                <div className="flex justify-between font-orbitron">
                  <span className="text-[#8A949D]">RADIO DE GIRO rx / ry:</span>
                  <span className="text-white font-bold">
                    {activeCatalogItem.propiedadesEstructuralesSeccion.radioGiro_rx_cm} / {activeCatalogItem.propiedadesEstructuralesSeccion.radioGiro_ry_cm} cm
                  </span>
                </div>
              </div>

              {/* Assign to active role button */}
              <button
                type="button"
                onClick={() => handleAssignCatalogToRole(inspectRole, activeCatalogItem)}
                className="w-full py-2 bg-[#00E5FF]/20 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black font-orbitron text-xs font-bold rounded-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ASIGNAR A {inspectRole}</span>
              </button>
            </div>

            {/* Semantic Audit & Handoff Footer */}
            <div className="space-y-3 pt-3 border-t border-[#0D1C2A]">
              {/* Audit Status Bar */}
              <div className="p-2.5 bg-[#03080E] border border-[#00E5FF]/40 rounded-sm flex items-center justify-between text-[9px] font-orbitron">
                <div className="flex items-center gap-1.5 text-[#00E5FF]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AUDITORÍA: DEFINED (VÁLIDO)</span>
                </div>
                <span className="text-[#8A949D]">8 APOYOS / 8 BASES</span>
              </div>

              {/* Continue to Foundation Action Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDossier();
                }}
                className="w-full py-2.5 bg-[#FFD600] text-black font-orbitron font-black text-xs rounded-sm hover:bg-[#FFE033] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,214,0,0.6)]"
              >
                <span>CONTINUAR A CIMENTACIÓN (HANDOFF)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
