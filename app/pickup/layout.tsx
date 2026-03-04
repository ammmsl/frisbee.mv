import SiteNav from '@/app/_components/SiteNav';
import SiteFooter from '@/app/_components/SiteFooter';
import PickupNav from './PickupNav';

export default function PickupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      <SiteNav />
      {/* pt-16 offsets the fixed SiteNav; PickupNav sits immediately below */}
      <div className="pt-16">
        <PickupNav />
      </div>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
