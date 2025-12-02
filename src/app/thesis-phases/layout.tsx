import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thesis Phase Workstations | ThesisAI',
  description:
    'Navigate through each phase of your thesis journey with dedicated workstations and specialized tools.',
};

export default function ThesisPhasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
