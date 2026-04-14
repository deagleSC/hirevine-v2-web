"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { homePathForRole } from "@/lib/auth/home-path";
import {
  registerSchema,
  type RegisterApiPayload,
  type RegisterInput,
} from "@/lib/validations/auth.schema";
import { authActions } from "@/store";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "candidate", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const payload: RegisterApiPayload = {
        email: data.email,
        password: data.password,
        role: data.role,
      };
      const user = await authActions.register(payload);
      toast.success("Account created");
      router.push(homePathForRole(user.role));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "signup-email-error" : undefined}
          {...register("email")}
          disabled={isLoading}
        />
        {errors.email && (
          <p
            id="signup-email-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">I am a</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isLoading}
            >
              <SelectTrigger
                id="role"
                className={cn("w-full", errors.role && "border-destructive")}
                aria-invalid={errors.role ? "true" : undefined}
                aria-describedby={errors.role ? "signup-role-error" : undefined}
              >
                <SelectValue placeholder="Choose role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candidate">Candidate</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p
            id="signup-role-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.role.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            aria-invalid={errors.password ? "true" : undefined}
            aria-describedby={
              errors.password
                ? "signup-password-error signup-password-hint"
                : "signup-password-hint"
            }
            {...register("password")}
            disabled={isLoading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="text-muted-foreground size-4" />
            ) : (
              <Eye className="text-muted-foreground size-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p
            id="signup-password-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.password.message}
          </p>
        )}
        <p id="signup-password-hint" className="text-muted-foreground text-xs">
          Must be at least 8 characters.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            aria-invalid={errors.confirmPassword ? "true" : undefined}
            aria-describedby={
              errors.confirmPassword
                ? "signup-confirm-password-error"
                : undefined
            }
            {...register("confirmPassword")}
            disabled={isLoading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="text-muted-foreground size-4" />
            ) : (
              <Eye className="text-muted-foreground size-4" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p
            id="signup-confirm-password-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
