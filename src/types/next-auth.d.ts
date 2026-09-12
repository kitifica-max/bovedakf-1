import { OrgRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      companyName: string | null;
      orgRole: OrgRole | null;
    } & DefaultSession["user"];
  }
  interface User {
    companyName?: string | null;
    orgRole?: OrgRole | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    companyName?: string | null;
    orgRole?: OrgRole | null;
  }
}
