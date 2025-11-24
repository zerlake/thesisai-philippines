"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Minus, 
  FileText, 
  Target, 
  ArrowRightLeft,
  GitBranch,
  Circle,
  Square,
  Triangle,
  Download,
} from "lucide-react";

type VariableType = "independent" | "dependent" | "intervening" | "moderating" | "control";

type Variable = {
  id: string;
  name: string;
  type: VariableType;
  description: string;
  measurement: string;
};

type Relationship = {
  id: string;
  sourceId: string;
  targetId: string;
  description: string;
  type: "causal" | "correlational" | "moderating";
};

export function VariableMappingTool() {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [newVariable, setNewVariable] = useState<Omit<Variable, 'id'>>({
    name: "",
    type: "independent",
    description: "",
    measurement: ""
  });
  const [newRelationship, setNewRelationship] = useState<Omit<Relationship, 'id'>>({
    sourceId: "",
    targetId: "",
    description: "",
    type: "causal"
  });
  const [selectedTab, setSelectedTab] = useState("builder");
  const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null);
  const [showVariableDetails, setShowVariableDetails] = useState(false);

  const addVariable = () => {
    if (!newVariable.name.trim()) return;
    
    const variable: Variable = {
      ...newVariable,
      id: `var-${Date.now()}`
    };
    
    setVariables([...variables, variable]);
    setNewVariable({
      name: "",
      type: "independent",
      description: "",
      measurement: ""
    });
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter(v => v.id !== id));
    // Also remove any relationships involving this variable
    setRelationships(relationships.filter(r => r.sourceId !== id && r.targetId !== id));
  };

  const addRelationship = () => {
    if (!newRelationship.sourceId || !newRelationship.targetId || !newRelationship.description.trim()) return;
    
    const relationship: Relationship = {
      ...newRelationship,
      id: `rel-${Date.now()}`
    };
    
    setRelationships([...relationships, relationship]);
    setNewRelationship({
      sourceId: "",
      targetId: "",
      description: "",
      type: "causal"
    });
  };

  const getVariableIcon = (type: VariableType) => {
    switch (type) {
      case "independent": return <Circle className="h-4 w-4" />;
      case "dependent": return <Square className="h-4 w-4" />;
      case "intervening": return <Square className="h-4 w-4 rotate-45" />;
      case "moderating": return <Triangle className="h-4 w-4" />;
      case "control": return <Target className="h-4 w-4" />;
    }
  };

  const getVariableColor = (type: VariableType) => {
    switch (type) {
      case "independent": return "bg-blue-100 text-blue-800 border-blue-300";
      case "dependent": return "bg-green-100 text-green-800 border-green-300";
      case "intervening": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "moderating": return "bg-purple-100 text-purple-800 border-purple-300";
      case "control": return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const exportFramework = () => {
    // In a real implementation, this would export the framework
    alert("Framework exported successfully!");
  };

  const handleVariableClick = (variable: Variable) => {
    setSelectedVariable(variable);
    setShowVariableDetails(true);
  };

  const updateVariable = (updatedVariable: Variable) => {
    setVariables(variables.map(v => v.id === updatedVariable.id ? updatedVariable : v));
    setSelectedVariable(updatedVariable);
  };

  const addSampleData = () => {
    // Sample variables
    const sampleVariables: Variable[] = [
      {
        id: `var-${Date.now()}-1`,
        name: "Social Media Usage",
        type: "independent",
        description: "Hours spent on social media platforms per day",
        measurement: "Self-reported daily hours via survey"
      },
      {
        id: `var-${Date.now()}-2`,
        name: "Academic Performance",
        type: "dependent",
        description: "Grade point average or test scores",
        measurement: "Official GPA from school records"
      },
      {
        id: `var-${Date.now()}-3`,
        name: "Study Time",
        type: "intervening",
        description: "Hours spent studying per day",
        measurement: "Self-reported study hours per week"
      },
      {
        id: `var-${Date.now()}-4`,
        name: "Sleep Quality",
        type: "moderating",
        description: "Quality of sleep measured by sleep score",
        measurement: "Sleep quality index survey"
      }
    ];
    
    // Sample relationships
    const sampleRelationships: Relationship[] = [
      {
        id: `rel-${Date.now()}-1`,
        sourceId: sampleVariables[0].id, // Social Media Usage
        targetId: sampleVariables[2].id, // Study Time
        description: "Increased social media usage reduces study time",
        type: "causal"
      },
      {
        id: `rel-${Date.now()}-2`,
        sourceId: sampleVariables[2].id, // Study Time
        targetId: sampleVariables[1].id, // Academic Performance
        description: "More study time improves academic performance",
        type: "causal"
      },
      {
        id: `rel-${Date.now()}-3`,
        sourceId: sampleVariables[3].id, // Sleep Quality
        targetId: sampleVariables[1].id, // Academic Performance
        description: "Better sleep quality moderates the relationship between study time and performance",
        type: "moderating"
      }
    ];
    
    setVariables(sampleVariables);
    setRelationships(sampleRelationships);
    alert("Sample data added successfully! Switch to Relationship Mapper or Conceptual Framework tabs to see them in action.");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Variable Mapping Tool</h1>
          <p className="text-muted-foreground">Define and visualize relationships between research variables</p>
        </div>
        <Button variant="outline" onClick={addSampleData} className="self-start">
          <FileText className="w-4 h-4 mr-2" />
          Add Sample Data
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Variable Builder</TabsTrigger>
          <TabsTrigger value="mapper">Relationship Mapper</TabsTrigger>
          <TabsTrigger value="framework">Conceptual Framework</TabsTrigger>
        </TabsList>
        
        <TabsContent value="builder" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Variable</CardTitle>
              <CardDescription>Define the variables in your research study</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="varName">Variable Name</Label>
                    <Input
                      id="varName"
                      placeholder="e.g., Cyber-bullying Category"
                      value={newVariable.name}
                      onChange={(e) => setNewVariable({...newVariable, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="varType">Variable Type</Label>
                    <Select value={newVariable.type} onValueChange={(value: VariableType) => setNewVariable({...newVariable, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="independent">Independent Variable</SelectItem>
                        <SelectItem value="dependent">Dependent Variable</SelectItem>
                        <SelectItem value="intervening">Intervening Variable</SelectItem>
                        <SelectItem value="moderating">Moderating Variable</SelectItem>
                        <SelectItem value="control">Control Variable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="varDescription">Description</Label>
                  <Textarea
                    id="varDescription"
                    placeholder="Briefly describe this variable..."
                    value={newVariable.description}
                    onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="varMeasurement">Measurement</Label>
                  <Input
                    id="varMeasurement"
                    placeholder="How will this variable be measured?"
                    value={newVariable.measurement}
                    onChange={(e) => setNewVariable({...newVariable, measurement: e.target.value})}
                  />
                </div>
                
                <Button onClick={addVariable} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Defined Variables</CardTitle>
              <CardDescription>Your research variables</CardDescription>
            </CardHeader>
            <CardContent>
              {variables.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>No variables defined yet. Add your first variable to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {variables.map((variable) => (
                    <Card key={variable.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getVariableIcon(variable.type)}
                            <CardTitle className="text-lg">{variable.name}</CardTitle>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeVariable(variable.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Badge className={getVariableColor(variable.type)}>
                          {variable.type.charAt(0).toUpperCase() + variable.type.slice(1)}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-2"><span className="font-medium">Description:</span> {variable.description}</p>
                        <p className="text-sm"><span className="font-medium">Measurement:</span> {variable.measurement}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapper" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Define Relationships</CardTitle>
              <CardDescription>Connect your variables to show relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {variables.length === 0 ? (
                  <div className="text-center p-4 bg-muted rounded-md">
                    <p className="text-muted-foreground">Create variables first to establish relationships</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sourceVar">Source Variable</Label>
                      <Select 
                        value={newRelationship.sourceId} 
                        onValueChange={(value) => setNewRelationship({...newRelationship, sourceId: value})}
                        disabled={variables.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source variable" />
                        </SelectTrigger>
                        <SelectContent>
                          {variables.map((variable) => (
                            <SelectItem key={variable.id} value={variable.id}>
                              {variable.name} ({variable.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="targetVar">Target Variable</Label>
                      <Select 
                        value={newRelationship.targetId} 
                        onValueChange={(value) => setNewRelationship({...newRelationship, targetId: value})}
                        disabled={variables.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target variable" />
                        </SelectTrigger>
                        <SelectContent>
                          {variables.map((variable) => (
                            <SelectItem key={variable.id} value={variable.id}>
                              {variable.name} ({variable.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="relType">Relationship Type</Label>
                    <Select value={newRelationship.type} onValueChange={(value: "causal" | "correlational" | "moderating") => setNewRelationship({...newRelationship, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="causal">Causal Relationship</SelectItem>
                        <SelectItem value="correlational">Correlational Relationship</SelectItem>
                        <SelectItem value="moderating">Moderating Relationship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="relDescription">Relationship Description</Label>
                    <Input
                      id="relDescription"
                      placeholder="e.g., X influences Y"
                      value={newRelationship.description}
                      onChange={(e) => setNewRelationship({...newRelationship, description: e.target.value})}
                      disabled={variables.length === 0}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={addRelationship} 
                  disabled={!newRelationship.sourceId || !newRelationship.targetId || variables.length === 0}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Add Relationship
                </Button>
                
                {variables.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Create variables in the &quot;Variable Builder&quot; tab to establish relationships here
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Defined Relationships</CardTitle>
              <CardDescription>Relationships between your research variables</CardDescription>
            </CardHeader>
            <CardContent>
              {relationships.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ArrowRightLeft className="mx-auto h-12 w-12 mb-4" />
                  <p>No relationships defined yet. Connect your variables to show relationships.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {relationships.map((relationship) => {
                    const source = variables.find(v => v.id === relationship.sourceId);
                    const target = variables.find(v => v.id === relationship.targetId);
                    
                    return (
                      <div key={relationship.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        <div className="flex items-center gap-1">
                          <Badge className={getVariableColor(source?.type || "independent")}>
                            {source?.name}
                          </Badge>
                          <ArrowRightLeft className="h-4 w-4" />
                          <Badge className={getVariableColor(target?.type || "independent")}>
                            {target?.name}
                          </Badge>
                        </div>
                        <div className="ml-2 flex-1">
                          <span className="text-sm">{relationship.description}</span>
                        </div>
                        <Badge variant="outline">{relationship.type}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="framework" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Conceptual Framework</CardTitle>
              <CardDescription>Visual representation of your research variables and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                {variables.length === 0 ? (
                  <div className="text-center">
                    <GitBranch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Define variables and relationships to generate your conceptual framework</p>
                  </div>
                ) : (
                  <div className="relative w-full h-[400px]">
                    {/* Connection lines using proximity and spatial grouping to show relationships */}
                    <svg 
                      className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none -z-0"
                      viewBox="0 0 400 400"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Relationship lines (without arrowheads) */}
                      {relationships.map((relationship) => {
                        const source = variables.find(v => v.id === relationship.sourceId);
                        const target = variables.find(v => v.id === relationship.targetId);
                        
                        if (!source || !target) return null;
                        
                        // Count variables of each type to calculate positioning
                        const independentVars = variables.filter(v => v.type === "independent");
                        const dependentVars = variables.filter(v => v.type === "dependent");
                        const otherVars = variables.filter(v => v.type === "intervening" || v.type === "moderating" || v.type === "control");
                        
                        // Calculate positions based on the specific variable's position in its group
                        let sourceX = 0, sourceY = 0, targetX = 0, targetY = 0;
                        
                        // Source position calculation
                        if (source.type === "independent") {
                          const sourceIndex = independentVars.findIndex(v => v.id === source.id);
                          sourceX = 80; // 20% of 400px - moved left for spacing
                          sourceY = 80 + (sourceIndex * 70); // Increased spacing from 60 to 70
                        } else if (source.type === "dependent") {
                          const sourceIndex = dependentVars.findIndex(v => v.id === source.id);
                          sourceX = 320; // 80% of 400px - moved right for spacing
                          sourceY = 80 + (sourceIndex * 70); // Increased spacing from 60 to 70
                        } else { // intervening, moderating, or control
                          const sourceIndex = otherVars.findIndex(v => v.id === source.id);
                          sourceX = 200; // 50% of 400px
                          sourceY = 320 + (sourceIndex * 60); // Lower position and increased spacing
                        }
                        
                        // Target position calculation
                        if (target.type === "dependent") {
                          const targetIndex = dependentVars.findIndex(v => v.id === target.id);
                          targetX = 320; // 80% of 400px - moved right for spacing
                          targetY = 80 + (targetIndex * 70); // Increased spacing from 60 to 70
                        } else if (target.type === "independent") {
                          const targetIndex = independentVars.findIndex(v => v.id === target.id);
                          targetX = 80; // 20% of 400px - moved left for spacing
                          targetY = 80 + (targetIndex * 70); // Increased spacing from 60 to 70
                        } else { // intervening, moderating, or control
                          const targetIndex = otherVars.findIndex(v => v.id === target.id);
                          targetX = 200; // 50% of 400px
                          targetY = 320 + (targetIndex * 60); // Lower position and increased spacing
                        }
                        
                        // Different line styles for different relationship types
                        let strokeDasharray = "none";
                        let strokeWidth = "2";
                        if (relationship.type === "moderating") {
                          strokeDasharray = "5,5"; // Dashed for moderating
                        } else if (relationship.type === "correlational") {
                          strokeDasharray = "2,2"; // Dotted for correlational
                        }
                        
                        return (
                          <line
                            key={relationship.id}
                            x1={sourceX}
                            y1={sourceY}
                            x2={targetX}
                            y2={targetY}
                            stroke="#3b82f6"
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                          />
                        );
                      })}
                    </svg>
                    
                    {/* Position independent variables on the left side */}
                    {variables.filter(v => v.type === "independent").map((variable, index) => (
                      <div 
                        key={variable.id} 
                        className="absolute text-center cursor-pointer hover:scale-105 transition-transform z-20"
                        style={{
                          top: `calc(${20 + (index * 17.5)}% - 30px)`, // Increased spacing from 15% to 17.5%, adjust for element height
                          left: '20%'  // Moved from 25% to 20% for more space
                        }}
                        title={`Type: ${variable.type}\n${variable.description}`}
                        onClick={() => handleVariableClick(variable)}
                      >
                        <div className={`p-3 rounded-full ${getVariableColor(variable.type)} border-2`}>
                          {getVariableIcon(variable.type)}
                        </div>
                        <div className="mt-2 text-xs font-medium max-w-[100px] truncate">{variable.name}</div>
                      </div>
                    ))}
                    
                    {/* Position dependent variables on the right side */}
                    {variables.filter(v => v.type === "dependent").map((variable, index) => (
                      <div 
                        key={variable.id} 
                        className="absolute text-center cursor-pointer hover:scale-105 transition-transform z-20"
                        style={{
                          top: `calc(${20 + (index * 17.5)}% - 30px)`, // Increased spacing from 15% to 17.5%, adjust for element height
                          left: '80%'  // Moved from 75% to 80% for more space
                        }}
                        title={`Type: ${variable.type}\n${variable.description}`}
                        onClick={() => handleVariableClick(variable)}
                      >
                        <div className={`p-3 rounded-lg ${getVariableColor(variable.type)} border-2`}>
                          {getVariableIcon(variable.type)}
                        </div>
                        <div className="mt-2 text-xs font-medium max-w-[100px] truncate">{variable.name}</div>
                      </div>
                    ))}
                    
                    {/* Position intervening/moderating/control variables at the bottom center */}
                    {variables.filter(v => v.type === "intervening" || v.type === "moderating" || v.type === "control").map((variable, index) => (
                      <div 
                        key={variable.id} 
                        className="absolute text-center cursor-pointer hover:scale-105 transition-transform z-20"
                        style={{
                          top: `calc(${75 + (index * 12)}% - 30px)`, // Moved from 70% to 75% and adjusted spacing
                          left: '50%'
                        }}
                        title={`Type: ${variable.type}\n${variable.description}`}
                        onClick={() => handleVariableClick(variable)}
                      >
                        <div className={`p-3 rounded-lg ${getVariableColor(variable.type)} border-2`}>
                          {getVariableIcon(variable.type)}
                        </div>
                        <div className="mt-2 text-xs font-medium max-w-[100px] truncate">{variable.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-300 mr-2 flex items-center justify-center">
                    <Circle className="w-2 h-2 text-blue-800" />
                  </div>
                  <span>Independent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-300 mr-2 flex items-center justify-center">
                    <Square className="w-2 h-2 text-green-800" />
                  </div>
                  <span>Dependent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300 mr-2 flex items-center justify-center rotate-45">
                    <Square className="w-2 h-2 text-yellow-800" />
                  </div>
                  <span>Intervening</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300 mr-2 flex items-center justify-center">
                    <Triangle className="w-2 h-2 text-purple-800" />
                  </div>
                  <span>Moderating</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300 mr-2 flex items-center justify-center">
                    <Target className="w-2 h-2 text-gray-800" />
                  </div>
                  <span>Control</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={exportFramework} disabled={variables.length === 0}>
                   <Download className="w-4 h-4 mr-2" />
                   Export Framework
                 </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Relationship Matrix - Table showing all variable relationships */}
          {relationships.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Relationship Matrix</CardTitle>
                <CardDescription>Overview of connections between research variables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">From (Influence)</th>
                        <th className="text-left p-3">To (Outcome)</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relationships.map((relationship) => {
                        const source = variables.find(v => v.id === relationship.sourceId);
                        const target = variables.find(v => v.id === relationship.targetId);
                        
                        return (
                          <tr key={relationship.id} className="border-t hover:bg-muted/50">
                            <td className="p-3 font-medium">{source?.name || 'Unknown'}</td>
                            <td className="p-3 font-medium">{target?.name || 'Unknown'}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {relationship.type}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">{relationship.description}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Variable Summary</CardTitle>
              <CardDescription>Table view of variables and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Variable</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Relationship</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variables.map((variable) => {
                      const rels = relationships.filter(r => r.sourceId === variable.id || r.targetId === variable.id);
                      return (
                        <tr key={variable.id} className="border-b">
                          <td className="p-2 font-medium">{variable.name}</td>
                          <td className="p-2">
                            <Badge className={getVariableColor(variable.type)}>
                              {variable.type.charAt(0).toUpperCase() + variable.type.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm">{variable.description}</td>
                          <td className="p-2">
                            {rels.length > 0 ? (
                              <ul className="text-sm">
                                {rels.map((rel, idx) => {
                                  const otherVar = rel.sourceId === variable.id 
                                    ? variables.find(v => v.id === rel.targetId) 
                                    : variables.find(v => v.id === rel.sourceId);
                                  return (
                                    <li key={idx}>
                                      {rel.sourceId === variable.id ? "→" : "←"} {otherVar?.name} ({rel.type})
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground">No relationships</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Variable Details Modal */}
      {showVariableDetails && selectedVariable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedVariable.name}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowVariableDetails(false)}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Type</h4>
                  <Badge className={getVariableColor(selectedVariable.type)}>
                    {selectedVariable.type.charAt(0).toUpperCase() + selectedVariable.type.slice(1)}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Description</h4>
                  <p className="mt-1 text-gray-800 bg-gray-50 p-2 rounded-md min-h-[40px]">{selectedVariable.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">Measurement</h4>
                  <p className="mt-1 text-gray-800 bg-gray-50 p-2 rounded-md min-h-[40px]">{selectedVariable.measurement}</p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Edit Details</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="editDescription" className="text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                        id="editDescription"
                        value={selectedVariable.description}
                        onChange={(e) => setSelectedVariable({
                          ...selectedVariable,
                          description: e.target.value
                        })}
                        rows={2}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md text-gray-800"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="editMeasurement" className="text-sm font-medium text-gray-700">Measurement</Label>
                      <Input
                        id="editMeasurement"
                        value={selectedVariable.measurement}
                        onChange={(e) => setSelectedVariable({
                          ...selectedVariable,
                          measurement: e.target.value
                        })}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md text-gray-800"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="editType" className="text-sm font-medium text-gray-700">Variable Type</Label>
                      <select
                        id="editType"
                        className="w-full p-2 border border-gray-300 rounded-md mt-1 bg-white text-gray-800"
                        value={selectedVariable.type}
                        onChange={(e) => setSelectedVariable({
                          ...selectedVariable,
                          type: e.target.value as VariableType
                        })}
                      >
                        <option value="independent" className="text-gray-800 bg-white">Independent Variable</option>
                        <option value="dependent" className="text-gray-800 bg-white">Dependent Variable</option>
                        <option value="intervening" className="text-gray-800 bg-white">Intervening Variable</option>
                        <option value="moderating" className="text-gray-800 bg-white">Moderating Variable</option>
                        <option value="control" className="text-gray-800 bg-white">Control Variable</option>
                      </select>
                    </div>
                    
                    <Button 
                      className="w-full mt-4"
                      onClick={() => {
                        if (selectedVariable) {
                          updateVariable(selectedVariable);
                          setShowVariableDetails(false);
                        }
                      }}
                    >
                      Update Variable
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}