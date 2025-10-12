export interface Choice {
  id?: number;
  text: string;
  image?: {
    file?: File;
    preview: string;
  } | null;
  icon: string | null | number;
}

export interface Question {
  id: number;
  text: string;
  type: string;
  choices: Choice[];
}

export interface QuestionResponse {
  succeeded: boolean;
  message: string | null;
  error: string | null;
  data: Question | null;
}

export interface QuestionListResponse {
  succeeded: boolean;
  message: string | null;
  error: string | null;
  data: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    data: Question[];
  } | null;
}

export enum QuestionType {
  Radio = 0,
  Checkbox = 1,
  Text = 2,
  Rating = 3,
  Bool = 4,
  RatingStar = 5,
  RatingEmoji = 6,
}
