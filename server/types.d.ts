import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      password: string;
      createdAt: Date | null;
    }
  }
}

export {};
