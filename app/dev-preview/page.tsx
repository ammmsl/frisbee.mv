/**
 * Dev-only component showcase page.
 * Visit: http://localhost:3000/dev-preview
 * DELETE THIS FILE (and ComponentShowcase.tsx) before Phase 1 ships.
 *
 * Note: The _dev directory uses Next.js private folder convention (_prefix)
 * which opts it out of routing. This page lives at /dev-preview instead.
 */

import ComponentShowcase from './ComponentShowcase';

export const metadata = { title: 'Component Showcase (Dev Only)' };

export default function DevPreviewPage() {
  return <ComponentShowcase />;
}
