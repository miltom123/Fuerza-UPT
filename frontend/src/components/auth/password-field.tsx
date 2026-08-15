"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PasswordFieldProps extends React.ComponentProps<"input"> {
  error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ error, id = "password", ...props }, ref) {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-fuerza-muted"
          />
          <Input
            {...props}
            ref={ref}
            id={id}
            type={isVisible ? "text" : "password"}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-13 rounded-xl border-fuerza-border bg-white pl-12 pr-12 text-base shadow-sm focus-visible:border-fuerza-blue"
          />
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={isVisible}
            className="absolute right-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-fuerza-muted transition hover:bg-fuerza-surface hover:text-fuerza-blue focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-fuerza-blue/25"
          >
            {isVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {error ? (
          <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-medium text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
