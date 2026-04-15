import { FullScreenAppLoader } from "@/components/layout/full-screen-app-loader";

/**
 * `/` always redirects (see `AuthProvider`). This is the only UI users should
 * see briefly while session resolution and navigation run.
 */
export default function RootEntryLoaderPage() {
  return <FullScreenAppLoader />;
}
