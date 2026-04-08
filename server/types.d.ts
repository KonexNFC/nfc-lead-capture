import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      password: string;
      resetToken: string | null;
      resetTokenExpiry: Date | null;
      isAdmin: boolean | null;
      createdAt: Date | null;
    }
  }
}

export {};
