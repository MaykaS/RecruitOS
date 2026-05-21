import { ModuleView } from "@/components/recruitos/module-view";
import { ModuleSlug, NAV_ITEMS } from "@/lib/recruitos";
import { notFound } from "next/navigation";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const valid = NAV_ITEMS.some((item) => item.slug === module);
  if (!valid) notFound();
  return <ModuleView slug={module as ModuleSlug} />;
}
