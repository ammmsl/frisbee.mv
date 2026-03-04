import type { Metadata } from 'next';
import TeamDrafter from './TeamDrafter';

export function generateMetadata(): Metadata {
  return {
    title: 'Team Drafter | frisbee.mv',
  };
}

export default function DraftPage() {
  return <TeamDrafter />;
}
