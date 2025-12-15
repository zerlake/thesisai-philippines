# Defense PPT Coach - Sample Data Guide

## Overview

Sample data files have been created to help users understand and learn from realistic thesis defense presentations. These samples demonstrate best practices for structure, timing, content, and Q&A preparation.

## Files Created

### 1. `/src/lib/defense-ppt-samples.ts`
**Location:** `src/lib/defense-ppt-samples.ts`

Contains TypeScript interfaces and sample data:

```typescript
// Sample Proposal Defense (15 minutes, Chapters 1-3)
export const sampleProposalDefense: DefensePlan

// Sample Final Defense (25 minutes, All chapters)
export const sampleFinalDefense: DefensePlan

// Sample Q&A data
export const sampleQAPairs = {
  proposal: [...],
  final: [...]
}

// Sample presentations by field
export const samplePresentationsByTopic = {
  engineering: {...},
  medicine: {...},
  business: {...},
  psychology: {...}
}
```

### 2. `/src/app/defense-ppt-coach/samples/page.tsx`
**Location:** `src/app/defense-ppt-coach/samples/page.tsx`
**Route:** `/defense-ppt-coach/samples`

Interactive page to browse, learn from, and copy sample presentations.

## Sample Data Details

### Proposal Defense Sample

**Topic:** Factors Affecting Student Academic Performance in Philippine Public Schools

**Format:**
- Duration: 15 minutes
- Slides: 8
- Chapters: 1-3 (Proposal scope)
- Field: Education

**Slide Structure:**
1. Title Slide (30s) - Introduction and basic info
2. Background & Significance (90s) - Context and importance
3. Research Problem (90s) - Gap to be addressed
4. Research Questions & Objectives (60s) - What will be studied
5. Proposed Methodology (120s) - How the research will be conducted
6. Expected Outcomes (60s) - What results are anticipated
7. Timeline (45s) - Project schedule
8. Questions (60s) - Q&A and closing

**Key Features:**
- Each slide has 2-3 concise bullets (under 100 characters each)
- Presenter notes provide 30-60 second speaking scripts
- Realistic time estimates for each slide
- Total time matches 15-minute budget

**Real-World Usage:**
- Shows how to compress complex research into concise bullets
- Demonstrates proper transitions between sections
- Example presenter notes for each slide
- Realistic speaking pace and timing

### Final Defense Sample

**Topic:** Digital Literacy Programs and Student Achievement in Rural Philippine Schools

**Format:**
- Duration: 25 minutes
- Slides: 10
- Chapters: 1-5 (All chapters)
- Field: Education with Research Methods

**Slide Structure:**
1. Title Slide (30s)
2. Introduction & Background (90s)
3. Literature Review Summary (120s)
4. Research Methodology (120s)
5. Key Findings (150s) ← Longest section
6. Discussion (120s)
7. Conclusions (90s)
8. Limitations & Future Research (90s)
9. Contributions to Knowledge (60s)
10. Thank You (60s)

**Key Differences from Proposal:**
- Much longer results/findings section (150s vs 60s)
- Includes full discussion of implications
- Addresses limitations upfront
- Emphasizes contributions to the field
- More sophisticated analysis (e.g., β coefficients, effect sizes)

### Q&A Samples

#### Proposal Q&A Examples:

1. **Q:** Why focus on socioeconomic factors rather than individual student characteristics?
   **A:** (Explains policy actionability vs. individual factors)

2. **Q:** How will you ensure the survey is valid and reliable?
   **A:** (Details validation approach: pilot testing, Cronbach's α targets)

3. **Q:** What is your sample size justification?
   **A:** (References power analysis and statistical method)

4. **Q:** How will you handle missing data?
   **A:** (Explains MCAR assumptions and MICE approach)

#### Final Defense Q&A Examples:

1. **Q:** Why quasi-experimental design instead of RCT?
   **A:** (Explains ethical constraints and alternative methodology)

2. **Q:** The 23% improvement seems high. How confident are you?
   **A:** (Provides confidence interval and statistical verification)

3. **Q:** Why are effects stronger for females?
   **A:** (Hypothesizes mechanisms and suggests follow-up research)

4. **Q:** What is the cost-benefit ratio?
   **A:** (Provides specific numbers: ₱2,500/student, 23% improvement)

5. **Q:** How will quality be maintained during scale-up?
   **A:** (Explains cascade training model and QA mechanisms)

### Presentations by Topic

Pre-configured samples for different research fields:

#### Engineering
- **Title:** Optimization of Water Purification Systems for Rural Communities
- **Key Points:** Technical specs, cost analysis, field testing, maintenance, scale-up
- **Duration:** 25 minutes
- **Type:** Final Defense

#### Medicine
- **Title:** Effectiveness of Community Health Worker Programs in Maternal Mortality Reduction
- **Key Points:** Literature review, study design, outcomes, cost-effectiveness, policy implications
- **Duration:** 25 minutes
- **Type:** Final Defense

#### Business
- **Title:** Digital Transformation and SME Performance in the Philippine Retail Sector
- **Key Points:** Landscape analysis, SME survey results, adoption patterns, performance metrics, recommendations
- **Duration:** 25 minutes
- **Type:** Final Defense

#### Psychology
- **Title:** Mental Health Support Systems in Philippine Universities: A Case Study
- **Key Points:** Current landscape, institutional survey, barriers, intervention effectiveness, policy recommendations
- **Duration:** 25 minutes
- **Type:** Final Defense

## How to Use Sample Data

### For Students

1. **Browse Samples Page**
   - Visit `/defense-ppt-coach/samples`
   - Review proposal and final defense examples
   - Study Q&A frameworks

2. **Copy as Template**
   - Click "Copy as Template" on any sample
   - Data is saved to browser localStorage
   - Open in main Defense PPT Coach tool

3. **Customize for Your Research**
   - Replace titles with your research
   - Adapt bullets to your methodology
   - Update presenter notes with your speaking style
   - Adjust time estimates as needed

4. **Practice with Q&A**
   - Review likely questions for each slide type
   - Study suggested answer frameworks
   - Practice responses out loud
   - Refine answers based on panel feedback

### For Instructors/Advisors

1. **Share as Teaching Examples**
   - Show students how proposals should be structured
   - Demonstrate time management in presentations
   - Use Q&A samples for teaching panels

2. **Customize for Your Institution**
   - Adapt samples to your university's requirements
   - Add field-specific examples from your discipline
   - Create institution-specific templates

3. **Use in Workshops**
   - Present samples to show presentation best practices
   - Have students critique and improve samples
   - Use as rubric examples for evaluation

## Data Structure Reference

```typescript
interface Slide {
  id: string;                    // Unique identifier
  title: string;                 // Slide title
  bullets: string[];             // 2-3 bullet points max
  notes: string;                 // Presenter notes (30-60 sec script)
  timeEstimate: number;          // Seconds
  order: number;                 // Position in presentation
}

interface DefensePlan {
  id: string;                    // Plan identifier
  thesisId?: string;             // Optional link to thesis
  defenseType: 'proposal' | 'final';
  totalTime: number;             // Minutes
  slideCount: number;            // Number of slides
  chaptersToInclude: number[];   // Which chapters covered
  slides: Slide[];               // Array of slides
  createdAt: Date;
  updatedAt: Date;
}
```

## Best Practices Demonstrated

### Content Guidelines
- ✓ 2-3 bullets per slide maximum
- ✓ Bullets under 100 characters
- ✓ No full sentences, only key points
- ✓ One main idea per slide

### Timing Guidelines
- ✓ 1.5-2 minutes per slide average
- ✓ 30-60 second presenter notes
- ✓ Results section gets most time
- ✓ Q&A buffer built into total

### Structure Guidelines
- ✓ Clear linear progression
- ✓ Proper transitions between sections
- ✓ Consistent formatting
- ✓ Audience-focused content

### Q&A Guidelines
- ✓ Questions test understanding of methodology
- ✓ Questions address methodological limitations
- ✓ Answer frameworks are complete but concise
- ✓ Includes both expected and challenging questions

## Customization Examples

### Example 1: Engineering Thesis

**From sample proposal on education:**
```
Title: Factors Affecting Student Academic Performance
Problem: 56% dropout rate, limited local research
```

**Adapted to engineering:**
```
Title: Optimization of Water Treatment Systems for Rural Communities
Problem: 45% of villages lack clean water, existing systems 60% efficient
```

### Example 2: Medical Thesis

**From sample final on education:**
```
Findings: 23% improvement in academic performance
Effects stronger for low-income students
```

**Adapted to medicine:**
```
Findings: 35% reduction in maternal mortality
Effects stronger in underserved regions
```

## Accessing Sample Data in Code

```typescript
// Import samples in your components
import { 
  sampleProposalDefense, 
  sampleFinalDefense,
  sampleQAPairs,
  samplePresentationsByTopic 
} from '@/lib/defense-ppt-samples';

// Use in your page
const plan = sampleProposalDefense;

// Access individual data
plan.slides.forEach(slide => {
  console.log(slide.title, slide.timeEstimate);
});

// Get Q&A for a defense type
const qa = sampleQAPairs[plan.defenseType];
```

## Future Sample Additions

Recommended samples to add:

1. **Quantitative vs Qualitative**
   - Sample qualitative research presentation
   - Different Q&A frameworks
   - Different results presentation

2. **Field-Specific Templates**
   - STEM (Engineering, Physics, Chemistry)
   - Health Sciences (Medicine, Nursing, Public Health)
   - Social Sciences (Psychology, Sociology, Anthropology)
   - Humanities (Literature, History, Philosophy)

3. **Regional Examples**
   - Tagalog/Filipino presenter notes
   - Mixed English-Tagalog presentations
   - Culturally adapted examples

4. **Defense Type Variations**
   - Master's thesis defense
   - Ph.D. dissertation defense
   - Undergraduate thesis defense
   - Research project presentation

## Testing the Samples

The samples page can be accessed at `/defense-ppt-coach/samples` and includes:

- Tab interface for browsing samples
- Copy-to-template functionality
- Q&A preview
- Field-specific templates
- Usage tips and guidelines

Each sample is fully functional and can be immediately used as a starting point for student presentations.

## Questions & Support

If you need to:

- **Add new samples:** Edit `/src/lib/defense-ppt-samples.ts`
- **Modify sample page:** Edit `/src/app/defense-ppt-coach/samples/page.tsx`
- **Create field-specific samples:** Follow the structure of existing samples and add to `samplePresentationsByTopic`
- **Update Q&A pairs:** Modify `sampleQAPairs` with new questions and answers
