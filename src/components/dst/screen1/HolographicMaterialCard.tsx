// ============================================================
// STV CLOSER — HOLOGRAPHIC MATERIAL REGISTRY HUD CARD
// HolographicMaterialCard.tsx
// Real-time Material Registry Query & Telemetry HUD on Component Click
// ============================================================

import React, { useState } from 'react';
import {
  MaterialCatalogItem,
  getMaterialCatalogItem
} from '../../../dst/material-catalog';
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  Cpu,
  BarChart3,
  Scale,
  DollarSign,
  Tag
} from 'lucide-react';

interface HolographicMaterialCardProps {
  catalogItemId: string;
  memberId?: string;
  memberRole?: string;
  position?: { x: number; y: number };
  onClose: () => void;
  onSelectForApplication?: (item: MaterialCatalogItem) => void;
}

export const HolographicMaterialCard: React.FC<HolographicMaterialCardProps> = ({
  catalogItemId,
  memberId,
  memberRole,
  position,
  onClose,
  onSelectForApplication
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'MECHANICAL' | 'SECTION' | 'SUPPLY'>('MECHANICAL');

  const item: MaterialCatalogItem = getMaterialCatalogItem(catalogItemId);

  const handleCopySku = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(item.metadatos.sku);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const stylePos: React.CSSProperties = position
    ? {
        position: 'absolute',
        left: `${Math.max(20, Math.min(position.x - 170, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 390))}px`,
        top: `${Math.max(60, Math.min(position.y - 120, (typeof window !== 'undefined' ? window.innerHeight : 800) - 450))}px`,
        zIndex: 35
      }
    : {
        position: 'absolute',
        left: '24px',
        bottom: '90px',
        zIndex: 35
      };

  return (
    <div
      style={stylePos}
      className="w-84 sm:w-92 bg-[#020509]/95 backdrop-blur-xl border border-[#00E5FF]/40 rounded-none shadow-[0_0_35px_rgba(0,229,255,0.22)] overflow-hidden font-mono-tech text-[10px] select-none transition-all duration-200"
    >
      {/* Top Holographic Header */}
      <div className="p-2.5 bg-gradient-to-r from-[#00E5FF]/20 via-[#071320] to-[#020509] border-b border-[#00E5FF]/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]" />
          <div className="flex flex-col">
            <span className="text-[11px] font-orbitron font-bold text-[#F2F7F7] flex items-center gap-1.5">
              <span>{memberRole ? memberRole : 'REGISTRO DE MATERIAL'}</span>
              {memberId && (
                <span className="text-[9px] px-1 py-0.2 bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                  {memberId}
                </span>
              )}
            </span>
            <span className="text-[8px] text-[#4CC9FF]">AISC 360-22 / ASTM VINCULADO</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-[#8A949D] hover:text-[#FF0055] hover:bg-[#FF0055]/10 transition-colors"
          title="Cerrar Ficha"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main Commercial Name & SKU Bar */}
      <div className="p-3 bg-[#050A12] border-b border-[#0D1A29] space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[12px] font-orbitron font-black text-[#00E5FF]">
              {item.metadatos.nombreComercial}
            </div>
            <div className="text-[9px] text-[#8A949D]">
              {item.metadatos.categoria} • {item.geometriaSeccion.tipoPerfil}
            </div>
          </div>
          <span className="px-1.5 py-0.5 bg-[#39E58C]/15 text-[#39E58C] border border-[#39E58C]/30 text-[8px] font-bold">
            {item.estabilidadYEsbeltez?.clasificacionSeccionAISC || 'COMPACTA'}
          </span>
        </div>

        {/* SKU Copy pill */}
        <div className="flex items-center justify-between px-2 py-1 bg-[#020509] border border-[#112438]">
          <span className="text-[8.5px] text-[#8A949D] font-mono-tech truncate max-w-[210px]">
            SKU: <span className="text-[#F2F7F7] font-bold">{item.metadatos.sku}</span>
          </span>
          <button
            onClick={handleCopySku}
            className="text-[8px] text-[#00E5FF] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {copied ? <CheckCircle2 size={10} className="text-[#39E58C]" /> : <Copy size={10} />}
            {copied ? 'COPIADO' : 'COPIAR'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#0D1A29] bg-[#020509]">
        <button
          onClick={() => setActiveTab('MECHANICAL')}
          className={`flex-1 py-1.5 text-center text-[9px] font-orbitron font-bold transition-all ${
            activeTab === 'MECHANICAL'
              ? 'text-[#00E5FF] border-b-2 border-[#00E5FF] bg-[#00E5FF]/10'
              : 'text-[#8A949D] hover:text-[#F2F7F7]'
          }`}
        >
          MECÁNICAS
        </button>
        <button
          onClick={() => setActiveTab('SECTION')}
          className={`flex-1 py-1.5 text-center text-[9px] font-orbitron font-bold transition-all ${
            activeTab === 'SECTION'
              ? 'text-[#00E5FF] border-b-2 border-[#00E5FF] bg-[#00E5FF]/10'
              : 'text-[#8A949D] hover:text-[#F2F7F7]'
          }`}
        >
          SECCIÓN
        </button>
        <button
          onClick={() => setActiveTab('SUPPLY')}
          className={`flex-1 py-1.5 text-center text-[9px] font-orbitron font-bold transition-all ${
            activeTab === 'SUPPLY'
              ? 'text-[#00E5FF] border-b-2 border-[#00E5FF] bg-[#00E5FF]/10'
              : 'text-[#8A949D] hover:text-[#F2F7F7]'
          }`}
        >
          SUMINISTRO
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-3 space-y-2.5 max-h-56 overflow-y-auto">
        {activeTab === 'MECHANICAL' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 bg-[#050A12] border border-[#0D1A29]">
                <div className="text-[8px] text-[#8A949D]">ESPECIFICACIÓN ASTM</div>
                <div className="text-[11px] font-orbitron font-bold text-[#F2F7F7]">
                  {item.propiedadesMecanicas.tipoAcero}
                </div>
              </div>
              <div className="p-2 bg-[#050A12] border border-[#0D1A29]">
                <div className="text-[8px] text-[#8A949D]">FLUENCIA (Fy)</div>
                <div className="text-[11px] font-orbitron font-bold text-[#00E5FF]">
                  {item.propiedadesMecanicas.limiteFluencia_Fy_MPa} MPa
                </div>
              </div>
              <div className="p-2 bg-[#050A12] border border-[#0D1A29]">
                <div className="text-[8px] text-[#8A949D]">TENSIÓN ÚLTIMA (Fu)</div>
                <div className="text-[11px] font-orbitron font-bold text-[#F2F7F7]">
                  {item.propiedadesMecanicas.resistenciaTraccion_Fu_MPa} MPa
                </div>
              </div>
              <div className="p-2 bg-[#050A12] border border-[#0D1A29]">
                <div className="text-[8px] text-[#8A949D]">MÓDULO ELASTICIDAD (E)</div>
                <div className="text-[11px] font-orbitron font-bold text-[#FFD600]">
                  {item.propiedadesMecanicas.moduloElasticidad_E_GPa} GPa
                </div>
              </div>
            </div>

            <div className="p-2 bg-[#050A12] border border-[#0D1A29] flex items-center justify-between text-[8.5px]">
              <span className="text-[#8A949D]">ALONGAMIENTO MÍNIMO:</span>
              <span className="text-[#39E58C] font-bold">{item.propiedadesMecanicas.elongacionMinima_porcentaje}%</span>
            </div>
          </div>
        )}

        {activeTab === 'SECTION' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 bg-[#050A12] border border-[#0D1A29]">
                <div className="text-[8px] text-[#8A949D]">PESO LINEAL</div>
                <div className="text-[11px] font-orbitron font-bold text-[#39E58C]">
                  {item.geometriaSeccion.pesoLineal_kg_m} kg/m
                </div>
              </div>
              <div className="p-2 bg-[#050A12] border border-[#0D1A29]">
                <div className="text-[8px] text-[#8A949D]">ÁREA TOTAL</div>
                <div className="text-[11px] font-orbitron font-bold text-[#F2F7F7]">
                  {item.geometriaSeccion.areaSeccion_cm2} cm²
                </div>
              </div>
              <div className="p-2 bg-[#050A12] border border-[#0D1A29]">
                <div className="text-[8px] text-[#8A949D]">INERCIA Ix</div>
                <div className="text-[11px] font-orbitron font-bold text-[#00E5FF]">
                  {item.propiedadesEstructuralesSeccion.momentoInercia_Ix_cm4} cm⁴
                </div>
              </div>
              <div className="p-2 bg-[#050A12] border border-[#0D1A29]">
                <div className="text-[8px] text-[#8A949D]">MÓDULO PLÁSTICO Zx</div>
                <div className="text-[11px] font-orbitron font-bold text-[#00E5FF]">
                  {item.propiedadesEstructuralesSeccion.moduloSeccionPlastico_Zx_cm3} cm³
                </div>
              </div>
            </div>

            <div className="p-2 bg-[#050A12] border border-[#0D1A29] grid grid-cols-3 gap-1 text-[8px] text-center">
              <div>
                <span className="text-[#8A949D] block">ALTO (H)</span>
                <span className="text-[#F2F7F7] font-bold">{item.geometriaSeccion.altoTotal_mm} mm</span>
              </div>
              <div>
                <span className="text-[#8A949D] block">ANCHO (B)</span>
                <span className="text-[#F2F7F7] font-bold">{item.geometriaSeccion.anchoTotal_mm} mm</span>
              </div>
              <div>
                <span className="text-[#8A949D] block">ESPESOR (t)</span>
                <span className="text-[#F2F7F7] font-bold">{item.geometriaSeccion.espesorPared_mm} mm</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SUPPLY' && (
          <div className="space-y-2">
            <div className="p-2 bg-[#050A12] border border-[#0D1A29] space-y-1">
              <div className="flex justify-between text-[8.5px]">
                <span className="text-[#8A949D]">PROVEEDOR / MOLINO:</span>
                <span className="text-[#F2F7F7] font-bold">{item.metadatos.fabricanteOProveedor}</span>
              </div>
              <div className="flex justify-between text-[8.5px]">
                <span className="text-[#8A949D]">UNIDAD DE VENTA:</span>
                <span className="text-[#00E5FF] font-bold">{item.metadatos.unidadVenta}</span>
              </div>
              <div className="flex justify-between text-[8.5px]">
                <span className="text-[#8A949D]">PRECIO ESTIMADO:</span>
                <span className="text-[#39E58C] font-bold font-orbitron">
                  ${item.metadatos.precioUnitarioEstimadoMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>

            <div className="p-2 bg-[#03070E] border border-dashed border-[#00E5FF]/30 text-[8px] text-[#8A949D] leading-relaxed">
              <span className="text-[#00E5FF] font-bold block mb-0.5">APLICACIÓN RECOMENDADA:</span>
              {item.aplicacionRecomendada.join(' • ')}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-2.5 bg-[#03060B] border-t border-[#0D1A29] flex items-center justify-between gap-2">
        <div className="text-[8px] text-[#8A949D] flex items-center gap-1">
          <ShieldCheck size={11} className="text-[#39E58C]" />
          <span>CATALOG_ITEM_ID BINDING: OK</span>
        </div>
        {onSelectForApplication && (
          <button
            onClick={() => onSelectForApplication(item)}
            className="px-2 py-1 bg-[#00E5FF]/20 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-[#020509] border border-[#00E5FF] text-[8.5px] font-orbitron font-bold transition-all"
          >
            USAR ESTE PERFIL
          </button>
        )}
      </div>
    </div>
  );
};
