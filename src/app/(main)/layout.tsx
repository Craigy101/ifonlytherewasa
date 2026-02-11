import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

import { SidebarAd } from "@/components/ads/SidebarAd";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen pt-14 sm:pt-16 pb-16 lg:pb-0">
        <Sidebar className="hidden lg:block w-64 shrink-0" />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-6 w-full">
          {children}
        </main>
        <aside className="hidden xl:block w-72 shrink-0 px-4 py-6">
          <div className="sticky top-20">
            <SidebarAd />
          </div>
        </aside>
      </div>
      <MobileNav className="lg:hidden" />
      <Footer />
    </>
  );
}
