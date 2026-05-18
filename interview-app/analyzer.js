const Analyzer = (() => {

  const TECH_KEYWORDS = {
    languages: ['javascript','typescript','python','java','c#','c++','go','rust','ruby','php','swift','kotlin','scala','r','sql','html','css','sass','less'],
    frameworks: ['react','angular','vue','next.js','nuxt','svelte','django','flask','spring','express','fastapi','rails','laravel','.net','node.js','nest.js','gatsby'],
    cloud: ['aws','azure','gcp','google cloud','cloud','docker','kubernetes','k8s','terraform','serverless','lambda','s3','ec2','cloudformation'],
    data: ['sql','nosql','postgresql','mysql','mongodb','redis','elasticsearch','kafka','spark','hadoop','snowflake','bigquery','databricks','etl','data pipeline','data warehouse','machine learning','ml','ai','deep learning','nlp','tensorflow','pytorch'],
    devops: ['ci/cd','jenkins','github actions','gitlab','circleci','ansible','puppet','chef','monitoring','grafana','prometheus','datadog','new relic','splunk','observability'],
    tools: ['git','jira','confluence','figma','sketch','adobe','agile','scrum','kanban','rest','graphql','api','microservices','soa','event-driven'],
    security: ['cybersecurity','infosec','oauth','authentication','authorization','encryption','penetration testing','soc 2','gdpr compliance','hipaa compliance','pci compliance','vulnerability assessment','security audit','network security','application security'],
  };

  const SOFT_SKILLS = [
    'communication','collaboration','teamwork','leadership','mentoring','coaching','problem-solving','critical thinking',
    'adaptability','flexibility','creativity','innovation','time management','organization','project management',
    'stakeholder management','presentation','negotiation','conflict resolution','decision-making','strategic thinking',
    'customer focus','empathy','emotional intelligence','resilience','accountability','initiative','self-motivated',
    'cross-functional','influence','facilitation','planning','prioritization',
  ];

  const SENIORITY_SIGNALS = {
    entry: ['junior','entry-level','entry level','graduate','intern','0-2 years','1-2 years','associate','trainee','early career'],
    mid: ['mid-level','mid level','3-5 years','2-5 years','3+ years','intermediate','experienced'],
    senior: ['senior','lead','principal','staff','architect','head of','director','vp','vice president','5+ years','7+ years','8+ years','10+ years','expert','advanced','seasoned','extensive experience'],
    executive: ['c-level','cto','cio','cfo','ceo','chief','executive','svp','evp'],
  };

  const LEADERSHIP_SIGNALS = [
    'manage','lead','direct reports','team of','mentor','coach','hire','recruit','performance review',
    'strategy','roadmap','vision','budget','p&l','revenue','growth','scale','build team','org design',
    'cross-functional','stakeholder','executive','board','c-suite','people management','talent',
  ];

  const COLLAB_SIGNALS = [
    'cross-functional','collaborate','partner','stakeholder','team','work closely','coordinate',
    'align','communicate','present','workshop','facilitate','bridge','liaison','interface',
  ];

  function extractTitle(text) {
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines.slice(0, 5)) {
      const trimmed = line.trim();
      if (trimmed.length > 3 && trimmed.length < 120 && !trimmed.includes('About') && !trimmed.includes('Company')) {
        const cleaned = trimmed.replace(/^(job title|position|role|title)\s*[:：\-]\s*/i, '');
        if (cleaned.length > 2) return cleaned;
      }
    }
    return 'Role';
  }

  function detectSeniority(text) {
    const lower = text.toLowerCase();
    let scores = { entry: 0, mid: 0, senior: 0, executive: 0 };
    for (const [level, signals] of Object.entries(SENIORITY_SIGNALS)) {
      for (const signal of signals) {
        if (lower.includes(signal)) scores[level]++;
      }
    }
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    if (best[1] === 0) return 'mid';
    return best[0];
  }

  // Short keywords that need word-boundary matching to avoid false positives
  const SHORT_TECH_WORDS = new Set(['go','r','c#','c++','ai','ml','s3','ec2','k8s','sql','css','soa','git','rest','api','nlp','sass','less','etl','aws','gcp','php','vue']);

  function extractTechSkills(text) {
    const lower = text.toLowerCase();
    const found = {};
    for (const [category, keywords] of Object.entries(TECH_KEYWORDS)) {
      const matches = keywords.filter(k => {
        if (SHORT_TECH_WORDS.has(k) || k.length <= 3) {
          // Use word-boundary regex to avoid matching substrings
          // e.g. "go" should not match "going", "r" should not match "manager"
          const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const re = new RegExp(`(?:^|[\\s,;:()\\[\\]/\\-])${escaped}(?:$|[\\s,;:()\\[\\]/\\-\\.])`, 'i');
          return re.test(text);
        }
        return lower.includes(k);
      });
      if (matches.length) found[category] = matches;
    }
    return found;
  }

  function extractSoftSkills(text) {
    const lower = text.toLowerCase();
    return SOFT_SKILLS.filter(s => lower.includes(s));
  }

  function detectLeadership(text) {
    const lower = text.toLowerCase();
    const signals = LEADERSHIP_SIGNALS.filter(s => lower.includes(s));
    return { present: signals.length >= 2, signals, level: signals.length >= 5 ? 'high' : signals.length >= 2 ? 'moderate' : 'low' };
  }

  function detectCollaboration(text) {
    const lower = text.toLowerCase();
    const signals = COLLAB_SIGNALS.filter(s => lower.includes(s));
    return { level: signals.length >= 4 ? 'high' : signals.length >= 2 ? 'moderate' : 'low', signals };
  }

  function extractKeyResponsibilities(text) {
    const lines = text.split('\n');
    const responsibilities = [];
    let inSection = false;
    for (const line of lines) {
      const trimmed = line.trim();
      const lower = trimmed.toLowerCase();
      if (lower.includes('responsibilit') || lower.includes('what you') || lower.includes('you will') || lower.includes('your role') || lower.includes('key duties')) {
        inSection = true;
        continue;
      }
      if (inSection && (lower.includes('requirement') || lower.includes('qualif') || lower.includes('what we') || lower.includes('nice to') || lower.includes('benefits') || lower.includes('about us'))) {
        inSection = false;
      }
      if (inSection && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*') || /^\d+[\.\)]/.test(trimmed))) {
        const clean = trimmed.replace(/^[-•*]\s*/, '').replace(/^\d+[\.\)]\s*/, '');
        if (clean.length > 10) responsibilities.push(clean);
      }
    }
    if (responsibilities.length < 3) {
      for (const line of lines) {
        const trimmed = line.trim();
        const clean = trimmed.replace(/^[-•*]\s*/, '').replace(/^\d+[\.\)]\s*/, '');
        if (clean.length > 20 && clean.length < 300 && !responsibilities.includes(clean)) {
          responsibilities.push(clean);
        }
        if (responsibilities.length >= 8) break;
      }
    }
    return responsibilities.slice(0, 10);
  }

  function buildCompetencies(analysis) {
    const comps = { technical: [], behavioral: [], leadership: [], communication: [], problemSolving: [] };
    const allTech = Object.values(analysis.techSkills).flat();
    const softFound = analysis.softSkills;

    // Determine if this is a primarily technical role based on evidence density
    const techCount = allTech.length;
    const hasCodingSkills = (analysis.techSkills.languages?.length || 0) + (analysis.techSkills.frameworks?.length || 0);
    const isTechRole = hasCodingSkills >= 2 || techCount >= 4;
    const hasSometech = techCount > 0;

    // --- TECHNICAL competencies (only when the role genuinely requires them) ---
    if (isTechRole) {
      const primaryTech = allTech.slice(0, 3).join(', ');
      comps.technical.push({
        name: `Core Technical Proficiency (${primaryTech})`,
        why: `The role requires hands-on expertise in ${primaryTech}. Strong technical foundations enable independent problem-solving and high-quality delivery.`,
        strongLooks: 'Candidate articulates technical decisions with depth, explains trade-offs, and demonstrates experience shipping production systems.',
        observable: ['Discusses architecture decisions with reasoning', 'References specific debugging or optimization experiences', 'Explains how they stay current with technology changes'],
      });

      comps.technical.push({
        name: 'Code Quality & Engineering Practices',
        why: 'Sustainable velocity depends on clean, testable, well-documented code. Poor quality creates compounding technical debt.',
        strongLooks: 'Candidate advocates for testing, code review, documentation, and iterative improvement without over-engineering.',
        observable: ['References testing strategies by name', 'Discusses refactoring decisions', 'Mentions code review practices'],
      });
    }

    if (analysis.techSkills.cloud?.length >= 2 || analysis.techSkills.devops?.length >= 2) {
      comps.technical.push({
        name: 'System Design & Architecture',
        why: 'Cloud and infrastructure skills signal a need for systems-level thinking and scalability awareness.',
        strongLooks: 'Candidate can whiteboard a system, discuss scaling strategies, and articulate monitoring/observability approaches.',
        observable: ['Draws systems before coding', 'Considers failure modes proactively', 'Discusses real production incidents and lessons learned'],
      });
    }

    if (analysis.techSkills.data?.length >= 2) {
      comps.technical.push({
        name: 'Data Engineering & Analysis',
        why: 'Data skills indicate the role involves data pipelines, analysis, or data-driven decision-making.',
        strongLooks: 'Candidate demonstrates ability to work with large datasets, optimize queries, and build reliable data pipelines.',
        observable: ['Explains data modeling decisions', 'Discusses data quality and validation', 'Shows experience with performance optimization'],
      });
    }

    // --- BEHAVIORAL competencies (conditional on evidence from the role description) ---
    if (softFound.includes('collaboration') || softFound.includes('teamwork') || analysis.collaboration.level !== 'low') {
      comps.behavioral.push({
        name: 'Collaboration & Teamwork',
        why: 'Most impactful work happens in teams. The ability to collaborate effectively multiplies individual contribution.',
        strongLooks: 'Candidate describes shared successes, gives credit to others, and navigates disagreements constructively.',
        observable: ['Uses "we" language naturally', 'Describes resolving team conflicts', 'Shows awareness of different working styles'],
      });
    }

    if (softFound.includes('adaptability') || softFound.includes('flexibility') || softFound.includes('creativity') || softFound.includes('innovation')) {
      comps.behavioral.push({
        name: 'Adaptability & Learning Agility',
        why: 'Roles evolve, technologies change, and priorities shift. Adaptable people thrive in ambiguity and grow faster.',
        strongLooks: 'Candidate shows a pattern of learning new domains, adjusting to change, and seeking feedback.',
        observable: ['Describes pivoting priorities successfully', 'Shares self-directed learning examples', 'Remains calm discussing uncertainty'],
      });
    }

    if (softFound.includes('accountability') || softFound.includes('initiative') || softFound.includes('self-motivated') || analysis.leadership.present) {
      comps.behavioral.push({
        name: 'Ownership & Accountability',
        why: 'Taking ownership means driving outcomes, not just completing tasks. This competency separates contributors from leaders.',
        strongLooks: 'Candidate takes responsibility for outcomes (including failures), follows through, and proactively identifies problems.',
        observable: ['Says "I" when describing failures', 'Describes going beyond assigned scope', 'Shows end-to-end ownership of projects'],
      });
    }

    if (softFound.includes('customer focus') || softFound.includes('empathy') || softFound.includes('stakeholder management')) {
      comps.behavioral.push({
        name: 'Customer & Stakeholder Focus',
        why: 'Understanding and prioritizing the needs of customers and stakeholders drives value and builds trust.',
        strongLooks: 'Candidate shows experience gathering requirements, managing expectations, and advocating for end-user needs.',
        observable: ['References user needs in decisions', 'Describes balancing competing stakeholder interests', 'Shows empathy for end-user experience'],
      });
    }

    if (softFound.includes('project management') || softFound.includes('planning') || softFound.includes('organization') || softFound.includes('time management')) {
      comps.behavioral.push({
        name: 'Planning & Organization',
        why: 'Structured planning enables predictable delivery, reduces waste, and helps teams coordinate effectively.',
        strongLooks: 'Candidate demonstrates experience breaking down work, setting milestones, tracking progress, and adjusting plans proactively.',
        observable: ['Describes planning methodology or tools', 'Shares examples of re-prioritization', 'Shows awareness of dependencies and risks'],
      });
    }

    // --- LEADERSHIP competencies (only when clearly signaled) ---
    if (analysis.leadership.present) {
      comps.leadership.push({
        name: 'People Leadership & Development',
        why: 'Effective leaders grow their teams, not just manage them. Developing talent is a force multiplier.',
        strongLooks: 'Candidate describes coaching individuals, giving feedback, and building team capabilities over time.',
        observable: ['Shares specific mentoring stories', 'Discusses performance conversations', 'Shows pride in team growth'],
      });

      if (analysis.leadership.level === 'high') {
        comps.leadership.push({
          name: 'Strategic Vision & Execution',
          why: 'Leaders must translate strategy into actionable plans and align teams around shared goals.',
          strongLooks: 'Candidate connects daily work to broader business objectives and makes principled trade-off decisions.',
          observable: ['Articulates why behind decisions', 'Balances short-term delivery with long-term vision', 'Describes influencing without authority'],
        });
      }
    }

    // --- COMMUNICATION competencies (conditional on evidence) ---
    if (softFound.includes('communication') || softFound.includes('presentation') || analysis.collaboration.level !== 'low') {
      comps.communication.push({
        name: 'Clear & Structured Communication',
        why: 'Clear communication reduces misunderstanding, accelerates decision-making, and builds trust across teams.',
        strongLooks: 'Candidate structures answers clearly, adjusts to the audience, and communicates complex ideas simply.',
        observable: ['Answers are well-structured (STAR format)', 'Avoids excessive jargon', 'Asks clarifying questions'],
      });
    }

    if (analysis.collaboration.level === 'high' || softFound.includes('stakeholder management') || softFound.includes('presentation')) {
      comps.communication.push({
        name: 'Stakeholder Communication',
        why: 'Working across teams and with diverse audiences requires translating complexity into actionable insights.',
        strongLooks: 'Candidate demonstrates experience presenting to diverse audiences and managing expectations.',
        observable: ['Describes adapting message for different audiences', 'Shows experience with executive presentations', 'Manages difficult conversations well'],
      });
    }

    if (softFound.includes('negotiation') || softFound.includes('influence') || softFound.includes('facilitation')) {
      comps.communication.push({
        name: 'Influence & Negotiation',
        why: 'Driving outcomes without direct authority requires the ability to persuade, negotiate, and build consensus.',
        strongLooks: 'Candidate demonstrates experience building alignment, navigating disagreements, and influencing decisions through evidence and relationships.',
        observable: ['Describes persuading without authority', 'Shows evidence of building consensus', 'Navigates conflicting interests constructively'],
      });
    }

    // --- PROBLEM-SOLVING competencies (conditional) ---
    if (softFound.includes('problem-solving') || softFound.includes('critical thinking') || isTechRole) {
      comps.problemSolving.push({
        name: 'Analytical Problem-Solving',
        why: 'Breaking down complex problems systematically leads to better solutions and fewer false starts.',
        strongLooks: 'Candidate demonstrates structured thinking: defines the problem, considers alternatives, evaluates trade-offs.',
        observable: ['Breaks large problems into smaller parts', 'Considers edge cases unprompted', 'Uses data to support decisions'],
      });
    }

    if (isTechRole) {
      comps.problemSolving.push({
        name: 'Root Cause Analysis',
        why: 'Fixing symptoms creates recurring problems. The ability to find root causes saves time and prevents regressions.',
        strongLooks: 'Candidate describes investigating beyond the surface, using systematic debugging, and preventing recurrence.',
        observable: ['Asks "why" multiple times', 'Describes post-mortem processes', 'Shows patience in investigation'],
      });
    }

    if (softFound.includes('strategic thinking') || softFound.includes('decision-making')) {
      comps.problemSolving.push({
        name: 'Strategic Decision-Making',
        why: 'Making sound decisions under uncertainty requires gathering relevant data, weighing trade-offs, and committing to a direction.',
        strongLooks: 'Candidate demonstrates a decision-making framework, considers long-term implications, and takes ownership of outcomes.',
        observable: ['Describes weighing trade-offs explicitly', 'Shows awareness of second-order effects', 'Takes ownership of decisions even when uncertain'],
      });
    }

    // --- FALLBACK: ensure at least some competencies are generated ---
    // If no behavioral competencies were found, add general ones
    if (comps.behavioral.length === 0) {
      comps.behavioral.push({
        name: 'Collaboration & Teamwork',
        why: 'Most impactful work happens in teams. The ability to collaborate effectively multiplies individual contribution.',
        strongLooks: 'Candidate describes shared successes, gives credit to others, and navigates disagreements constructively.',
        observable: ['Uses "we" language naturally', 'Describes resolving team conflicts', 'Shows awareness of different working styles'],
      });
    }

    if (comps.communication.length === 0) {
      comps.communication.push({
        name: 'Clear & Structured Communication',
        why: 'Clear communication reduces misunderstanding, accelerates decision-making, and builds trust across teams.',
        strongLooks: 'Candidate structures answers clearly, adjusts to the audience, and communicates complex ideas simply.',
        observable: ['Answers are well-structured (STAR format)', 'Avoids excessive jargon', 'Asks clarifying questions'],
      });
    }

    if (comps.problemSolving.length === 0) {
      comps.problemSolving.push({
        name: 'Analytical Problem-Solving',
        why: 'Breaking down complex problems systematically leads to better solutions and fewer false starts.',
        strongLooks: 'Candidate demonstrates structured thinking: defines the problem, considers alternatives, evaluates trade-offs.',
        observable: ['Breaks large problems into smaller parts', 'Considers edge cases unprompted', 'Uses data to support decisions'],
      });
    }

    return comps;
  }

  function buildCompetencyLibrary(competencies, analysis) {
    const allComps = Object.values(competencies).flat();
    return allComps.map(comp => ({
      name: comp.name,
      description: comp.why,
      levels: {
        beginner: generateLevelDesc(comp.name, 'beginner', analysis),
        mid: generateLevelDesc(comp.name, 'mid', analysis),
        senior: generateLevelDesc(comp.name, 'senior', analysis),
      },
      positiveBehaviors: comp.observable,
      riskIndicators: generateRiskIndicators(comp.name),
      exampleEvidence: generateEvidence(comp.name),
      evaluationCriteria: generateCriteria(comp.name),
    }));
  }

  function generateLevelDesc(name, level, analysis) {
    const descs = {
      beginner: {
        default: 'Demonstrates foundational understanding. Requires guidance on complex tasks. Shows willingness to learn and improve. Asks relevant questions.',
        technical: 'Can complete defined tasks with guidance. Understands core concepts but needs support with architecture decisions. Writes functional code with room for improvement in quality.',
        leadership: 'Leads by example in small groups. Beginning to mentor peers. Takes ownership of individual deliverables.',
      },
      mid: {
        default: 'Works independently on most tasks. Identifies problems proactively. Contributes ideas and drives improvements. Handles ambiguity with some support.',
        technical: 'Designs and implements features independently. Makes sound technical decisions. Contributes to code reviews effectively. Debugs complex issues.',
        leadership: 'Manages small teams or projects. Provides regular feedback. Coordinates across teams. Developing strategic thinking skills.',
      },
      senior: {
        default: 'Excels independently and elevates others. Drives organizational improvements. Navigates complex situations with confidence. Role model for the competency.',
        technical: 'Architects systems, sets technical direction. Mentors engineers across the organization. Makes decisions with long-term impact. Recognized as a domain expert.',
        leadership: 'Builds and scales high-performing teams. Shapes organizational strategy. Develops future leaders. Influences at executive level.',
      },
    };
    const isTech = name.toLowerCase().includes('technical') || name.toLowerCase().includes('code') || name.toLowerCase().includes('system') || name.toLowerCase().includes('data');
    const isLead = name.toLowerCase().includes('leader') || name.toLowerCase().includes('strategic');
    const key = isLead ? 'leadership' : isTech ? 'technical' : 'default';
    return descs[level][key];
  }

  function generateRiskIndicators(name) {
    const lower = name.toLowerCase();
    if (lower.includes('technical') || lower.includes('code') || lower.includes('system')) {
      return ['Cannot explain past technical decisions', 'Avoids discussing failures or bugs', 'Over-reliance on specific tools without understanding principles', 'Unable to discuss trade-offs'];
    }
    if (lower.includes('collabor') || lower.includes('team')) {
      return ['Uses only "I" when describing team projects', 'Blames others for failures', 'Shows frustration with differing opinions', 'Cannot describe resolving a disagreement'];
    }
    if (lower.includes('leader') || lower.includes('strateg')) {
      return ['Micromanages rather than delegates', 'Cannot describe developing team members', 'Avoids difficult conversations', 'Focuses only on output, not people'];
    }
    if (lower.includes('communic') || lower.includes('stakeholder')) {
      return ['Rambling or unfocused answers', 'Cannot simplify complex concepts', 'Avoids eye contact or engagement', 'Does not ask clarifying questions'];
    }
    return ['Lacks specific examples', 'Gives theoretical answers without practical evidence', 'Inconsistent across answers', 'Shows limited self-awareness'];
  }

  function generateEvidence(name) {
    const lower = name.toLowerCase();
    if (lower.includes('technical') || lower.includes('code') || lower.includes('system')) {
      return ['Describes a project they architected end-to-end', 'Explains a production incident they resolved', 'Shares metrics on system performance improvements', 'Discusses technology selection with trade-off analysis'];
    }
    if (lower.includes('collabor') || lower.includes('team')) {
      return ['Describes facilitating a cross-team initiative', 'Shares how they onboarded a new team member', 'Explains navigating a significant disagreement to resolution', 'Demonstrates adjusting communication style for different audiences'];
    }
    if (lower.includes('leader')) {
      return ['Shares a story of growing someone on their team', 'Describes building a team from scratch', 'Explains setting and achieving team-level goals', 'Discusses managing underperformance constructively'];
    }
    return ['Provides a specific, detailed example with context', 'Quantifies impact where possible', 'Describes their specific role and actions', 'Reflects on what they learned'];
  }

  function generateCriteria(name) {
    return [
      'Specificity: Does the candidate provide concrete, detailed examples?',
      'Impact: Can they quantify or clearly describe the outcome?',
      'Ownership: Is their role in the situation clear and significant?',
      'Reflection: Do they show learning and growth from the experience?',
      'Relevance: Is the example relevant to the role requirements?',
    ];
  }

  function buildBigFive(analysis) {
    const seniority = analysis.seniority;
    const leadership = analysis.leadership;
    const collab = analysis.collaboration;
    const hasTech = Object.keys(analysis.techSkills).length > 0;

    return {
      openness: {
        ideal: hasTech ? 'medium-high' : 'medium',
        rationale: hasTech
          ? 'Technical roles benefit from curiosity about new tools, approaches, and continuous learning. A moderate-to-high openness supports innovation while maintaining pragmatism.'
          : 'The role benefits from adaptability and willingness to explore new approaches while maintaining practical focus on delivery.',
        behaviors: [
          'Seeks out new technologies and methods proactively',
          'Asks thought-provoking questions during interviews',
          'Describes experimenting with different approaches',
          'Comfortable discussing failures as learning opportunities',
        ],
        signals: [
          'Ask about a time they learned a new technology or approach — look for enthusiasm and depth',
          'Explore how they handle ambiguous requirements — high openness shows comfort with exploration',
          'Discuss a decision where they chose a conventional vs. novel approach — listen for reasoning',
        ],
      },
      conscientiousness: {
        ideal: seniority === 'senior' || seniority === 'executive' ? 'high' : 'medium-high',
        rationale: 'Reliability, organization, and follow-through are essential for consistent delivery. Higher seniority roles require greater conscientiousness for managing complexity and team dependencies.',
        behaviors: [
          'Follows through on commitments consistently',
          'Maintains organized documentation and processes',
          'Plans work carefully and meets deadlines',
          'Pays attention to quality and detail',
        ],
        signals: [
          'Ask about managing competing deadlines — look for structured prioritization',
          'Explore their project tracking habits — conscientiousness shows in systems and routines',
          'Ask about a mistake they caught before it reached production — detail orientation',
        ],
      },
      extraversion: {
        ideal: collab.level === 'high' ? 'medium-high' : leadership.present ? 'medium-high' : 'medium',
        rationale: collab.level === 'high'
          ? 'This role requires extensive collaboration, making moderate-to-high extraversion beneficial for building relationships and driving alignment across teams.'
          : 'A balanced level of extraversion supports the collaboration needed while allowing focused, independent work.',
        behaviors: [
          'Engages actively in team discussions',
          'Builds relationships across organizational boundaries',
          'Comfortable presenting ideas to groups',
          'Balances social engagement with focused deep work',
        ],
        signals: [
          'Observe energy during the interview — does the candidate engage naturally or seem drained?',
          'Ask about their ideal work environment — reveals preferences for social vs. solo work',
          'Explore how they build relationships in a new team — look for initiative and warmth',
        ],
      },
      agreeableness: {
        ideal: leadership.present ? 'medium' : 'medium-high',
        rationale: leadership.present
          ? 'Leaders need enough agreeableness to build trust and rapport, but also enough assertiveness to make difficult decisions, give critical feedback, and push back when needed.'
          : 'Moderate-to-high agreeableness supports effective teamwork, empathy, and constructive conflict resolution.',
        behaviors: [
          'Shows empathy and consideration for others\' perspectives',
          'Navigates disagreements respectfully and constructively',
          'Provides honest feedback with care',
          'Balances accommodation with assertiveness when needed',
        ],
        signals: [
          'Ask about a disagreement with a colleague — listen for empathy AND backbone',
          'Explore how they give critical feedback — overly agreeable candidates avoid conflict',
          'Ask about a time they said no — healthy assertiveness is a positive signal',
        ],
      },
      emotionalStability: {
        ideal: 'high',
        rationale: 'Emotional stability is broadly beneficial across roles. It supports consistent performance under pressure, healthy responses to setbacks, and creates a calming influence on teams.',
        behaviors: [
          'Remains calm and composed under pressure',
          'Handles criticism and setbacks constructively',
          'Maintains consistent performance during stressful periods',
          'Serves as a stabilizing presence for the team',
        ],
        signals: [
          'Ask about their most stressful professional experience — listen for composure and perspective',
          'Explore how they handle critical feedback — emotional stability shows in non-defensive responses',
          'Ask about a significant failure — stable candidates discuss openly without excessive distress',
        ],
      },
    };
  }

  function buildQuestions(analysis) {
    const questions = { competency: [], situational: [], technical: [], bigFive: [], culture: [] };
    const seniority = analysis.seniority;
    const allTech = Object.values(analysis.techSkills).flat();
    const primaryTech = allTech.slice(0, 3).join(', ') || 'relevant technologies';

    questions.competency = [
      {
        q: 'Tell me about a time when you had to deliver a project under significant pressure. How did you manage priorities and ensure quality?',
        why: 'Assesses ownership, prioritization, and quality standards under constraint.',
        strong: 'Candidate describes a structured approach to prioritization, communicates trade-offs to stakeholders, and maintains quality despite pressure.',
        warning: 'Blames others for pressure, shows no system for prioritization, or sacrifices quality without acknowledging it.',
        followups: ['What would you do differently?', 'How did you decide what to deprioritize?', 'Who else was involved, and how did you coordinate?'],
        category: 'Ownership & Delivery',
      },
      {
        q: 'Describe a situation where you had to collaborate with someone whose working style was very different from yours.',
        why: 'Evaluates adaptability, empathy, and interpersonal skills.',
        strong: 'Shows genuine effort to understand the other person, adapts approach, and finds a productive working dynamic.',
        warning: 'Frames the other person as the problem, shows no adaptation, or avoids collaboration.',
        followups: ['What did you learn about yourself from that experience?', 'How did you identify the working style mismatch?'],
        category: 'Collaboration',
      },
      {
        q: 'Tell me about a time you identified a significant problem that others had not noticed. What did you do?',
        why: 'Tests proactive thinking, observation skills, and initiative.',
        strong: 'Describes systematic observation, takes initiative to raise and solve the problem, and considers broader impact.',
        warning: 'Cannot provide a specific example, or identified the problem but took no action.',
        followups: ['How did you convince others this was a real problem?', 'What was the impact of addressing it?'],
        category: 'Problem-Solving',
      },
      {
        q: 'Describe a time you received feedback that was hard to hear. How did you respond?',
        why: 'Evaluates self-awareness, growth mindset, and emotional maturity.',
        strong: 'Acknowledges the feedback genuinely, describes specific changes made, and shows appreciation for growth.',
        warning: 'Dismisses the feedback, becomes defensive in telling the story, or cannot recall receiving constructive feedback.',
        followups: ['What specifically changed in your behavior afterward?', 'Would you seek out similar feedback today?'],
        category: 'Growth Mindset',
      },
    ];

    if (analysis.leadership.present) {
      questions.competency.push({
        q: 'Tell me about a time you had to make an unpopular decision with your team. How did you handle it?',
        why: 'Evaluates leadership courage, communication skills, and ability to maintain trust through difficult moments.',
        strong: 'Explains the reasoning transparently, listens to concerns, and stands by the decision while showing empathy.',
        warning: 'Avoids difficult decisions, does not communicate reasoning, or is dismissive of team concerns.',
        followups: ['How did the team respond?', 'What would you do differently?', 'How did you rebuild trust afterward?'],
        category: 'Leadership',
      });
    }

    questions.situational = [
      {
        q: 'Imagine you are two weeks into a new role and you discover that a key process your team relies on is significantly flawed. What would you do?',
        why: 'Tests how candidates balance initiative with humility in a new environment.',
        strong: 'Gathers context first, consults teammates, proposes solutions diplomatically, and considers organizational history.',
        warning: 'Immediately tries to change everything, or stays silent and does nothing.',
        followups: ['Who would you talk to first?', 'How would you present your findings?'],
        category: 'Judgment',
      },
      {
        q: `You are leading a project and realize mid-way that the technical approach ${primaryTech ? `using ${primaryTech} ` : ''}will not meet the deadline. What do you do?`,
        why: 'Evaluates decision-making under pressure, communication skills, and pragmatism.',
        strong: 'Escalates early, proposes alternatives with trade-offs, and communicates transparently to stakeholders.',
        warning: 'Hides the problem, works excessive hours silently, or blames the original plan.',
        followups: ['How would you communicate this to stakeholders?', 'What trade-offs would you consider?'],
        category: 'Decision-Making',
      },
      {
        q: 'A colleague repeatedly takes credit for work you contributed significantly to. How do you handle it?',
        why: 'Evaluates conflict resolution, assertiveness, and interpersonal judgment.',
        strong: 'Addresses directly but diplomatically, documents contributions going forward, and focuses on resolution over blame.',
        warning: 'Passive-aggressive behavior, escalates immediately to management, or lets it continue indefinitely.',
        followups: ['What if the direct conversation did not resolve it?', 'How do you ensure visibility for your work generally?'],
        category: 'Conflict Resolution',
      },
      {
        q: 'You have three urgent requests from different stakeholders, all due this week. How do you decide what to work on first?',
        why: 'Tests prioritization frameworks and stakeholder management skills.',
        strong: 'Uses a clear prioritization framework (impact, urgency, dependencies), communicates proactively, and renegotiates deadlines when needed.',
        warning: 'Works on whatever is loudest, cannot articulate a prioritization method, or tries to do everything simultaneously.',
        followups: ['How would you communicate to the stakeholders whose work you deprioritized?'],
        category: 'Prioritization',
      },
    ];

    if (allTech.length > 0) {
      questions.technical = [
        {
          q: `Describe a system you designed or significantly contributed to using ${primaryTech}. Walk me through the architecture decisions.`,
          why: 'Evaluates depth of technical knowledge, decision-making, and ability to communicate architecture.',
          strong: 'Clearly explains trade-offs, considers scalability and maintainability, and discusses what they would change in hindsight.',
          warning: 'Cannot explain why decisions were made, focuses only on implementation details, or gives textbook answers without practical depth.',
          followups: ['What would you change if you redesigned it today?', 'What was the most difficult technical decision?', 'How did you handle testing and deployment?'],
          category: 'Architecture',
        },
        {
          q: 'Tell me about a production issue you debugged that was particularly challenging. Walk me through your investigation process.',
          why: 'Evaluates debugging skills, systematic thinking, and composure under pressure.',
          strong: 'Describes a methodical approach, uses data to narrow hypotheses, and implements prevention measures.',
          warning: 'Random trial-and-error approach, cannot explain their debugging process, or did not follow up with prevention.',
          followups: ['How did you prevent this from happening again?', 'What tools did you use?', 'How did you communicate status during the incident?'],
          category: 'Debugging',
        },
        {
          q: `How do you approach technical debt in a codebase? Can you give a specific example of how you managed it?`,
          why: 'Evaluates pragmatism, long-term thinking, and ability to balance speed with quality.',
          strong: 'Shows a balanced approach — acknowledges tech debt as normal, has strategies for managing it, and can prioritize effectively.',
          warning: 'Ignores tech debt entirely, or is dogmatic about perfection at the expense of delivery.',
          followups: ['How did you make the case for addressing it?', 'How do you measure the impact of paying down tech debt?'],
          category: 'Engineering Practices',
        },
      ];

      if (analysis.techSkills.data?.length) {
        questions.technical.push({
          q: 'Describe how you would design a data pipeline for processing large-scale data. What considerations drive your architecture?',
          why: 'Evaluates data engineering depth, systems thinking, and understanding of reliability requirements.',
          strong: 'Discusses idempotency, error handling, monitoring, schema evolution, and scaling considerations.',
          warning: 'Ignores failure modes, cannot discuss trade-offs between batch and streaming, or lacks practical experience.',
          followups: ['How do you handle schema changes?', 'What monitoring would you put in place?'],
          category: 'Data Engineering',
        });
      }
    } else {
      questions.technical = [
        {
          q: 'Describe a complex project you managed from start to finish. What was your approach to planning and execution?',
          why: 'Evaluates project management skills, systematic thinking, and ability to handle complexity.',
          strong: 'Shows structured planning, risk management, stakeholder communication, and iterative adjustment.',
          warning: 'No clear methodology, ignores risks, or cannot describe adjustments made during execution.',
          followups: ['What was the biggest risk, and how did you mitigate it?', 'How did you handle scope changes?'],
          category: 'Project Management',
        },
        {
          q: 'What processes or systems have you put in place to improve efficiency in your current or previous role?',
          why: 'Evaluates initiative, systems thinking, and impact mindset.',
          strong: 'Describes specific improvements with measurable outcomes, shows consideration for the team, and iterates on the solution.',
          warning: 'Cannot provide specific examples, or imposed solutions without team input.',
          followups: ['How did you measure the improvement?', 'How did the team respond to the change?'],
          category: 'Process Improvement',
        },
      ];
    }

    questions.bigFive = [
      {
        q: 'How do you typically approach learning something completely new — a technology, domain, or skill you have no experience with?',
        why: 'Explores openness to experience and learning agility.',
        strong: 'Describes a structured but enthusiastic approach to learning, seeks diverse resources, and applies learning quickly.',
        warning: 'Shows reluctance to learn new things, prefers to stay in comfort zone, or learns only when forced.',
        followups: ['What was the most recent new thing you learned?', 'How long does it typically take you to feel productive?'],
        category: 'Openness',
        trait: 'openness',
      },
      {
        q: 'Walk me through how you organize your work when you have multiple ongoing projects with different deadlines.',
        why: 'Explores conscientiousness through organizational habits and reliability.',
        strong: 'Has a clear system, tracks commitments, and proactively manages expectations when capacity is tight.',
        warning: 'No system in place, frequently misses deadlines, or over-commits without adjusting.',
        followups: ['What tools do you use?', 'How do you handle unexpected urgent tasks?'],
        category: 'Conscientiousness',
        trait: 'conscientiousness',
      },
      {
        q: 'Describe your ideal balance between working independently and working with others. How does that show up in your daily work?',
        why: 'Explores extraversion tendencies and social energy management.',
        strong: 'Shows self-awareness about preferences, adapts to team needs, and has strategies for both focused and collaborative work.',
        warning: 'Extremely rigid about preferences, or is unaware of how their style affects others.',
        followups: ['How do you recharge during a demanding week?', 'What kind of meetings do you find most valuable?'],
        category: 'Extraversion',
        trait: 'extraversion',
      },
      {
        q: 'Tell me about a time when you had to push back on a decision you disagreed with. How did you approach it?',
        why: 'Explores agreeableness — specifically the balance between cooperation and healthy assertiveness.',
        strong: 'Pushes back respectfully with evidence, listens to other perspectives, and accepts the outcome gracefully even if their view did not prevail.',
        warning: 'Either never pushes back (too agreeable) or pushes back aggressively without listening.',
        followups: ['How did the other person react?', 'What did you do after the decision was made?'],
        category: 'Agreeableness',
        trait: 'agreeableness',
      },
      {
        q: 'Describe the most stressful period in your professional career. How did you manage your well-being and performance during that time?',
        why: 'Explores emotional stability and stress management capabilities.',
        strong: 'Shows self-awareness about stress triggers, has healthy coping strategies, and maintains functioning under pressure.',
        warning: 'Describes being overwhelmed without any coping strategies, or denies ever experiencing stress.',
        followups: ['What would you do differently now?', 'How did you know when to ask for help?'],
        category: 'Emotional Stability',
        trait: 'emotionalStability',
      },
    ];

    questions.culture = [
      {
        q: 'What kind of work environment brings out your best performance? Be specific.',
        why: 'Assesses cultural fit and self-awareness about optimal working conditions.',
        strong: 'Provides specific, thoughtful answers that align with the team culture. Shows awareness of what motivates them.',
        warning: 'Generic answers like "I work well anywhere" or expectations that conflict significantly with the team culture.',
        followups: ['What about that environment specifically makes you productive?', 'Can you give an example of an environment where you struggled?'],
        category: 'Work Environment',
      },
      {
        q: 'What is something you are genuinely passionate about in your work, and how do you pursue it?',
        why: 'Explores intrinsic motivation and values alignment.',
        strong: 'Shows genuine enthusiasm for aspects of the work, connects passion to action, and describes pursuing it proactively.',
        warning: 'Cannot identify any passion, or passion is entirely disconnected from the role.',
        followups: ['How does that passion influence the projects you choose?', 'How do you maintain motivation during routine tasks?'],
        category: 'Motivation',
      },
      {
        q: 'Describe a team you thrived in. What made it work?',
        why: 'Reveals values around teamwork, management style preferences, and cultural expectations.',
        strong: 'Describes specific team dynamics with nuance, appreciates diverse contributions, and shows self-awareness about their role in team success.',
        warning: 'Attributes success entirely to themselves, or cannot describe a positive team experience.',
        followups: ['What was your specific role in making it work?', 'How was conflict handled on that team?'],
        category: 'Teamwork',
      },
      {
        q: 'How do you define success in your career, and how does this role fit into that vision?',
        why: 'Evaluates long-term thinking, career intentionality, and alignment with what the role offers.',
        strong: 'Has a thoughtful career narrative, connects the role to growth goals, and shows genuine interest in the opportunity.',
        warning: 'Has not thought about career direction, or the role clearly does not fit their goals.',
        followups: ['Where do you see yourself in 3 years?', 'What skills do you most want to develop?'],
        category: 'Career Vision',
      },
    ];

    return questions;
  }

  function buildFollowUps() {
    return {
      vague: {
        title: 'When Answers Are Vague',
        questions: [
          'Can you walk me through a specific example of that?',
          'What was your exact role in that situation?',
          'What specific steps did you take?',
          'What was the measurable outcome?',
          'When did this happen, and how long did the project last?',
          'Who else was involved, and what was their role?',
        ],
      },
      achievements: {
        title: 'When Probing Strong Achievements',
        questions: [
          'What made your approach different from what had been tried before?',
          'How did you measure the success of this achievement?',
          'What was the most challenging part?',
          'Would you approach it differently today? Why?',
          'How did this impact the broader team or organization?',
          'What did others contribute to this success?',
        ],
      },
      conflict: {
        title: 'When Exploring Conflict Situations',
        questions: [
          'How did you feel during this conflict?',
          'What did you learn about yourself from this experience?',
          'What was the other person\'s perspective?',
          'How was the relationship afterward?',
          'Looking back, what would you do differently?',
          'How did you prevent similar conflicts in the future?',
        ],
      },
      leadership: {
        title: 'When Assessing Leadership',
        questions: [
          'How did you decide to take on a leadership role in this situation?',
          'How did you handle team members who disagreed with your direction?',
          'What is the most important thing you learned about leading others?',
          'How do you adapt your leadership style for different team members?',
          'Tell me about someone you helped develop — where are they now?',
          'How do you handle underperformance on your team?',
        ],
      },
      technical: {
        title: 'When Probing Technical Depth',
        questions: [
          'What alternatives did you consider, and why did you rule them out?',
          'How would this solution scale to 10x the current load?',
          'What are the main risks or limitations of this approach?',
          'How did you test this solution?',
          'What would you change in hindsight?',
          'How did you communicate the technical decision to non-technical stakeholders?',
        ],
      },
      teamwork: {
        title: 'When Exploring Teamwork',
        questions: [
          'What was the team dynamic, and how did you contribute to it?',
          'How did the team handle disagreements?',
          'What role do you naturally take in a team setting?',
          'How do you build trust with new team members?',
          'Can you describe a time when team collaboration broke down?',
          'How do you handle a teammate who is not contributing equally?',
        ],
      },
      ownership: {
        title: 'When Clarifying Ownership',
        questions: [
          'Were you the decision-maker, or were you implementing someone else\'s decision?',
          'What happened when you were not available — did the project continue smoothly?',
          'What was your direct contribution versus the team\'s?',
          'Who would I speak to if I wanted to validate your role in this?',
          'How did you ensure accountability throughout the project?',
        ],
      },
      learning: {
        title: 'When Exploring Learning Experiences',
        questions: [
          'What specific skill did you develop from this experience?',
          'How did you seek feedback during the learning process?',
          'How long did it take you to become proficient?',
          'How have you applied this learning since then?',
          'What resources or methods were most helpful?',
        ],
      },
      failures: {
        title: 'When Discussing Failures & Setbacks',
        questions: [
          'At what point did you realize things were going wrong?',
          'What was your first reaction?',
          'What did you learn from this failure?',
          'How did you communicate the failure to others?',
          'What systems or processes did you put in place to prevent recurrence?',
          'How did this experience change your approach going forward?',
        ],
      },
    };
  }

  function buildScorecard(competencies, analysis) {
    const allComps = [];
    const ordering = ['technical', 'behavioral', 'leadership', 'communication', 'problemSolving'];
    const allTech = Object.values(analysis.techSkills).flat();
    const hasCodingSkills = (analysis.techSkills.languages?.length || 0) + (analysis.techSkills.frameworks?.length || 0);
    const isTechRole = hasCodingSkills >= 2 || allTech.length >= 4;

    for (const cat of ordering) {
      for (const comp of competencies[cat] || []) {
        let weight;
        if (cat === 'technical') {
          // Only mark technical as critical for genuinely technical roles
          weight = isTechRole ? 'critical' : 'medium';
        } else if (cat === 'behavioral') weight = 'high';
        else if (cat === 'leadership') weight = analysis.leadership.level === 'high' ? 'critical' : 'high';
        else if (cat === 'communication') weight = 'medium';
        else weight = 'high';
        allComps.push({ name: comp.name, category: cat, weight });
      }
    }
    return allComps;
  }

  function analyze(text) {
    const title = extractTitle(text);
    const seniority = detectSeniority(text);
    const techSkills = extractTechSkills(text);
    const softSkills = extractSoftSkills(text);
    const leadership = detectLeadership(text);
    const collaboration = detectCollaboration(text);
    const responsibilities = extractKeyResponsibilities(text);

    const allTech = Object.values(techSkills).flat();
    const techVsSoft = allTech.length > 0
      ? `${Math.round((allTech.length / (allTech.length + softSkills.length + 1)) * 100)}% technical / ${Math.round((softSkills.length / (allTech.length + softSkills.length + 1)) * 100)}% soft skills`
      : 'Primarily soft skills focused';

    const analysis = { title, seniority, techSkills, softSkills, leadership, collaboration, responsibilities, techVsSoft };

    const competencies = buildCompetencies(analysis);
    const competencyLibrary = buildCompetencyLibrary(competencies, analysis);
    const bigFive = buildBigFive(analysis);
    const questions = buildQuestions(analysis);
    const followUps = buildFollowUps();
    const scorecard = buildScorecard(competencies, analysis);

    return { analysis, competencies, competencyLibrary, bigFive, questions, followUps, scorecard };
  }

  return { analyze };
})();
