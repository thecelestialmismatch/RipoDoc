import type { Metadata } from 'next';
import { MonteCarloScenarioLab } from '@/components/marketing/MonteCarloScenarioLab.tsx';

export const metadata: Metadata = {
  title: 'Monte Carlo Scenario Lab',
  description: 'Compare two RipoDoc public demonstration-fixture Monte Carlo runs, inspect live percentile overlays, set transparent local stress assumptions, and download a browser-generated comparison report without customer data or predictive claims.',
  alternates: { canonical: '/monte-carlo-scenario-lab' },
};

export default function MonteCarloScenarioLabPage() {
  return <MonteCarloScenarioLab />;
}
