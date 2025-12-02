import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chapter 3 - Methodology | ThesisAI',
  description: 'Develop and validate your research methodology with AI-powered tools.',
};

export default function Chapter3Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
