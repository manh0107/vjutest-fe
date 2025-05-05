export interface Question {
  id: number;
  name: string;
  difficulty: number;
  isPublic: boolean;
  isCompleted: boolean;
  createdAt: string;
  modifiedAt: string;
  createdById: number;
  createdByName: string;
  modifiedById: number;
  modifiedByName: string;
  chapterId: number;
  chapterName: string;
  imageUrl?: string;
  examQuestions?: {
    point: number;
  }[];
} 