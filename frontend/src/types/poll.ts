import type { AdminPage } from "@/types/admin";

export type PollStatus = "DRAFT" | "SCHEDULED" | "OPEN" | "CLOSED" | "ARCHIVED";
export type PollQuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RATING" | "SHORT_TEXT";

export interface PollSummary {
  id: string;
  slug: string;
  title: string;
  description?: string;
  status: PollStatus;
  startAt?: string;
  endAt?: string;
  allowAnonymous: boolean;
  showResults: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface PollOption {
  id: string;
  label: string;
  displayOrder: number;
}

export interface PollQuestion {
  id: string;
  questionText: string;
  questionType: PollQuestionType;
  required: boolean;
  displayOrder: number;
  options: PollOption[];
}

export interface PollDetail {
  poll: PollSummary;
  questions: PollQuestion[];
}

export interface PollAdminDetail {
  detail: PollDetail;
  responseCount: number;
}

export interface PollMutation {
  slug: string;
  title: string;
  description?: string;
  status: PollStatus;
  startAt?: string;
  endAt?: string;
  allowAnonymous: boolean;
  showResults: boolean;
  featured: boolean;
  questions: Array<{
    questionText: string;
    questionType: PollQuestionType;
    required: boolean;
    displayOrder: number;
    options: Array<{ label: string; displayOrder: number }>;
  }>;
  version?: number;
}

export interface PollResults {
  pollId: string;
  title: string;
  totalResponses: number;
  questions: Array<{
    questionId: string;
    questionText: string;
    questionType: PollQuestionType;
    totalAnswers: number;
    averageRating?: number;
    options: Array<{ optionId: string; label: string; votes: number; percentage: number }>;
    textAnswers: string[];
  }>;
}

export interface PollSubmissionRequest {
  answers: Array<{
    questionId: string;
    optionIds?: string[];
    ratingValue?: number;
    textValue?: string;
  }>;
  consent: boolean;
}

export type PollPage = AdminPage<PollSummary>;
