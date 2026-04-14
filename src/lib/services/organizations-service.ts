import { API_ROUTES } from "@/lib/configs/api";
import { api } from "@/lib/utils/api-client";
import { handleError } from "@/lib/utils/handleError";
import type { Organization } from "@/types/organizations.types";
import type { User } from "@/types/auth.types";

export async function getMyOrganization(): Promise<Organization> {
  try {
    const res = await api.get(API_ROUTES.ORGANIZATIONS.ME);
    const org = (res.data?.data as { organization?: Organization } | undefined)
      ?.organization;
    if (!org?.id) throw new Error("No organization");
    return org;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function createOrganization(body: {
  name: string;
  slug: string;
}): Promise<{ organization: Organization; user: User }> {
  try {
    const res = await api.post(API_ROUTES.ORGANIZATIONS.CREATE, body);
    const data = res.data?.data as
      | { organization?: Organization; user?: User }
      | undefined;
    if (!data?.organization?.id || !data.user?.id) {
      throw new Error("Invalid response");
    }
    return { organization: data.organization, user: data.user };
  } catch (e) {
    throw new Error(handleError(e));
  }
}
