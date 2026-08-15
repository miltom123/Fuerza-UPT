"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { TeamMemberAdmin } from "@/types/team-member";

interface TeamMemberDeleteDialogProps {
  member: TeamMemberAdmin | null;
  permanent: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function TeamMemberDeleteDialog({ member, permanent, busy, onClose, onConfirm }: TeamMemberDeleteDialogProps) {
  return (
    <Dialog open={Boolean(member)} onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <span className={`mb-2 grid size-11 place-items-center rounded-2xl ${permanent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}><AlertTriangle className="size-5" /></span>
          <DialogTitle>{permanent ? "Eliminar definitivamente" : "Archivar integrante"}</DialogTitle>
          <DialogDescription>
            {permanent
              ? `Se eliminara permanentemente a ${member?.name ?? "este integrante"}, incluida su imagen. Esta accion no se puede deshacer.`
              : `${member?.name ?? "Este integrante"} dejara de aparecer en la web y quedara disponible en Archivados.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>Cancelar</Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={busy}>
            {busy ? <LoaderCircle className="animate-spin" /> : null}{permanent ? "Eliminar definitivamente" : "Archivar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
