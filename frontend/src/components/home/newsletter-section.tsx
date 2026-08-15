"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const newsletterSchema = z.object({
  email: z.string().email("Ingresa un correo valido."),
});

type NewsletterForm = z.infer<typeof newsletterSchema>;

async function subscribeToNewsletter() {
  await new Promise((resolve) => setTimeout(resolve, 450));
}

export function NewsletterSection() {
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit() {
    await subscribeToNewsletter();
    setSuccessMessage("Listo. Te avisaremos cuando haya novedades.");
    reset();
  }

  return (
    <section className="section-spacing bg-white">
      <div className="container-fuerza">
        <div className="grid overflow-hidden rounded-[2rem] bg-fuerza-navy text-white lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-8 sm:p-10 lg:p-14">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-fuerza-red">Novedades</p>
            <h2 className="mt-4 text-3xl font-black sm:text-5xl">Recibe oportunidades en tu correo institucional</h2>
            <p className="mt-5 text-base leading-7 text-white/72">
              Formulario visual con validacion local. La conexion real se activara cuando el backend este listo.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center gap-4 bg-white p-8 text-fuerza-navy sm:p-10 lg:p-14" noValidate>
            <label htmlFor="newsletter-email" className="text-sm font-bold">
              Correo institucional
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="newsletter-email"
                type="email"
                placeholder="nombre@upt.pe"
                aria-invalid={Boolean(errors.email)}
                className="h-12 rounded-full border-fuerza-border bg-fuerza-surface px-5"
                {...register("email")}
              />
              <Button disabled={isSubmitting} className="h-12 rounded-full bg-fuerza-blue px-6 text-white hover:bg-fuerza-blue-light">
                <Send className="size-4" />
                {isSubmitting ? "Enviando" : "Suscribirme"}
              </Button>
            </div>
            {errors.email ? <p className="text-sm font-medium text-fuerza-red">{errors.email.message}</p> : null}
            {successMessage ? <p className="text-sm font-semibold text-fuerza-blue">{successMessage}</p> : null}
          </form>
        </div>
      </div>
    </section>
  );
}
