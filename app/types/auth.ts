import { Session } from "next-auth";
import { Role } from "@prisma/client";

/**
 * Extended session type that ensures user.id is present
 */
export interface SessionWithId extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: Role;
  };
}
