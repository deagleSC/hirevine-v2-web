"use client";

import * as React from "react";
import { Drawer as VaulDrawer } from "vaul";

import { cn } from "@/lib/utils";

function Drawer({
  shouldScaleBackground = false,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Root>) {
  return (
    <VaulDrawer.Root shouldScaleBackground={shouldScaleBackground} {...props} />
  );
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof VaulDrawer.Trigger>) {
  return <VaulDrawer.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof VaulDrawer.Close>) {
  return <VaulDrawer.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Overlay>) {
  return (
    <VaulDrawer.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Content>) {
  return (
    <VaulDrawer.Portal>
      <DrawerOverlay />
      <VaulDrawer.Content
        data-slot="drawer-content"
        className={cn(
          "bg-background text-foreground fixed z-50 flex flex-col overflow-hidden bg-clip-padding text-sm shadow-xl will-change-transform",
          "inset-x-0 bottom-0 h-auto max-h-[96dvh] rounded-t-2xl border-t border-border",
          className,
        )}
        {...props}
      >
        <VaulDrawer.Handle className="bg-muted mx-auto mt-3 mb-1 h-1.5 w-10 shrink-0 rounded-full opacity-80" />
        {children}
      </VaulDrawer.Content>
    </VaulDrawer.Portal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Title>) {
  return (
    <VaulDrawer.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-medium", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Description>) {
  return (
    <VaulDrawer.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
