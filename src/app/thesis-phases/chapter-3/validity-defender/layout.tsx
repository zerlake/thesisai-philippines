import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Validity Defender | Thesis Defense Preparation | ThesisAI',
  description:
    'Prepare compelling evidence for your thesis defense by validating your research instruments, generating defense responses, and practicing with AI-powered scoring.',
  keywords: [
    'thesis defense',
    'instrument validation',
    'validity evidence',
    'research methodology',
    'defense preparation',
  ],
};

export default function ValidityDefenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
