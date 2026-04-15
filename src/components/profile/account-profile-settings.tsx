"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authActions, useAuthStore } from "@/store";
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

export function AccountProfileSettings() {
  const user = useAuthStore((s) => s.user);
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) setDisplayName(user.displayName);
  }, [user]);

  if (!user) return null;

  const onSaveDisplayName = async () => {
    const next = displayName.trim();
    if (next === user.displayName) {
      toast.info("No changes to save");
      return;
    }
    setSavingProfile(true);
    try {
      await authActions.patchProfile({ displayName: next });
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async () => {
    if (!newPassword && !currentPassword && !confirmPassword) {
      toast.info("Enter a new password to update");
      return;
    }
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await authActions.patchProfile({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Update how you appear and your sign-in password. Account email is{" "}
          <span className="text-foreground font-medium">{user.email}</span>{" "}
          (change via support later if needed).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display name</CardTitle>
          <CardDescription>
            Optional. Shown in the sidebar and menus instead of your email when
            set.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-display">Name</Label>
            <Input
              id="profile-display"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={120}
              placeholder={user.email}
              autoComplete="name"
            />
          </div>
          <Button
            type="button"
            disabled={savingProfile}
            onClick={() => void onSaveDisplayName()}
          >
            {savingProfile ? "Saving…" : "Save display name"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
          <CardDescription>
            Use at least 8 characters. You must enter your current password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-current-pw">Current password</Label>
            <Input
              id="profile-current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-new-pw">New password</Label>
            <Input
              id="profile-new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-confirm-pw">Confirm new password</Label>
            <Input
              id="profile-confirm-pw"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={savingPassword}
            onClick={() => void onChangePassword()}
          >
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
