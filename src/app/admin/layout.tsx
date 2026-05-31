import Link from "next/link";
import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/auth";
import { logout as logoutAction } from "@/lib/admin-actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/admin" className="font-display text-lg font-extrabold">
            Select Trucks <span className="text-accent-bright">Admin</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {authed && (
              <>
                <Link href="/admin" className="text-muted-dark hover:text-white">Stock</Link>
                <Link href="/admin/enquiries" className="text-muted-dark hover:text-white">Enquiries</Link>
                <Link href="/" className="text-muted-dark hover:text-white" target="_blank">View site ↗</Link>
                <form action={logoutAction}>
                  <button className="rounded-md border border-white/20 px-3 py-1.5 font-semibold hover:bg-white/10">
                    Sign out
                  </button>
                </form>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
