import SiteNav from "@/app/_components/SiteNav";
import SiteFooter from "@/app/_components/SiteFooter";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* Light theme scope — enforced here so /league/* can use data-theme="dark" */
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      <SiteNav />
      {/* pt-16 offsets the fixed transparent nav; home hero uses -mt-16 to sit behind it */}
      <main id="main-content" className="flex-1 pt-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
