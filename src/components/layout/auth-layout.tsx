import { HirevineMark } from "@/components/brand/hirevine-mark";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="from-primary/10 via-primary/5 to-background hidden w-1/2 items-center justify-center bg-gradient-to-br p-8 lg:flex">
        <div className="flex flex-col items-center gap-6">
          <HirevineMark size={96} />
          <div className="text-center">
            <p className="text-lg font-semibold tracking-tight">Hirevine</p>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
              Hiring automation: jobs, applications, and structured evaluation
              pipelines.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-4 sm:p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md space-y-3 sm:space-y-4">
          <div className="mb-6">
            <div className="mb-4 flex justify-center lg:hidden">
              <HirevineMark size={64} />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Welcome</h1>
            <p className="text-muted-foreground text-sm">
              Sign in or create an account to continue
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
