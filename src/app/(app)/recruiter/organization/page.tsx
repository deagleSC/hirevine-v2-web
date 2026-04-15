"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import {
  createOrganization,
  getMyOrganization,
  joinOrganizationBySlug,
  leaveOrganization,
  updateMyOrganization,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type OrgSetupMode = "create" | "join";

export default function RecruiterOrganizationPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<OrgSetupMode>("create");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [joinSlug, setJoinSlug] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [joinSlugError, setJoinSlugError] = useState<string | null>(null);
  const [detailName, setDetailName] = useState("");
  const [detailSlug, setDetailSlug] = useState("");
  const [detailNameError, setDetailNameError] = useState<string | null>(null);
  const [detailSlugError, setDetailSlugError] = useState<string | null>(null);
  const [saveOrgPending, setSaveOrgPending] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leavePending, setLeavePending] = useState(false);

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

  useEffect(() => {
    if (org) {
      setDetailName(org.name);
      setDetailSlug(org.slug);
      setDetailNameError(null);
      setDetailSlugError(null);
    }
  }, [org]);

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

  const onJoin = async () => {
    const s = joinSlug.trim().toLowerCase();
    setJoinSlugError(null);
    if (!s) {
      setJoinSlugError("Enter the organization slug your teammate shared.");
      toast.error("Organization slug is required");
      return;
    }
    setJoining(true);
    try {
      const { organization } = await joinOrganizationBySlug({ slug: s });
      await authActions.refreshUser();
      setOrg(organization);
      toast.success(`Joined ${organization.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not join");
    } finally {
      setJoining(false);
    }
  };

  const onCopySlug = async () => {
    if (!org) return;
    const toCopy = detailSlug.trim().toLowerCase() || org.slug;
    try {
      await navigator.clipboard.writeText(toCopy);
      toast.success("Slug copied to clipboard");
    } catch {
      toast.error("Could not copy — try selecting the slug manually");
    }
  };

  const onSaveOrgDetails = async () => {
    if (!org) return;
    const n = detailName.trim();
    const s = detailSlug.trim().toLowerCase();
    setDetailNameError(null);
    setDetailSlugError(null);
    if (!n) {
      setDetailNameError("Company or team name is required.");
      toast.error("Organization name is required");
      return;
    }
    if (!s) {
      setDetailSlugError(
        "Slug is required (lowercase letters, numbers, hyphens).",
      );
      toast.error("Slug is required");
      return;
    }
    const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
    if (!slugOk) {
      setDetailSlugError(
        "Use lowercase letters, numbers, and single hyphens between segments.",
      );
      toast.error("Invalid slug format");
      return;
    }
    const payload: { name?: string; slug?: string } = {};
    if (n !== org.name) payload.name = n;
    if (s !== org.slug) payload.slug = s;
    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save");
      return;
    }
    setSaveOrgPending(true);
    try {
      const { organization } = await updateMyOrganization(payload);
      setOrg(organization);
      await authActions.refreshUser();
      toast.success("Organization updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    } finally {
      setSaveOrgPending(false);
    }
  };

  const onConfirmLeave = async () => {
    setLeavePending(true);
    try {
      await leaveOrganization();
      await authActions.refreshUser();
      setOrg(null);
      setLeaveOpen(false);
      toast.success("You have left the organization");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not leave");
    } finally {
      setLeavePending(false);
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
            Jobs and applications are scoped to this employer account. Share the
            slug so teammates can join from Organization → Join existing.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
            <CardDescription>
              Update the name or URL slug. Changing the slug does not move
              existing data; tell your team the new slug if they still need to
              join.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-detail-name">Company or team name</Label>
              <Input
                id="org-detail-name"
                value={detailName}
                onChange={(e) => {
                  setDetailName(e.target.value);
                  setDetailNameError(null);
                }}
                maxLength={200}
                aria-invalid={detailNameError ? "true" : undefined}
              />
              {detailNameError ? (
                <p className="text-destructive text-xs" role="alert">
                  {detailNameError}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-detail-slug">Slug</Label>
              <Input
                id="org-detail-slug"
                value={detailSlug}
                onChange={(e) => {
                  setDetailSlug(e.target.value.toLowerCase());
                  setDetailSlugError(null);
                }}
                maxLength={64}
                className="font-mono text-sm"
                aria-invalid={detailSlugError ? "true" : undefined}
              />
              <p className="text-muted-foreground text-xs">
                Lowercase letters, numbers, and hyphens only (no leading or
                trailing hyphen).
              </p>
              {detailSlugError ? (
                <p className="text-destructive text-xs" role="alert">
                  {detailSlugError}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void onCopySlug()}
              >
                <Copy className="size-4" aria-hidden />
                Copy slug
              </Button>
              <Button
                type="button"
                disabled={saveOrgPending}
                onClick={() => void onSaveOrgDetails()}
              >
                {saveOrgPending ? "Saving…" : "Save changes"}
              </Button>
            </div>

            <div className="space-y-2 border-destructive/40 border rounded-md p-4">
              <h3 className="text-destructive text-sm font-medium">
                Danger Zone
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You will lose access to this org&apos;s jobs and applications
                until you create or join another organization. The org and its
                data stay for your teammates.
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => setLeaveOpen(true)}
              >
                Leave organization…
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
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

        <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
          <DialogContent className="sm:max-w-md" showCloseButton>
            <DialogHeader>
              <DialogTitle>Leave this organization?</DialogTitle>
              <DialogDescription>
                You can join again later with the slug if a teammate shares it,
                or create a new org.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton={false}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLeaveOpen(false)}
                disabled={leavePending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={leavePending}
                onClick={() => void onConfirmLeave()}
              >
                {leavePending ? "Leaving…" : "Leave organization"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Set up your organization
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          You need an organization before you can publish jobs or review
          applicants. Create a new employer account, or join one a colleague
          already created using its slug.
        </p>
      </div>

      <div
        className="bg-muted/40 inline-flex rounded-lg border p-0.5"
        role="tablist"
        aria-label="Organization setup"
      >
        <Button
          type="button"
          variant={mode === "create" ? "default" : "ghost"}
          size="sm"
          className="rounded-md px-3"
          onClick={() => setMode("create")}
          aria-selected={mode === "create"}
          role="tab"
        >
          Create new
        </Button>
        <Button
          type="button"
          variant={mode === "join" ? "default" : "ghost"}
          size="sm"
          className="rounded-md px-3"
          onClick={() => setMode("join")}
          aria-selected={mode === "join"}
          role="tab"
        >
          Join existing
        </Button>
      </div>

      {mode === "create" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New organization</CardTitle>
            <CardDescription>
              Choose a display name and a unique URL slug (letters, numbers,
              single hyphens between segments). Your user is linked to this org
              automatically.
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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Join an existing org</CardTitle>
            <CardDescription>
              Ask an org admin for the slug from their Organization page (same
              format as when creating an org: lowercase letters, numbers, and
              hyphens).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-join-slug">Organization slug</Label>
              <Input
                id="org-join-slug"
                value={joinSlug}
                onChange={(e) => {
                  setJoinSlug(e.target.value.toLowerCase());
                  setJoinSlugError(null);
                }}
                placeholder="acme-hiring"
                maxLength={64}
                className="font-mono text-sm"
                aria-invalid={joinSlugError ? "true" : undefined}
                aria-describedby={
                  joinSlugError
                    ? "org-join-slug-error org-join-slug-hint"
                    : "org-join-slug-hint"
                }
              />
              <p
                id="org-join-slug-hint"
                className="text-muted-foreground text-xs"
              >
                Must match an existing organization exactly (same rules as the
                slug field when creating an org).
              </p>
              {joinSlugError ? (
                <p
                  id="org-join-slug-error"
                  role="alert"
                  className="text-destructive text-xs"
                >
                  {joinSlugError}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              disabled={joining}
              onClick={() => void onJoin()}
            >
              {joining ? "Joining…" : "Join organization"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
