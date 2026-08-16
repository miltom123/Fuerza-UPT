"use client";

import { useState } from "react";
import {
  Activity,
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import type { RepresentationItem } from "@/types";
import { Button } from "@/components/ui/button";

export interface RepresentationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: RepresentationItem[];
  initialItem?: RepresentationItem | null;
  initialTab?: "ALL" | "SEGUIMIENTO" | "LOGROS" | "DOCUMENTOS";
}

export function RepresentationDetailModal({
  isOpen,
  onClose,
  items,
  initialItem,
  initialTab = "ALL",
}: RepresentationDetailModalProps) {
  const [selectedItem, setSelectedItem] = useState<RepresentationItem | null>(initialItem || null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "SEGUIMIENTO" | "LOGROS" | "DOCUMENTOS">(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("ALL");

  if (!isOpen) return null;

  // Filter items based on active tab, search, and kind
  const filteredItems = items.filter((item) => {
    // Search query
    const searchMatch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.identifiedProblem && item.identifiedProblem.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.proposalOrManagement && item.proposalOrManagement.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!searchMatch) return false;

    // Kind filter
    if (kindFilter !== "ALL" && item.kind !== kindFilter) return false;

    // Tab filter
    if (activeFilter === "SEGUIMIENTO") {
      return (
        item.kind === "SEGUIMIENTO" ||
        item.kind === "GESTION" ||
        item.progress === "EN_SEGUIMIENTO" ||
        item.progress === "EN_EVALUACION" ||
        item.progress === "PRESENTADO"
      );
    }
    if (activeFilter === "LOGROS") {
      return item.kind === "LOGRO" || item.progress === "LOGRADO" || item.progress === "APROBADO" || item.progress === "CERRADO";
    }
    if (activeFilter === "DOCUMENTOS") {
      return item.kind === "ACUERDO" || item.kind === "PRONUNCIAMIENTO" || item.kind === "ASAMBLEA" || (item.evidenceUrls && item.evidenceUrls.length > 0);
    }

    return true;
  });

  const activeItemToDisplay = selectedItem || filteredItems[0] || items[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                  Legado Fuerza UPT
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                  {items.length} registros
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Detalle y Seguimiento de Gestiones Estudiantiles
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar ventana"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* MODAL SUB-HEADER: TABS & SEARCH */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-3">
          {/* Tab Filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => {
                setActiveFilter("ALL");
                setSelectedItem(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "ALL"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
              }`}
            >
              Todos
            </button>

            <button
              onClick={() => {
                setActiveFilter("SEGUIMIENTO");
                setSelectedItem(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "SEGUIMIENTO"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
              }`}
            >
              <Activity className="size-3.5" /> En seguimiento
            </button>

            <button
              onClick={() => {
                setActiveFilter("LOGROS");
                setSelectedItem(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "LOGROS"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
              }`}
            >
              <Trophy className="size-3.5" /> Logros y resultados
            </button>

            <button
              onClick={() => {
                setActiveFilter("DOCUMENTOS");
                setSelectedItem(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "DOCUMENTOS"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
              }`}
            >
              <FileText className="size-3.5" /> Documentos y acuerdos
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2">
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">Todas las clases</option>
              <option value="LOGRO">LOGRO</option>
              <option value="PROPUESTA">PROPUESTA</option>
              <option value="GESTION">GESTIÓN</option>
              <option value="ACUERDO">ACUERDO</option>
              <option value="SEGUIMIENTO">SEGUIMIENTO</option>
              <option value="PRONUNCIAMIENTO">PRONUNCIAMIENTO</option>
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar propuesta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* MODAL MAIN CONTENT (SPLIT VIEW: LIST ON LEFT, EXPANDED DETAILS ON RIGHT) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT LIST COLUMN */}
          <div className="w-full sm:w-2/5 border-r border-slate-100 overflow-y-auto p-4 space-y-2.5 bg-slate-50/40">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <FileText className="size-8 mx-auto opacity-40" />
                <p className="text-xs font-bold text-slate-600">No se encontraron registros</p>
                <p className="text-[11px]">Prueba con otro término de búsqueda o categoría.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = activeItemToDisplay?.id === item.id;
                const isLogro = item.kind === "LOGRO" || item.progress === "LOGRADO" || item.progress === "APROBADO";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-100 scale-[1.01]"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isLogro
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-blue-50 text-blue-700 border border-blue-200/60"
                        }`}
                      >
                        {item.kind || "GESTIÓN"}
                      </span>

                      <span className="text-[10px] font-bold text-slate-400">
                        {item.progressPercentage ?? (isLogro ? 100 : 50)}%
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {item.title}
                    </h4>

                    {item.summary && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.summary}
                      </p>
                    )}

                    {/* Mini Progress Bar */}
                    <div className="mt-2.5 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isLogro ? "bg-emerald-500" : "bg-blue-600"}`}
                        style={{ width: `${item.progressPercentage ?? (isLogro ? 100 : 50)}%` }}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* RIGHT EXPANDED DETAILS COLUMN */}
          <div className="hidden sm:block sm:w-3/5 overflow-y-auto p-6 bg-white">
            {activeItemToDisplay ? (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* Header Category & Progress */}
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1 text-xs font-black text-blue-700">
                    {activeItemToDisplay.kind || "GESTIÓN"}
                  </span>

                  <div className="flex items-center gap-2">
                    {activeItemToDisplay.impactLevel && (
                      <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                        IMPACTO {activeItemToDisplay.impactLevel}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                      <TrendingUp className="size-3.5" />
                      <span>
                        {activeItemToDisplay.progress || "EN EVALUACIÓN"} (
                        {activeItemToDisplay.progressPercentage ?? 50}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Title & Summary */}
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {activeItemToDisplay.title}
                  </h3>
                  {activeItemToDisplay.summary && (
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {activeItemToDisplay.summary}
                    </p>
                  )}
                </div>

                {/* Implementation Progress Bar */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Activity className="size-3.5 text-blue-600" /> Progreso de implementación
                    </span>
                    <span className="font-extrabold text-blue-600">
                      {activeItemToDisplay.progressPercentage ?? 50}%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                      style={{ width: `${activeItemToDisplay.progressPercentage ?? 50}%` }}
                    />
                  </div>
                </div>

                {/* Problem & Solution Breakdown Card */}
                {(activeItemToDisplay.identifiedProblem || activeItemToDisplay.proposalOrManagement || activeItemToDisplay.result) && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 space-y-4 text-xs">
                    {/* Problem */}
                    {activeItemToDisplay.identifiedProblem && (
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                          <HelpCircle className="size-4 text-amber-500" /> Problema reportado por estudiantes:
                        </span>
                        <p className="pl-5 text-slate-600 font-normal leading-relaxed">
                          {activeItemToDisplay.identifiedProblem}
                        </p>
                      </div>
                    )}

                    {/* Proposal / Action Taken */}
                    {activeItemToDisplay.proposalOrManagement && (
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                          <Target className="size-4 text-blue-600" /> Propuesta / Gestión realizada:
                        </span>
                        <p className="pl-5 text-slate-600 font-normal leading-relaxed">
                          {activeItemToDisplay.proposalOrManagement}
                        </p>
                      </div>
                    )}

                    {/* Result */}
                    {activeItemToDisplay.result && (
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                          <Trophy className="size-4 text-emerald-600" /> Resultado alcanzado:
                        </span>
                        <p className="pl-5 text-slate-600 font-normal leading-relaxed">
                          {activeItemToDisplay.result}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Concrete Actions List */}
                {activeItemToDisplay.actionsTaken && activeItemToDisplay.actionsTaken.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600" /> Acciones concretas ejecutadas:
                    </h4>
                    <div className="grid gap-2">
                      {activeItemToDisplay.actionsTaken.map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 shadow-xs text-xs text-slate-700"
                        >
                          <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="size-2.5 stroke-[3]" />
                          </div>
                          <span className="font-medium leading-relaxed">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence & Documents */}
                {activeItemToDisplay.evidenceUrls && activeItemToDisplay.evidenceUrls.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FileCheck className="size-4 text-indigo-600" /> Documentos y actas oficiales:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeItemToDisplay.evidenceUrls.map((doc, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80"
                        >
                          <FileText className="size-3.5 text-red-500" />
                          <span>Documento adjunto #{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-xs">
                Selecciona un registro de la lista izquierda para ver su detalle completo.
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
          <p className="text-[11px] font-medium text-slate-500">
            Transparencia y rendición de cuentas permanente con la comunidad universitaria.
          </p>

          <Button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl"
          >
            Cerrar vista
          </Button>
        </div>
      </div>
    </div>
  );
}
