import type { BetterAuthOptions } from "better-auth";

// Shared schema-affecting settings for the runtime and schema generator.
export const authOptions = {
  emailAndPassword: {
    enabled: true,
  },
} satisfies BetterAuthOptions;
