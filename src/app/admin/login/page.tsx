import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-7 shadow-[var(--shadow-card)]">
        <h1 className="font-display text-xl font-extrabold text-body">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Enter the admin password to manage stock.</p>
        <LoginForm />
      </div>
    </div>
  );
}
