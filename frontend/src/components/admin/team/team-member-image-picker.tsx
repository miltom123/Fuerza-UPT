"use client";

import Image from "next/image";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";

export const TEAM_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const TEAM_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

interface TeamMemberImagePickerProps {
  previewUrl: string;
  hasStoredImage: boolean;
  error?: string;
  onChange: (file: File) => void;
  onRemove: () => void;
}

export function TeamMemberImagePicker({
  previewUrl,
  hasStoredImage,
  error,
  onChange,
  onRemove,
}: TeamMemberImagePickerProps) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-fuerza-muted">Fotografia</span>
      <label className="mt-2 grid min-h-52 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-blue-300 bg-blue-50/40 text-center transition hover:border-fuerza-blue hover:bg-blue-50">
        {previewUrl ? (
          <span className="relative block h-52 w-full">
            <Image src={previewUrl} alt="Vista previa de la fotografia" fill sizes="520px" className="object-cover object-top" unoptimized />
            <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-xl bg-fuerza-navy/85 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">
              <UploadCloud className="size-4" />Reemplazar imagen
            </span>
          </span>
        ) : (
          <span className="p-7 text-fuerza-navy">
            <ImagePlus className="mx-auto size-9 text-fuerza-blue" />
            <strong className="mt-3 block text-sm">Seleccionar imagen</strong>
            <small className="mt-1 block text-xs text-fuerza-muted">JPG, PNG o WebP, maximo 5 MB</small>
          </span>
        )}
        <input
          type="file"
          accept={TEAM_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onChange(file);
            event.target.value = "";
          }}
        />
      </label>
      {(previewUrl || hasStoredImage) ? (
        <button type="button" onClick={onRemove} className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-red-600">
          <Trash2 className="size-3.5" />Quitar imagen
        </button>
      ) : null}
      {error ? <p role="alert" className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
