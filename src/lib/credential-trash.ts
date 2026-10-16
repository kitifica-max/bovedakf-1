import "server-only";
import { db } from "@/lib/db";

// Undo window for deleted accounts (see DeletedCredential in schema.prisma).
export const UNDO_WINDOW_MS = 60_000;

// Drops trash rows past the window. Called on delete and on page load, so a secret never outlives the
// window by more than the gap between two visits. Server-only on purpose: not a callable server action.
export async function purgeDeletedCredentials() {
  await db.deletedCredential.deleteMany({ where: { deletedAt: { lt: new Date(Date.now() - UNDO_WINDOW_MS) } } });
}
