"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  createOrganization,
  getMyOrganization,
} from "@/lib/services/organizations-service";
import { authActions } from "@/store";
import type { Organization } from "@/types/organizations.types";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function RecruiterOrganizationPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const o = await getMyOrganization();
      setOrg(o);
    } catch {
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async () => {
    const n = name.trim();
    const s = slug.trim().toLowerCase();
    setNameError(null);
    setSlugError(null);
    if (!n) {
      setNameError("Company or team name is required.");
      toast.error("Organization name is required");
      return;
    }
    if (!s) {
      setSlugError(
        "URL slug is required (lowercase letters, numbers, hyphens).",
      );
      toast.error("URL slug is required (lowercase letters, numbers, hyphens)");
      return;
    }
    setCreating(true);
    try {
      const { organization } = await createOrganization({ name: n, slug: s });
      await authActions.refreshUser();
      setOrg(organization);
      toast.success("Organization created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 w-full max-w-lg rounded-xl" />
      </div>
    );
  }

  if (org) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Organization
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Jobs and applications are scoped to this employer account.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{org.name}</CardTitle>
            <CardDescription>
              Public slug:{" "}
              <span className="text-foreground font-mono">{org.slug}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm leading-relaxed">
            <p>
              To rename or change the slug later, use the API or add an update
              flow when the backend supports it.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/recruiter/jobs"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "no-underline",
                )}
              >
                Manage job posts
              </Link>
              <Link
                href="/recruiter/applications"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "no-underline",
                )}
              >
                View applications
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your organization
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          You need an organization before you can publish jobs or review
          applicants. Choose a display name and a unique URL slug (letters,
          numbers, single hyphens between segments).
        </p>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Organization details</CardTitle>
          <CardDescription>
            After creation, your user is linked to this org automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Company or team name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(null);
              }}
              placeholder="Acme Hiring"
              maxLength={200}
              aria-invalid={nameError ? "true" : undefined}
              aria-describedby={
                nameError ? "org-name-error org-name-hint" : "org-name-hint"
              }
            />
            <p id="org-name-hint" className="text-muted-foreground text-xs">
              Shown to your team inside Hirevine.
            </p>
            {nameError ? (
              <p
                id="org-name-error"
                role="alert"
                className="text-destructive text-xs"
              >
                {nameError}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase());
                setSlugError(null);
              }}
              placeholder="acme-hiring"
              maxLength={64}
              className="font-mono text-sm"
              aria-invalid={slugError ? "true" : undefined}
              aria-describedby={
                slugError ? "org-slug-error org-slug-hint" : "org-slug-hint"
              }
            />
            <p id="org-slug-hint" className="text-muted-foreground text-xs">
              Lowercase; letters, numbers, and hyphens only (no leading or
              trailing hyphen).
            </p>
            {slugError ? (
              <p
                id="org-slug-error"
                role="alert"
                className="text-destructive text-xs"
              >
                {slugError}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            disabled={creating}
            onClick={() => void onCreate()}
          >
            {creating ? "Creating…" : "Create organization"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
