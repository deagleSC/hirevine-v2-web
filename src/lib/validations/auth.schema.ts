import { z } from "zod";

const registerRoleSchema = z.enum(["recruiter", "candidate"]);

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    role: registerRoleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** POST /api/auth/register (no confirmPassword). */
export type RegisterApiPayload = Omit<RegisterInput, "confirmPassword">;

export type LoginInput = z.infer<typeof loginSchema>;
