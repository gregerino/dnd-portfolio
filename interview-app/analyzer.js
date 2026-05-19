const Analyzer = (() => {

  let _lang = 'en';
  const L = (en, sv) => _lang === 'sv' ? sv : en;

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
    // Swedish equivalents
    'kommunikation','samarbete','teamarbete','ledarskap','mentorskap','coachning','problemlösning','kritiskt tänkande',
    'anpassningsförmåga','flexibilitet','kreativitet','innovation','tidshantering','organisationsförmåga','projektledning',
    'intressenthantering','presentation','förhandling','konflikthantering','beslutsfattande','strategiskt tänkande',
    'kundfokus','empati','emotionell intelligens','motståndskraft','ansvarstagande','initiativförmåga','självgående',
    'tvärfunktionell','påverkan','facilitering','planering','prioritering',
  ];

  // Map Swedish soft skill keywords to their English equivalents for matching
  const SV_TO_EN_SOFT = {
    'kommunikation': 'communication', 'samarbete': 'collaboration', 'teamarbete': 'teamwork',
    'ledarskap': 'leadership', 'mentorskap': 'mentoring', 'coachning': 'coaching',
    'problemlösning': 'problem-solving', 'kritiskt tänkande': 'critical thinking',
    'anpassningsförmåga': 'adaptability', 'flexibilitet': 'flexibility', 'kreativitet': 'creativity',
    'innovation': 'innovation', 'tidshantering': 'time management', 'organisationsförmåga': 'organization',
    'projektledning': 'project management', 'intressenthantering': 'stakeholder management',
    'presentation': 'presentation', 'förhandling': 'negotiation', 'konflikthantering': 'conflict resolution',
    'beslutsfattande': 'decision-making', 'strategiskt tänkande': 'strategic thinking',
    'kundfokus': 'customer focus', 'empati': 'empathy', 'emotionell intelligens': 'emotional intelligence',
    'motståndskraft': 'resilience', 'ansvarstagande': 'accountability', 'initiativförmåga': 'initiative',
    'självgående': 'self-motivated', 'tvärfunktionell': 'cross-functional',
    'påverkan': 'influence', 'facilitering': 'facilitation', 'planering': 'planning', 'prioritering': 'prioritization',
  };

  const SENIORITY_SIGNALS = {
    entry: ['junior','entry-level','entry level','graduate','intern','0-2 years','1-2 years','associate','trainee','early career',
            'nyexaminerad','praktikant','0-2 år','1-2 år','tidig karriär','nybörjare'],
    mid: ['mid-level','mid level','3-5 years','2-5 years','3+ years','intermediate','experienced',
          'mellannivå','3-5 år','2-5 år','3+ år','erfaren'],
    senior: ['senior','lead','principal','staff','architect','head of','director','vp','vice president','5+ years','7+ years','8+ years','10+ years','expert','advanced','seasoned','extensive experience',
             'ledande','chefsarkitekt','chef för','5+ år','7+ år','8+ år','10+ år','avancerad','lång erfarenhet'],
    executive: ['c-level','cto','cio','cfo','ceo','chief','executive','svp','evp',
                'verkställande','koncernchef'],
  };

  const LEADERSHIP_SIGNALS = [
    'manage','lead','direct reports','team of','mentor','coach','hire','recruit','performance review',
    'strategy','roadmap','vision','budget','p&l','revenue','growth','scale','build team','org design',
    'cross-functional','stakeholder','executive','board','c-suite','people management','talent',
    // Swedish
    'leda','ansvara för','personalansvar','teamledare','rekrytera','medarbetarsamtal',
    'strategi','budget','tillväxt','bygga team','organisationsdesign',
    'tvärfunktionell','intressent','styrelse','personalledning',
  ];

  const COLLAB_SIGNALS = [
    'cross-functional','collaborate','partner','stakeholder','team','work closely','coordinate',
    'align','communicate','present','workshop','facilitate','bridge','liaison','interface',
    // Swedish
    'tvärfunktionell','samarbeta','partner','intressent','team','arbeta nära','koordinera',
    'kommunicera','presentera','facilitera','workshoppa',
  ];

  const SHORT_TECH_WORDS = new Set(['go','r','c#','c++','ai','ml','s3','ec2','k8s','sql','css','soa','git','rest','api','nlp','sass','less','etl','aws','gcp','php','vue']);

  function extractTitle(text) {
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines.slice(0, 5)) {
      const trimmed = line.trim();
      if (trimmed.length > 3 && trimmed.length < 120 && !trimmed.includes('About') && !trimmed.includes('Company') && !trimmed.includes('Om oss') && !trimmed.includes('Företag')) {
        const cleaned = trimmed.replace(/^(job title|position|role|title|tjänstetitel|roll|befattning)\s*[:：\-]\s*/i, '');
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

  function extractTechSkills(text) {
    const lower = text.toLowerCase();
    const found = {};
    for (const [category, keywords] of Object.entries(TECH_KEYWORDS)) {
      const matches = keywords.filter(k => {
        if (SHORT_TECH_WORDS.has(k) || k.length <= 3) {
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
    const found = SOFT_SKILLS.filter(s => lower.includes(s));
    // Normalize Swedish matches to English equivalents
    const normalized = new Set();
    for (const s of found) {
      if (SV_TO_EN_SOFT[s]) normalized.add(SV_TO_EN_SOFT[s]);
      else normalized.add(s);
    }
    return [...normalized];
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
      if (lower.includes('responsibilit') || lower.includes('what you') || lower.includes('you will') || lower.includes('your role') || lower.includes('key duties') ||
          lower.includes('ansvarsområden') || lower.includes('arbetsuppgifter') || lower.includes('du kommer') || lower.includes('din roll') || lower.includes('dina uppgifter')) {
        inSection = true;
        continue;
      }
      if (inSection && (lower.includes('requirement') || lower.includes('qualif') || lower.includes('what we') || lower.includes('nice to') || lower.includes('benefits') || lower.includes('about us') ||
          lower.includes('krav') || lower.includes('kvalifikation') || lower.includes('vi erbjuder') || lower.includes('meriterande') || lower.includes('om oss'))) {
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

  // ══════════════════════════════════════
  //  COMPETENCIES
  // ══════════════════════════════════════

  function buildCompetencies(analysis) {
    const comps = { technical: [], behavioral: [], leadership: [], communication: [], problemSolving: [] };
    const allTech = Object.values(analysis.techSkills).flat();
    const softFound = analysis.softSkills;
    const hasCodingSkills = (analysis.techSkills.languages?.length || 0) + (analysis.techSkills.frameworks?.length || 0);
    const isTechRole = hasCodingSkills >= 2 || allTech.length >= 4;

    // --- TECHNICAL ---
    if (isTechRole) {
      const primaryTech = allTech.slice(0, 3).join(', ');
      comps.technical.push({
        name: L(`Core Technical Proficiency (${primaryTech})`, `Teknisk kärnkompetens (${primaryTech})`),
        why: L(
          `The role requires hands-on expertise in ${primaryTech}. Strong technical foundations enable independent problem-solving and high-quality delivery.`,
          `Rollen kräver praktisk expertis inom ${primaryTech}. Starka tekniska grunder möjliggör självständig problemlösning och leverans av hög kvalitet.`
        ),
        strongLooks: L(
          'Candidate articulates technical decisions with depth, explains trade-offs, and demonstrates experience shipping production systems.',
          'Kandidaten beskriver tekniska beslut med djup, förklarar avvägningar och visar erfarenhet av att leverera produktionssystem.'
        ),
        observable: L(
          ['Discusses architecture decisions with reasoning', 'References specific debugging or optimization experiences', 'Explains how they stay current with technology changes'],
          ['Diskuterar arkitekturbeslut med resonemang', 'Refererar till specifika felsöknings- eller optimeringsupplevelser', 'Förklarar hur de håller sig uppdaterade med teknikförändringar']
        ),
      });

      comps.technical.push({
        name: L('Code Quality & Engineering Practices', 'Kodkvalitet & ingenjörspraxis'),
        why: L(
          'Sustainable velocity depends on clean, testable, well-documented code. Poor quality creates compounding technical debt.',
          'Hållbar hastighet beror på ren, testbar och väldokumenterad kod. Dålig kvalitet skapar växande teknisk skuld.'
        ),
        strongLooks: L(
          'Candidate advocates for testing, code review, documentation, and iterative improvement without over-engineering.',
          'Kandidaten förespråkar testning, kodgranskning, dokumentation och iterativ förbättring utan att överkomplicera.'
        ),
        observable: L(
          ['References testing strategies by name', 'Discusses refactoring decisions', 'Mentions code review practices'],
          ['Refererar till teststrategier vid namn', 'Diskuterar refaktoriseringsbeslut', 'Nämner kodgranskningspraxis']
        ),
      });
    }

    if (analysis.techSkills.cloud?.length >= 2 || analysis.techSkills.devops?.length >= 2) {
      comps.technical.push({
        name: L('System Design & Architecture', 'Systemdesign & arkitektur'),
        why: L(
          'Cloud and infrastructure skills signal a need for systems-level thinking and scalability awareness.',
          'Moln- och infrastrukturkompetens signalerar behov av systemtänkande och skalbarhet.'
        ),
        strongLooks: L(
          'Candidate can whiteboard a system, discuss scaling strategies, and articulate monitoring/observability approaches.',
          'Kandidaten kan skissa ett system, diskutera skalningsstrategier och beskriva övervakningsmetoder.'
        ),
        observable: L(
          ['Draws systems before coding', 'Considers failure modes proactively', 'Discusses real production incidents and lessons learned'],
          ['Skissar system före kodning', 'Överväger felscenarier proaktivt', 'Diskuterar verkliga produktionsincidenter och lärdomar']
        ),
      });
    }

    if (analysis.techSkills.data?.length >= 2) {
      comps.technical.push({
        name: L('Data Engineering & Analysis', 'Datateknik & analys'),
        why: L(
          'Data skills indicate the role involves data pipelines, analysis, or data-driven decision-making.',
          'Datakompetens indikerar att rollen involverar datapipelines, analys eller datadrivet beslutsfattande.'
        ),
        strongLooks: L(
          'Candidate demonstrates ability to work with large datasets, optimize queries, and build reliable data pipelines.',
          'Kandidaten visar förmåga att arbeta med stora datamängder, optimera frågor och bygga pålitliga datapipelines.'
        ),
        observable: L(
          ['Explains data modeling decisions', 'Discusses data quality and validation', 'Shows experience with performance optimization'],
          ['Förklarar datamodelleringsbeslut', 'Diskuterar datakvalitet och validering', 'Visar erfarenhet av prestandaoptimering']
        ),
      });
    }

    // --- BEHAVIORAL ---
    if (softFound.includes('collaboration') || softFound.includes('teamwork') || analysis.collaboration.level !== 'low') {
      comps.behavioral.push({
        name: L('Collaboration & Teamwork', 'Samarbete & teamarbete'),
        why: L('Most impactful work happens in teams. The ability to collaborate effectively multiplies individual contribution.',
               'Det mest verkningsfulla arbetet sker i team. Förmågan att samarbeta effektivt mångdubblar individuella bidrag.'),
        strongLooks: L('Candidate describes shared successes, gives credit to others, and navigates disagreements constructively.',
                       'Kandidaten beskriver gemensamma framgångar, ger erkännande till andra och hanterar meningsskiljaktigheter konstruktivt.'),
        observable: L(['Uses "we" language naturally', 'Describes resolving team conflicts', 'Shows awareness of different working styles'],
                      ['Använder "vi"-språk naturligt', 'Beskriver hur de löst teamkonflikter', 'Visar medvetenhet om olika arbetsstilar']),
      });
    }

    if (softFound.includes('adaptability') || softFound.includes('flexibility') || softFound.includes('creativity') || softFound.includes('innovation')) {
      comps.behavioral.push({
        name: L('Adaptability & Learning Agility', 'Anpassningsförmåga & lärandeagilitet'),
        why: L('Roles evolve, technologies change, and priorities shift. Adaptable people thrive in ambiguity and grow faster.',
               'Roller utvecklas, teknologier förändras och prioriteringar skiftar. Anpassningsbara personer trivs i osäkerhet och växer snabbare.'),
        strongLooks: L('Candidate shows a pattern of learning new domains, adjusting to change, and seeking feedback.',
                       'Kandidaten visar ett mönster av att lära sig nya områden, anpassa sig till förändringar och söka feedback.'),
        observable: L(['Describes pivoting priorities successfully', 'Shares self-directed learning examples', 'Remains calm discussing uncertainty'],
                      ['Beskriver framgångsrik omprioritering', 'Delar exempel på eget lärande', 'Förblir lugn vid diskussion om osäkerhet']),
      });
    }

    if (softFound.includes('accountability') || softFound.includes('initiative') || softFound.includes('self-motivated') || analysis.leadership.present) {
      comps.behavioral.push({
        name: L('Ownership & Accountability', 'Ägarskap & ansvarstagande'),
        why: L('Taking ownership means driving outcomes, not just completing tasks. This competency separates contributors from leaders.',
               'Att ta ägarskap innebär att driva resultat, inte bara slutföra uppgifter. Denna kompetens skiljer bidragsgivare från ledare.'),
        strongLooks: L('Candidate takes responsibility for outcomes (including failures), follows through, and proactively identifies problems.',
                       'Kandidaten tar ansvar för resultat (inklusive misslyckanden), följer upp och identifierar problem proaktivt.'),
        observable: L(['Says "I" when describing failures', 'Describes going beyond assigned scope', 'Shows end-to-end ownership of projects'],
                      ['Säger "jag" när de beskriver misslyckanden', 'Beskriver att gå utöver tilldelat ansvar', 'Visar helhetägarskap av projekt']),
      });
    }

    if (softFound.includes('customer focus') || softFound.includes('empathy') || softFound.includes('stakeholder management')) {
      comps.behavioral.push({
        name: L('Customer & Stakeholder Focus', 'Kund- & intressentfokus'),
        why: L('Understanding and prioritizing the needs of customers and stakeholders drives value and builds trust.',
               'Att förstå och prioritera kunders och intressenters behov skapar värde och bygger förtroende.'),
        strongLooks: L('Candidate shows experience gathering requirements, managing expectations, and advocating for end-user needs.',
                       'Kandidaten visar erfarenhet av att samla krav, hantera förväntningar och förespråka slutanvändares behov.'),
        observable: L(['References user needs in decisions', 'Describes balancing competing stakeholder interests', 'Shows empathy for end-user experience'],
                      ['Refererar till användarbehov i beslut', 'Beskriver balansering av konkurrerande intressenters intressen', 'Visar empati för slutanvändarupplevelsen']),
      });
    }

    if (softFound.includes('project management') || softFound.includes('planning') || softFound.includes('organization') || softFound.includes('time management')) {
      comps.behavioral.push({
        name: L('Planning & Organization', 'Planering & organisation'),
        why: L('Structured planning enables predictable delivery, reduces waste, and helps teams coordinate effectively.',
               'Strukturerad planering möjliggör förutsägbar leverans, minskar slöseri och hjälper team att samordna effektivt.'),
        strongLooks: L('Candidate demonstrates experience breaking down work, setting milestones, tracking progress, and adjusting plans proactively.',
                       'Kandidaten visar erfarenhet av att bryta ner arbete, sätta milstolpar, följa framsteg och justera planer proaktivt.'),
        observable: L(['Describes planning methodology or tools', 'Shares examples of re-prioritization', 'Shows awareness of dependencies and risks'],
                      ['Beskriver planeringsmetodik eller verktyg', 'Delar exempel på omprioritering', 'Visar medvetenhet om beroenden och risker']),
      });
    }

    // --- LEADERSHIP ---
    if (analysis.leadership.present) {
      comps.leadership.push({
        name: L('People Leadership & Development', 'Ledarskap & medarbetarutveckling'),
        why: L('Effective leaders grow their teams, not just manage them. Developing talent is a force multiplier.',
               'Effektiva ledare utvecklar sina team, inte bara hanterar dem. Att utveckla talang är en kraftmultiplikator.'),
        strongLooks: L('Candidate describes coaching individuals, giving feedback, and building team capabilities over time.',
                       'Kandidaten beskriver coachning av individer, att ge feedback och att bygga teamets kapacitet över tid.'),
        observable: L(['Shares specific mentoring stories', 'Discusses performance conversations', 'Shows pride in team growth'],
                      ['Delar specifika mentorsberättelser', 'Diskuterar utvecklingssamtal', 'Visar stolthet över teamets utveckling']),
      });

      if (analysis.leadership.level === 'high') {
        comps.leadership.push({
          name: L('Strategic Vision & Execution', 'Strategisk vision & genomförande'),
          why: L('Leaders must translate strategy into actionable plans and align teams around shared goals.',
                 'Ledare måste omsätta strategi till handlingsplaner och samordna team kring gemensamma mål.'),
          strongLooks: L('Candidate connects daily work to broader business objectives and makes principled trade-off decisions.',
                         'Kandidaten kopplar dagligt arbete till bredare affärsmål och fattar principiella avvägningsbeslut.'),
          observable: L(['Articulates why behind decisions', 'Balances short-term delivery with long-term vision', 'Describes influencing without authority'],
                        ['Formulerar varför bakom beslut', 'Balanserar kortsiktig leverans med långsiktig vision', 'Beskriver påverkan utan formell auktoritet']),
        });
      }
    }

    // --- COMMUNICATION ---
    if (softFound.includes('communication') || softFound.includes('presentation') || analysis.collaboration.level !== 'low') {
      comps.communication.push({
        name: L('Clear & Structured Communication', 'Tydlig & strukturerad kommunikation'),
        why: L('Clear communication reduces misunderstanding, accelerates decision-making, and builds trust across teams.',
               'Tydlig kommunikation minskar missförstånd, påskyndar beslutsfattande och bygger förtroende i team.'),
        strongLooks: L('Candidate structures answers clearly, adjusts to the audience, and communicates complex ideas simply.',
                       'Kandidaten strukturerar svar tydligt, anpassar sig till publiken och kommunicerar komplexa idéer enkelt.'),
        observable: L(['Answers are well-structured (STAR format)', 'Avoids excessive jargon', 'Asks clarifying questions'],
                      ['Svaren är välstrukturerade (STAR-format)', 'Undviker onödig jargong', 'Ställer klargörande frågor']),
      });
    }

    if (analysis.collaboration.level === 'high' || softFound.includes('stakeholder management') || softFound.includes('presentation')) {
      comps.communication.push({
        name: L('Stakeholder Communication', 'Intressentkommunikation'),
        why: L('Working across teams and with diverse audiences requires translating complexity into actionable insights.',
               'Att arbeta tvärs över team och med olika målgrupper kräver att omsätta komplexitet till handlingsbara insikter.'),
        strongLooks: L('Candidate demonstrates experience presenting to diverse audiences and managing expectations.',
                       'Kandidaten visar erfarenhet av att presentera för olika målgrupper och hantera förväntningar.'),
        observable: L(['Describes adapting message for different audiences', 'Shows experience with executive presentations', 'Manages difficult conversations well'],
                      ['Beskriver anpassning av budskap för olika målgrupper', 'Visar erfarenhet av ledningspresentationer', 'Hanterar svåra samtal väl']),
      });
    }

    if (softFound.includes('negotiation') || softFound.includes('influence') || softFound.includes('facilitation')) {
      comps.communication.push({
        name: L('Influence & Negotiation', 'Påverkan & förhandling'),
        why: L('Driving outcomes without direct authority requires the ability to persuade, negotiate, and build consensus.',
               'Att driva resultat utan direkt auktoritet kräver förmåga att övertyga, förhandla och bygga konsensus.'),
        strongLooks: L('Candidate demonstrates experience building alignment, navigating disagreements, and influencing decisions through evidence and relationships.',
                       'Kandidaten visar erfarenhet av att skapa samsyn, navigera meningsskiljaktigheter och påverka beslut genom bevis och relationer.'),
        observable: L(['Describes persuading without authority', 'Shows evidence of building consensus', 'Navigates conflicting interests constructively'],
                      ['Beskriver övertygande utan auktoritet', 'Visar på att bygga konsensus', 'Navigerar motstridiga intressen konstruktivt']),
      });
    }

    // --- PROBLEM-SOLVING ---
    if (softFound.includes('problem-solving') || softFound.includes('critical thinking') || isTechRole) {
      comps.problemSolving.push({
        name: L('Analytical Problem-Solving', 'Analytisk problemlösning'),
        why: L('Breaking down complex problems systematically leads to better solutions and fewer false starts.',
               'Att systematiskt bryta ner komplexa problem leder till bättre lösningar och färre omstarter.'),
        strongLooks: L('Candidate demonstrates structured thinking: defines the problem, considers alternatives, evaluates trade-offs.',
                       'Kandidaten visar strukturerat tänkande: definierar problemet, överväger alternativ, utvärderar avvägningar.'),
        observable: L(['Breaks large problems into smaller parts', 'Considers edge cases unprompted', 'Uses data to support decisions'],
                      ['Bryter ner stora problem i mindre delar', 'Överväger specialfall utan att bli tillfrågad', 'Använder data för att stödja beslut']),
      });
    }

    if (isTechRole) {
      comps.problemSolving.push({
        name: L('Root Cause Analysis', 'Rotorsaksanalys'),
        why: L('Fixing symptoms creates recurring problems. The ability to find root causes saves time and prevents regressions.',
               'Att åtgärda symptom skapar återkommande problem. Förmågan att hitta rotorsaker sparar tid och förhindrar regressioner.'),
        strongLooks: L('Candidate describes investigating beyond the surface, using systematic debugging, and preventing recurrence.',
                       'Kandidaten beskriver undersökning bortom ytan, systematisk felsökning och förebyggande av upprepning.'),
        observable: L(['Asks "why" multiple times', 'Describes post-mortem processes', 'Shows patience in investigation'],
                      ['Frågar "varför" flera gånger', 'Beskriver post-mortem-processer', 'Visar tålamod i utredningar']),
      });
    }

    if (softFound.includes('strategic thinking') || softFound.includes('decision-making')) {
      comps.problemSolving.push({
        name: L('Strategic Decision-Making', 'Strategiskt beslutsfattande'),
        why: L('Making sound decisions under uncertainty requires gathering relevant data, weighing trade-offs, and committing to a direction.',
               'Att fatta sunda beslut under osäkerhet kräver insamling av relevant data, avvägning av kompromisser och engagemang för en riktning.'),
        strongLooks: L('Candidate demonstrates a decision-making framework, considers long-term implications, and takes ownership of outcomes.',
                       'Kandidaten visar ett ramverk för beslutsfattande, överväger långsiktiga konsekvenser och tar ägarskap för resultat.'),
        observable: L(['Describes weighing trade-offs explicitly', 'Shows awareness of second-order effects', 'Takes ownership of decisions even when uncertain'],
                      ['Beskriver avvägning av kompromisser explicit', 'Visar medvetenhet om andrahandseffekter', 'Tar ägarskap för beslut även under osäkerhet']),
      });
    }

    // --- FALLBACK ---
    if (comps.behavioral.length === 0) {
      comps.behavioral.push({
        name: L('Collaboration & Teamwork', 'Samarbete & teamarbete'),
        why: L('Most impactful work happens in teams. The ability to collaborate effectively multiplies individual contribution.',
               'Det mest verkningsfulla arbetet sker i team. Förmågan att samarbeta effektivt mångdubblar individuella bidrag.'),
        strongLooks: L('Candidate describes shared successes, gives credit to others, and navigates disagreements constructively.',
                       'Kandidaten beskriver gemensamma framgångar, ger erkännande till andra och hanterar meningsskiljaktigheter konstruktivt.'),
        observable: L(['Uses "we" language naturally', 'Describes resolving team conflicts', 'Shows awareness of different working styles'],
                      ['Använder "vi"-språk naturligt', 'Beskriver hur de löst teamkonflikter', 'Visar medvetenhet om olika arbetsstilar']),
      });
    }
    if (comps.communication.length === 0) {
      comps.communication.push({
        name: L('Clear & Structured Communication', 'Tydlig & strukturerad kommunikation'),
        why: L('Clear communication reduces misunderstanding, accelerates decision-making, and builds trust across teams.',
               'Tydlig kommunikation minskar missförstånd, påskyndar beslutsfattande och bygger förtroende i team.'),
        strongLooks: L('Candidate structures answers clearly, adjusts to the audience, and communicates complex ideas simply.',
                       'Kandidaten strukturerar svar tydligt, anpassar sig till publiken och kommunicerar komplexa idéer enkelt.'),
        observable: L(['Answers are well-structured (STAR format)', 'Avoids excessive jargon', 'Asks clarifying questions'],
                      ['Svaren är välstrukturerade (STAR-format)', 'Undviker onödig jargong', 'Ställer klargörande frågor']),
      });
    }
    if (comps.problemSolving.length === 0) {
      comps.problemSolving.push({
        name: L('Analytical Problem-Solving', 'Analytisk problemlösning'),
        why: L('Breaking down complex problems systematically leads to better solutions and fewer false starts.',
               'Att systematiskt bryta ner komplexa problem leder till bättre lösningar och färre omstarter.'),
        strongLooks: L('Candidate demonstrates structured thinking: defines the problem, considers alternatives, evaluates trade-offs.',
                       'Kandidaten visar strukturerat tänkande: definierar problemet, överväger alternativ, utvärderar avvägningar.'),
        observable: L(['Breaks large problems into smaller parts', 'Considers edge cases unprompted', 'Uses data to support decisions'],
                      ['Bryter ner stora problem i mindre delar', 'Överväger specialfall utan att bli tillfrågad', 'Använder data för att stödja beslut']),
      });
    }

    return comps;
  }

  // ══════════════════════════════════════
  //  COMPETENCY LIBRARY
  // ══════════════════════════════════════

  function slugify(name) {
    return name.toLowerCase().replace(/[^a-zåäö0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function buildBigFiveCompetencies(bigFive, analysis) {
    return [
      {
        id: 'b5-curiosity-learning',
        name: L('Curiosity & Learning Agility', 'Nyfikenhet & lärandeagilitet'),
        why: L('Openness to experience drives innovation, adaptability, and continuous improvement. Curious people learn faster and adapt to changing environments.',
               'Öppenhet för nya erfarenheter driver innovation, anpassningsförmåga och ständig förbättring. Nyfikna personer lär sig snabbare och anpassar sig till föränderliga miljöer.'),
        strongLooks: L('Candidate shows genuine curiosity, describes self-directed learning, and embraces new challenges with enthusiasm.',
                       'Kandidaten visar genuin nyfikenhet, beskriver eget lärande och tar sig an nya utmaningar med entusiasm.'),
        observable: L(
          ['Asks thoughtful questions during the interview', 'Describes experimenting with new approaches', 'Discusses failures as learning opportunities', 'Shows breadth of interests beyond core role'],
          ['Ställer tankeväckande frågor under intervjun', 'Beskriver experiment med nya tillvägagångssätt', 'Diskuterar misslyckanden som lärtillfällen', 'Visar bredd av intressen utöver kärnrollen']
        ),
        source: 'bigFive', trait: 'openness', category: 'behavioral',
        b5Ideal: bigFive.openness.ideal, b5Rationale: bigFive.openness.rationale,
      },
      {
        id: 'b5-reliability-followthrough',
        name: L('Reliability & Follow-Through', 'Tillförlitlighet & uppföljning'),
        why: L('Conscientiousness predicts consistent performance. Reliable people meet commitments, maintain quality, and create trust through predictability.',
               'Samvetsgrannhet förutsäger konsekvent prestation. Tillförlitliga personer håller åtaganden, upprätthåller kvalitet och skapar förtroende genom förutsägbarhet.'),
        strongLooks: L('Candidate demonstrates organized work habits, tracks commitments systematically, and follows through on promises.',
                       'Kandidaten visar organiserade arbetsvanor, följer upp åtaganden systematiskt och håller sina löften.'),
        observable: L(
          ['Describes structured planning habits', 'Provides specific examples of meeting tight deadlines', 'Shows attention to detail and quality', 'Mentions systems for tracking work'],
          ['Beskriver strukturerade planeringsvanor', 'Ger specifika exempel på att hålla tajta deadlines', 'Visar uppmärksamhet på detaljer och kvalitet', 'Nämner system för att följa arbete']
        ),
        source: 'bigFive', trait: 'conscientiousness', category: 'behavioral',
        b5Ideal: bigFive.conscientiousness.ideal, b5Rationale: bigFive.conscientiousness.rationale,
      },
      {
        id: 'b5-interpersonal-engagement',
        name: L('Interpersonal Engagement', 'Interpersonellt engagemang'),
        why: L('Extraversion influences how people build relationships, energize teams, and drive collaboration. The right level depends on the role context.',
               'Extraversion påverkar hur människor bygger relationer, energiserar team och driver samarbete. Rätt nivå beror på rollens kontext.'),
        strongLooks: L('Candidate builds rapport naturally, engages actively in discussions, and balances social energy with focused work.',
                       'Kandidaten bygger relation naturligt, deltar aktivt i diskussioner och balanserar social energi med fokuserat arbete.'),
        observable: L(
          ['Engages naturally in conversation', 'Describes building relationships proactively', 'Shows comfort presenting to groups', 'Balances collaboration with deep work'],
          ['Engagerar sig naturligt i samtal', 'Beskriver proaktivt relationsbyggande', 'Visar bekvämlighet att presentera för grupper', 'Balanserar samarbete med djuparbete']
        ),
        source: 'bigFive', trait: 'extraversion', category: 'behavioral',
        b5Ideal: bigFive.extraversion.ideal, b5Rationale: bigFive.extraversion.rationale,
      },
      {
        id: 'b5-empathy-cooperation',
        name: L('Empathy & Cooperation', 'Empati & samarbetsvilja'),
        why: L('Agreeableness balances between building trust and maintaining healthy assertiveness. Both extremes create problems in teams.',
               'Vänlighet balanserar mellan att bygga förtroende och upprätthålla sund bestämdhet. Båda extremerna skapar problem i team.'),
        strongLooks: L('Candidate shows empathy, navigates disagreements respectfully, and provides honest feedback with care.',
                       'Kandidaten visar empati, navigerar meningsskiljaktigheter respektfullt och ger ärlig feedback med omsorg.'),
        observable: L(
          ['Considers others\' perspectives in examples', 'Handles disagreements respectfully', 'Gives honest but caring feedback', 'Balances accommodation with assertiveness'],
          ['Överväger andras perspektiv i exempel', 'Hanterar meningsskiljaktigheter respektfullt', 'Ger ärlig men omtänksam feedback', 'Balanserar anpassning med bestämdhet']
        ),
        source: 'bigFive', trait: 'agreeableness', category: 'behavioral',
        b5Ideal: bigFive.agreeableness.ideal, b5Rationale: bigFive.agreeableness.rationale,
      },
      {
        id: 'b5-stress-resilience',
        name: L('Stress Resilience', 'Stresstålighet'),
        why: L('Emotional stability supports consistent performance under pressure, healthy responses to setbacks, and a calming influence on teams.',
               'Emotionell stabilitet stöder konsekvent prestation under press, sunda reaktioner på motgångar och ett lugnande inflytande på team.'),
        strongLooks: L('Candidate remains composed discussing challenges, shows perspective on setbacks, and describes constructive coping strategies.',
                       'Kandidaten förblir lugn vid diskussion om utmaningar, visar perspektiv på motgångar och beskriver konstruktiva copingstrategier.'),
        observable: L(
          ['Remains calm discussing stressful experiences', 'Describes healthy coping strategies', 'Shows perspective and self-awareness', 'Discusses failures openly without excessive distress'],
          ['Förblir lugn vid diskussion om stressiga upplevelser', 'Beskriver hälsosamma copingstrategier', 'Visar perspektiv och självkännedom', 'Diskuterar misslyckanden öppet utan överdriven oro']
        ),
        source: 'bigFive', trait: 'emotionalStability', category: 'behavioral',
        b5Ideal: bigFive.emotionalStability.ideal, b5Rationale: bigFive.emotionalStability.rationale,
      },
    ];
  }

  function buildCompetencyLibrary(competencies, analysis, bigFive) {
    const allComps = Object.values(competencies).flat();
    const roleComps = allComps.map(comp => ({
      id: slugify(comp.name),
      name: comp.name,
      description: comp.why,
      category: Object.entries(competencies).find(([, v]) => v.includes(comp))?.[0] || 'behavioral',
      source: 'role',
      selected: true,
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

    const b5Comps = buildBigFiveCompetencies(bigFive, analysis).map(comp => ({
      id: comp.id,
      name: comp.name,
      description: comp.why,
      category: comp.category,
      source: 'bigFive',
      trait: comp.trait,
      b5Ideal: comp.b5Ideal,
      b5Rationale: comp.b5Rationale,
      selected: false,
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

    return [...roleComps, ...b5Comps];
  }

  function generateLevelDesc(name, level, analysis) {
    const descs = {
      beginner: {
        default: L('Demonstrates foundational understanding. Requires guidance on complex tasks. Shows willingness to learn and improve. Asks relevant questions.',
                   'Visar grundläggande förståelse. Behöver vägledning vid komplexa uppgifter. Visar vilja att lära och förbättras. Ställer relevanta frågor.'),
        technical: L('Can complete defined tasks with guidance. Understands core concepts but needs support with architecture decisions. Writes functional code with room for improvement in quality.',
                     'Kan slutföra definierade uppgifter med vägledning. Förstår kärnkoncept men behöver stöd vid arkitekturbeslut. Skriver funktionell kod med utrymme för kvalitetsförbättring.'),
        leadership: L('Leads by example in small groups. Beginning to mentor peers. Takes ownership of individual deliverables.',
                      'Leder genom exempel i små grupper. Börjar mentora kollegor. Tar ägarskap för individuella leverabler.'),
      },
      mid: {
        default: L('Works independently on most tasks. Identifies problems proactively. Contributes ideas and drives improvements. Handles ambiguity with some support.',
                   'Arbetar självständigt med de flesta uppgifter. Identifierar problem proaktivt. Bidrar med idéer och driver förbättringar. Hanterar osäkerhet med visst stöd.'),
        technical: L('Designs and implements features independently. Makes sound technical decisions. Contributes to code reviews effectively. Debugs complex issues.',
                     'Designar och implementerar funktioner självständigt. Fattar sunda tekniska beslut. Bidrar effektivt till kodgranskningar. Felsöker komplexa problem.'),
        leadership: L('Manages small teams or projects. Provides regular feedback. Coordinates across teams. Developing strategic thinking skills.',
                      'Hanterar små team eller projekt. Ger regelbunden feedback. Koordinerar tvärs över team. Utvecklar strategiskt tänkande.'),
      },
      senior: {
        default: L('Excels independently and elevates others. Drives organizational improvements. Navigates complex situations with confidence. Role model for the competency.',
                   'Excellerar självständigt och lyfter andra. Driver organisatoriska förbättringar. Navigerar komplexa situationer med självförtroende. Förebild för kompetensen.'),
        technical: L('Architects systems, sets technical direction. Mentors engineers across the organization. Makes decisions with long-term impact. Recognized as a domain expert.',
                     'Arkitekterar system, sätter teknisk riktning. Mentorerar ingenjörer i hela organisationen. Fattar beslut med långsiktig påverkan. Erkänd som domänexpert.'),
        leadership: L('Builds and scales high-performing teams. Shapes organizational strategy. Develops future leaders. Influences at executive level.',
                      'Bygger och skalar högpresterande team. Formar organisationsstrategi. Utvecklar framtida ledare. Påverkar på ledningsnivå.'),
      },
    };
    const lower = name.toLowerCase();
    const isTech = lower.includes('techni') || lower.includes('tekni') || lower.includes('code') || lower.includes('kod') || lower.includes('system') || lower.includes('data');
    const isLead = lower.includes('leader') || lower.includes('ledar') || lower.includes('strateg');
    const key = isLead ? 'leadership' : isTech ? 'technical' : 'default';
    return descs[level][key];
  }

  function generateRiskIndicators(name) {
    const lower = name.toLowerCase();
    if (lower.includes('techni') || lower.includes('tekni') || lower.includes('code') || lower.includes('kod') || lower.includes('system')) {
      return L(
        ['Cannot explain past technical decisions', 'Avoids discussing failures or bugs', 'Over-reliance on specific tools without understanding principles', 'Unable to discuss trade-offs'],
        ['Kan inte förklara tidigare tekniska beslut', 'Undviker att diskutera misslyckanden eller buggar', 'Överberoende av specifika verktyg utan förståelse för principer', 'Kan inte diskutera avvägningar']
      );
    }
    if (lower.includes('collabor') || lower.includes('samarbete') || lower.includes('team')) {
      return L(
        ['Uses only "I" when describing team projects', 'Blames others for failures', 'Shows frustration with differing opinions', 'Cannot describe resolving a disagreement'],
        ['Använder bara "jag" när de beskriver teamprojekt', 'Skyller på andra för misslyckanden', 'Visar frustration med avvikande åsikter', 'Kan inte beskriva hur de löst en oenighet']
      );
    }
    if (lower.includes('leader') || lower.includes('ledar') || lower.includes('strateg')) {
      return L(
        ['Micromanages rather than delegates', 'Cannot describe developing team members', 'Avoids difficult conversations', 'Focuses only on output, not people'],
        ['Detaljstyr istället för att delegera', 'Kan inte beskriva utveckling av teammedlemmar', 'Undviker svåra samtal', 'Fokuserar bara på resultat, inte på människor']
      );
    }
    if (lower.includes('communic') || lower.includes('kommunik') || lower.includes('stakeholder') || lower.includes('intressent')) {
      return L(
        ['Rambling or unfocused answers', 'Cannot simplify complex concepts', 'Avoids eye contact or engagement', 'Does not ask clarifying questions'],
        ['Osammanhängande eller ofokuserade svar', 'Kan inte förenkla komplexa koncept', 'Undviker ögonkontakt eller engagemang', 'Ställer inte klargörande frågor']
      );
    }
    return L(
      ['Lacks specific examples', 'Gives theoretical answers without practical evidence', 'Inconsistent across answers', 'Shows limited self-awareness'],
      ['Saknar specifika exempel', 'Ger teoretiska svar utan praktiskt underlag', 'Inkonsekvent i svaren', 'Visar begränsad självkännedom']
    );
  }

  function generateEvidence(name) {
    const lower = name.toLowerCase();
    if (lower.includes('techni') || lower.includes('tekni') || lower.includes('code') || lower.includes('kod') || lower.includes('system')) {
      return L(
        ['Describes a project they architected end-to-end', 'Explains a production incident they resolved', 'Shares metrics on system performance improvements', 'Discusses technology selection with trade-off analysis'],
        ['Beskriver ett projekt de arkitekterat från början till slut', 'Förklarar en produktionsincident de löste', 'Delar mätetal om systemprestandaförbättringar', 'Diskuterar teknikval med avvägningsanalys']
      );
    }
    if (lower.includes('collabor') || lower.includes('samarbete') || lower.includes('team')) {
      return L(
        ['Describes facilitating a cross-team initiative', 'Shares how they onboarded a new team member', 'Explains navigating a significant disagreement to resolution', 'Demonstrates adjusting communication style for different audiences'],
        ['Beskriver facilitering av ett tvärfunktionellt initiativ', 'Berättar hur de introducerade en ny teammedlem', 'Förklarar hur de navigerade en betydande oenighet till lösning', 'Visar anpassning av kommunikationsstil för olika målgrupper']
      );
    }
    if (lower.includes('leader') || lower.includes('ledar')) {
      return L(
        ['Shares a story of growing someone on their team', 'Describes building a team from scratch', 'Explains setting and achieving team-level goals', 'Discusses managing underperformance constructively'],
        ['Delar en berättelse om att utveckla någon i teamet', 'Beskriver att bygga ett team från grunden', 'Förklarar hur de satt och uppnått teammål', 'Diskuterar konstruktiv hantering av underprestation']
      );
    }
    return L(
      ['Provides a specific, detailed example with context', 'Quantifies impact where possible', 'Describes their specific role and actions', 'Reflects on what they learned'],
      ['Ger ett specifikt, detaljerat exempel med kontext', 'Kvantifierar påverkan där det är möjligt', 'Beskriver sin specifika roll och sina handlingar', 'Reflekterar över vad de lärde sig']
    );
  }

  function generateCriteria(name) {
    return L(
      [
        'Specificity: Does the candidate provide concrete, detailed examples?',
        'Impact: Can they quantify or clearly describe the outcome?',
        'Ownership: Is their role in the situation clear and significant?',
        'Reflection: Do they show learning and growth from the experience?',
        'Relevance: Is the example relevant to the role requirements?',
      ],
      [
        'Specificitet: Ger kandidaten konkreta, detaljerade exempel?',
        'Påverkan: Kan de kvantifiera eller tydligt beskriva resultatet?',
        'Ägarskap: Är deras roll i situationen tydlig och betydande?',
        'Reflektion: Visar de lärande och tillväxt från erfarenheten?',
        'Relevans: Är exemplet relevant för rollens krav?',
      ]
    );
  }

  // ══════════════════════════════════════
  //  BIG FIVE
  // ══════════════════════════════════════

  function buildBigFive(analysis) {
    const seniority = analysis.seniority;
    const leadership = analysis.leadership;
    const collab = analysis.collaboration;
    const hasTech = Object.keys(analysis.techSkills).length > 0;

    return {
      openness: {
        ideal: hasTech ? 'medium-high' : 'medium',
        rationale: hasTech
          ? L('Technical roles benefit from curiosity about new tools, approaches, and continuous learning. A moderate-to-high openness supports innovation while maintaining pragmatism.',
              'Tekniska roller gynnas av nyfikenhet kring nya verktyg, metoder och kontinuerligt lärande. En måttlig till hög öppenhet stöder innovation samtidigt som pragmatism bibehålls.')
          : L('The role benefits from adaptability and willingness to explore new approaches while maintaining practical focus on delivery.',
              'Rollen gynnas av anpassningsförmåga och vilja att utforska nya tillvägagångssätt samtidigt som praktiskt fokus på leverans bibehålls.'),
        behaviors: L(
          ['Seeks out new technologies and methods proactively', 'Asks thought-provoking questions during interviews', 'Describes experimenting with different approaches', 'Comfortable discussing failures as learning opportunities'],
          ['Söker proaktivt nya teknologier och metoder', 'Ställer tankeväckande frågor under intervjuer', 'Beskriver experiment med olika tillvägagångssätt', 'Bekväm med att diskutera misslyckanden som lärtillfällen']
        ),
        signals: L(
          ['Ask about a time they learned a new technology or approach — look for enthusiasm and depth', 'Explore how they handle ambiguous requirements — high openness shows comfort with exploration', 'Discuss a decision where they chose a conventional vs. novel approach — listen for reasoning'],
          ['Fråga om en gång de lärde sig ny teknik eller metod — leta efter entusiasm och djup', 'Utforska hur de hanterar tvetydiga krav — hög öppenhet visar bekvämlighet med utforskning', 'Diskutera ett beslut där de valde konventionellt vs. nytt tillvägagångssätt — lyssna efter resonemang']
        ),
      },
      conscientiousness: {
        ideal: seniority === 'senior' || seniority === 'executive' ? 'high' : 'medium-high',
        rationale: L('Reliability, organization, and follow-through are essential for consistent delivery. Higher seniority roles require greater conscientiousness for managing complexity and team dependencies.',
                     'Tillförlitlighet, organisation och uppföljning är avgörande för konsekvent leverans. Högre senioritet kräver större samvetsgrannhet för att hantera komplexitet och teamberoenden.'),
        behaviors: L(
          ['Follows through on commitments consistently', 'Maintains organized documentation and processes', 'Plans work carefully and meets deadlines', 'Pays attention to quality and detail'],
          ['Följer upp åtaganden konsekvent', 'Upprätthåller organiserad dokumentation och processer', 'Planerar arbete noggrant och håller deadlines', 'Uppmärksam på kvalitet och detaljer']
        ),
        signals: L(
          ['Ask about managing competing deadlines — look for structured prioritization', 'Explore their project tracking habits — conscientiousness shows in systems and routines', 'Ask about a mistake they caught before it reached production — detail orientation'],
          ['Fråga om hantering av konkurrerande deadlines — leta efter strukturerad prioritering', 'Utforska deras vanor för projektuppföljning — samvetsgrannhet syns i system och rutiner', 'Fråga om ett misstag de fångade innan det nådde produktion — detaljorientering']
        ),
      },
      extraversion: {
        ideal: collab.level === 'high' ? 'medium-high' : leadership.present ? 'medium-high' : 'medium',
        rationale: collab.level === 'high'
          ? L('This role requires extensive collaboration, making moderate-to-high extraversion beneficial for building relationships and driving alignment across teams.',
              'Denna roll kräver omfattande samarbete, vilket gör måttlig till hög extraversion fördelaktig för att bygga relationer och skapa samsyn tvärs över team.')
          : L('A balanced level of extraversion supports the collaboration needed while allowing focused, independent work.',
              'En balanserad nivå av extraversion stöder det samarbete som behövs samtidigt som fokuserat, självständigt arbete tillåts.'),
        behaviors: L(
          ['Engages actively in team discussions', 'Builds relationships across organizational boundaries', 'Comfortable presenting ideas to groups', 'Balances social engagement with focused deep work'],
          ['Deltar aktivt i teamdiskussioner', 'Bygger relationer tvärs över organisationsgränser', 'Bekväm med att presentera idéer för grupper', 'Balanserar socialt engagemang med fokuserat djuparbete']
        ),
        signals: L(
          ['Observe energy during the interview — does the candidate engage naturally or seem drained?', 'Ask about their ideal work environment — reveals preferences for social vs. solo work', 'Explore how they build relationships in a new team — look for initiative and warmth'],
          ['Observera energi under intervjun — engagerar sig kandidaten naturligt eller verkar de dränerade?', 'Fråga om deras ideala arbetsmiljö — avslöjar preferenser för socialt vs. ensamt arbete', 'Utforska hur de bygger relationer i ett nytt team — leta efter initiativ och värme']
        ),
      },
      agreeableness: {
        ideal: leadership.present ? 'medium' : 'medium-high',
        rationale: leadership.present
          ? L('Leaders need enough agreeableness to build trust and rapport, but also enough assertiveness to make difficult decisions, give critical feedback, and push back when needed.',
              'Ledare behöver tillräcklig vänlighet för att bygga förtroende och rapport, men också tillräcklig bestämdhet för att fatta svåra beslut, ge kritisk feedback och stå emot vid behov.')
          : L('Moderate-to-high agreeableness supports effective teamwork, empathy, and constructive conflict resolution.',
              'Måttlig till hög vänlighet stöder effektivt teamarbete, empati och konstruktiv konflikthantering.'),
        behaviors: L(
          ['Shows empathy and consideration for others\' perspectives', 'Navigates disagreements respectfully and constructively', 'Provides honest feedback with care', 'Balances accommodation with assertiveness when needed'],
          ['Visar empati och hänsyn till andras perspektiv', 'Navigerar meningsskiljaktigheter respektfullt och konstruktivt', 'Ger ärlig feedback med omsorg', 'Balanserar anpassning med bestämdhet vid behov']
        ),
        signals: L(
          ['Ask about a disagreement with a colleague — listen for empathy AND backbone', 'Explore how they give critical feedback — overly agreeable candidates avoid conflict', 'Ask about a time they said no — healthy assertiveness is a positive signal'],
          ['Fråga om en oenighet med en kollega — lyssna efter empati OCH ryggrad', 'Utforska hur de ger kritisk feedback — alltför medgörliga kandidater undviker konflikter', 'Fråga om en gång de sa nej — hälsosam bestämdhet är en positiv signal']
        ),
      },
      emotionalStability: {
        ideal: 'high',
        rationale: L('Emotional stability is broadly beneficial across roles. It supports consistent performance under pressure, healthy responses to setbacks, and creates a calming influence on teams.',
                     'Emotionell stabilitet är brett fördelaktigt i alla roller. Det stöder konsekvent prestation under press, sunda reaktioner på motgångar och skapar ett lugnande inflytande på team.'),
        behaviors: L(
          ['Remains calm and composed under pressure', 'Handles criticism and setbacks constructively', 'Maintains consistent performance during stressful periods', 'Serves as a stabilizing presence for the team'],
          ['Förblir lugn och samlad under press', 'Hanterar kritik och motgångar konstruktivt', 'Upprätthåller konsekvent prestation under stressiga perioder', 'Fungerar som en stabiliserande närvaro för teamet']
        ),
        signals: L(
          ['Ask about their most stressful professional experience — listen for composure and perspective', 'Explore how they handle critical feedback — emotional stability shows in non-defensive responses', 'Ask about a significant failure — stable candidates discuss openly without excessive distress'],
          ['Fråga om deras mest stressiga yrkesupplevelse — lyssna efter lugn och perspektiv', 'Utforska hur de hanterar kritisk feedback — emotionell stabilitet visar sig i icke-defensiva svar', 'Fråga om ett betydande misslyckande — stabila kandidater diskuterar öppet utan överdriven oro']
        ),
      },
    };
  }

  // ══════════════════════════════════════
  //  QUESTIONS
  // ══════════════════════════════════════

  function buildQuestions(analysis) {
    const questions = { competency: [], situational: [], technical: [], bigFive: [], culture: [] };
    const allTech = Object.values(analysis.techSkills).flat();
    const primaryTech = allTech.slice(0, 3).join(', ') || L('relevant technologies', 'relevanta teknologier');

    questions.competency = [
      {
        q: L('Tell me about a time when you had to deliver a project under significant pressure. How did you manage priorities and ensure quality?',
             'Berätta om en gång du behövde leverera ett projekt under betydande press. Hur hanterade du prioriteringar och säkerställde kvalitet?'),
        why: L('Assesses ownership, prioritization, and quality standards under constraint.',
               'Bedömer ägarskap, prioritering och kvalitetsstandarder under begränsningar.'),
        strong: L('Candidate describes a structured approach to prioritization, communicates trade-offs to stakeholders, and maintains quality despite pressure.',
                  'Kandidaten beskriver ett strukturerat tillvägagångssätt för prioritering, kommunicerar avvägningar till intressenter och upprätthåller kvalitet trots press.'),
        warning: L('Blames others for pressure, shows no system for prioritization, or sacrifices quality without acknowledging it.',
                   'Skyller på andra för pressen, visar inget system för prioritering, eller offrar kvalitet utan att erkänna det.'),
        followups: L(['What would you do differently?', 'How did you decide what to deprioritize?', 'Who else was involved, and how did you coordinate?'],
                     ['Vad skulle du göra annorlunda?', 'Hur bestämde du vad som skulle nedprioriteras?', 'Vilka andra var involverade, och hur koordinerade ni?']),
        category: L('Ownership & Delivery', 'Ägarskap & leverans'),
      },
      {
        q: L('Describe a situation where you had to collaborate with someone whose working style was very different from yours.',
             'Beskriv en situation där du behövde samarbeta med någon vars arbetsstil var mycket annorlunda än din.'),
        why: L('Evaluates adaptability, empathy, and interpersonal skills.',
               'Utvärderar anpassningsförmåga, empati och interpersonella färdigheter.'),
        strong: L('Shows genuine effort to understand the other person, adapts approach, and finds a productive working dynamic.',
                  'Visar genuint engagemang för att förstå den andra personen, anpassar sitt tillvägagångssätt och hittar en produktiv arbetsdynamik.'),
        warning: L('Frames the other person as the problem, shows no adaptation, or avoids collaboration.',
                   'Framställer den andra personen som problemet, visar ingen anpassning, eller undviker samarbete.'),
        followups: L(['What did you learn about yourself from that experience?', 'How did you identify the working style mismatch?'],
                     ['Vad lärde du dig om dig själv från den erfarenheten?', 'Hur identifierade du skillnaden i arbetsstil?']),
        category: L('Collaboration', 'Samarbete'),
      },
      {
        q: L('Tell me about a time you identified a significant problem that others had not noticed. What did you do?',
             'Berätta om en gång du identifierade ett betydande problem som andra inte hade lagt märke till. Vad gjorde du?'),
        why: L('Tests proactive thinking, observation skills, and initiative.',
               'Testar proaktivt tänkande, observationsförmåga och initiativkraft.'),
        strong: L('Describes systematic observation, takes initiative to raise and solve the problem, and considers broader impact.',
                  'Beskriver systematisk observation, tar initiativ till att lyfta och lösa problemet och överväger bredare påverkan.'),
        warning: L('Cannot provide a specific example, or identified the problem but took no action.',
                   'Kan inte ge ett specifikt exempel, eller identifierade problemet men vidtog inga åtgärder.'),
        followups: L(['How did you convince others this was a real problem?', 'What was the impact of addressing it?'],
                     ['Hur övertygade du andra om att det var ett verkligt problem?', 'Vilken påverkan hade det att åtgärda det?']),
        category: L('Problem-Solving', 'Problemlösning'),
      },
      {
        q: L('Describe a time you received feedback that was hard to hear. How did you respond?',
             'Beskriv en gång du fick feedback som var svår att ta emot. Hur reagerade du?'),
        why: L('Evaluates self-awareness, growth mindset, and emotional maturity.',
               'Utvärderar självkännedom, tillväxttänkande och emotionell mognad.'),
        strong: L('Acknowledges the feedback genuinely, describes specific changes made, and shows appreciation for growth.',
                  'Erkänner feedbacken genuint, beskriver specifika förändringar som gjorts och visar uppskattning för tillväxt.'),
        warning: L('Dismisses the feedback, becomes defensive in telling the story, or cannot recall receiving constructive feedback.',
                   'Avfärdar feedbacken, blir defensiv i berättelsen, eller kan inte minnas att ha fått konstruktiv feedback.'),
        followups: L(['What specifically changed in your behavior afterward?', 'Would you seek out similar feedback today?'],
                     ['Vad förändrades specifikt i ditt beteende efteråt?', 'Skulle du söka liknande feedback idag?']),
        category: L('Growth Mindset', 'Tillväxttänkande'),
      },
    ];

    if (analysis.leadership.present) {
      questions.competency.push({
        q: L('Tell me about a time you had to make an unpopular decision with your team. How did you handle it?',
             'Berätta om en gång du behövde fatta ett impopulärt beslut med ditt team. Hur hanterade du det?'),
        why: L('Evaluates leadership courage, communication skills, and ability to maintain trust through difficult moments.',
               'Utvärderar ledarskapsmod, kommunikationsförmåga och förmåga att bibehålla förtroende genom svåra stunder.'),
        strong: L('Explains the reasoning transparently, listens to concerns, and stands by the decision while showing empathy.',
                  'Förklarar resonemanget transparent, lyssnar på oro och står vid beslutet samtidigt som empati visas.'),
        warning: L('Avoids difficult decisions, does not communicate reasoning, or is dismissive of team concerns.',
                   'Undviker svåra beslut, kommunicerar inte resonemanget, eller avfärdar teamets oro.'),
        followups: L(['How did the team respond?', 'What would you do differently?', 'How did you rebuild trust afterward?'],
                     ['Hur reagerade teamet?', 'Vad skulle du göra annorlunda?', 'Hur återbyggde du förtroendet efteråt?']),
        category: L('Leadership', 'Ledarskap'),
      });
    }

    questions.situational = [
      {
        q: L('Imagine you are two weeks into a new role and you discover that a key process your team relies on is significantly flawed. What would you do?',
             'Tänk dig att du är två veckor in i en ny roll och du upptäcker att en nyckelprocess som ditt team förlitar sig på har betydande brister. Vad skulle du göra?'),
        why: L('Tests how candidates balance initiative with humility in a new environment.',
               'Testar hur kandidater balanserar initiativ med ödmjukhet i en ny miljö.'),
        strong: L('Gathers context first, consults teammates, proposes solutions diplomatically, and considers organizational history.',
                  'Samlar in kontext först, konsulterar kollegor, föreslår lösningar diplomatiskt och tar hänsyn till organisationens historia.'),
        warning: L('Immediately tries to change everything, or stays silent and does nothing.',
                   'Försöker omedelbart ändra allt, eller förblir tyst och gör ingenting.'),
        followups: L(['Who would you talk to first?', 'How would you present your findings?'],
                     ['Vem skulle du prata med först?', 'Hur skulle du presentera dina insikter?']),
        category: L('Judgment', 'Omdöme'),
      },
      {
        q: L(`You are leading a project and realize mid-way that the technical approach ${allTech.length > 0 ? `using ${primaryTech} ` : ''}will not meet the deadline. What do you do?`,
             `Du leder ett projekt och inser halvvägs att tillvägagångssättet ${allTech.length > 0 ? `med ${primaryTech} ` : ''}inte kommer att hålla deadline. Vad gör du?`),
        why: L('Evaluates decision-making under pressure, communication skills, and pragmatism.',
               'Utvärderar beslutsfattande under press, kommunikationsförmåga och pragmatism.'),
        strong: L('Escalates early, proposes alternatives with trade-offs, and communicates transparently to stakeholders.',
                  'Eskalerar tidigt, föreslår alternativ med avvägningar och kommunicerar transparent till intressenter.'),
        warning: L('Hides the problem, works excessive hours silently, or blames the original plan.',
                   'Döljer problemet, arbetar överdrivet mycket i tysthet, eller skyller på den ursprungliga planen.'),
        followups: L(['How would you communicate this to stakeholders?', 'What trade-offs would you consider?'],
                     ['Hur skulle du kommunicera detta till intressenter?', 'Vilka avvägningar skulle du överväga?']),
        category: L('Decision-Making', 'Beslutsfattande'),
      },
      {
        q: L('A colleague repeatedly takes credit for work you contributed significantly to. How do you handle it?',
             'En kollega tar upprepade gånger åt sig äran för arbete som du bidragit betydligt till. Hur hanterar du det?'),
        why: L('Evaluates conflict resolution, assertiveness, and interpersonal judgment.',
               'Utvärderar konflikthantering, bestämdhet och interpersonellt omdöme.'),
        strong: L('Addresses directly but diplomatically, documents contributions going forward, and focuses on resolution over blame.',
                  'Tar upp det direkt men diplomatiskt, dokumenterar bidrag framöver och fokuserar på lösning snarare än skuld.'),
        warning: L('Passive-aggressive behavior, escalates immediately to management, or lets it continue indefinitely.',
                   'Passivt-aggressivt beteende, eskalerar omedelbart till ledningen, eller låter det fortsätta i oändlighet.'),
        followups: L(['What if the direct conversation did not resolve it?', 'How do you ensure visibility for your work generally?'],
                     ['Vad om det direkta samtalet inte löste det?', 'Hur säkerställer du synlighet för ditt arbete generellt?']),
        category: L('Conflict Resolution', 'Konflikthantering'),
      },
      {
        q: L('You have three urgent requests from different stakeholders, all due this week. How do you decide what to work on first?',
             'Du har tre brådskande förfrågningar från olika intressenter, alla med deadline denna vecka. Hur bestämmer du vad du ska arbeta med först?'),
        why: L('Tests prioritization frameworks and stakeholder management skills.',
               'Testar prioriteringsramverk och färdigheter i intressenthantering.'),
        strong: L('Uses a clear prioritization framework (impact, urgency, dependencies), communicates proactively, and renegotiates deadlines when needed.',
                  'Använder ett tydligt prioriteringsramverk (påverkan, brådska, beroenden), kommunicerar proaktivt och omförhandlar deadlines vid behov.'),
        warning: L('Works on whatever is loudest, cannot articulate a prioritization method, or tries to do everything simultaneously.',
                   'Arbetar med det som skriker högst, kan inte formulera en prioriteringsmetod, eller försöker göra allt samtidigt.'),
        followups: L(['How would you communicate to the stakeholders whose work you deprioritized?'],
                     ['Hur skulle du kommunicera till de intressenter vars arbete du nedprioriterade?']),
        category: L('Prioritization', 'Prioritering'),
      },
    ];

    if (allTech.length > 0) {
      questions.technical = [
        {
          q: L(`Describe a system you designed or significantly contributed to using ${primaryTech}. Walk me through the architecture decisions.`,
               `Beskriv ett system du designat eller bidragit betydligt till med ${primaryTech}. Gå igenom arkitekturbesluten.`),
          why: L('Evaluates depth of technical knowledge, decision-making, and ability to communicate architecture.',
                 'Utvärderar djup av teknisk kunskap, beslutsfattande och förmåga att kommunicera arkitektur.'),
          strong: L('Clearly explains trade-offs, considers scalability and maintainability, and discusses what they would change in hindsight.',
                    'Förklarar tydligt avvägningar, överväger skalbarhet och underhållbarhet, och diskuterar vad de skulle ändra i efterhand.'),
          warning: L('Cannot explain why decisions were made, focuses only on implementation details, or gives textbook answers without practical depth.',
                     'Kan inte förklara varför beslut fattades, fokuserar bara på implementeringsdetaljer, eller ger lärobokssvar utan praktiskt djup.'),
          followups: L(['What would you change if you redesigned it today?', 'What was the most difficult technical decision?', 'How did you handle testing and deployment?'],
                       ['Vad skulle du ändra om du designade om det idag?', 'Vad var det svåraste tekniska beslutet?', 'Hur hanterade du testning och driftsättning?']),
          category: L('Architecture', 'Arkitektur'),
        },
        {
          q: L('Tell me about a production issue you debugged that was particularly challenging. Walk me through your investigation process.',
               'Berätta om ett produktionsproblem du felsökte som var särskilt utmanande. Gå igenom din utredningsprocess.'),
          why: L('Evaluates debugging skills, systematic thinking, and composure under pressure.',
                 'Utvärderar felsökningsförmåga, systematiskt tänkande och lugn under press.'),
          strong: L('Describes a methodical approach, uses data to narrow hypotheses, and implements prevention measures.',
                    'Beskriver ett metodiskt tillvägagångssätt, använder data för att begränsa hypoteser och implementerar förebyggande åtgärder.'),
          warning: L('Random trial-and-error approach, cannot explain their debugging process, or did not follow up with prevention.',
                     'Slumpmässigt försök-och-misstag-tillvägagångssätt, kan inte förklara sin felsökningsprocess, eller följde inte upp med förebyggande åtgärder.'),
          followups: L(['How did you prevent this from happening again?', 'What tools did you use?', 'How did you communicate status during the incident?'],
                       ['Hur förhindrade du att det hände igen?', 'Vilka verktyg använde du?', 'Hur kommunicerade du status under incidenten?']),
          category: L('Debugging', 'Felsökning'),
        },
        {
          q: L('How do you approach technical debt in a codebase? Can you give a specific example of how you managed it?',
               'Hur hanterar du teknisk skuld i en kodbas? Kan du ge ett specifikt exempel på hur du hanterade det?'),
          why: L('Evaluates pragmatism, long-term thinking, and ability to balance speed with quality.',
                 'Utvärderar pragmatism, långsiktigt tänkande och förmåga att balansera hastighet med kvalitet.'),
          strong: L('Shows a balanced approach — acknowledges tech debt as normal, has strategies for managing it, and can prioritize effectively.',
                    'Visar ett balanserat tillvägagångssätt — erkänner teknisk skuld som normalt, har strategier för att hantera det och kan prioritera effektivt.'),
          warning: L('Ignores tech debt entirely, or is dogmatic about perfection at the expense of delivery.',
                     'Ignorerar teknisk skuld helt, eller är dogmatisk om perfektion på bekostnad av leverans.'),
          followups: L(['How did you make the case for addressing it?', 'How do you measure the impact of paying down tech debt?'],
                       ['Hur argumenterade du för att åtgärda det?', 'Hur mäter du effekten av att betala av teknisk skuld?']),
          category: L('Engineering Practices', 'Ingenjörspraxis'),
        },
      ];

      if (analysis.techSkills.data?.length) {
        questions.technical.push({
          q: L('Describe how you would design a data pipeline for processing large-scale data. What considerations drive your architecture?',
               'Beskriv hur du skulle designa en datapipeline för bearbetning av storskalig data. Vilka överväganden driver din arkitektur?'),
          why: L('Evaluates data engineering depth, systems thinking, and understanding of reliability requirements.',
                 'Utvärderar djup inom datateknik, systemtänkande och förståelse för tillförlitlighetskrav.'),
          strong: L('Discusses idempotency, error handling, monitoring, schema evolution, and scaling considerations.',
                    'Diskuterar idempotens, felhantering, övervakning, schemaevolution och skalningsöverväganden.'),
          warning: L('Ignores failure modes, cannot discuss trade-offs between batch and streaming, or lacks practical experience.',
                     'Ignorerar felscenarier, kan inte diskutera avvägningar mellan batch och streaming, eller saknar praktisk erfarenhet.'),
          followups: L(['How do you handle schema changes?', 'What monitoring would you put in place?'],
                       ['Hur hanterar du schemaändringar?', 'Vilken övervakning skulle du sätta upp?']),
          category: L('Data Engineering', 'Datateknik'),
        });
      }
    } else {
      questions.technical = [
        {
          q: L('Describe a complex project you managed from start to finish. What was your approach to planning and execution?',
               'Beskriv ett komplext projekt du ledde från start till mål. Vad var ditt tillvägagångssätt för planering och genomförande?'),
          why: L('Evaluates project management skills, systematic thinking, and ability to handle complexity.',
                 'Utvärderar projektledningsförmåga, systematiskt tänkande och förmåga att hantera komplexitet.'),
          strong: L('Shows structured planning, risk management, stakeholder communication, and iterative adjustment.',
                    'Visar strukturerad planering, riskhantering, intressentkommunikation och iterativ anpassning.'),
          warning: L('No clear methodology, ignores risks, or cannot describe adjustments made during execution.',
                     'Ingen tydlig metodik, ignorerar risker, eller kan inte beskriva justeringar under genomförandet.'),
          followups: L(['What was the biggest risk, and how did you mitigate it?', 'How did you handle scope changes?'],
                       ['Vad var den största risken, och hur mitigerade du den?', 'Hur hanterade du ändringar i omfattningen?']),
          category: L('Project Management', 'Projektledning'),
        },
        {
          q: L('What processes or systems have you put in place to improve efficiency in your current or previous role?',
               'Vilka processer eller system har du infört för att förbättra effektiviteten i din nuvarande eller tidigare roll?'),
          why: L('Evaluates initiative, systems thinking, and impact mindset.',
                 'Utvärderar initiativkraft, systemtänkande och resultatfokus.'),
          strong: L('Describes specific improvements with measurable outcomes, shows consideration for the team, and iterates on the solution.',
                    'Beskriver specifika förbättringar med mätbara resultat, visar hänsyn till teamet och itererar på lösningen.'),
          warning: L('Cannot provide specific examples, or imposed solutions without team input.',
                     'Kan inte ge specifika exempel, eller påtvingade lösningar utan teamets input.'),
          followups: L(['How did you measure the improvement?', 'How did the team respond to the change?'],
                       ['Hur mätte du förbättringen?', 'Hur reagerade teamet på förändringen?']),
          category: L('Process Improvement', 'Processförbättring'),
        },
      ];
    }

    questions.bigFive = [
      {
        q: L('How do you typically approach learning something completely new — a technology, domain, or skill you have no experience with?',
             'Hur brukar du närma dig att lära dig något helt nytt — en teknik, domän eller färdighet du inte har erfarenhet av?'),
        why: L('Explores openness to experience and learning agility.', 'Utforskar öppenhet för nya erfarenheter och lärandeagilitet.'),
        strong: L('Describes a structured but enthusiastic approach to learning, seeks diverse resources, and applies learning quickly.',
                  'Beskriver ett strukturerat men entusiastiskt tillvägagångssätt för lärande, söker olika resurser och tillämpar lärande snabbt.'),
        warning: L('Shows reluctance to learn new things, prefers to stay in comfort zone, or learns only when forced.',
                   'Visar ovilja att lära sig nya saker, föredrar att stanna i bekvämlighetszon, eller lär sig bara under tvång.'),
        followups: L(['What was the most recent new thing you learned?', 'How long does it typically take you to feel productive?'],
                     ['Vad var det senaste nya du lärde dig?', 'Hur lång tid tar det vanligtvis för dig att känna dig produktiv?']),
        category: L('Openness', 'Öppenhet'), trait: 'openness',
      },
      {
        q: L('Walk me through how you organize your work when you have multiple ongoing projects with different deadlines.',
             'Berätta hur du organiserar ditt arbete när du har flera pågående projekt med olika deadlines.'),
        why: L('Explores conscientiousness through organizational habits and reliability.', 'Utforskar samvetsgrannhet genom organisatoriska vanor och tillförlitlighet.'),
        strong: L('Has a clear system, tracks commitments, and proactively manages expectations when capacity is tight.',
                  'Har ett tydligt system, följer upp åtaganden och hanterar proaktivt förväntningar när kapaciteten är ansträngd.'),
        warning: L('No system in place, frequently misses deadlines, or over-commits without adjusting.',
                   'Inget system på plats, missar ofta deadlines, eller åtar sig för mycket utan att justera.'),
        followups: L(['What tools do you use?', 'How do you handle unexpected urgent tasks?'],
                     ['Vilka verktyg använder du?', 'Hur hanterar du oväntade brådskande uppgifter?']),
        category: L('Conscientiousness', 'Samvetsgrannhet'), trait: 'conscientiousness',
      },
      {
        q: L('Describe your ideal balance between working independently and working with others. How does that show up in your daily work?',
             'Beskriv din ideala balans mellan att arbeta självständigt och att arbeta med andra. Hur visar sig det i ditt dagliga arbete?'),
        why: L('Explores extraversion tendencies and social energy management.', 'Utforskar extraversionstendenser och hantering av social energi.'),
        strong: L('Shows self-awareness about preferences, adapts to team needs, and has strategies for both focused and collaborative work.',
                  'Visar självkännedom om preferenser, anpassar sig till teamets behov och har strategier för både fokuserat och samarbetande arbete.'),
        warning: L('Extremely rigid about preferences, or is unaware of how their style affects others.',
                   'Extremt rigid om preferenser, eller omedveten om hur deras stil påverkar andra.'),
        followups: L(['How do you recharge during a demanding week?', 'What kind of meetings do you find most valuable?'],
                     ['Hur laddar du om under en krävande vecka?', 'Vilken typ av möten tycker du är mest värdefulla?']),
        category: L('Extraversion', 'Extraversion'), trait: 'extraversion',
      },
      {
        q: L('Tell me about a time when you had to push back on a decision you disagreed with. How did you approach it?',
             'Berätta om en gång du behövde stå emot ett beslut du inte höll med om. Hur närmade du dig det?'),
        why: L('Explores agreeableness — specifically the balance between cooperation and healthy assertiveness.',
               'Utforskar vänlighet — specifikt balansen mellan samarbetsvilja och sund bestämdhet.'),
        strong: L('Pushes back respectfully with evidence, listens to other perspectives, and accepts the outcome gracefully even if their view did not prevail.',
                  'Står emot respektfullt med bevis, lyssnar på andra perspektiv och accepterar utfallet med grace även om deras åsikt inte vann.'),
        warning: L('Either never pushes back (too agreeable) or pushes back aggressively without listening.',
                   'Antingen står aldrig emot (för medgörlig) eller står emot aggressivt utan att lyssna.'),
        followups: L(['How did the other person react?', 'What did you do after the decision was made?'],
                     ['Hur reagerade den andra personen?', 'Vad gjorde du efter att beslutet fattats?']),
        category: L('Agreeableness', 'Vänlighet'), trait: 'agreeableness',
      },
      {
        q: L('Describe the most stressful period in your professional career. How did you manage your well-being and performance during that time?',
             'Beskriv den mest stressiga perioden i din yrkeskarriär. Hur hanterade du ditt välbefinnande och din prestation under den tiden?'),
        why: L('Explores emotional stability and stress management capabilities.', 'Utforskar emotionell stabilitet och stresshanteringsförmåga.'),
        strong: L('Shows self-awareness about stress triggers, has healthy coping strategies, and maintains functioning under pressure.',
                  'Visar självkännedom om stressfaktorer, har hälsosamma copingstrategier och upprätthåller funktion under press.'),
        warning: L('Describes being overwhelmed without any coping strategies, or denies ever experiencing stress.',
                   'Beskriver att vara överväldigad utan några copingstrategier, eller förnekar att någonsin ha upplevt stress.'),
        followups: L(['What would you do differently now?', 'How did you know when to ask for help?'],
                     ['Vad skulle du göra annorlunda nu?', 'Hur visste du när du skulle be om hjälp?']),
        category: L('Emotional Stability', 'Emotionell stabilitet'), trait: 'emotionalStability',
      },
    ];

    questions.culture = [
      {
        q: L('What kind of work environment brings out your best performance? Be specific.',
             'Vilken typ av arbetsmiljö får fram din bästa prestation? Var specifik.'),
        why: L('Assesses cultural fit and self-awareness about optimal working conditions.',
               'Bedömer kulturell passning och självkännedom om optimala arbetsförhållanden.'),
        strong: L('Provides specific, thoughtful answers that align with the team culture. Shows awareness of what motivates them.',
                  'Ger specifika, genomtänkta svar som stämmer med teamkulturen. Visar medvetenhet om vad som motiverar dem.'),
        warning: L('Generic answers like "I work well anywhere" or expectations that conflict significantly with the team culture.',
                   'Generiska svar som "jag arbetar bra överallt" eller förväntningar som starkt konfliktar med teamkulturen.'),
        followups: L(['What about that environment specifically makes you productive?', 'Can you give an example of an environment where you struggled?'],
                     ['Vad i den miljön gör dig specifikt produktiv?', 'Kan du ge ett exempel på en miljö där du kämpade?']),
        category: L('Work Environment', 'Arbetsmiljö'),
      },
      {
        q: L('What is something you are genuinely passionate about in your work, and how do you pursue it?',
             'Vad är något du genuint brinner för i ditt arbete, och hur strävar du efter det?'),
        why: L('Explores intrinsic motivation and values alignment.', 'Utforskar inre motivation och värderingsöverensstämmelse.'),
        strong: L('Shows genuine enthusiasm for aspects of the work, connects passion to action, and describes pursuing it proactively.',
                  'Visar genuint engagemang för aspekter av arbetet, kopplar passion till handling och beskriver proaktivt eftersträvande.'),
        warning: L('Cannot identify any passion, or passion is entirely disconnected from the role.',
                   'Kan inte identifiera någon passion, eller passionen är helt frikopplad från rollen.'),
        followups: L(['How does that passion influence the projects you choose?', 'How do you maintain motivation during routine tasks?'],
                     ['Hur påverkar den passionen projekten du väljer?', 'Hur upprätthåller du motivationen under rutinuppgifter?']),
        category: L('Motivation', 'Motivation'),
      },
      {
        q: L('Describe a team you thrived in. What made it work?',
             'Beskriv ett team där du trivdes och presterade bra. Vad fick det att fungera?'),
        why: L('Reveals values around teamwork, management style preferences, and cultural expectations.',
               'Avslöjar värderingar kring teamarbete, ledarstilspreferenser och kulturella förväntningar.'),
        strong: L('Describes specific team dynamics with nuance, appreciates diverse contributions, and shows self-awareness about their role in team success.',
                  'Beskriver specifik teamdynamik med nyanser, uppskattar olika bidrag och visar självkännedom om sin roll i teamets framgång.'),
        warning: L('Attributes success entirely to themselves, or cannot describe a positive team experience.',
                   'Tillskriver framgång helt sig själv, eller kan inte beskriva en positiv teamupplevelse.'),
        followups: L(['What was your specific role in making it work?', 'How was conflict handled on that team?'],
                     ['Vad var din specifika roll i att få det att fungera?', 'Hur hanterades konflikter i det teamet?']),
        category: L('Teamwork', 'Teamarbete'),
      },
      {
        q: L('How do you define success in your career, and how does this role fit into that vision?',
             'Hur definierar du framgång i din karriär, och hur passar denna roll in i den visionen?'),
        why: L('Evaluates long-term thinking, career intentionality, and alignment with what the role offers.',
               'Utvärderar långsiktigt tänkande, karriäravsikt och överensstämmelse med vad rollen erbjuder.'),
        strong: L('Has a thoughtful career narrative, connects the role to growth goals, and shows genuine interest in the opportunity.',
                  'Har en genomtänkt karriärberättelse, kopplar rollen till tillväxtmål och visar genuint intresse för möjligheten.'),
        warning: L('Has not thought about career direction, or the role clearly does not fit their goals.',
                   'Har inte tänkt på karriärriktning, eller rollen passar tydligt inte deras mål.'),
        followups: L(['Where do you see yourself in 3 years?', 'What skills do you most want to develop?'],
                     ['Var ser du dig själv om 3 år?', 'Vilka färdigheter vill du mest utveckla?']),
        category: L('Career Vision', 'Karriärvision'),
      },
    ];

    return questions;
  }

  // ══════════════════════════════════════
  //  FOLLOW-UPS
  // ══════════════════════════════════════

  function buildFollowUps() {
    return {
      vague: {
        title: L('When Answers Are Vague', 'När svaren är vaga'),
        questions: L(
          ['Can you walk me through a specific example of that?', 'What was your exact role in that situation?', 'What specific steps did you take?', 'What was the measurable outcome?', 'When did this happen, and how long did the project last?', 'Who else was involved, and what was their role?'],
          ['Kan du gå igenom ett specifikt exempel på det?', 'Vad var din exakta roll i den situationen?', 'Vilka specifika steg tog du?', 'Vad var det mätbara resultatet?', 'När hände detta, och hur länge pågick projektet?', 'Vilka andra var involverade, och vad var deras roll?']
        ),
      },
      achievements: {
        title: L('When Probing Strong Achievements', 'När starka prestationer utforskas'),
        questions: L(
          ['What made your approach different from what had been tried before?', 'How did you measure the success of this achievement?', 'What was the most challenging part?', 'Would you approach it differently today? Why?', 'How did this impact the broader team or organization?', 'What did others contribute to this success?'],
          ['Vad gjorde ditt tillvägagångssätt annorlunda jämfört med vad som provats tidigare?', 'Hur mätte du framgången med denna prestation?', 'Vad var den mest utmanande delen?', 'Skulle du göra det annorlunda idag? Varför?', 'Hur påverkade detta det bredare teamet eller organisationen?', 'Vad bidrog andra till denna framgång?']
        ),
      },
      conflict: {
        title: L('When Exploring Conflict Situations', 'När konfliktsituationer utforskas'),
        questions: L(
          ['How did you feel during this conflict?', 'What did you learn about yourself from this experience?', 'What was the other person\'s perspective?', 'How was the relationship afterward?', 'Looking back, what would you do differently?', 'How did you prevent similar conflicts in the future?'],
          ['Hur kände du dig under denna konflikt?', 'Vad lärde du dig om dig själv från denna erfarenhet?', 'Vad var den andra personens perspektiv?', 'Hur var relationen efteråt?', 'När du ser tillbaka, vad skulle du göra annorlunda?', 'Hur förhindrade du liknande konflikter i framtiden?']
        ),
      },
      leadership: {
        title: L('When Assessing Leadership', 'När ledarskap bedöms'),
        questions: L(
          ['How did you decide to take on a leadership role in this situation?', 'How did you handle team members who disagreed with your direction?', 'What is the most important thing you learned about leading others?', 'How do you adapt your leadership style for different team members?', 'Tell me about someone you helped develop — where are they now?', 'How do you handle underperformance on your team?'],
          ['Hur bestämde du dig för att ta en ledarroll i denna situation?', 'Hur hanterade du teammedlemmar som inte höll med om din riktning?', 'Vad är det viktigaste du lärt dig om att leda andra?', 'Hur anpassar du din ledarstil för olika teammedlemmar?', 'Berätta om någon du hjälpt utvecklas — var är de nu?', 'Hur hanterar du underprestation i ditt team?']
        ),
      },
      technical: {
        title: L('When Probing Technical Depth', 'När tekniskt djup utforskas'),
        questions: L(
          ['What alternatives did you consider, and why did you rule them out?', 'How would this solution scale to 10x the current load?', 'What are the main risks or limitations of this approach?', 'How did you test this solution?', 'What would you change in hindsight?', 'How did you communicate the technical decision to non-technical stakeholders?'],
          ['Vilka alternativ övervägde du, och varför uteslöt du dem?', 'Hur skulle denna lösning skala till 10x nuvarande belastning?', 'Vilka är de främsta riskerna eller begränsningarna med detta tillvägagångssätt?', 'Hur testade du denna lösning?', 'Vad skulle du ändra i efterhand?', 'Hur kommunicerade du det tekniska beslutet till icke-tekniska intressenter?']
        ),
      },
      teamwork: {
        title: L('When Exploring Teamwork', 'När teamarbete utforskas'),
        questions: L(
          ['What was the team dynamic, and how did you contribute to it?', 'How did the team handle disagreements?', 'What role do you naturally take in a team setting?', 'How do you build trust with new team members?', 'Can you describe a time when team collaboration broke down?', 'How do you handle a teammate who is not contributing equally?'],
          ['Vad var teamdynamiken, och hur bidrog du till den?', 'Hur hanterade teamet meningsskiljaktigheter?', 'Vilken roll tar du naturligt i en teamsituation?', 'Hur bygger du förtroende med nya teammedlemmar?', 'Kan du beskriva en gång när teamsamarbetet bröt samman?', 'Hur hanterar du en teammedlem som inte bidrar lika mycket?']
        ),
      },
      ownership: {
        title: L('When Clarifying Ownership', 'När ägarskap klargörs'),
        questions: L(
          ['Were you the decision-maker, or were you implementing someone else\'s decision?', 'What happened when you were not available — did the project continue smoothly?', 'What was your direct contribution versus the team\'s?', 'Who would I speak to if I wanted to validate your role in this?', 'How did you ensure accountability throughout the project?'],
          ['Var du beslutsfattaren, eller implementerade du någon annans beslut?', 'Vad hände när du inte var tillgänglig — fortsatte projektet smidigt?', 'Vad var ditt direkta bidrag jämfört med teamets?', 'Vem skulle jag prata med om jag ville validera din roll i detta?', 'Hur säkerställde du ansvarighet genom hela projektet?']
        ),
      },
      learning: {
        title: L('When Exploring Learning Experiences', 'När lärupplevelser utforskas'),
        questions: L(
          ['What specific skill did you develop from this experience?', 'How did you seek feedback during the learning process?', 'How long did it take you to become proficient?', 'How have you applied this learning since then?', 'What resources or methods were most helpful?'],
          ['Vilken specifik färdighet utvecklade du från denna erfarenhet?', 'Hur sökte du feedback under lärprocessen?', 'Hur lång tid tog det för dig att bli skicklig?', 'Hur har du tillämpat detta lärande sedan dess?', 'Vilka resurser eller metoder var mest hjälpsamma?']
        ),
      },
      failures: {
        title: L('When Discussing Failures & Setbacks', 'När misslyckanden & motgångar diskuteras'),
        questions: L(
          ['At what point did you realize things were going wrong?', 'What was your first reaction?', 'What did you learn from this failure?', 'How did you communicate the failure to others?', 'What systems or processes did you put in place to prevent recurrence?', 'How did this experience change your approach going forward?'],
          ['Vid vilken punkt insåg du att saker gick fel?', 'Vad var din första reaktion?', 'Vad lärde du dig av detta misslyckande?', 'Hur kommunicerade du misslyckandet till andra?', 'Vilka system eller processer införde du för att förhindra upprepning?', 'Hur förändrade denna erfarenhet ditt tillvägagångssätt framöver?']
        ),
      },
    };
  }

  // ══════════════════════════════════════
  //  SCORECARD
  // ══════════════════════════════════════

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
          weight = isTechRole ? 'critical' : 'medium';
        } else if (cat === 'behavioral') weight = 'high';
        else if (cat === 'leadership') weight = analysis.leadership.level === 'high' ? 'critical' : 'high';
        else if (cat === 'communication') weight = 'medium';
        else weight = 'high';
        allComps.push({ id: slugify(comp.name), name: comp.name, category: cat, weight });
      }
    }
    return allComps;
  }

  // Build scorecard from selected library entries
  function buildScorecardFromLibrary(selectedEntries, analysis) {
    const allTech = Object.values(analysis.techSkills).flat();
    const hasCodingSkills = (analysis.techSkills.languages?.length || 0) + (analysis.techSkills.frameworks?.length || 0);
    const isTechRole = hasCodingSkills >= 2 || allTech.length >= 4;

    return selectedEntries.map(entry => {
      const cat = entry.category;
      let weight;
      if (cat === 'technical') weight = isTechRole ? 'critical' : 'medium';
      else if (cat === 'behavioral') weight = 'high';
      else if (cat === 'leadership') weight = analysis.leadership.level === 'high' ? 'critical' : 'high';
      else if (cat === 'communication') weight = 'medium';
      else weight = 'high';
      return { id: entry.id, name: entry.name, category: cat, weight };
    });
  }

  // Build questions filtered by selected competency IDs
  function buildQuestionsForSelection(selectedIds, analysis, lang) {
    if (lang) _lang = lang;
    const allQuestions = buildQuestions(analysis);

    // Map competency IDs to question categories
    const idLower = new Set(selectedIds.map(id => id.toLowerCase()));

    // Check if any technical comps are selected
    const hasTech = selectedIds.some(id => {
      const l = id.toLowerCase();
      return l.includes('techni') || l.includes('tekni') || l.includes('code') || l.includes('kod') ||
             l.includes('system-design') || l.includes('data-engineer');
    });

    // Check if any Big Five comps are selected
    const traitMap = {
      'b5-curiosity-learning': 'openness',
      'b5-reliability-followthrough': 'conscientiousness',
      'b5-interpersonal-engagement': 'extraversion',
      'b5-empathy-cooperation': 'agreeableness',
      'b5-stress-resilience': 'emotionalStability',
    };
    const selectedTraits = new Set();
    selectedIds.forEach(id => { if (traitMap[id]) selectedTraits.add(traitMap[id]); });

    // Filter bigFive questions by selected traits
    if (selectedTraits.size > 0) {
      allQuestions.bigFive = allQuestions.bigFive.filter(q => selectedTraits.has(q.trait));
    }

    // Filter technical questions
    if (!hasTech) {
      allQuestions.technical = allQuestions.technical.filter(q => {
        // Keep non-tech questions (project management etc) for non-tech roles
        const cat = (q.category || '').toLowerCase();
        return cat.includes('project') || cat.includes('process') || cat.includes('projekt');
      });
    }

    return allQuestions;
  }

  // ══════════════════════════════════════
  //  MAIN ANALYZE
  // ══════════════════════════════════════

  function analyze(text, lang) {
    _lang = lang || 'en';

    const title = extractTitle(text);
    const seniority = detectSeniority(text);
    const techSkills = extractTechSkills(text);
    const softSkills = extractSoftSkills(text);
    const leadership = detectLeadership(text);
    const collaboration = detectCollaboration(text);
    const responsibilities = extractKeyResponsibilities(text);

    const allTech = Object.values(techSkills).flat();
    const techVsSoft = allTech.length > 0
      ? `${Math.round((allTech.length / (allTech.length + softSkills.length + 1)) * 100)}% ${L('technical', 'tekniskt')} / ${Math.round((softSkills.length / (allTech.length + softSkills.length + 1)) * 100)}% ${L('soft skills', 'mjuka färdigheter')}`
      : L('Primarily soft skills focused', 'Främst fokuserat på mjuka färdigheter');

    const analysis = { title, seniority, techSkills, softSkills, leadership, collaboration, responsibilities, techVsSoft };

    const competencies = buildCompetencies(analysis);
    const bigFive = buildBigFive(analysis);
    const competencyLibrary = buildCompetencyLibrary(competencies, analysis, bigFive);
    const questions = buildQuestions(analysis);
    const followUps = buildFollowUps();
    const scorecard = buildScorecard(competencies, analysis);

    return { analysis, competencies, competencyLibrary, bigFive, questions, followUps, scorecard };
  }

  return {
    analyze,
    buildQuestionsForSelection,
    buildScorecardFromLibrary,
    setLang(lang) { _lang = lang; },
  };
})();
