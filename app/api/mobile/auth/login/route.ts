import { z } from "zod";

import {
  createMobileAccessToken,
  verifyMobilePassword,
} from "@/lib/auth/mobileAuth";

const loginRequestSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required.")
    .max(200, "Password is too long."),
});

export async function POST(request: Request) {
  try {
    const requestBody: unknown = await request.json();

    const parsedRequest = loginRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return Response.json(
        {
          error: "A valid password is required.",
        },
        {
          status: 400,
        },
      );
    }

    const isValidPassword = verifyMobilePassword(parsedRequest.data.password);

    if (!isValidPassword) {
      return Response.json(
        {
          error: "Invalid password.",
        },
        {
          status: 401,
        },
      );
    }

    const accessToken = createMobileAccessToken();

    return Response.json({
      accessToken,
      tokenType: "Bearer",
      expiresInSeconds: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    console.error("Mobile login failed:", error);

    return Response.json(
      {
        error: "Unable to complete login.",
      },
      {
        status: 500,
      },
    );
  }
}
