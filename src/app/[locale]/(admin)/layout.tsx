import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
