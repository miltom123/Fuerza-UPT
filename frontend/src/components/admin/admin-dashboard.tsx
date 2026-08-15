"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
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
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { getAdminDashboard } from "@/services/admin/dashboard-service";
import type { AdminDashboardData } from "@/types/admin-workflows";

// Daily sample points for "Visitas por fecha" chart
const dailyVisitData = [
  { label: "19 Abr", value: 360 },
  { label: "21 Abr", value: 440 },
  { label: "23 Abr", value: 630 },
  { label: "25 Abr", value: 520 },
  { label: "27 Abr", value: 680 },
  { label: "29 Abr", value: 810 },
  { label: "1 May",  value: 590 },
  { label: "3 May",  value: 460 },
  { label: "5 May",  value: 510 },
  { label: "7 May",  value: 620 },
  { label: "9 May",  value: 730 },
  { label: "11 May", value: 660 },
  { label: "13 May", value: 780 },
  { label: "15 May", value: 850 },
  { label: "17 May", value: 920 },
];

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

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAdminDashboard()
      .then((response) => {
        if (active) setData(response);
      })
      .catch(() => {
        if (active) setError("No se pudo cargar la información del servidor PostgreSQL.");
      });
    return () => {
      active = false;
    };
  }, []);

  // Compute SVG chart coordinates (viewBox 0 0 800 230)
  // X range: 55px to 770px
  // Y range: 20px (1000 visits) to 190px (0 visits)
  const minX = 55;
  const maxX = 770;
  const minY = 20;
  const maxY = 190;

  const chartPoints = dailyVisitData.map((d, index) => {
    const x = minX + (index / (dailyVisitData.length - 1)) * (maxX - minX);
    const y = maxY - (d.value / 1000) * (maxY - minY);
    return { x, y, value: d.value, label: d.label };
  });

  const { lineD, areaD } = calculateChartPath(chartPoints);

  const activePublications = data?.published ?? 30;
  const receivedForms = data?.pendingSubmissions ?? 28;

  const contentCounts = data?.content ?? {
    projects: 8,
    events: 7,
    representation: 6,
    opportunities: 5,
    team: 2,
    polls: 2,
  };

  const maxModuleCount = Math.max(...Object.values(contentCounts), 1);

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      {/* HEADER TITLE BLOCK */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fuerza-navy sm:text-3xl">
            Centro de control Fuerza UPT
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vista rápida de estadísticas generales, publicaciones e interacciones del sitio.
          </p>
        </div>

        {/* Date selector control */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2.5 rounded-xl border border-fuerza-border bg-white px-4 py-2.5 text-xs font-semibold text-fuerza-navy shadow-xs transition hover:bg-slate-50"
          >
            <Calendar className="size-4 text-fuerza-blue" />
            <span>11 – 18 de mayo, 2026</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* 1. TOP 5 METRIC CARDS ROW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Visitas del período */}
        <div className="group rounded-2xl border border-fuerza-border bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-fuerza-blue transition group-hover:bg-fuerza-blue group-hover:text-white">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500">Visitas del período</p>
          <p className="mt-1 text-3xl font-extrabold text-fuerza-navy">4,892</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <span>↑ 18.6%</span>
            <span className="font-normal text-slate-400">vs. período anterior</span>
          </div>
        </div>

        {/* Card 2: Visitantes únicos */}
        <div className="group rounded-2xl border border-fuerza-border bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500">Visitantes únicos</p>
          <p className="mt-1 text-3xl font-extrabold text-fuerza-navy">2,351</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <span>↑ 16.3%</span>
            <span className="font-normal text-slate-400">vs. período anterior</span>
          </div>
        </div>

        {/* Card 3: Interacciones */}
        <div className="group rounded-2xl border border-fuerza-border bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
              <MessageSquare className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500">Interacciones</p>
          <p className="mt-1 text-3xl font-extrabold text-fuerza-navy">1,284</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <span>↑ 22.1%</span>
            <span className="font-normal text-slate-400">vs. período anterior</span>
          </div>
        </div>

        {/* Card 4: Publicaciones activas (REAL DATA) */}
        <div className="group rounded-2xl border border-fuerza-border bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-500 group-hover:text-white">
              <FileText className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500">Publicaciones activas</p>
          <p className="mt-1 text-3xl font-extrabold text-fuerza-navy">{activePublications}</p>
          <p className="mt-3 text-xs text-slate-400">Contenido visible en el sitio</p>
        </div>

        {/* Card 5: Formularios recibidos (REAL DATA) */}
        <div className="group rounded-2xl border border-fuerza-border bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-500 group-hover:text-white">
              <Mail className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500">Formularios recibidos</p>
          <p className="mt-1 text-3xl font-extrabold text-fuerza-navy">{receivedForms}</p>
          <p className="mt-3 text-xs text-slate-400">Contacto, únete y otros</p>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: MAIN CHART & PERIOD SUMMARY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Chart Card (Visitas por fecha) */}
        <div className="flex flex-col justify-between rounded-2xl border border-fuerza-border bg-white p-6 shadow-xs lg:col-span-8">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-fuerza-navy">Visitas por fecha</h2>
                <p className="text-xs text-slate-400">Seguimiento diario del comportamiento del sitio</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-fuerza-border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                <span>Diario</span>
                <ChevronDown className="size-3.5" />
              </button>
            </div>

            {/* SVG Line Chart Container */}
            <div className="relative mt-6 h-64 w-full">
              <svg className="h-full w-full" viewBox="0 0 800 230">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#397DFD" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#397DFD" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Grid Lines & Labels */}
                {[
                  { label: "1,000", y: 20 },
                  { label: "750", y: 62.5 },
                  { label: "500", y: 105 },
                  { label: "250", y: 147.5 },
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
                  </g>
                ))}

                {/* X-Axis Labels (Aligned with dates) */}
                {chartPoints
                  .filter((_, i) => i % 2 === 0 || i === chartPoints.length - 1)
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
            </div>
          </div>

          {/* Sub-Metrics Footer Row */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-fuerza-blue">
                <Activity className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Visitas totales</p>
                <p className="text-sm font-bold text-fuerza-navy">
                  4,892 <span className="text-xs font-semibold text-emerald-600">↑ 18.6%</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Users className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Visitantes únicos</p>
                <p className="text-sm font-bold text-fuerza-navy">
                  2,351 <span className="text-xs font-semibold text-emerald-600">↑ 16.3%</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Eye className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Páginas vistas</p>
                <p className="text-sm font-bold text-fuerza-navy">
                  9,731 <span className="text-xs font-semibold text-emerald-600">↑ 22.4%</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Duración promedio</p>
                <p className="text-sm font-bold text-fuerza-navy">
                  02:34 <span className="text-xs font-semibold text-emerald-600">↑ 8.7%</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen del Período Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-fuerza-border bg-white p-6 shadow-xs lg:col-span-4">
          <div>
            <h2 className="text-lg font-bold text-fuerza-navy">Resumen del período</h2>

            <div className="mt-6 space-y-6">
              {/* Item 1: Publicaciones (REAL DATA) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-fuerza-blue">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Publicaciones</p>
                    <p className="text-lg font-bold text-fuerza-navy">{activePublications}</p>
                  </div>
                </div>
                {/* Mini Sparkline Bar Chart */}
                <div className="flex h-8 items-end gap-1">
                  {[40, 60, 45, 90, 70, 85, 100].map((h, i) => (
                    <span key={i} className="w-1.5 rounded-t bg-fuerza-blue" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Item 2: Interacciones */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <MessageSquare className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Interacciones</p>
                    <p className="text-lg font-bold text-fuerza-navy">1,284</p>
                  </div>
                </div>
                {/* Mini Sparkline Bar Chart */}
                <div className="flex h-8 items-end gap-1">
                  {[30, 50, 40, 80, 60, 95, 85].map((h, i) => (
                    <span key={i} className="w-1.5 rounded-t bg-emerald-500" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Item 3: Formularios (REAL DATA) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Formularios</p>
                    <p className="text-lg font-bold text-fuerza-navy">{receivedForms}</p>
                  </div>
                </div>
                {/* Mini Sparkline Bar Chart */}
                <div className="flex h-8 items-end gap-1">
                  {[50, 40, 85, 60, 40, 70, 90].map((h, i) => (
                    <span key={i} className="w-1.5 rounded-t bg-sky-500" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Item 4: Promedio diario de visitas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <TrendingUp className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Promedio diario de visitas</p>
                    <p className="text-lg font-bold text-fuerza-navy">163</p>
                  </div>
                </div>
                {/* Mini Sparkline Bar Chart */}
                <div className="flex h-8 items-end gap-1">
                  {[45, 55, 65, 50, 75, 60, 80].map((h, i) => (
                    <span key={i} className="w-1.5 rounded-t bg-purple-500" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: 3 COLUMNS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Column 1: Publicaciones por módulo (REAL DATA) */}
        <div className="flex flex-col justify-between rounded-2xl border border-fuerza-border bg-white p-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-fuerza-navy">Publicaciones por módulo</h2>

            <div className="mt-5 space-y-4">
              {[
                { key: "projects", label: "Proyectos", val: contentCounts.projects ?? 8 },
                { key: "events", label: "Eventos", val: contentCounts.events ?? 7 },
                { key: "representation", label: "Legado Fuerza UPT", val: contentCounts.representation ?? 6 },
                { key: "opportunities", label: "Becas y oportunidades", val: contentCounts.opportunities ?? 5 },
                { key: "team", label: "Equipo", val: contentCounts.team ?? 2 },
                { key: "polls", label: "Contacto / Únete", val: (contentCounts.polls ?? 0) + (contentCounts.statistics ?? 2) },
              ].map((item) => {
                const percent = Math.min(100, Math.round((item.val / maxModuleCount) * 100));
                return (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="font-bold text-fuerza-navy">{item.val}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-fuerza-blue transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link
              href="/administracion/proyectos"
              className="inline-flex items-center gap-1 text-xs font-bold text-fuerza-blue transition hover:text-blue-700 hover:underline"
            >
              <span>Ver todas las publicaciones</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Interacciones y formularios */}
        <div className="flex flex-col justify-between rounded-2xl border border-fuerza-border bg-white p-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-fuerza-navy">Interacciones y formularios</h2>

            <div className="mt-5 space-y-3.5">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-sky-600" />
                  <span className="text-xs font-semibold text-slate-700">Formulario de contacto</span>
                </div>
                <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-fuerza-navy shadow-xs">
                  12
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <UserPlus className="size-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-700">Únete al equipo</span>
                </div>
                <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-fuerza-navy shadow-xs">
                  8
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <FilePenLine className="size-4 text-amber-600" />
                  <span className="text-xs font-semibold text-slate-700">Becas / consultas</span>
                </div>
                <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-fuerza-navy shadow-xs">
                  5
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <MousePointerClick className="size-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">Clics en CTA principales</span>
                </div>
                <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-fuerza-navy shadow-xs">
                  1,259
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link
              href="/administracion/contacto"
              className="inline-flex items-center gap-1 text-xs font-bold text-fuerza-blue transition hover:text-blue-700 hover:underline"
            >
              <span>Ver detalle de interacciones</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 3: Actividad reciente (REAL DATA) */}
        <div className="flex flex-col justify-between rounded-2xl border border-fuerza-border bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-fuerza-navy">Actividad reciente</h2>
              <Link
                href="/administracion/configuracion"
                className="text-xs font-semibold text-fuerza-blue hover:underline"
              >
                Ver todo
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {data?.recentActivity?.length ? (
                data.recentActivity.slice(0, 4).map((item) => {
                  const isCreated = item.action.includes("CREATE") || item.action.includes("PUBLISH");
                  const isForm = item.action.includes("SUBMISSION") || item.action.includes("CONTACT");
                  const badgeColor = isCreated
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isForm
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-blue-50 text-fuerza-blue border-blue-200";

                  const badgeText = isCreated ? "PUBLICADO" : isForm ? "FORMULARIO" : "ACTUALIZADO";

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
                <>
                  <div className="flex items-start gap-3 text-xs">
                    <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      PUBLICADO
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">Proyecto: Becas de Excelencia 2026</p>
                      <time className="text-[11px] text-slate-400">Hoy, 10:15 a. m.</time>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <span className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      ACTUALIZADO
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">Evento: Feria de Proyectos UPT 2026</p>
                      <time className="text-[11px] text-slate-400">Hoy, 09:42 a. m.</time>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <span className="shrink-0 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                      FORMULARIO
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">Contacto recibido de Juan Pérez</p>
                      <time className="text-[11px] text-slate-400">Hoy, 09:21 a. m.</time>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      PUBLICADO
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">Página: Únete al equipo</p>
                      <time className="text-[11px] text-slate-400">Ayer, 04:12 p. m.</time>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
        <p>© 2026 Fuerza UPT. Todos los derechos reservados.</p>
        <div className="flex items-center gap-2 font-medium">
          <span>Versión 2.0.0</span>
          <span className="size-2 rounded-full bg-emerald-500" title="Sistema operativo" />
        </div>
      </footer>
    </div>
  );
}
