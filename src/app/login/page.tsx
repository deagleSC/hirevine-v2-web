"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
      <div className="text-center text-sm">
        No account?{" "}
        <Link
          href="/signup"
          className="text-primary rounded-md px-1 py-0.5 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}
