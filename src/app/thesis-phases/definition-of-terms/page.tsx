'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, BookText, Bot } from 'lucide-react';
import { DefinitionOfTerms } from '@/components/definition-of-terms';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/integrations/supabase/client';

interface Term {
  id?: string;
  term: string;
  conceptualDefinition: string;
  operationalDefinition: string;
  sourceType: string;
  variableLink: string;
}

export default function DefinitionOfTermsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [terms, setTerms] = useState<Term[]>([]);
  const [originalTerms, setOriginalTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sampleDataLoaded, setSampleDataLoaded] = useState(false);
  const [manualTermInput, setManualTermInput] = useState("");
  const [isManualGenerating, setIsManualGenerating] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchTerms = async () => {
      try {
        // First, get the latest study guide that might contain terms
        const { data: guides, error: guidesError } = await supabase
          .from('study_guides')
          .select('id')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (guidesError) {
          console.error('Error fetching guides:', guidesError);
          setTerms([]);
        } else if (guides && guides.length > 0) {
          // Get terms for the latest guide
          const { data: terms, error: termsError } = await supabase
            .from('study_guide_terms')
            .select('*')
            .eq('guide_id', guides[0].id)
            .order('created_at', { ascending: true });

          if (termsError) {
            console.error('Error fetching terms:', termsError);
            setTerms([]);
          } else {
            // Map the database fields to our component format
            const mappedTerms = terms.map((term: any) => ({
              id: term.id,
              term: term.term,
              conceptualDefinition: term.conceptual_definition || '',
              operationalDefinition: term.operational_definition || '',
              sourceType: term.source_type || 'researcher-defined',
              variableLink: term.variable_link || '',
            }));
            setTerms(mappedTerms);
            setOriginalTerms([...mappedTerms]); // Store original terms
          }
        } else {
          // No guides exist yet, start with empty terms
          setTerms([]);
          setOriginalTerms([]);
        }
      } catch (error) {
        console.error('Error fetching terms:', error);
        setTerms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [session]);

  const handleSave = async (termsToSave: Term[]) => {
    if (!session) return;

    setSaving(true);
    try {
      // Save to the database using the study guides API
      const response = await fetch('/api/study-guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Definition of Terms',
          executiveSummary: 'Key terms with conceptual and operational definitions',
          sections: [],
          keyTerms: termsToSave,
          studyTips: [],
          citationsList: [],
          estimatedReadingTime: 0
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Terms saved successfully:', result);
        // Update original terms to match current terms after successful save
        setOriginalTerms([...terms]);
      } else {
        console.error('Failed to save terms');
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Error saving terms:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading terms...</p>
        </div>
      </div>
    );
  }

  // Course options for the dropdown
  const courseOptions = [
    { value: "computer-science", label: "Computer Science" },
    { value: "information-technology", label: "Information Technology" },
    { value: "business-administration", label: "Business Administration" },
    { value: "education", label: "Education" },
    { value: "psychology", label: "Psychology" },
    { value: "engineering", label: "Engineering" },
    { value: "nursing", label: "Nursing" },
    { value: "medicine", label: "Medicine" },
    { value: "law", label: "Law" },
    { value: "economics", label: "Economics" },
    { value: "mathematics", label: "Mathematics" },
    { value: "biology", label: "Biology" },
    { value: "chemistry", label: "Chemistry" },
    { value: "physics", label: "Physics" },
    { value: "literature", label: "Literature" },
    { value: "history", label: "History" },
    { value: "sociology", label: "Sociology" },
    { value: "political-science", label: "Political Science" },
    { value: "environmental-science", label: "Environmental Science" },
    { value: "architecture", label: "Architecture" },
  ];

  const loadSampleData = () => {
    if (sampleDataLoaded) {
      // If sample data is currently loaded, restore original terms
      setTerms([...originalTerms]);
      setSampleDataLoaded(false);
    } else {
      // Load sample data
      const sampleTerms = [
        {
          term: "Academic Motivation",
          conceptualDefinition: "Academic motivation refers to the internal process that initiates and sustains students' goal-directed learning behavior. It encompasses the reasons and goals that drive students to engage in academic tasks and persist in their educational pursuits.",
          operationalDefinition: "In this study, academic motivation is measured using the Academic Motivation Scale (AMS), a 28-item Likert-scale questionnaire with responses ranging from 1 (does not correspond at all) to 7 (corresponds exactly). Higher scores indicate stronger academic motivation.",
          sourceType: "article",
          variableLink: "dependent-variable"
        },
        {
          term: "Digital Literacy",
          conceptualDefinition: "Digital literacy is the ability to use information and communication technologies to find, evaluate, create, and communicate information, requiring both cognitive and technical skills in digital environments.",
          operationalDefinition: "Digital literacy is assessed through the Digital Literacy Assessment Tool, which evaluates students' proficiency in five areas: information literacy, digital communication, digital content creation, safety and security, and problem-solving. Scores range from 0-100 with higher scores indicating higher digital literacy.",
          sourceType: "book",
          variableLink: "independent-variable"
        },
        {
          term: "Thesis Completion Rate",
          conceptualDefinition: "The thesis completion rate represents the proportion of students who successfully finish their thesis or dissertation within a specified timeframe relative to those who initially enrolled in the thesis-writing process.",
          operationalDefinition: "Calculated as the number of students who defended and submitted their final thesis within 12 months divided by the total number of students who registered for thesis writing, expressed as a percentage.",
          sourceType: "researcher-defined",
          variableLink: "outcome-variable"
        }
      ];

      setTerms(sampleTerms);
      setSampleDataLoaded(true);
    }
  };


  const generateManualTermDefinition = async () => {
    if (!manualTermInput.trim()) {
      alert("Please enter a term to define");
      return;
    }

    setIsManualGenerating(true);
    try {
      let newTerms: Term[] = [];

      // Generate definition for manually entered term
      // In a real implementation, this would call the Puter AI API
      // For now, we'll simulate AI-generated definitions based on common academic terms
      const term = manualTermInput.trim();

      // Basic logic to generate more realistic definitions based on the term
      let conceptualDef = "";
      let operationalDef = "";

      // Create more specific definitions based on the term and selected course
      const lowerTerm = term.toLowerCase();
      const selectedCourseName = selectedCourse ? courseOptions.find(option => option.value === selectedCourse)?.label : "your research";

      if (lowerTerm.includes('technology') || lowerTerm.includes('tech')) {
        conceptualDef = "Technology refers to the application of scientific knowledge for practical purposes, especially in industry and other areas such as education, communication, and research. It encompasses tools, systems, methods, and processes used to solve problems or achieve objectives.";
        operationalDef = selectedCourse ?
          `In ${selectedCourseName}-related studies, technology is measured through a Technology Adoption Scale assessing frequency of use, proficiency levels, and perceived usefulness using a 5-point Likert scale from 'Strongly Disagree' to 'Strongly Agree'.` :
          `In this study, technology is measured through a Technology Adoption Scale assessing frequency of use, proficiency levels, and perceived usefulness using a 5-point Likert scale from 'Strongly Disagree' to 'Strongly Agree'.`;
      } else if (lowerTerm.includes('motivation') || lowerTerm.includes('motivate')) {
        conceptualDef = "Motivation is the internal process that initiates, guides, and maintains goal-oriented behaviors. It encompasses the reasons and drives that cause individuals to pursue certain actions or goals.";
        operationalDef = selectedCourse ?
          `In ${selectedCourseName} contexts, motivation is assessed using the Academic Motivation Scale (AMS), a 28-item questionnaire measuring intrinsic motivation, extrinsic motivation, and amotivation with responses on a 7-point Likert scale.` :
          `In this study, motivation is assessed using the Academic Motivation Scale (AMS), a 28-item questionnaire measuring intrinsic motivation, extrinsic motivation, and amotivation with responses on a 7-point Likert scale.`;
      } else if (lowerTerm.includes('performance') || lowerTerm.includes('achievement')) {
        conceptualDef = "Performance refers to the accomplishment of a given task measured against preset standards of accuracy, completeness, cost, and speed. It represents the execution or completion of activities that deliver results.";
        operationalDef = selectedCourse ?
          `In ${selectedCourseName} studies, performance is measured by grade point average (GPA), test scores, and project completion rates, with values ranging from 0.0 to 4.0 for GPA and 0-100 for test scores.` :
          `In this study, performance is measured by grade point average (GPA), test scores, and project completion rates, with values ranging from 0.0 to 4.0 for GPA and 0-100 for test scores.`;
      } else if (lowerTerm.includes('engagement') || lowerTerm.includes('engage')) {
        conceptualDef = "Engagement refers to the degree of attention, curiosity, interest, optimism, and passion that students show when they are learning or being taught.";
        operationalDef = selectedCourse ?
          `In ${selectedCourseName} contexts, student engagement is measured using the Student Engagement Instrument (SEI), a 35-item scale assessing behavioral, emotional, and cognitive engagement with responses from 1 (never) to 5 (always).` :
          `In this study, student engagement is measured using the Student Engagement Instrument (SEI), a 35-item scale assessing behavioral, emotional, and cognitive engagement with responses from 1 (never) to 5 (always).`;
      } else if (lowerTerm.includes('satisfaction') || lowerTerm.includes('satisfy')) {
        conceptualDef = "Satisfaction is the feeling of contentment or fulfillment derived from meeting or exceeding expectations, needs, or desires.";
        operationalDef = selectedCourse ?
          `In ${selectedCourseName} research, satisfaction is measured using a 5-point Likert scale survey with items ranging from 'Very Dissatisfied' (1) to 'Very Satisfied' (5), calculating an overall satisfaction index.` :
          `In this study, satisfaction is measured using a 5-point Likert scale survey with items ranging from 'Very Dissatisfied' (1) to 'Very Satisfied' (5), calculating an overall satisfaction index.`;
      } else {
        // Default for other terms
        conceptualDef = `${term} refers to the concept or phenomenon related to ${lowerTerm} within the context of this research. It encompasses the theoretical understanding and academic definition of this term.`;
        operationalDef = selectedCourse ?
          `${term} in ${selectedCourseName} studies is measured or assessed through specific instruments, scales, or observation methods relevant to this field. The measurement approach will depend on the specific context and variables in the research.` :
          `${term} is measured or assessed through specific instruments, scales, or observation methods relevant to this study. The measurement approach will depend on the specific context and variables in the research.`;
      }

      const newTerm: Term = {
        term: term,
        conceptualDefinition: conceptualDef,
        operationalDefinition: operationalDef,
        sourceType: "researcher-defined",
        variableLink: selectedCourse ? selectedCourse : ""
      };
      newTerms.push(newTerm);

      // Add the new terms to the existing terms
      setTerms([...terms, ...newTerms]);
      setManualTermInput(""); // Clear the input field
      setSampleDataLoaded(false); // Reset sample data state
    } catch (error) {
      console.error("Error generating definition for manual term:", error);
      alert("Failed to generate definition for the term. Please try again.");
    } finally {
      setIsManualGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Definition of Terms</h1>
                  <p className="text-sm text-muted-foreground">
                    Define key terms with conceptual and operational definitions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="course-select" className="text-sm font-medium text-muted-foreground">
                  Course:
                </label>
                <select
                  id="course-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                >
                  <option value="" className="text-muted-foreground">
                    Select Course
                  </option>
                  {courseOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-foreground bg-background"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualTermInput}
                  onChange={(e) => setManualTermInput(e.target.value)}
                  placeholder="Enter term to define..."
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground w-48"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      generateManualTermDefinition();
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={generateManualTermDefinition}
                  disabled={isManualGenerating || (!manualTermInput.trim() && !selectedCourse)}
                  className="flex items-center gap-2"
                >
                  <Bot className="h-4 w-4" />
                  {isManualGenerating ? 'Defining...' : 'Define Term'}
                </Button>
              </div>
              <Button
                variant={sampleDataLoaded ? "default" : "outline"}
                onClick={loadSampleData}
                className="flex items-center gap-2"
              >
                <BookText className="h-4 w-4" />
                {sampleDataLoaded ? 'Clear Sample' : 'Load Sample'}
              </Button>
              <Button
                onClick={() => handleSave(terms)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save All'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DefinitionOfTerms
          initialTerms={terms}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}