// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    Deno.env.get('NEXT_PUBLIC_APP_BASE_URL') || Deno.env.get('NEXT_PUBLIC_VERCEL_URL') || 'http://localhost:3000',
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

async function generateIdeasWithPuter(field: string): Promise<any> {
  const prompt = `You are an expert academic advisor at a Philippine university. Your task is to brainstorm EXACTLY TEN (10) unique and researchable thesis topic ideas based on a given field of study.

IMPORTANT: You MUST generate exactly 10 topics. Not 3, not 5, but exactly 10.

For each of the 10 topics, provide a title and a brief description (2-3 sentences) explaining the potential research focus and its relevance in the Philippine context.

Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting or any text outside of the JSON object.

The JSON object must have the following structure with EXACTLY 10 items in the topicIdeas array:
{
  "topicIdeas": [
    {
      "title": "...",
      "description": "..."
    },
    {
      "title": "...",
      "description": "..."
    },
    ... (8 more items for a total of 10)
  ]
}

Field of Study: "${field}"

Generate the JSON object now with all 10 topic ideas. Do not generate fewer than 10 ideas.`;

  try {
    // Use Puter AI service for generating thesis topic ideas
    const puterApiKey = Deno.env.get('PUTER_API_KEY');
    
    if (!puterApiKey) {
      console.warn("PUTER_API_KEY not configured, using fallback generation");
      return generateFallbackTopics(field);
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
              content: 'You are an expert academic advisor at a Philippine university specializing in thesis development. You must ALWAYS generate exactly 10 topic ideas when requested, never fewer.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      }).then(r => r.json()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Puter AI request timed out')), 30000)
      ),
    ]) as any;

    // Parse Puter response
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
      return generateFallbackTopics(field);
    }

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not extract JSON from Puter AI response');
  } catch (error) {
    console.error("Puter AI Error:", error);
    console.log("Falling back to default topic generation");
    return generateFallbackTopics(field);
  }
}

function generateFallbackTopics(field: string): any {
  // Expanded topic pool for common fields - now with 20+ ideas per field
  const allTopics: Record<string, any> = {
    'education': [
      {
        title: 'Impact of Digital Learning on Student Achievement in Philippine Secondary Schools',
        description: 'An examination of how technology-enhanced learning environments affect academic performance, engagement, and retention among Filipino high school students. This study will investigate the effectiveness of digital tools in traditional classroom settings.'
      },
      {
        title: 'Teacher Professional Development and Classroom Innovation in the Philippine Context',
        description: 'A research study on how continuous professional development programs influence teachers ability to implement innovative teaching methodologies. Focuses on challenges and opportunities in Philippine public schools.'
      },
      {
        title: 'Inclusive Education Practices and Student Performance in Mixed-Ability Classrooms',
        description: 'An investigation of inclusive teaching strategies effectiveness in supporting both regular and special education students. Examines best practices adapted for Philippine educational settings.'
      },
      {
        title: 'Parental Involvement and Academic Success in Philippine Primary Schools',
        description: 'A study examining the relationship between parent-teacher engagement and student outcomes in elementary education. Explores cultural factors and practical strategies for increasing participation in resource-limited settings.'
      },
      {
        title: 'Language Acquisition and Multilingual Education in Filipino Classrooms',
        description: 'Research on the effectiveness of teaching English and Filipino simultaneously and its impact on language proficiency and cognitive development among young learners in the Philippines.'
      },
      {
        title: 'Early Childhood Development Programs and School Readiness in Underserved Communities',
        description: 'An evaluation of preschool intervention programs effectiveness in preparing disadvantaged Filipino children for formal schooling and long-term educational outcomes.'
      },
      {
        title: 'Student Mental Health and Academic Performance in Philippine High Schools',
        description: 'An investigation of stress, anxiety, and depression prevalence among Filipino secondary students and its relationship to academic achievement and school-based intervention effectiveness.'
      },
      {
        title: 'Special Education Resource Allocation and Inclusive Education Outcomes',
        description: 'A comparative analysis of funding models for special education services across Philippine schools and their impact on student inclusion, support, and academic progress.'
      },
      {
        title: 'STEM Education and Career Aspirations Among Filipino Female Students',
        description: 'Research exploring factors influencing girls participation in science, technology, engineering, and mathematics fields in Philippine schools and strategies to increase female representation.'
      },
      {
        title: 'Distance Learning Effectiveness and Digital Divide Impact on Student Outcomes',
        description: 'A study examining the sustainability and effectiveness of remote learning models in Philippine schools, with focus on disparities in technology access and their academic consequences.'
      },
      {
        title: 'Critical Thinking Development Through Problem-Based Learning in Philippine Classrooms',
        description: 'Research on the effectiveness of problem-based learning methodologies in developing critical thinking skills among Filipino students across different grade levels and subjects.'
      },
      {
        title: 'Indigenous Knowledge Integration in Philippine School Curriculum',
        description: 'A study examining how traditional knowledge systems and indigenous learning practices can be integrated into the national curriculum to enhance cultural awareness and student engagement.'
      },
      {
        title: 'Assessment Methods and Learning Outcomes in Philippine Higher Education',
        description: 'Research comparing traditional and innovative assessment approaches in Philippine universities and their correlation with actual student learning and skill development.'
      },
      {
        title: 'School Leadership and Organizational Climate Impact on Teacher Effectiveness',
        description: 'A study on how school management practices and leadership styles in Philippine schools influence teacher motivation, job satisfaction, and instructional quality.'
      },
      {
        title: 'Transition Programs from Secondary to Higher Education in the Philippines',
        description: 'Research examining support systems and interventions that ease the academic and social transition for Filipino students entering higher education institutions.'
      },
      {
        title: 'Peer Tutoring Programs and Academic Achievement Among Low-Performing Philippine Students',
        description: 'An evaluation of peer-assisted learning programs effectiveness in improving academic performance and social integration of struggling learners in Philippine schools.'
      },
      {
        title: 'Bullying Prevention and School Safety Interventions in Philippine Schools',
        description: 'A comprehensive study of bullying prevalence, its psychological impact, and effectiveness of anti-bullying programs in Philippine educational settings.'
      },
      {
        title: 'Career Guidance and Vocational Training Integration in Philippine Secondary Education',
        description: 'Research on career counseling effectiveness and the impact of vocational training exposure on student career choices and post-secondary pathways.'
      },
      {
        title: 'Technology Access and Digital Literacy Among Rural Philippine Teachers',
        description: 'A study examining the technology gaps facing educators in rural Philippines and strategies for improving digital literacy to support technology-enhanced instruction.'
      },
      {
        title: 'Community Engagement and School Development in Philippine Public Schools',
        description: 'Research on mechanisms for meaningful community participation in school improvement initiatives and how it affects educational outcomes in Philippine communities.'
      }
    ],
    'engineering': [
      {
        title: 'Sustainable Green Building Design in Tropical Philippine Climate',
        description: 'A study on architectural and engineering solutions for energy-efficient buildings suited to the Philippine tropical environment. Focuses on renewable energy integration and material sustainability.'
      },
      {
        title: 'IoT Applications for Water Quality Monitoring in Philippine Agricultural Systems',
        description: 'Development of Internet of Things solutions for real-time water quality assessment in farming communities. Addresses challenges specific to Philippine agricultural practices and climate conditions.'
      },
      {
        title: 'Renewable Energy Potential and Implementation Barriers in Philippine Rural Communities',
        description: 'An analysis of solar and wind energy feasibility in remote Philippine areas, examining technical, economic, and social factors affecting adoption and sustainability.'
      },
      {
        title: 'Smart Transportation Systems for Philippine Urban Centers',
        description: 'Development of intelligent transportation solutions to reduce congestion and improve traffic management in Manila and other major Philippine cities, incorporating IoT and AI technologies.'
      },
      {
        title: 'Coastal Protection and Flood Resilience Engineering in Typhoon-Prone Philippines',
        description: 'Research on engineering solutions for disaster mitigation, including sea walls, mangrove restoration, and early warning systems adapted to Philippine coastal geography and climate challenges.'
      },
      {
        title: 'Waste Management Systems and Environmental Remediation in Philippine Industrial Areas',
        description: 'A study on innovative waste management technologies and cleanup strategies for contaminated sites in Philippine manufacturing regions, balancing environmental protection and industrial development.'
      },
      {
        title: 'Off-Grid Electrification Solutions for Remote Philippine Islands',
        description: 'Development and optimization of hybrid renewable energy systems for island communities lacking grid access, addressing technical, economic, and maintenance challenges.'
      },
      {
        title: 'Earthquake-Resistant Infrastructure Design for Philippine Building Standards',
        description: 'Research on structural engineering innovations and construction materials to improve earthquake resilience in Philippine buildings, incorporating traditional and modern engineering approaches.'
      },
      {
        title: 'Water Purification Technologies for Philippine Communities with Contaminated Water Sources',
        description: 'Development of affordable, sustainable water treatment solutions for rural and urban poor communities addressing arsenic, bacteria, and other Philippine water contamination issues.'
      },
      {
        title: 'Manufacturing Automation and Industry 4.0 Adoption in Philippine Industries',
        description: 'A study on the barriers and facilitators of digital transformation and automation in Philippine manufacturing, with focus on technology transfer and workforce retraining strategies.'
      },
      {
        title: 'Geothermal Energy Potential Development in Philippine Volcanic Regions',
        description: 'Research on harnessing geothermal resources in earthquake-prone Philippine areas for sustainable power generation, examining technical feasibility and environmental impact.'
      },
      {
        title: 'Rehabilitation and Repair Technologies for Aging Infrastructure in Philippine Cities',
        description: 'A study on cost-effective infrastructure rehabilitation techniques for aging roads, bridges, and public facilities in Philippine urban areas.'
      },
      {
        title: 'Biomimicry Applications in Philippine Engineering Design',
        description: 'Research on applying nature-inspired design principles to solve engineering challenges in Philippine construction, water management, and environmental engineering projects.'
      },
      {
        title: 'Food Processing and Agricultural Technology Innovation for Philippine Farmers',
        description: 'Development of appropriate technology solutions for food preservation, processing, and value-addition in Philippine agricultural communities.'
      },
      {
        title: 'Smart Agriculture Systems for Philippine Smallholder Farmers',
        description: 'Research on precision agriculture technologies adapted for small-scale Philippine farming operations to improve productivity and sustainability.'
      },
      {
        title: 'Sanitation Engineering and Public Health Infrastructure in Philippine Rural Areas',
        description: 'A study on designing appropriate sanitation systems and water supply infrastructure for rural and remote Philippine communities with limited resources.'
      },
      {
        title: 'Mining Reclamation and Environmental Restoration in Philippine Extractive Industries',
        description: 'Research on post-mining land rehabilitation techniques and sustainable mining practices specific to Philippine geological and environmental contexts.'
      },
      {
        title: 'Bamboo Engineering Applications in Philippine Construction and Materials Science',
        description: 'Investigation of bamboo as an engineered building material for sustainable, cost-effective construction solutions in the Philippines.'
      },
      {
        title: 'Air Quality Monitoring and Pollution Control in Philippine Industrial Zones',
        description: 'Development of air quality monitoring systems and pollution mitigation strategies for industrial areas affecting nearby Philippine communities.'
      },
      {
        title: 'Renewable Microgrids and Energy Storage Solutions for Philippine Islands',
        description: 'Research on designing resilient renewable energy microgrids with storage capabilities for decentralized power generation in Philippine island communities.'
      }
    ],
    'business': [
      {
        title: 'E-Commerce Growth and Digital Payment Adoption Among Philippine SMEs',
        description: 'A study on factors driving digital transformation in small and medium enterprises, with focus on online selling platforms and digital payment systems in the Philippine market.'
      },
      {
        title: 'Social Enterprise Models and Economic Impact in Philippine Communities',
        description: 'An examination of business models that combine profit with social good, analyzing their sustainability and effectiveness in addressing local poverty and unemployment.'
      },
      {
        title: 'Consumer Behavior and Brand Loyalty in Philippine E-Commerce Platforms',
        description: 'Research on how Filipino consumers make purchasing decisions online, factors influencing brand preference, and strategies for customer retention in competitive digital marketplaces.'
      },
      {
        title: 'Supply Chain Optimization in Philippine Manufacturing and Agricultural Sectors',
        description: 'An investigation of logistics challenges and technological solutions for improving efficiency in product distribution from producers to consumers in the Philippine market.'
      },
      {
        title: 'Business Model Innovation Among Filipino Startups in Technology and Services',
        description: 'A comparative analysis of successful and failed startup models in the Philippines, examining critical success factors, market positioning, and investor relations strategies.'
      },
      {
        title: 'Human Resource Management and Employee Retention in Philippine BPO Industry',
        description: 'Research on talent management practices, career development opportunities, and factors influencing retention in the competitive business process outsourcing sector in the Philippines.'
      },
      {
        title: 'Foreign Direct Investment Impact on Economic Development in Philippine Regions',
        description: 'A study on how multinational corporations influence local economies, employment patterns, and technology transfer in different regions of the Philippines.'
      },
      {
        title: 'Microfinance Effectiveness and Financial Inclusion for Philippine Unbanked Populations',
        description: 'Research evaluating microfinance institutions impact on poverty reduction, women empowerment, and business creation among low-income Filipinos with limited formal banking access.'
      },
      {
        title: 'Family Business Succession Planning and Performance in Philippine Enterprises',
        description: 'An examination of succession planning challenges, governance structures, and sustainability of family-owned businesses across different industries in the Philippines.'
      },
      {
        title: 'Sustainable Tourism Development and Community Benefits in Philippine Destinations',
        description: 'A study on balancing economic growth from tourism with environmental conservation and equitable distribution of benefits to local Filipino communities.'
      },
      {
        title: 'Women Entrepreneurship and Business Performance in Philippine Markets',
        description: 'Research on factors supporting women entrepreneurs in the Philippines, barriers they face, and strategies for increasing their business success and economic contribution.'
      },
      {
        title: 'Corporate Social Responsibility Initiatives and Community Development in the Philippines',
        description: 'A study on corporate social responsibility programs effectiveness in contributing to sustainable community development in Philippine areas where businesses operate.'
      },
      {
        title: 'Franchise Models and Market Expansion Strategies in Philippine Retail and Services',
        description: 'Research analyzing the success and challenges of franchise business models in the Philippine market and their role in business expansion and job creation.'
      },
      {
        title: 'Digital Marketing Strategies and Consumer Engagement in Philippine Social Media',
        description: 'A study on how Philippine businesses leverage social media and digital marketing for brand awareness, customer engagement, and sales conversion.'
      },
      {
        title: 'Agricultural Cooperative Development and Market Access for Philippine Farmers',
        description: 'Research on the effectiveness of cooperative models in improving market access, pricing power, and income stability for Filipino agricultural producers.'
      },
      {
        title: 'Business Ethics and Governance in Philippine Corporations',
        description: 'A comprehensive study on ethical business practices, corporate governance standards, and their impact on organizational performance and stakeholder trust in Philippine companies.'
      },
      {
        title: 'Innovation Management and R&D Effectiveness in Philippine Industries',
        description: 'Research on how Philippine companies approach innovation, allocate research and development resources, and convert innovations into competitive advantages.'
      },
      {
        title: 'Fintech Adoption and Digital Banking Services in the Philippines',
        description: 'A study on the growth of financial technology startups in the Philippines, their market penetration, and impact on traditional banking and financial services.'
      },
      {
        title: 'Retail Business Transformation and Omnichannel Strategies in Philippine Markets',
        description: 'Research on how Philippine retailers are adapting to changing consumer preferences through omnichannel strategies and digital transformation.'
      },
      {
        title: 'Real Estate Market Dynamics and Housing Development Patterns in Philippine Cities',
        description: 'A comprehensive study of real estate business models, development trends, and affordable housing challenges in major Philippine urban centers.'
      }
    ],
    'healthcare': [
      {
        title: 'Effectiveness of Telemedicine in Underserved Philippine Rural Health Facilities',
        description: 'An investigation of remote healthcare delivery models effectiveness in improving health outcomes in rural areas. Focuses on accessibility, cost-effectiveness, and community acceptance.'
      },
      {
        title: 'Mental Health Service Accessibility and Community Mental Health Programs in the Philippines',
        description: 'A study of barriers and enablers in mental health service access among Filipino populations, examining cultural factors and effectiveness of community-based intervention programs.'
      },
      {
        title: 'Maternal and Child Health Outcomes in Philippine Urban Informal Settlements',
        description: 'Research on health disparities, prenatal care access, and intervention effectiveness in improving maternal and infant health outcomes in Filipino urban poor communities.'
      },
      {
        title: 'Antimicrobial Resistance in Philippine Healthcare Settings and Community Health Implications',
        description: 'An analysis of antibiotic overuse patterns, resistance development, and strategies for combating antimicrobial resistance in hospitals and communities across the Philippines.'
      },
      {
        title: 'Prevention and Management of Non-Communicable Diseases in Philippine Primary Care',
        description: 'Research on implementing prevention programs and management protocols for diabetes, hypertension, and other chronic diseases in resource-limited Philippine healthcare settings.'
      },
      {
        title: 'Health Literacy and Patient Compliance in Philippine Communities with Limited Healthcare Access',
        description: 'A study examining health knowledge gaps and cultural beliefs affecting treatment adherence and preventive health behaviors among Filipino populations.'
      },
      {
        title: 'Healthcare Worker Burnout and Job Satisfaction in Philippine Public Hospitals',
        description: 'Research identifying factors contributing to physician and nurse burnout in underfunded Philippine hospitals and interventions to improve working conditions and retention.'
      },
      {
        title: 'Infectious Disease Surveillance and Response Capacity in Philippine Barangay Health Centers',
        description: 'An evaluation of disease detection and outbreak response systems at the community level, examining gaps and recommendations for strengthening grassroots health surveillance.'
      },
      {
        title: 'Drug Pricing and Pharmaceutical Accessibility for Chronic Disease Management in the Philippines',
        description: 'Research on affordability challenges and policy interventions affecting access to medications among low-income Filipinos suffering from chronic health conditions.'
      },
      {
        title: 'Traditional and Complementary Medicine Integration with Modern Healthcare in Philippine Settings',
        description: 'A study examining the role of traditional healing practices in Philippine healthcare, safety considerations, and potential for integration with evidence-based modern medicine.'
      },
      {
        title: 'Occupational Health and Safety in Philippine Manufacturing and Construction Industries',
        description: 'Research on occupational hazards, workplace health and safety practices, and effectiveness of prevention programs in high-risk Philippine industrial sectors.'
      },
      {
        title: 'Nutrition Status and Malnutrition Prevention Programs in Philippine Communities',
        description: 'A comprehensive study on malnutrition causes, health consequences, and effectiveness of nutrition intervention programs in vulnerable Philippine populations.'
      },
      {
        title: 'Healthcare Financing and Out-of-Pocket Expenses Impact on Philippine Families',
        description: 'Research examining healthcare financing mechanisms in the Philippines and how medical expenses affect family finances and health-seeking behaviors.'
      },
      {
        title: 'Quality Improvement and Patient Safety in Philippine Healthcare Facilities',
        description: 'A study on implementing quality assurance and patient safety protocols in resource-limited Philippine hospitals to reduce adverse events and improve outcomes.'
      },
      {
        title: 'Tobacco Cessation Programs and Smoking Prevention in the Philippines',
        description: 'Research evaluating the effectiveness of anti-smoking campaigns and cessation support programs in reducing smoking prevalence among Filipinos.'
      },
      {
        title: 'Alcohol and Substance Abuse Treatment and Prevention in Philippine Communities',
        description: 'A comprehensive study on substance abuse patterns, treatment accessibility, and effectiveness of prevention and rehabilitation programs in the Philippines.'
      },
      {
        title: 'Public Health Emergency Preparedness and Disaster Response in Philippine Provinces',
        description: 'Research on disaster health management, emergency preparedness systems, and healthcare system resilience in typhoon-prone and earthquake-prone Philippine regions.'
      },
      {
        title: 'Reproductive Health Services and Family Planning Utilization in Philippine Rural Areas',
        description: 'A study on access to contraceptive services, reproductive health education, and determinants of family planning adoption in rural Filipino communities.'
      },
      {
        title: 'Communicable Disease Control and HIV/AIDS Prevention Strategies in the Philippines',
        description: 'Research on disease control programs, prevention strategies, and behavioral interventions targeting HIV and other communicable diseases affecting Filipinos.'
      },
      {
        title: 'Community Health Worker Programs and Primary Healthcare Service Delivery in the Philippines',
        description: 'An evaluation of community health worker training, motivation, and effectiveness in delivering primary healthcare services in underserved Philippine communities.'
      }
    ],
    'default': [
      {
        title: 'Comprehensive Analysis of Key Developments in FIELD',
        description: 'An in-depth examination of recent trends, innovations, and challenges in the field. This research will provide valuable insights into current best practices and future directions.'
      },
      {
        title: 'Impact Assessment of Digital Transformation in FIELD',
        description: 'A study on how digital technologies and innovation are reshaping practices, with particular attention to the Philippine context and local applicability.'
      },
      {
        title: 'Sustainability and Future Prospects in FIELD',
        description: 'An analysis of sustainable approaches and long-term viability of practices, examining both opportunities and challenges for future development and growth.'
      },
      {
        title: 'Policy and Regulatory Frameworks Affecting FIELD in the Philippines',
        description: 'Research on government policies, regulations, and their impact on practice and innovation, including recommendations for policy improvement.'
      },
      {
        title: 'Skills Gap and Workforce Development Needs in Philippine FIELD',
        description: 'A study identifying skill requirements, training gaps, and educational initiatives needed to prepare professionals for careers in the Philippines.'
      },
      {
        title: 'Cross-Cultural Considerations in Implementing FIELD Practices in Philippine Communities',
        description: 'An examination of how cultural values and local contexts affect the adoption and effectiveness of practices, with recommendations for culturally-appropriate approaches.'
      },
      {
        title: 'Technology Adoption and Digital Divide in FIELD Across Philippine Regions',
        description: 'Research on disparities in technology access and utilization, analyzing barriers to adoption and strategies for bridging the digital gap.'
      },
      {
        title: 'Cost-Benefit Analysis of Innovative Approaches in FIELD for Philippine Markets',
        description: 'An economic evaluation of new methods and technologies, assessing their financial viability and return on investment in the Philippine context.'
      },
      {
        title: 'Stakeholder Collaboration and Partnership Models in Philippine FIELD',
        description: 'Research examining successful collaborative frameworks between government agencies, private sector, and communities in advancing initiatives.'
      },
      {
        title: 'Long-term Impact and Sustainability of FIELD Interventions in Underserved Philippine Areas',
        description: 'A longitudinal study evaluating the lasting effects and sustainability of programs and initiatives within resource-limited Philippine communities.'
      },
      {
        title: 'Scaling and Replication of Successful FIELD Programs Across Philippine Regions',
        description: 'Research on mechanisms for scaling up successful pilots and programs across different Philippine contexts while maintaining effectiveness and local relevance.'
      },
      {
        title: 'Community Participation and Stakeholder Engagement in FIELD Development',
        description: 'A study on inclusive decision-making processes and community involvement in designing and implementing programs and initiatives.'
      },
      {
        title: 'Data-Driven Decision Making and Monitoring in Philippine FIELD Programs',
        description: 'Research on evidence collection, data management, and utilization of performance metrics to guide program improvement and policy decisions.'
      },
      {
        title: 'Private Sector Involvement and Public-Private Partnerships in Philippine FIELD',
        description: 'An examination of business models and partnership frameworks that leverage private sector expertise and resources for public benefit in the Philippines.'
      },
      {
        title: 'International Best Practices Adaptation for Philippine FIELD Context',
        description: 'Research on lessons learned from successful approaches globally and strategies for contextualizing and adapting them for Philippine implementation.'
      },
      {
        title: 'Research Gaps and Future Directions in Philippine FIELD Studies',
        description: 'A comprehensive literature review identifying unexplored areas and emerging issues that require further research and investigation.'
      },
      {
        title: 'Training and Capacity Building Needs for FIELD Professionals in the Philippines',
        description: 'A study assessing gaps in professional competencies and designing targeted training and development programs for field practitioners.'
      },
      {
        title: 'Monitoring and Evaluation Frameworks for FIELD Programs in Philippine Settings',
        description: 'Research on developing context-appropriate M&E systems that capture both quantitative outcomes and qualitative impacts of programs.'
      },
      {
        title: 'Organizational Effectiveness and Institutional Strengthening in Philippine FIELD',
        description: 'A study on organizational development, leadership, and management practices that enable institutions to achieve their FIELD-related objectives.'
      },
      {
        title: 'Equity and Inclusion in FIELD Programs and Services Delivery in the Philippines',
        description: 'Research on ensuring equitable access and culturally-sensitive service delivery to marginalized and vulnerable populations.'
      }
    ]
  };

  const fieldKey = field.toLowerCase().split(' ')[0];
  const topicPool = allTopics[fieldKey] || allTopics['default'];
  
  // Replace FIELD placeholder in default topics with actual field name
  const processedTopics = topicPool.map((topic: any) => ({
    ...topic,
    title: topic.title.replace(/FIELD/g, field),
    description: topic.description.replace(/FIELD/g, field)
  }));

  // Shuffle the topics and select 10
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

    const ideaData = await generateIdeasWithPuter(field);

    return new Response(JSON.stringify(ideaData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-topic-ideas function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
