import type { Metadata } from 'next';
import { MonteCarloScenarioLab } from '@/components/marketing/MonteCarloScenarioLab.tsx';

export const metadata: Metadata = {
  title: 'Monte Carlo Scenario Lab',
  description: 'Interact with RipoDoc public demonstration fixtures through a transparent, browser-based Monte Carlo scenario lab with live percentile and sensitivity views.',
  alternates: { canonical: '/monte-carlo-scenario-lab' },
};

export default function MonteCarloScenarioLabPage() {
  return <MonteCarloScenarioLab />;
}
