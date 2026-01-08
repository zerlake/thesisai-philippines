'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Term {
  id?: string;
  term: string;
  conceptualDefinition: string;
  operationalDefinition: string;
  sourceType: string;
  variableLink: string;
}

interface DefinitionOfTermsProps {
  initialTerms?: Term[];
  onSave: (terms: Term[]) => void;
}

export function DefinitionOfTerms({ initialTerms = [], onSave }: DefinitionOfTermsProps) {
  const [terms, setTerms] = useState<Term[]>(initialTerms);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setTerms(initialTerms);
  }, [initialTerms]);

  const validateTerm = (term: Term, index: number): string[] => {
    const errors: string[] = [];

    if (!term.term.trim()) {
      errors.push('Term is required');
    }

    if (!term.conceptualDefinition.trim()) {
      errors.push('Conceptual definition is required');
    } else {
      // Check if conceptual definition contains measurement words (indicating it might be operational)
      const measurementWords = ['score', 'number of', 'frequency', 'count', 'measured', 'calculated', 'total'];
      const hasMeasurementWords = measurementWords.some(word =>
        term.conceptualDefinition.toLowerCase().includes(word)
      );
      if (hasMeasurementWords) {
        errors.push('Conceptual definition should not contain measurement words like "score", "number of", or "frequency"');
      }
    }

    if (!term.operationalDefinition.trim()) {
      errors.push('Operational definition is required');
    } else {
      // Check if operational definition lacks specific measurement indicators
      const lacksMeasurementIndicators = !/(instrument|scale|survey|test|rubric|checklist|score|rating|behavior|observed|measured|criterion|threshold|unit|percentage|time|duration|frequency|count)/i.test(term.operationalDefinition);

      if (lacksMeasurementIndicators) {
        errors.push('Operational definition should specify how the term will be measured or observed (instrument, indicators, behaviors, thresholds)');
      }
    }

    return errors;
  };

  const validateAllTerms = (): boolean => {
    const allErrors: Record<string, string[]> = {};
    let hasErrors = false;

    terms.forEach((term, index) => {
      const errors = validateTerm(term, index);
      if (errors.length > 0) {
        allErrors[`term-${index}`] = errors;
        hasErrors = true;
      }
    });

    setValidationErrors(allErrors);
    return !hasErrors;
  };

  const addTerm = () => {
    setTerms([
      ...terms,
      {
        term: '',
        conceptualDefinition: '',
        operationalDefinition: '',
        sourceType: 'researcher-defined',
        variableLink: '',
      }
    ]);
  };

  const updateTerm = (index: number, field: keyof Term, value: string) => {
    const newTerms = [...terms];
    newTerms[index] = { ...newTerms[index], [field]: value };
    setTerms(newTerms);

    // Clear validation errors for this term when it's updated
    if (validationErrors[`term-${index}`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`term-${index}`];
      setValidationErrors(newErrors);
    }
  };

  const removeTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
    // Clear validation errors for this term
    if (validationErrors[`term-${index}`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`term-${index}`];
      setValidationErrors(newErrors);
    }
  };

  const handleSave = async () => {
    if (!validateAllTerms()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(terms);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Definition of Terms</h2>
          <p className="text-muted-foreground">
            Define key terms with both conceptual and operational definitions
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Terms'}
        </Button>
      </div>

      <div className="space-y-4">
        {terms.map((term, index) => (
          <Card key={index} className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Term #{index + 1}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTerm(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Define both conceptual and operational definitions for this term
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`term-${index}`}>
                    Term <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`term-${index}`}
                    value={term.term}
                    onChange={(e) => updateTerm(index, 'term', e.target.value)}
                    placeholder="Enter the term"
                    className={validationErrors[`term-${index}`]?.some(error => error.includes('Term is required')) ? 'border-destructive' : ''}
                  />
                  {validationErrors[`term-${index}`]?.some(error => error.includes('Term is required')) && (
                    <p className="text-destructive text-sm">{validationErrors[`term-${index}`].find(error => error.includes('Term is required'))}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`variable-link-${index}`}>
                    Variable Link (Optional)
                  </Label>
                  <Input
                    id={`variable-link-${index}`}
                    value={term.variableLink}
                    onChange={(e) => updateTerm(index, 'variableLink', e.target.value)}
                    placeholder="Link to research variable (e.g., IV, DV, Moderator)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`conceptual-${index}`}>
                    Conceptual Definition <span className="text-destructive">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>
                          Explain what this term means in theory or in the literature. 
                          Avoid measurement words like 'score', 'number of', or 'frequency'.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id={`conceptual-${index}`}
                  value={term.conceptualDefinition}
                  onChange={(e) => updateTerm(index, 'conceptualDefinition', e.target.value)}
                  placeholder="Explain what this term means in theory or in the literature..."
                  rows={3}
                  className={validationErrors[`term-${index}`]?.some(error =>
                    error.includes('Conceptual definition is required') ||
                    error.includes('Conceptual definition should not contain measurement words')
                  ) ? 'border-destructive' : ''}
                />
                {(validationErrors[`term-${index}`]?.some(error =>
                  error.includes('Conceptual definition is required') ||
                  error.includes('Conceptual definition should not contain measurement words')
                )) && (
                  <div className="space-y-1">
                    {validationErrors[`term-${index}`]
                      .filter(error =>
                        error.includes('Conceptual definition is required') ||
                        error.includes('Conceptual definition should not contain measurement words')
                      )
                      .map((error, idx) => (
                        <p key={idx} className="text-destructive text-sm">{error}</p>
                      ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`operational-${index}`}>
                    Operational Definition <span className="text-destructive">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>
                          Explain how this study will observe, apply, or measure this term 
                          (instrument, indicators, behaviors, thresholds, coding rules). 
                          Imagine instructing another researcher how to collect the data.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id={`operational-${index}`}
                  value={term.operationalDefinition}
                  onChange={(e) => updateTerm(index, 'operationalDefinition', e.target.value)}
                  placeholder="Explain how this study will observe, apply, or measure this term..."
                  rows={3}
                  className={validationErrors[`term-${index}`]?.some(error =>
                    error.includes('Operational definition is required') ||
                    error.includes('Operational definition should specify how the term will be measured')
                  ) ? 'border-destructive' : ''}
                />
                {(validationErrors[`term-${index}`]?.some(error =>
                  error.includes('Operational definition is required') ||
                  error.includes('Operational definition should specify how the term will be measured')
                )) && (
                  <div className="space-y-1">
                    {validationErrors[`term-${index}`]
                      .filter(error =>
                        error.includes('Operational definition is required') ||
                        error.includes('Operational definition should specify how the term will be measured')
                      )
                      .map((error, idx) => (
                        <p key={idx} className="text-destructive text-sm">{error}</p>
                      ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`source-type-${index}`}>
                  Source Type
                </Label>
                <Select 
                  value={term.sourceType} 
                  onValueChange={(value) => updateTerm(index, 'sourceType', value)}
                >
                  <SelectTrigger id={`source-type-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="article">Journal Article</SelectItem>
                    <SelectItem value="law">Law/Policy</SelectItem>
                    <SelectItem value="local-policy">Local Policy</SelectItem>
                    <SelectItem value="researcher-defined">Researcher Defined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button onClick={addTerm} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Term
        </Button>
      </div>

      {/* Educational section about conceptual vs operational definitions */}
      <Card className="border border-border bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Understanding Conceptual vs Operational Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Conceptual Definition</h4>
              <p className="text-sm text-muted-foreground">
                Explains what the concept <em>means</em> in theory or in the literature. 
                Comparable to a refined dictionary or textbook explanation tailored to the study's field.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Example:</strong> Academic motivation is the internal process that initiates and sustains students' goal-directed learning behavior.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Operational Definition</h4>
              <p className="text-sm text-muted-foreground">
                Explains <em>how the study will observe, apply, or measure</em> that concept in practice. 
                Specifies instruments, indicators, cut-off points, or coding rules.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Example:</strong> In this study, academic motivation refers to the total score obtained by respondents on the 20-item Academic Motivation Scale, with higher scores indicating stronger motivation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}