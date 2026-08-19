// ============================================================
// STV CLOSER — CUSTOM TRUSS GRAMMAR & GRAPH EDITOR MODAL
// CustomTrussEditorModal.tsx
// Interactive Custom Node & Member Creator for TR-18 / Custom Typologies
// ============================================================

import React, { useState } from 'react';
import { X, Plus, Trash2, GitCommit, Link, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ArchivedCustomNode, ArchivedCustomMember } from '../../../dst/design-archive';

interface CustomTrussEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNodes?: ArchivedCustomNode[];
  initialMembers?: ArchivedCustomMember[];
  onApplyCustomGraph: (nodes: ArchivedCustomNode[], members: ArchivedCustomMember[]) => void;
}

export const CustomTrussEditorModal: React.FC<CustomTrussEditorModalProps> = ({
  isOpen,
  onClose,
  initialNodes = [],
  initialMembers = [],
  onApplyCustomGraph
}) => {
  const [nodes, setNodes] = useState<ArchivedCustomNode[]>(() =>
    initialNodes.length > 0
      ? initialNodes
      : [
          { id: 'N-01', x: 0, y: 0, z: 0, role: 'SUPPORT' },
          { id: 'N-02', x: 7, y: 0, z: 0, role: 'CHORD_BOTTOM' },
          { id: 'N-03', x: 14, y: 0, z: 0, role: 'SUPPORT' },
          { id: 'N-04', x: 0, y: 1.2, z: 0, role: 'HEEL' },
          { id: 'N-05', x: 7, y: 2.4, z: 0, role: 'RIDGE' },
          { id: 'N-06', x: 14, y: 1.2, z: 0, role: 'HEEL' }
        ]
  );

  const [members, setMembers] = useState<ArchivedCustomMember[]>(() =>
    initialMembers.length > 0
      ? initialMembers
      : [
          { id: 'M-01', startNodeId: 'N-01', endNodeId: 'N-02', role: 'CHORD_BOTTOM' },
          { id: 'M-02', startNodeId: 'N-02', endNodeId: 'N-03', role: 'CHORD_BOTTOM' },
          { id: 'M-03', startNodeId: 'N-04', endNodeId: 'N-05', role: 'CHORD_TOP' },
          { id: 'M-04', startNodeId: 'N-05', endNodeId: 'N-06', role: 'CHORD_TOP' },
          { id: 'M-05', startNodeId: 'N-01', endNodeId: 'N-04', role: 'VERTICAL' },
          { id: 'M-06', startNodeId: 'N-02', endNodeId: 'N-05', role: 'VERTICAL' },
          { id: 'M-07', startNodeId: 'N-03', endNodeId: 'N-06', role: 'VERTICAL' },
          { id: 'M-08', startNodeId: 'N-01', endNodeId: 'N-05', role: 'DIAGONAL' },
          { id: 'M-09', startNodeId: 'N-03', endNodeId: 'N-05', role: 'DIAGONAL' }
        ]
  );

  const [newNodeX, setNewNodeX] = useState(0);
  const [newNodeY, setNewNodeY] = useState(0);
  const [newNodeRole, setNewNodeRole] = useState<'CHORD_TOP' | 'CHORD_BOTTOM' | 'RIDGE' | 'SUPPORT' | 'WEB_NODE'>('WEB_NODE');

  const [newMemberStart, setNewMemberStart] = useState(nodes[0]?.id || '');
  const [newMemberEnd, setNewMemberEnd] = useState(nodes[1]?.id || '');
  const [newMemberRole, setNewMemberRole] = useState<'CHORD_TOP' | 'CHORD_BOTTOM' | 'DIAGONAL' | 'VERTICAL' | 'STRUT' | 'TIE'>('DIAGONAL');

  if (!isOpen) return null;

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = `N-${String(nodes.length + 1).padStart(2, '0')}`;
    setNodes([...nodes, { id: nextId, x: newNodeX, y: newNodeY, z: 0, role: newNodeRole }]);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberStart === newMemberEnd) {
      alert('Los nodos de inicio y fin deben ser diferentes.');
      return;
    }
    const nextId = `M-${String(members.length + 1).padStart(2, '0')}`;
    setMembers([...members, { id: nextId, startNodeId: newMemberStart, endNodeId: newMemberEnd, role: newMemberRole }]);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id));
    setMembers(members.filter((m) => m.startNodeId !== id && m.endNodeId !== id));
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleConfirm = () => {
    onApplyCustomGraph(nodes, members);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono-tech">
      <div className="relative w-full max-w-4xl bg-[#030911] border border-[#FF3366]/50 rounded-lg shadow-[0_0_35px_rgba(255,51,102,0.3)] flex flex-col max-h-[88vh] text-[#F2F7F7] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-[#0D2235] bg-[#02050A]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#FF3366]" />
            <div>
              <div className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                <span>CUSTOM STRUCTURAL GRAMMAR EDITOR (TR-18)</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#FF3366]/20 text-[#FF3366] border border-[#FF3366]/40 rounded">
                  FREE-FORM GRAPH
                </span>
              </div>
              <div className="text-[10px] text-[#8A949D]">
                Definición explícita de nodos $(x,y,z)$, barras y conectividad topológica
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-[#8A949D] hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto text-xs">
          {/* Nodes Section */}
          <div className="flex flex-col gap-2 bg-[#02050A] p-3 rounded border border-[#0D2235]">
            <div className="flex items-center justify-between font-orbitron font-bold text-[#00E5FF] text-[11px]">
              <span className="flex items-center gap-1.5">
                <GitCommit className="w-4 h-4" />
                NODOS DEL GRAFO ({nodes.length})
              </span>
            </div>

            {/* Add Node Form */}
            <form onSubmit={handleAddNode} className="grid grid-cols-4 gap-1.5 pt-1">
              <div>
                <label className="text-[8px] text-[#8A949D]">X (m):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newNodeX}
                  onChange={(e) => setNewNodeX(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#010307] border border-[#0D2235] rounded p-1 text-[10px] text-white"
                />
              </div>
              <div>
                <label className="text-[8px] text-[#8A949D]">Y (m):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newNodeY}
                  onChange={(e) => setNewNodeY(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#010307] border border-[#0D2235] rounded p-1 text-[10px] text-white"
                />
              </div>
              <div>
                <label className="text-[8px] text-[#8A949D]">Rol:</label>
                <select
                  value={newNodeRole}
                  onChange={(e) => setNewNodeRole(e.target.value as any)}
                  className="w-full bg-[#010307] border border-[#0D2235] rounded p-1 text-[10px] text-white"
                >
                  <option value="SUPPORT">APOYO</option>
                  <option value="RIDGE">CUMBRERA</option>
                  <option value="CHORD_BOTTOM">CUERDA INF</option>
                  <option value="CHORD_TOP">CUERDA SUP</option>
                  <option value="WEB_NODE">ALMA</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1 bg-[#00E5FF] hover:bg-white text-black font-orbitron font-bold text-[9px] rounded flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  AGREGAR
                </button>
              </div>
            </form>

            {/* Nodes Table */}
            <div className="flex-1 overflow-y-auto max-h-56 border border-[#0D2235] rounded">
              <table className="w-full text-left text-[9px]">
                <thead className="bg-[#051829] text-[#00E5FF]">
                  <tr>
                    <th className="p-1.5">ID</th>
                    <th className="p-1.5">X</th>
                    <th className="p-1.5">Y</th>
                    <th className="p-1.5">ROL</th>
                    <th className="p-1.5 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0D2235]">
                  {nodes.map((n) => (
                    <tr key={n.id} className="hover:bg-[#030911]">
                      <td className="p-1.5 font-bold text-[#FFD600]">{n.id}</td>
                      <td className="p-1.5 text-white">{n.x.toFixed(2)}m</td>
                      <td className="p-1.5 text-white">{n.y.toFixed(2)}m</td>
                      <td className="p-1.5 text-[#8A949D]">{n.role}</td>
                      <td className="p-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteNode(n.id)}
                          className="text-[#FF3366] hover:text-white p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Members Section */}
          <div className="flex flex-col gap-2 bg-[#02050A] p-3 rounded border border-[#0D2235]">
            <div className="flex items-center justify-between font-orbitron font-bold text-[#FFD600] text-[11px]">
              <span className="flex items-center gap-1.5">
                <Link className="w-4 h-4" />
                BARRAS / ELEMENTOS ({members.length})
              </span>
            </div>

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="grid grid-cols-4 gap-1.5 pt-1">
              <div>
                <label className="text-[8px] text-[#8A949D]">Inicio:</label>
                <select
                  value={newMemberStart}
                  onChange={(e) => setNewMemberStart(e.target.value)}
                  className="w-full bg-[#010307] border border-[#0D2235] rounded p-1 text-[10px] text-white"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[8px] text-[#8A949D]">Fin:</label>
                <select
                  value={newMemberEnd}
                  onChange={(e) => setNewMemberEnd(e.target.value)}
                  className="w-full bg-[#010307] border border-[#0D2235] rounded p-1 text-[10px] text-white"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[8px] text-[#8A949D]">Rol:</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full bg-[#010307] border border-[#0D2235] rounded p-1 text-[10px] text-white"
                >
                  <option value="CHORD_TOP">CUERDA SUP</option>
                  <option value="CHORD_BOTTOM">CUERDA INF</option>
                  <option value="DIAGONAL">DIAGONAL</option>
                  <option value="VERTICAL">VERTICAL</option>
                  <option value="STRUT">PUNTAL</option>
                  <option value="TIE">TIRANTE</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1 bg-[#FFD600] hover:bg-white text-black font-orbitron font-bold text-[9px] rounded flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  CONECTAR
                </button>
              </div>
            </form>

            {/* Members Table */}
            <div className="flex-1 overflow-y-auto max-h-56 border border-[#0D2235] rounded">
              <table className="w-full text-left text-[9px]">
                <thead className="bg-[#051829] text-[#FFD600]">
                  <tr>
                    <th className="p-1.5">ID</th>
                    <th className="p-1.5">CONEXIÓN</th>
                    <th className="p-1.5">ROL</th>
                    <th className="p-1.5 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0D2235]">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-[#030911]">
                      <td className="p-1.5 font-bold text-[#00E5FF]">{m.id}</td>
                      <td className="p-1.5 text-white">{m.startNodeId} → {m.endNodeId}</td>
                      <td className="p-1.5 text-[#8A949D]">{m.role}</td>
                      <td className="p-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(m.id)}
                          className="text-[#FF3366] hover:text-white p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#0D2235] bg-[#02050A] flex items-center justify-between">
          <div className="text-[9px] text-[#8A949D]">
            Topología: <b className="text-white">{nodes.length} Nodos</b> | <b className="text-white">{members.length} Barras</b>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1 text-xs text-[#8A949D] hover:text-white">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-1.5 bg-[#FF3366] hover:bg-white text-white hover:text-black font-orbitron font-bold text-xs rounded transition-all shadow-[0_0_10px_#FF3366]"
            >
              APLICAR AL GRAFO DST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
