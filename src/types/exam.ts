export enum ExamVisibility {
  PUBLIC = 'PUBLIC',
  DEPARTMENT = 'DEPARTMENT',
  MAJOR = 'MAJOR',
  CLASS = 'CLASS'
}

export interface Exam {
  id: number;
  name: string;
  description: string;
  durationTime: number;
  passScore: number;
  isPublic: boolean;
  visibility: ExamVisibility;
  maxAttempts: number;
  randomQuestions: boolean;
  questionsCount: number;
  startAt: string;
  endAt: string;
  subjectId: number;
  departmentIds?: number[];
  majorIds?: number[];
}

export interface CreateExamData {
  name: string;
  description: string;
  durationTime: number;
  passScore: number;
  isPublic: boolean;
  visibility: ExamVisibility;
  maxAttempts: number;
  randomQuestions: boolean;
  startAt: string;
  endAt: string;
  subjectId: number;
  departmentIds?: number[];
  majorIds?: number[];
} 