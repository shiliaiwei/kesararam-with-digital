import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import data from "@/app/dashboard/data.json";
import { RBACForm } from "@/components/dashboard/rbac-form";
import { CloudinaryDemo } from "@/components/dashboard/cloudinary-demo";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of the KWD platform admin panel.
          </p>
        </div>
      </div>
      
      <SectionCards />
      
      <div className="grid gap-4 md:grid-cols-2 px-4 lg:px-6">
         <RBACForm />
         <CloudinaryDemo />
      </div>

      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      
      <div className="px-4 lg:px-6">
        <DataTable data={data} />
      </div>
    </div>
  );
}
