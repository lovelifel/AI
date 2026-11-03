"use client";

import { createAuthClient } from "better-auth/react";

// Same-origin requests use the existing /api/auth endpoint.
export const authClient = createAuthClient();
