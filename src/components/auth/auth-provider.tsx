"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FullScreenAppLoader } from "@/components/layout/full-screen-app-loader";
import { homePathForRole } from "@/lib/auth/home-path";
import { authServices } from "@/store/zustand/services/auth-services";
import { useAuthStore } from "@/store";

interface AuthProviderProps {
  children: React.ReactNode;
}

const protectedPrefixes = ["/candidate", "/recruiter"];
const authRoutes = ["/login", "/signup"];

function isProtectedRoute(path: string | null | undefined): boolean {
  if (!path) return false;
  return protectedPrefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

function isAuthRoute(path: string | null | undefined): boolean {
  if (!path) return false;
  return authRoutes.includes(path);
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, setUser, clearAuth, setError } =
    useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authServices.getMe();
        setUser(me);
        setError(null);
      } catch {
        clearAuth();
        setError(null);
      } finally {
        setIsInitialized(true);
      }
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session bootstrap once on mount
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    if (pathname === "/" || pathname === "") {
      router.replace(
        isAuthenticated && user ? homePathForRole(user.role) : "/login",
      );
      return;
    }

    const isProtected = isProtectedRoute(pathname);
    const onAuthRoute = isAuthRoute(pathname);

    const wrongRoleOnCandidate =
      Boolean(pathname?.startsWith("/candidate")) &&
      isAuthenticated &&
      user &&
      user.role !== "candidate";

    const wrongRoleOnRecruiter =
      Boolean(pathname?.startsWith("/recruiter")) &&
      isAuthenticated &&
      user &&
      user.role === "candidate";

    if (wrongRoleOnCandidate || wrongRoleOnRecruiter) {
      router.replace(homePathForRole(user!.role));
      return;
    }

    if (isProtected && !isAuthenticated) {
      router.replace("/login");
    } else if (onAuthRoute && isAuthenticated && user) {
      router.replace(homePathForRole(user.role));
    }
  }, [pathname, isAuthenticated, isInitialized, router, user]);

  if (!isInitialized) {
    if (pathname === "/" || pathname === "") {
      return <FullScreenAppLoader />;
    }
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-b-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
