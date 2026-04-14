"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homePathForRole } from "@/lib/auth/home-path";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { authActions } from "@/store";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const user = await authActions.login(data);
      toast.success("Signed in");
      router.push(homePathForRole(user.role));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
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
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...register("email")}
          disabled={isLoading}
        />
        {errors.email && (
          <p
            id="login-email-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-invalid={errors.password ? "true" : undefined}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
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
            id="login-password-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
