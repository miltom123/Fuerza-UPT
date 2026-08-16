"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Clock,
  Eye,
  FilePenLine,
  FileText,
  Mail,
  MessageSquare,
  MousePointerClick,
  RefreshCw,
  RotateCcw,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { getAdminDashboard } from "@/services/admin/dashboard-service";
import type { AdminDashboardData, DailyVisitStat } from "@/types/admin-workflows";
import {
  AnimatedCounter,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";
import { Button } from "@/components/ui/button";

// Helper to compute Catmull-Rom smooth cubic bezier curve through points
function calculateChartPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return { lineD: "", areaD: "" };

  let lineD = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to Cubic Bezier conversion (smooth tension = 0.5)
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    lineD += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  const firstX = points[0].x.toFixed(1);
  const lastX = points[points.length - 1].x.toFixed(1);
  const areaD = `${lineD} L ${lastX},190 L ${firstX},190 Z`;

  return { lineD, areaD };
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Range state: "7D" | "30D" | "CUSTOM"
  const [preset, setPreset] = useState<"7D" | "30D" | "CUSTOM">("7D");
  const [customFrom, setCustomFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatDateISO(d);
  });
  const [customTo, setCustomTo] = useState<string>(() => formatDateISO(new Date()));

  const fetchStats = useCallback(async (fromDate?: string, toDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminDashboard(fromDate, toDate);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar la información del servidor PostgreSQL.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Compute actual date range to query
  useEffect(() => {
    if (preset === "7D") {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 6);
      fetchStats(formatDateISO(from), formatDateISO(to));
    } else if (preset === "30D") {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 29);
      fetchStats(formatDateISO(from), formatDateISO(to));
    } else {
      fetchStats(customFrom, customTo);
    }
  }, [preset, customFrom, customTo, fetchStats]);

  // Compute SVG chart coordinates (viewBox 0 0 800 230)
  const minX = 55;
  const maxX = 770;
  const minY = 25;
  const maxY = 190;

  const rawDailyVisits = data?.dailyVisits || [];
  const maxVisitValue = Math.max(...rawDailyVisits.map((d) => d.visits), 10);

  const chartPoints = rawDailyVisits.map((d, index) => {
    const x =
      rawDailyVisits.length > 1
        ? minX + (index / (rawDailyVisits.length - 1)) * (maxX - minX)
        : (minX + maxX) / 2;
    const y = maxY - (d.visits / maxVisitValue) * (maxY - minY);
    return { x, y, value: d.visits, label: d.label };
  });

  const { lineD, areaD } = calculateChartPath(chartPoints);

  const visitsCount = data?.visits ?? 0;
  const uniqueVisitorsCount = data?.uniqueVisitors ?? 0;
  const pageViewsCount = data?.pageViews ?? 0;
  const interactionsCount = data?.interactions ?? 0;
  const activePublications = data?.published ?? 0;
  const receivedForms = data?.submissionsSummary?.total ?? 0;

  const contentCounts = data?.content ?? {
    projects: 0,
    events: 0,
    representation: 0,
    opportunities: 0,
    team: 0,
    polls: 0,
  };

  const maxModuleCount = Math.max(...Object.values(contentCounts), 1);
  const avgDailyVisits =
    rawDailyVisits.length > 0 ? (visitsCount / rawDailyVisits.length).toFixed(1) : "0";

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      {/* HEADER TITLE BLOCK & REAL DATE SELECTOR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-fuerza-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              DATOS EN TIEMPO REAL
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-fuerza-navy sm:text-3xl">
            Centro de control Fuerza UPT
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Estadísticas reales obtenidas directamente de PostgreSQL (Zona horaria: America/Lima).
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-fuerza-border shadow-xs">
            <button
              type="button"
              onClick={() => setPreset("7D")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                preset === "7D"
                  ? "bg-fuerza-blue text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              onClick={() => setPreset("30D")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                preset === "30D"
                  ? "bg-fuerza-blue text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Últimos 30 días
            </button>
            <button
              type="button"
              onClick={() => setPreset("CUSTOM")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                preset === "CUSTOM"
                  ? "bg-fuerza-blue text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Personalizado
            </button>
          </div>

          {preset === "CUSTOM" && (
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-fuerza-border shadow-xs text-xs">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-slate-700 outline-none focus:border-fuerza-blue"
              />
              <span className="text-slate-400 font-bold">a</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-slate-700 outline-none focus:border-fuerza-blue"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (preset === "7D") {
                const to = new Date();
                const from = new Date();
                from.setDate(from.getDate() - 6);
                fetchStats(formatDateISO(from), formatDateISO(to));
              } else if (preset === "30D") {
                const to = new Date();
                const from = new Date();
                from.setDate(from.getDate() - 29);
                fetchStats(formatDateISO(from), formatDateISO(to));
              } else {
                fetchStats(customFrom, customTo);
              }
            }}
            title="Refrescar estadísticas"
            className="flex size-9 items-center justify-center rounded-2xl border border-fuerza-border bg-white text-slate-500 hover:text-fuerza-blue hover:bg-slate-50 shadow-xs transition"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin text-fuerza-blue" : ""}`} />
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fetchStats(customFrom, customTo)}
            className="rounded-xl text-xs font-bold bg-white text-red-700 border-red-200 hover:bg-red-100"
          >
            Reintentar
          </Button>
        </div>
      ) : null}

      {/* 1. TOP 5 METRIC CARDS ROW WITH ANIMATED COUNTER */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" staggerDelay={0.06}>
        {/* Card 1: Visitas del período */}
        <StaggerItem>
          <div className="group rounded-3xl border border-fuerza-border bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-fuerza-blue transition-colors group-hover:bg-fuerza-blue group-hover:text-white">
                <TrendingUp className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PostgreSQL</span>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Visitas del período</p>
            <p className="mt-1 text-3xl font-extrabold text-fuerza-navy">
              {loading ? "..." : <AnimatedCounter value={visitsCount} />}
            </p>
            <p className="mt-3 text-xs text-slate-400">Páginas públicas consultadas</p>
          </div>
        </StaggerItem>

        {/* Card 2: Visitantes únicos */}
        <StaggerItem>
          <div className="group rounded-3xl border border-fuerza-border bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                <Users className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">HMAC Privado</span>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Visitantes únicos</p>
            <p className="mt-1 text-3xl font-extrabold text-fuerza-navy">
              {loading ? "..." : <AnimatedCounter value={uniqueVisitorsCount} />}
            </p>
            <p className="mt-3 text-xs text-slate-400">Dispositivos en el período</p>
          </div>
        </StaggerItem>

        {/* Card 3: Interacciones */}
        <StaggerItem>
          <div className="group rounded-3xl border border-fuerza-border bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <MessageSquare className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Participación</span>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Interacciones</p>
            <p className="mt-1 text-3xl font-extrabold text-fuerza-navy">
              {loading ? "..." : <AnimatedCounter value={interactionsCount} />}
            </p>
            <p className="mt-3 text-xs text-slate-400">Formularios y votos registrados</p>
          </div>
        </StaggerItem>

        {/* Card 4: Publicaciones activas */}
        <StaggerItem>
          <div className="group rounded-3xl border border-fuerza-border bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                <FileText className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Activas</span>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Publicaciones activas</p>
            <p className="mt-1 text-3xl font-extrabold text-fuerza-navy">
              {loading ? "..." : <AnimatedCounter value={activePublications} />}
            </p>
            <p className="mt-3 text-xs text-slate-400">Contenido público visible</p>
          </div>
        </StaggerItem>

        {/* Card 5: Formularios recibidos */}
        <StaggerItem>
          <div className="group rounded-3xl border border-fuerza-border bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-500 group-hover:text-white">
                <Mail className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-500">Enviados</span>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Formularios recibidos</p>
            <p className="mt-1 text-3xl font-extrabold text-fuerza-navy">
              {loading ? "..." : <AnimatedCounter value={receivedForms} />}
            </p>
            <p className="mt-3 text-xs text-slate-400">En el período seleccionado</p>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* 2. MIDDLE SECTION: MAIN CHART & PERIOD SUMMARY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Chart Card (Visitas por fecha) */}
        <div className="flex flex-col justify-between rounded-3xl border border-fuerza-border bg-white p-6 shadow-xs lg:col-span-8">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-fuerza-navy">Visitas por fecha</h2>
                <p className="text-xs text-slate-400">
                  Historial real de visitas diarias obtenidas de PostgreSQL
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                {rawDailyVisits.length} días analizados
              </span>
            </div>

            {/* SVG Line Chart Container */}
            <div className="relative mt-6 h-64 w-full">
              {loading ? (
                <div className="flex size-full items-center justify-center text-slate-400 text-xs font-bold">
                  Cargando gráfico de visitas...
                </div>
              ) : visitsCount === 0 ? (
                <div className="flex size-full flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <Activity className="size-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    Aún no hay visitas registradas en este período.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Las visitas a las páginas públicas del portal se registrarán automáticamente aquí.
                  </p>
                </div>
              ) : (
                <svg className="h-full w-full" viewBox="0 0 800 230">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#397DFD" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#397DFD" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Y-Axis Grid Lines & Labels */}
                  {[
                    { label: String(Math.round(maxVisitValue)), y: 25 },
                    { label: String(Math.round(maxVisitValue * 0.75)), y: 66 },
                    { label: String(Math.round(maxVisitValue * 0.5)), y: 107 },
                    { label: String(Math.round(maxVisitValue * 0.25)), y: 148 },
                    { label: "0", y: 190 },
                  ].map((grid, idx) => (
                    <g key={idx}>
                      <line
                        x1="45"
                        y1={grid.y}
                        x2="775"
                        y2={grid.y}
                        stroke={idx === 4 ? "#e2e8f0" : "#f1f5f9"}
                        strokeDasharray={idx === 4 ? "none" : "4 4"}
                        strokeWidth="1"
                      />
                      <text
                        x="35"
                        y={grid.y + 4}
                        fill="#94a3b8"
                        fontSize="11"
                        fontFamily="system-ui"
                        textAnchor="end"
                      >
                        {grid.label}
                      </text>
                    </g>
                  ))}

                  {/* Smooth Area Gradient Fill */}
                  <path d={areaD} fill="url(#chartGradient)" />

                  {/* Smooth Line Path */}
                  <path
                    d={lineD}
                    fill="none"
                    stroke="#397DFD"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points (100% aligned with curve!) */}
                  {chartPoints.map((pt, idx) => (
                    <g key={idx} className="group/pt cursor-pointer">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#ffffff"
                        stroke="#397DFD"
                        strokeWidth="2.5"
                        className="transition-all duration-200 group-hover/pt:r-6 group-hover/pt:fill-fuerza-blue"
                      />
                      {/* Tooltip on hover */}
                      <title>{`${pt.label}: ${pt.value} visitas`}</title>
                    </g>
                  ))}

                  {/* X-Axis Labels (Aligned with dates) */}
                  {chartPoints
                    .filter((_, i) => {
                      if (chartPoints.length <= 8) return true;
                      return i % Math.ceil(chartPoints.length / 8) === 0 || i === chartPoints.length - 1;
                    })
                    .map((pt, idx) => (
                      <text
                        key={idx}
                        x={pt.x}
                        y="218"
                        fill="#94a3b8"
                        fontSize="11"
                        fontFamily="system-ui"
                        textAnchor="middle"
                      >
                        {pt.label}
                      </text>
                    ))}
                </svg>
              )}
            </div>
          </div>

          {/* Sub-Metrics Footer Row (100% REAL) */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-fuerza-blue">
                <Activity className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Visitas totales</p>
                <p className="text-sm font-bold text-fuerza-navy">{visitsCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Users className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Visitantes únicos</p>
                <p className="text-sm font-bold text-fuerza-navy">{uniqueVisitorsCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Eye className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Páginas vistas</p>
                <p className="text-sm font-bold text-fuerza-navy">{pageViewsCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Interacciones</p>
                <p className="text-sm font-bold text-fuerza-navy">{interactionsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen del Período Card (100% REAL) */}
        <div className="flex flex-col justify-between rounded-3xl border border-fuerza-border bg-white p-6 shadow-xs lg:col-span-4">
          <div>
            <h2 className="text-lg font-bold text-fuerza-navy">Resumen del período</h2>

            <div className="mt-6 space-y-6">
              {/* Item 1: Publicaciones */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-fuerza-blue">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Publicaciones activas</p>
                    <p className="text-lg font-bold text-fuerza-navy">{activePublications}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
                  {data?.drafts ?? 0} borradores
                </span>
              </div>

              {/* Item 2: Interacciones */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <MessageSquare className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Interacciones totales</p>
                    <p className="text-lg font-bold text-fuerza-navy">{interactionsCount}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                  {receivedForms} formularios
                </span>
              </div>

              {/* Item 3: Formularios */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Pendientes de revisión</p>
                    <p className="text-lg font-bold text-fuerza-navy">{data?.pendingSubmissions ?? 0}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl">
                  {data?.pendingSubmissions ?? 0} nuevos
                </span>
              </div>

              {/* Item 4: Promedio diario de visitas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <TrendingUp className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Promedio diario de visitas</p>
                    <p className="text-lg font-bold text-fuerza-navy">{avgDailyVisits}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                  visitas / día
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: 3 COLUMNS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Column 1: Publicaciones por módulo (100% REAL) */}
        <div className="flex flex-col justify-between rounded-3xl border border-fuerza-border bg-white p-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-fuerza-navy">Publicaciones por módulo</h2>

            <div className="mt-5 space-y-4">
              {[
                { key: "projects", label: "Proyectos", val: contentCounts.projects ?? 0, href: "/administracion/proyectos" },
                { key: "events", label: "Eventos", val: contentCounts.events ?? 0, href: "/administracion/eventos" },
                { key: "representation", label: "Legado Fuerza UPT", val: contentCounts.representation ?? 0, href: "/administracion/representacion-estudiantil" },
                { key: "opportunities", label: "Becas y oportunidades", val: contentCounts.opportunities ?? 0, href: "/administracion/becas-y-oportunidades" },
                { key: "team", label: "Equipo", val: contentCounts.team ?? 0, href: "/administracion/equipo" },
                { key: "polls", label: "Encuestas y sondeos", val: contentCounts.polls ?? 0, href: "/administracion/configuracion" },
              ].map((item) => {
                const percent = Math.min(100, Math.round((item.val / maxModuleCount) * 100));
                return (
                  <Link key={item.key} href={item.href} className="group block space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 group-hover:text-fuerza-blue transition-colors">
                        {item.label}
                      </span>
                      <span className="font-bold text-fuerza-navy">{item.val}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-fuerza-blue transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link
              href="/administracion/proyectos"
              className="inline-flex items-center gap-1 text-xs font-bold text-fuerza-blue transition hover:text-blue-700 hover:underline"
            >
              <span>Gestionar contenidos</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Interacciones y formularios (100% REAL DESGLOSE) */}
        <div className="flex flex-col justify-between rounded-3xl border border-fuerza-border bg-white p-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-fuerza-navy">Interacciones y formularios</h2>

            <div className="mt-5 space-y-3.5">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-sky-600" />
                  <span className="text-xs font-semibold text-slate-700">Mensajes de contacto</span>
                </div>
                <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-fuerza-navy shadow-xs">
                  {data?.submissionsSummary?.contactMessages ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <UserPlus className="size-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-700">Postulaciones al equipo</span>
                </div>
                <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-fuerza-navy shadow-xs">
                  {data?.submissionsSummary?.teamApplications ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <FilePenLine className="size-4 text-amber-600" />
                  <span className="text-xs font-semibold text-slate-700">Propuestas estudiantiles</span>
                </div>
                <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-fuerza-navy shadow-xs">
                  {data?.submissionsSummary?.studentProposals ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">Suscripciones al boletín</span>
                </div>
                <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-fuerza-navy shadow-xs">
                  {data?.submissionsSummary?.newsletterSubscriptions ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <MousePointerClick className="size-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-700">Inscripciones a eventos</span>
                </div>
                <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-fuerza-navy shadow-xs">
                  {data?.submissionsSummary?.eventRegistrations ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link
              href="/administracion/contacto"
              className="inline-flex items-center gap-1 text-xs font-bold text-fuerza-blue transition hover:text-blue-700 hover:underline"
            >
              <span>Ver todos los mensajes</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 3: Actividad reciente (100% REAL DE AUDIT_LOGS) */}
        <div className="flex flex-col justify-between rounded-3xl border border-fuerza-border bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-fuerza-navy">Actividad reciente</h2>
              <Link
                href="/administracion/configuracion"
                className="text-xs font-semibold text-fuerza-blue hover:underline"
              >
                Ver registros
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.slice(0, 5).map((item) => {
                  const isCreated = item.action.includes("CREATE") || item.action.includes("PUBLISH");
                  const isArchive = item.action.includes("ARCHIVE") || item.action.includes("DELETE");
                  const badgeColor = isCreated
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isArchive
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-blue-50 text-fuerza-blue border-blue-200";

                  const badgeText = isCreated ? "CREADO" : isArchive ? "ARCHIVADO" : "EDITADO";

                  return (
                    <div key={item.id} className="flex items-start gap-3 text-xs">
                      <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                        {badgeText}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800">
                          {item.entityType}: {item.entityId.slice(0, 8)}...
                        </p>
                        <time className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleString("es-PE", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "short",
                          })}
                        </time>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <Clock className="size-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-600">No hay actividad reciente registrada</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Las acciones de administración quedarán registradas en este bloque.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
        <p>© 2026 Fuerza UPT. Todos los derechos reservados.</p>
        <div className="flex items-center gap-2 font-medium">
          <span>Versión 2.0.0 (PostgreSQL Live Analytics)</span>
          <span className="size-2 rounded-full bg-emerald-500" title="Sistema conectado y operativo" />
        </div>
      </footer>
    </div>
  );
}
