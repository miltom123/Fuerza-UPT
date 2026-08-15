"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, CheckCircle2, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/services/api-client";
import { getPollResults, submitPoll } from "@/services/poll-service";
import type { PollDetail, PollQuestion, PollResults, PollSubmissionRequest } from "@/types/poll";

const formSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  consent: z.boolean(),
});

type PollFormValues = z.infer<typeof formSchema>;
type RegisterPollField = ReturnType<typeof useForm<PollFormValues>>["register"];

export function PublicPollForm({ detail }: { detail: PollDetail }) {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<PollResults | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const hasTextQuestion = detail.questions.some((question) => question.questionType === "SHORT_TEXT");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<PollFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { answers: {}, consent: false },
  });

  async function onSubmit(values: PollFormValues) {
    setSubmissionError(null);
    const missingQuestion = detail.questions.find((question) => {
      if (!question.required) return false;
      const value = values.answers[question.id];
      return Array.isArray(value) ? value.length === 0 : !String(value ?? "").trim();
    });

    if (missingQuestion) {
      setSubmissionError(`Responde la pregunta obligatoria: ${missingQuestion.questionText}`);
      return;
    }
    if (hasTextQuestion && !values.consent) {
      setSubmissionError("Confirma el consentimiento antes de enviar respuestas de texto libre.");
      return;
    }

    const input: PollSubmissionRequest = {
      answers: detail.questions
        .map((question) => toSubmissionAnswer(question, values.answers[question.id]))
        .filter((answer): answer is NonNullable<typeof answer> => answer !== null),
      consent: values.consent,
    };

    try {
      await submitPoll(detail.poll.id, input);
      setSubmitted(true);
      if (detail.poll.showResults) setResults(await getPollResults(detail.poll.id));
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 400) {
        setSubmissionError(error.message || "Esta encuesta ya fue respondida desde este navegador.");
      } else {
        setSubmissionError(error instanceof Error ? error.message : "No se pudo registrar tu respuesta.");
      }
    }
  }

  async function loadResults() {
    setLoadingResults(true);
    setSubmissionError(null);
    try {
      setResults(await getPollResults(detail.poll.id));
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "No se pudieron cargar los resultados.");
    } finally {
      setLoadingResults(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-7 text-center sm:p-10">
          <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
          <h2 className="mt-4 text-2xl font-bold text-fuerza-navy">Tu respuesta fue registrada</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-emerald-900/75">
            Gracias por participar. Esta consulta es informativa y nos ayuda a conocer mejor las prioridades estudiantiles.
          </p>
        </section>
        {results ? <PollResultsView results={results} /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {detail.questions.map((question, index) => (
          <fieldset key={question.id} className="rounded-[1.5rem] border border-fuerza-border bg-white p-5 shadow-[0_12px_34px_rgba(6,27,77,0.05)] sm:p-7">
            <legend className="sr-only">{question.questionText}</legend>
            <div className="flex gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-fuerza-blue">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold leading-7 text-fuerza-navy">
                  {question.questionText}
                  {question.required ? <span className="ml-1 text-fuerza-red" aria-label="obligatoria">*</span> : null}
                </h2>
                <QuestionInput question={question} register={register} />
              </div>
            </div>
          </fieldset>
        ))}

        {hasTextQuestion ? (
          <label className="flex cursor-pointer gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-sm leading-6 text-fuerza-navy">
            <input type="checkbox" {...register("consent")} className="mt-1 size-4 accent-fuerza-blue" />
            <span>
              Acepto que Fuerza UPT procese las respuestas de texto que decida compartir para analizar esta consulta. No incluyas datos personales sensibles.
            </span>
          </label>
        ) : null}

        {submissionError ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{submissionError}</p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex max-w-xl items-start gap-2 text-xs leading-5 text-fuerza-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-fuerza-blue" />
            Se aplican controles antiabuso sin almacenar tu dirección IP en texto plano. Esta no es una votación electoral oficial.
          </p>
          <Button type="submit" disabled={isSubmitting} className="h-12 rounded-full bg-fuerza-blue px-7 font-bold text-white hover:bg-fuerza-blue-light">
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            Enviar respuestas
          </Button>
        </div>
      </form>

      {detail.poll.showResults ? (
        <div className="border-t border-fuerza-border pt-6 text-center">
          <Button type="button" variant="outline" disabled={loadingResults} onClick={loadResults} className="rounded-full">
            {loadingResults ? <LoaderCircle className="size-4 animate-spin" /> : <BarChart3 className="size-4" />}
            Ver resultados actuales
          </Button>
        </div>
      ) : null}
      {results ? <PollResultsView results={results} /> : null}
    </div>
  );
}

function QuestionInput({ question, register }: { question: PollQuestion; register: RegisterPollField }) {
  const fieldName = `answers.${question.id}` as const;

  if (question.questionType === "SHORT_TEXT") {
    return (
      <textarea
        {...register(fieldName)}
        maxLength={500}
        rows={4}
        placeholder="Escribe una respuesta breve"
        className="mt-4 w-full resize-y rounded-2xl border border-fuerza-border bg-[#f8faff] px-4 py-3 text-sm outline-none transition focus:border-fuerza-blue focus:ring-4 focus:ring-fuerza-blue/10"
      />
    );
  }

  if (question.questionType === "RATING") {
    return (
      <div className="mt-4 grid grid-cols-5 gap-2" aria-label="Escala del 1 al 5">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label key={rating} className="cursor-pointer">
            <input type="radio" value={rating} {...register(fieldName)} className="peer sr-only" />
            <span className="flex h-12 items-center justify-center rounded-xl border border-fuerza-border bg-white font-bold text-fuerza-navy transition peer-checked:border-fuerza-blue peer-checked:bg-fuerza-blue peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-fuerza-blue/20">{rating}</span>
          </label>
        ))}
      </div>
    );
  }

  const inputType = question.questionType === "MULTIPLE_CHOICE" ? "checkbox" : "radio";
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {question.options.map((option) => (
        <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-fuerza-border bg-[#f8faff] px-4 py-3 text-sm font-medium text-fuerza-navy transition hover:border-blue-300 has-checked:border-fuerza-blue has-checked:bg-blue-50">
          <input type={inputType} value={option.id} {...register(fieldName)} className="size-4 accent-fuerza-blue" />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function toSubmissionAnswer(question: PollQuestion, rawValue: string | string[] | undefined): PollSubmissionRequest["answers"][number] | null {
  if (rawValue === undefined || rawValue === "" || (Array.isArray(rawValue) && rawValue.length === 0)) return null;
  if (question.questionType === "SINGLE_CHOICE" || question.questionType === "MULTIPLE_CHOICE") {
    return { questionId: question.id, optionIds: Array.isArray(rawValue) ? rawValue : [rawValue] };
  }
  if (question.questionType === "RATING") {
    return { questionId: question.id, ratingValue: Number(Array.isArray(rawValue) ? rawValue[0] : rawValue) };
  }
  return { questionId: question.id, textValue: String(Array.isArray(rawValue) ? rawValue[0] : rawValue).trim() };
}

function PollResultsView({ results }: { results: PollResults }) {
  return (
    <section className="rounded-[2rem] border border-fuerza-border bg-white p-6 shadow-[0_16px_50px_rgba(6,27,77,0.08)] sm:p-8">
      <div className="flex items-end justify-between gap-4 border-b border-fuerza-border pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-fuerza-blue">Resultados públicos</p>
          <h2 className="mt-2 text-2xl font-bold text-fuerza-navy">{results.title}</h2>
        </div>
        <div className="text-right">
          <strong className="text-3xl text-fuerza-blue">{results.totalResponses}</strong>
          <p className="text-xs text-fuerza-muted">respuestas</p>
        </div>
      </div>
      <div className="mt-6 space-y-6">
        {results.questions.map((question) => (
          <div key={question.questionId}>
            <h3 className="font-bold text-fuerza-navy">{question.questionText}</h3>
            {question.averageRating !== undefined && question.averageRating !== null ? <p className="mt-3 text-2xl font-bold text-fuerza-blue">{question.averageRating.toFixed(2)} / 5</p> : null}
            <div className="mt-3 space-y-3">
              {question.options.map((option) => (
                <div key={option.optionId}>
                  <div className="flex justify-between gap-3 text-sm"><span>{option.label}</span><strong>{option.votes} ({option.percentage.toFixed(1)}%)</strong></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-blue-50"><div className="h-full rounded-full bg-fuerza-blue" style={{ width: `${Math.min(100, option.percentage)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
