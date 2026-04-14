import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS_HELP,
  APPLICATION_STATUS_LABEL,
} from "@/lib/applications/candidate-copy";
import type { ApplicationStatus } from "@/types/applications.types";

export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const variant =
    status === "REJECTED"
      ? "destructive"
      : status === "COMPLETED"
        ? "secondary"
        : "default";

  return (
    <span title={APPLICATION_STATUS_HELP[status]} className="inline-flex">
      <Badge variant={variant}>{APPLICATION_STATUS_LABEL[status]}</Badge>
    </span>
  );
}
