import { bsuGuide } from "./bsu";
import { buksuGuide } from "./buksu";
import { cmuGuide } from "./cmu";
import { dlsuGuide } from "./dlsu";
import { msuGuide } from "./msu";
import { nemsuGuide } from "./nemsu";
import { pnuGuide } from "./pnu";
import { pupGuide } from "./pup";
import { vsuGuide } from "./vsu";
import { type UniversityGuide } from "./types";

export const universityGuides: UniversityGuide[] = [
  bsuGuide,
  buksuGuide,
  cmuGuide,
  dlsuGuide,
  msuGuide,
  nemsuGuide,
  pnuGuide,
  pupGuide,
  vsuGuide,
].sort((a, b) => a.school.localeCompare(b.school));

export * from "./types";