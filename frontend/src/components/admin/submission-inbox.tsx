"use client";

import { useEffect, useState } from "react";
import { Inbox, LoaderCircle, Save } from "lucide-react";
import { submissionAdminService } from "@/services/admin/submission-admin-service";
import type { AdminSubmission, SubmissionStatus, SubmissionType } from "@/types/admin-workflows";

interface SubmissionInboxProps {
  type: SubmissionType;
  title: string;
  description: string;
}

export function SubmissionInbox({ type, title, description }: SubmissionInboxProps) {
  const [rows,setRows]=useState<AdminSubmission[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null); const [refresh,setRefresh]=useState(0);
  useEffect(()=>{let active=true;submissionAdminService.list(type).then((page)=>{if(active)setRows(page.content)}).catch(()=>{if(active)setError("No se pudo cargar la bandeja.")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[type,refresh]);
  return <div className="mx-auto max-w-7xl"><header className="rounded-[2rem] bg-fuerza-navy p-7 text-white"><Inbox className="size-7 text-blue-200" /><h1 className="mt-4 text-3xl font-bold">{title}</h1><p className="mt-2 text-sm text-blue-100/75">{description}</p></header>{error?<p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>:null}{loading?<p className="mt-6 flex items-center gap-2 rounded-xl bg-white p-8"><LoaderCircle className="size-5 animate-spin" />Cargando...</p>:null}<div className="mt-6 grid gap-4">{rows.map((row)=><SubmissionRow key={row.id} type={type} row={row} onChanged={()=>{setLoading(true);setRefresh((v)=>v+1)}} onError={setError}/>)}</div>{!loading&&!rows.length?<p className="mt-6 rounded-2xl border border-dashed bg-white p-12 text-center text-fuerza-muted">No hay elementos en esta bandeja.</p>:null}</div>;
}

function SubmissionRow({type,row,onChanged,onError}:{type:SubmissionType;row:AdminSubmission;onChanged:()=>void;onError:(message:string)=>void}){const[status,setStatus]=useState(row.status);const[notes,setNotes]=useState(row.notes??"");const[busy,setBusy]=useState(false);async function save(){setBusy(true);try{if(status!==row.status)await submissionAdminService.updateStatus(type,row.id,status);await submissionAdminService.updateNotes(type,row.id,notes);onChanged()}catch(cause){onError(cause instanceof Error?cause.message:"No se pudo guardar.")}finally{setBusy(false)}}return <article className="rounded-2xl border border-fuerza-border bg-white p-5"><div className="flex flex-col gap-4 lg:flex-row"><div className="flex-1"><div className="flex flex-wrap gap-3 text-xs text-fuerza-muted"><span>{new Date(row.createdAt).toLocaleString("es-PE")}</span>{row.email?<span>{row.email}</span>:null}</div><h2 className="mt-2 text-lg font-bold text-fuerza-navy">{row.name}</h2>{row.context?<p className="mt-1 text-sm font-semibold text-fuerza-blue">{row.context}</p>:null}{row.body?<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-fuerza-muted">{row.body}</p>:null}</div><div className="grid gap-3 lg:w-80"><select value={status} onChange={(event)=>setStatus(event.target.value as SubmissionStatus)} className="rounded-xl border bg-white px-3 py-2 text-sm font-bold"><option value="NEW">Nuevo</option><option value="IN_REVIEW">En revision</option><option value="RESOLVED">Resuelto</option><option value="REJECTED">Rechazado</option><option value="SPAM">Spam</option></select><textarea value={notes} onChange={(event)=>setNotes(event.target.value)} placeholder="Notas internas" className="min-h-24 rounded-xl border px-3 py-2 text-sm"/><button onClick={save} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuerza-blue px-4 py-2.5 text-sm font-bold text-white">{busy?<LoaderCircle className="size-4 animate-spin"/>:<Save className="size-4"/>}Guardar revision</button></div></div></article>}
