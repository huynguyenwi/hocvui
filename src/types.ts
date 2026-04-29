export interface User {
  id: string;
  username: string;
  role: "user" | "admin";
  score: number;
}

export interface Subject {
  id: string;
  name: string;
  level: "primary" | "secondary";
}

export interface Topic {
  id: string;
  subjectId: string;
  grade: number;
  name: string;
  theory: string;
  example: string;
}

export interface Question {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
}
