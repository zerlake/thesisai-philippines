// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    Deno.env.get('NEXT_PUBLIC_APP_BASE_URL') || 'https://thesisai-philippines.vercel.app',
    'http://localhost:3000',
    'http://localhost:32100',
  ];
  const origin = req.headers.get('Origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cc-webhook-signature',
  };
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

type EnrichedTopic = {
  title: string;
  description: string;
  feasibilityScore: number;
  innovationScore: number;
  estimatedDuration: string;
  resourceRequirements: string;
  researchGap: string;
};

async function generateEnrichedTopicsWithPuter(field: string): Promise<any> {
  const prompt = `You are an expert academic advisor and research consultant at a leading Philippine university. Your task is to generate and analyze exactly TEN (10) advanced thesis topic ideas for the field of ${field}.

For EACH topic, you MUST provide:
1. A compelling title
2. A 2-3 sentence description
3. A feasibility score (1-10, where 10 is highly feasible with standard resources)
4. An innovation score (1-10, where 10 is highly novel/groundbreaking)
5. Estimated research duration (e.g., "6-12 months", "12-18 months", "18-24 months")
6. Resource requirements (e.g., "Low cost, minimal equipment", "Moderate budget, specialized software", "High budget, expensive equipment")
7. A specific research gap this topic addresses

CRITICAL: Return EXACTLY a valid JSON object with NO markdown, NO explanations, ONLY the JSON:
{
  "topicIdeas": [
    {
      "title": "...",
      "description": "...",
      "feasibilityScore": 8,
      "innovationScore": 7,
      "estimatedDuration": "12-18 months",
      "resourceRequirements": "Moderate budget, specialized equipment",
      "researchGap": "..."
    },
    ... (9 more topics for a total of exactly 10)
  ]
}

Field: ${field}

Generate exactly 10 advanced topics with all required fields. Focus on Philippine context where applicable. Return ONLY valid JSON.`;

  try {
    const puterApiKey = Deno.env.get('PUTER_API_KEY');
    
    if (!puterApiKey) {
      console.warn("PUTER_API_KEY not configured, using fallback generation");
      return generateFallbackEnrichedTopics(field);
    }

    const response = await Promise.race([
      fetch(Deno.env.get("PUTER_API_ENDPOINT") || 'https://api.puter.com/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${puterApiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert academic advisor specializing in advanced thesis development. You must ALWAYS return valid JSON with exactly 10 topics, each with all 7 required fields.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 5000,
        }),
      }).then(r => r.json()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Puter AI request timed out')), 30000)
      ),
    ]) as any;

    if (response.error) {
      throw new Error(`Puter API error: ${response.error}`);
    }

    let responseText = '';
    
    if (typeof response === 'string') {
      responseText = response;
    } else if (response.choices && response.choices[0]?.message?.content) {
      responseText = response.choices[0].message.content;
    } else if (response.message) {
      responseText = response.message;
    } else if (response.response) {
      responseText = response.response;
    } else {
      console.error('Unexpected Puter response format:', response);
      return generateFallbackEnrichedTopics(field);
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        topicIdeas: (parsed.topicIdeas || []).slice(0, 10).map((topic: any) => ({
          title: topic.title || '',
          description: topic.description || '',
          feasibilityScore: Math.min(10, Math.max(1, topic.feasibilityScore || 5)),
          innovationScore: Math.min(10, Math.max(1, topic.innovationScore || 5)),
          estimatedDuration: topic.estimatedDuration || '6-12 months',
          resourceRequirements: topic.resourceRequirements || 'Moderate',
          researchGap: topic.researchGap || 'Addresses emerging gap in current research',
        }))
      };
    }

    throw new Error('Could not extract JSON from Puter AI response');
  } catch (error) {
    console.error("Puter AI Error:", error);
    return generateFallbackEnrichedTopics(field);
  }
}

function generateFallbackEnrichedTopics(field: string): any {
  const allTopics: Record<string, EnrichedTopic[]> = {
    'education': [
      {
        title: 'AI-Enhanced Personalized Learning Pathways in Philippine Secondary Schools',
        description: 'Development and evaluation of adaptive learning systems that customize educational content based on individual student learning patterns and preferences in Philippine schools.',
        feasibilityScore: 8,
        innovationScore: 9,
        estimatedDuration: '12-18 months',
        resourceRequirements: 'Moderate budget, software development',
        researchGap: 'Limited research on AI adoption in Philippine education systems'
      },
      {
        title: 'Teacher Competency Frameworks and Student Outcomes in Digital-First Classrooms',
        description: 'Examination of what digital competencies teachers need and how these correlate with improved student achievement in technology-enabled Philippine classrooms.',
        feasibilityScore: 7,
        innovationScore: 7,
        estimatedDuration: '10-15 months',
        resourceRequirements: 'Low cost, survey and interview tools',
        researchGap: 'Gap in understanding teacher digital competency requirements in Philippine context'
      },
      {
        title: 'Neurodiversity-Inclusive Curriculum Design and Implementation Outcomes',
        description: 'Research on designing and implementing curricula that effectively support neurodivergent learners (autism, ADHD, dyslexia) in mainstream Philippine schools.',
        feasibilityScore: 6,
        innovationScore: 8,
        estimatedDuration: '15-20 months',
        resourceRequirements: 'Moderate budget, specialist consultation',
        researchGap: 'Underrepresentation of neurodiversity research in Philippine education literature'
      },
      {
        title: 'Metacognitive Strategy Training and Problem-Solving Transfer in Mathematics',
        description: 'Investigation of explicit metacognitive instruction effectiveness in teaching Philippine students to solve novel math problems through deeper cognitive processes.',
        feasibilityScore: 7,
        innovationScore: 6,
        estimatedDuration: '8-12 months',
        resourceRequirements: 'Low cost, experimental classroom setup',
        researchGap: 'Limited empirical research on metacognitive transfer in Philippine mathematics education'
      },
      {
        title: 'School-Community Co-Production of Educational Content for Contextual Learning',
        description: 'Participatory action research on collaborative development of locally-relevant educational materials that improve engagement and learning outcomes.',
        feasibilityScore: 8,
        innovationScore: 7,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, community engagement',
        researchGap: 'Limited evidence on effectiveness of co-produced educational materials'
      },
      {
        title: 'Language Switching Strategies and Bilingual Cognition in English-Filipino Classrooms',
        description: 'Cognitive linguistic study of how code-switching patterns affect learning outcomes and language development in bilingual Philippine educational contexts.',
        feasibilityScore: 7,
        innovationScore: 8,
        estimatedDuration: '14-18 months',
        resourceRequirements: 'Moderate budget, linguistic expertise required',
        researchGap: 'Underexplored area of code-switching impact on cognitive development'
      },
      {
        title: 'Learning Analytics Dashboards and Data-Informed Pedagogical Decision-Making',
        description: 'Development and evaluation of real-time learning analytics systems to support teachers in making evidence-based instructional decisions.',
        feasibilityScore: 8,
        innovationScore: 8,
        estimatedDuration: '12-18 months',
        resourceRequirements: 'Moderate budget, tech development',
        researchGap: 'Limited implementation research on learning analytics in Philippine schools'
      },
      {
        title: 'Trauma-Informed Teaching Practices and Student Emotional Resilience Development',
        description: 'Research on implementing trauma-informed approaches in Philippine schools and their effectiveness in building student emotional resilience.',
        feasibilityScore: 7,
        innovationScore: 7,
        estimatedDuration: '12-15 months',
        resourceRequirements: 'Moderate budget, psychological expertise',
        researchGap: 'Emerging field with limited research in Philippine educational settings'
      },
      {
        title: 'Gamification Elements in Academic Motivation and Engagement Sustainability',
        description: 'Longitudinal study examining which gamification strategies maintain student engagement over time versus creating novelty-dependent motivation.',
        feasibilityScore: 8,
        innovationScore: 7,
        estimatedDuration: '18-24 months',
        resourceRequirements: 'Moderate budget, software development',
        researchGap: 'Research gap on long-term sustainability of gamification effects'
      },
      {
        title: 'Assessment Literacy Development Among Teachers and Impact on Student Learning Gains',
        description: 'Professional development study on improving teachers\' understanding of assessment principles and its direct impact on student achievement outcomes.',
        feasibilityScore: 7,
        innovationScore: 6,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, professional development design',
        researchGap: 'Limited research on teacher assessment literacy effects in Philippines'
      }
    ],
    'engineering': [
      {
        title: 'Polymer Concrete Composites from Recycled Agricultural Waste for Sustainable Infrastructure',
        description: 'Development of high-performance concrete using recycled agricultural byproducts and polymer binders for cost-effective, sustainable construction.',
        feasibilityScore: 8,
        innovationScore: 8,
        estimatedDuration: '18-24 months',
        resourceRequirements: 'Moderate budget, laboratory equipment',
        researchGap: 'Limited research on agricultural waste utilization in Philippine construction'
      },
      {
        title: 'AI-Optimized Microgrid Design for Island Energy Resilience and Autonomy',
        description: 'Machine learning approach to design hybrid renewable microgrids for Philippine islands, optimizing for reliability, cost, and environmental impact.',
        feasibilityScore: 7,
        innovationScore: 9,
        estimatedDuration: '16-20 months',
        resourceRequirements: 'Moderate budget, computational resources',
        researchGap: 'Emerging field combining AI and island microgrid design'
      },
      {
        title: 'Real-Time Flood Prediction Using IoT Sensor Networks and Machine Learning',
        description: 'Development of distributed IoT sensor system with ML-based flood prediction for early warning in typhoon-prone Philippine communities.',
        feasibilityScore: 8,
        innovationScore: 8,
        estimatedDuration: '14-18 months',
        resourceRequirements: 'Moderate budget, hardware and software',
        researchGap: 'Gap in localized flood prediction systems for Philippine context'
      },
      {
        title: 'Seismic Retrofitting Optimization for Existing Philippine Concrete Buildings',
        description: 'Research on cost-effective seismic strengthening techniques adapted for existing unreinforced masonry and reinforced concrete structures.',
        feasibilityScore: 7,
        innovationScore: 7,
        estimatedDuration: '18-24 months',
        resourceRequirements: 'High budget, structural testing',
        researchGap: 'Limited research on retrofitting strategies for Philippine building stock'
      },
      {
        title: 'Bioelectrochemical Systems for Wastewater Treatment and Bioelectricity Generation',
        description: 'Investigation of microbial fuel cells and electrochemical systems for treating Philippine municipal wastewater while generating renewable electricity.',
        feasibilityScore: 6,
        innovationScore: 9,
        estimatedDuration: '20-24 months',
        resourceRequirements: 'Moderate budget, specialized laboratory',
        researchGap: 'Cutting-edge technology with limited Philippine-based research'
      },
      {
        title: 'Smart Water Distribution Networks with Real-Time Leak Detection and Prevention',
        description: 'IoT and AI-enabled system to identify and respond to water loss in Philippine municipal distribution networks to reduce non-revenue water.',
        feasibilityScore: 8,
        innovationScore: 8,
        estimatedDuration: '12-18 months',
        resourceRequirements: 'Moderate budget, sensors and software',
        researchGap: 'Technology application for Philippine water utility challenges'
      },
      {
        title: 'Advanced Materials for Corrosion Prevention in High-Humidity Tropical Environments',
        description: 'Development and testing of coating materials and surface treatments for infrastructure durability in Philippine tropical climate conditions.',
        feasibilityScore: 7,
        innovationScore: 7,
        estimatedDuration: '16-20 months',
        resourceRequirements: 'Moderate budget, materials testing',
        researchGap: 'Materials science research addressing tropical climate challenges'
      },
      {
        title: 'Modular Sustainable Housing Systems for Informal Settlement Upgrading',
        description: 'Engineering design and evaluation of adaptable, affordable housing units for upgrading Philippine informal settlements sustainably.',
        feasibilityScore: 7,
        innovationScore: 8,
        estimatedDuration: '18-22 months',
        resourceRequirements: 'Moderate budget, prototype development',
        researchGap: 'Engineering solutions for housing challenges in urban poor areas'
      },
      {
        title: 'Precision Agriculture Systems Optimized for Small-Scale Philippine Farmers',
        description: 'Development of affordable precision agriculture technology (soil sensing, micro-irrigation) suited to small landholdings and rural contexts.',
        feasibilityScore: 7,
        innovationScore: 7,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Moderate budget, field testing',
        researchGap: 'Technology adaptation for small-scale farming context'
      },
      {
        title: 'Blockchain-Based Supply Chain Transparency for Philippine Agricultural Exports',
        description: 'Implementation of distributed ledger technology to track and verify agricultural product authenticity and sustainability throughout supply chains.',
        feasibilityScore: 7,
        innovationScore: 9,
        estimatedDuration: '14-18 months',
        resourceRequirements: 'Moderate budget, blockchain development',
        researchGap: 'Emerging technology application in agricultural sector'
      }
    ],
    'business': [
      {
        title: 'Circular Economy Business Models and Economic Value Creation in Philippine Manufacturing',
        description: 'Analysis of how manufacturing companies can redesign products and processes for circular value creation, waste reduction, and competitive advantage.',
        feasibilityScore: 8,
        innovationScore: 8,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, case study research',
        researchGap: 'Limited research on circular economy implementation in Philippines'
      },
      {
        title: 'Platform Cooperatives as Alternative to Gig Economy Exploitation Models',
        description: 'Research on developing worker-owned platform alternatives in ride-sharing, delivery, and services sectors addressing labor concerns.',
        feasibilityScore: 7,
        innovationScore: 9,
        estimatedDuration: '14-18 months',
        resourceRequirements: 'Low cost, qualitative research',
        researchGap: 'Emerging business model with limited empirical research'
      },
      {
        title: 'Impact Measurement Frameworks for Social Enterprises: Balancing Social and Financial Returns',
        description: 'Development of comprehensive frameworks for measuring and reporting both social impact and financial performance in Philippine social enterprises.',
        feasibilityScore: 8,
        innovationScore: 7,
        estimatedDuration: '10-14 months',
        resourceRequirements: 'Low cost, framework development',
        researchGap: 'Standardization needed for impact measurement'
      },
      {
        title: 'Digital Supply Chain Resilience and Business Continuity in Philippine SMEs',
        description: 'Study on how Philippine small and medium enterprises build supply chain resilience through digitalization and strategic partnerships.',
        feasibilityScore: 7,
        innovationScore: 7,
        estimatedDuration: '12-15 months',
        resourceRequirements: 'Low cost, survey and interviews',
        researchGap: 'Research on supply chain resilience post-pandemic'
      },
      {
        title: 'Customer Data Analytics and Personalization Strategies in Philippine E-Commerce',
        description: 'Research on how Philippine e-commerce businesses leverage customer data and analytics to increase conversion rates and customer lifetime value.',
        feasibilityScore: 8,
        innovationScore: 7,
        estimatedDuration: '8-12 months',
        resourceRequirements: 'Moderate cost, data access needed',
        researchGap: 'Limited research on data analytics practices in Philippine e-commerce'
      },
      {
        title: 'Stakeholder Capitalism vs. Shareholder Primacy: Philippine Context and Implications',
        description: 'Comparative study of corporate governance models and their effects on stakeholder benefits and long-term firm sustainability.',
        feasibilityScore: 7,
        innovationScore: 6,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, document review',
        researchGap: 'Emerging governance framework research in Philippine context'
      },
      {
        title: 'Hybrid Work Models and Organizational Culture Transformation in Philippine Companies',
        description: 'Longitudinal research on how companies maintain organizational culture, employee engagement, and productivity in hybrid work environments.',
        feasibilityScore: 8,
        innovationScore: 7,
        estimatedDuration: '12-18 months',
        resourceRequirements: 'Low cost, organizational research',
        researchGap: 'Ongoing research on post-pandemic work structure implications'
      },
      {
        title: 'Competitive Intelligence Systems and Strategic Decision-Making in Philippine Industries',
        description: 'Research on how competitive intelligence gathering and analysis systems inform strategic decisions in specific Philippine industry sectors.',
        feasibilityScore: 7,
        innovationScore: 6,
        estimatedDuration: '10-14 months',
        resourceRequirements: 'Low cost, interview-based research',
        researchGap: 'Limited research on CI practices in Philippine companies'
      },
      {
        title: 'Community-Centric Business Models and Value Co-Creation in Philippine Markets',
        description: 'Study of businesses that engage communities as active participants in value creation, examining economic and social outcomes.',
        feasibilityScore: 7,
        innovationScore: 8,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, case studies',
        researchGap: 'Community engagement as business strategy research'
      },
      {
        title: 'Emerging Technologies Adoption (AI, Blockchain, IoT) and Organizational Innovation Capacity',
        description: 'Research on how Philippine enterprises adopt emerging technologies and the organizational factors enabling or inhibiting innovation capacity.',
        feasibilityScore: 8,
        innovationScore: 8,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Moderate cost, surveys and case studies',
        researchGap: 'Technology adoption patterns in Philippine corporate context'
      }
    ],
    'healthcare': [
      {
        title: 'Artificial Intelligence Diagnostics and Clinical Decision Support System Implementation',
        description: 'Research on deploying AI-assisted diagnostic tools in Philippine hospitals to improve diagnostic accuracy and clinical outcomes.',
        feasibilityScore: 7,
        innovationScore: 9,
        estimatedDuration: '16-20 months',
        resourceRequirements: 'High budget, medical expertise',
        researchGap: 'Limited implementation research in Philippine healthcare'
      },
      {
        title: 'Mental Health Service Integration in Primary Care: Screening, Referral, and Treatment Outcomes',
        description: 'Implementation research on integrating mental health assessment and basic interventions into primary healthcare services across Philippine communities.',
        feasibilityScore: 7,
        innovationScore: 7,
        estimatedDuration: '14-18 months',
        resourceRequirements: 'Moderate budget, training required',
        researchGap: 'Integration of mental health in primary care settings'
      },
      {
        title: 'Pharmacogenomics and Personalized Medicine Approaches for Common Philippine Diseases',
        description: 'Research on genetic factors affecting medication response in Filipino populations and implications for personalized treatment approaches.',
        feasibilityScore: 6,
        innovationScore: 9,
        estimatedDuration: '18-24 months',
        resourceRequirements: 'High budget, advanced laboratory',
        researchGap: 'Underrepresentation of Filipino populations in pharmacogenomics research'
      },
      {
        title: 'Preventive Health Education Programs and Behavioral Change Sustainability',
        description: 'Longitudinal study on effectiveness of health education interventions in sustaining positive behavioral changes in Philippine communities.',
        feasibilityScore: 8,
        innovationScore: 6,
        estimatedDuration: '18-24 months',
        resourceRequirements: 'Moderate budget, community engagement',
        researchGap: 'Long-term effectiveness research on health behavior programs'
      },
      {
        title: 'Digital Health Records Interoperability and Data Analytics for Population Health',
        description: 'Development and evaluation of systems enabling interoperable electronic health records for population-level health monitoring and planning.',
        feasibilityScore: 7,
        innovationScore: 8,
        estimatedDuration: '16-20 months',
        resourceRequirements: 'Moderate budget, IT expertise',
        researchGap: 'Implementation of health information systems in Philippines'
      },
      {
        title: 'Traditional Healers and Modern Medicine Integration: Efficacy and Safety Evaluation',
        description: 'Research on safety-effective integration of traditional healing practices with evidence-based medicine in Philippine healthcare systems.',
        feasibilityScore: 6,
        innovationScore: 7,
        estimatedDuration: '18-22 months',
        resourceRequirements: 'Moderate budget, cultural expertise',
        researchGap: 'Limited rigorous research on traditional-modern medicine integration'
      },
      {
        title: 'Healthcare Worker Mental Health and Organizational Support Systems Post-Pandemic',
        description: 'Study on burnout, compassion fatigue, mental health challenges of healthcare workers and effectiveness of organizational support interventions.',
        feasibilityScore: 8,
        innovationScore: 7,
        estimatedDuration: '12-15 months',
        resourceRequirements: 'Low cost, survey-based',
        researchGap: 'Post-pandemic mental health research in healthcare workforce'
      },
      {
        title: 'Maternal and Neonatal Mortality Reduction Through Community Health Worker Programs',
        description: 'Effectiveness research on empowered community health workers in reducing maternal and newborn complications in underserved Philippine areas.',
        feasibilityScore: 8,
        innovationScore: 6,
        estimatedDuration: '16-20 months',
        resourceRequirements: 'Moderate budget, community-based',
        researchGap: 'Evidence on CHW effectiveness in reducing maternal mortality'
      },
      {
        title: 'Cost-Effectiveness Analysis of Disease Surveillance and Prevention Programs',
        description: 'Economic evaluation of public health surveillance systems and prevention programs to guide resource allocation in Philippine healthcare.',
        feasibilityScore: 7,
        innovationScore: 6,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, economic analysis',
        researchGap: 'Health economic research informing Philippine policy'
      },
      {
        title: 'Chronic Disease Management and Self-Efficacy in Community-Based Patient Groups',
        description: 'Research on community support groups and self-management programs effectiveness in controlling chronic diseases in Filipino populations.',
        feasibilityScore: 8,
        innovationScore: 6,
        estimatedDuration: '12-15 months',
        resourceRequirements: 'Low cost, community-based research',
        researchGap: 'Community-based chronic disease management effectiveness'
      }
    ],
    'default': [
      {
        title: 'Stakeholder Ecosystem Analysis and Value Network Design in FIELD',
        description: 'Comprehensive mapping of stakeholder networks and value creation mechanisms in the FIELD sector for strategy optimization.',
        feasibilityScore: 7,
        innovationScore: 7,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, network analysis',
        researchGap: 'Ecosystem approach to understanding FIELD dynamics'
      },
      {
        title: 'Organizational Change Management and Digital Transformation in Philippine FIELD',
        description: 'Study on successful change management strategies enabling organizations to implement digital transformation initiatives.',
        feasibilityScore: 8,
        innovationScore: 7,
        estimatedDuration: '12-15 months',
        resourceRequirements: 'Low cost, case study research',
        researchGap: 'Digital transformation success factors in Philippine FIELD'
      },
      {
        title: 'Sustainability Assessment and Circular Economy Principles in FIELD Practices',
        description: 'Development of frameworks assessing environmental sustainability of practices and potential for circular economy adoption.',
        feasibilityScore: 7,
        innovationScore: 8,
        estimatedDuration: '12-18 months',
        resourceRequirements: 'Moderate cost, assessment design',
        researchGap: 'Sustainability integration in FIELD sector'
      },
      {
        title: 'Human Capital Development and Skills Training Program Effectiveness in FIELD',
        description: 'Evaluation of workforce development initiatives and training effectiveness in creating skilled professionals for FIELD roles.',
        feasibilityScore: 8,
        innovationScore: 6,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, program evaluation',
        researchGap: 'Skills training effectiveness in FIELD sector'
      },
      {
        title: 'Innovation Pipeline and Technology Adoption Barriers in Philippine FIELD',
        description: 'Research on organizational factors affecting adoption of innovations and barriers to technology implementation in FIELD.',
        feasibilityScore: 7,
        innovationScore: 8,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, qualitative research',
        researchGap: 'Innovation adoption patterns in FIELD sector'
      },
      {
        title: 'Customer Experience Design and Service Innovation in FIELD Sector',
        description: 'Study on designing superior customer experiences and implementing service innovations to improve competitive positioning.',
        feasibilityScore: 8,
        innovationScore: 8,
        estimatedDuration: '10-14 months',
        resourceRequirements: 'Moderate cost, user research',
        researchGap: 'Customer-centric innovation in FIELD'
      },
      {
        title: 'Public Policy Analysis and Regulatory Framework Effects on FIELD Development',
        description: 'Examination of government policies\' impact on FIELD sector growth, innovation, and sustainability outcomes.',
        feasibilityScore: 7,
        innovationScore: 6,
        estimatedDuration: '12-15 months',
        resourceRequirements: 'Low cost, policy analysis',
        researchGap: 'Policy impact research on FIELD sector'
      },
      {
        title: 'Strategic Partnerships and Collaboration Networks for FIELD Advancement',
        description: 'Research on effective partnership models enabling knowledge sharing, resource pooling, and accelerated FIELD development.',
        feasibilityScore: 7,
        innovationScore: 7,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, network research',
        researchGap: 'Collaboration effectiveness in FIELD sector'
      },
      {
        title: 'Data-Driven Decision Making and Analytics Systems Implementation in FIELD',
        description: 'Study on adoption of data analytics and business intelligence systems to improve operational decisions in FIELD organizations.',
        feasibilityScore: 8,
        innovationScore: 8,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Moderate cost, systems implementation',
        researchGap: 'Data analytics adoption in FIELD sector'
      },
      {
        title: 'Future Scenario Planning and Organizational Resilience in FIELD Sector',
        description: 'Research on scenario planning methodologies and resilience strategies enabling organizations to navigate uncertain FIELD futures.',
        feasibilityScore: 7,
        innovationScore: 8,
        estimatedDuration: '12-16 months',
        resourceRequirements: 'Low cost, strategic foresight',
        researchGap: 'Resilience and adaptability in FIELD sector'
      }
    ]
  };

  const fieldKey = field.toLowerCase().split(' ')[0];
  const topicPool = allTopics[fieldKey] || allTopics['default'];
  
  // Process default topics to replace FIELD placeholder
  const processedTopics = topicPool.map((topic: EnrichedTopic) => ({
    ...topic,
    title: topic.title.replace(/FIELD/g, field),
    description: topic.description.replace(/FIELD/g, field),
    researchGap: topic.researchGap.replace(/FIELD/g, field)
  }));

  // Shuffle and select 10
  const shuffled = shuffleArray(processedTopics);
  const selected = shuffled.slice(0, 10);

  return {
    topicIdeas: selected
  };
}

interface RequestBody {
  field: string;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }
    const jwt = authHeader.replace('Bearer ', '')

    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) {
      throw new Error('Invalid JWT')
    }

    const { field } = await req.json() as RequestBody;
    if (!field) {
      return new Response(JSON.stringify({ error: 'Field of study is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ideaData = await generateEnrichedTopicsWithPuter(field);

    return new Response(JSON.stringify(ideaData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-topic-ideas-enterprise function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
