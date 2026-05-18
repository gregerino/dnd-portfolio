const T = (() => {
  let currentLang = 'en';

  const strings = {
    // Landing
    badge: { en: 'AI-Powered Interview Preparation', sv: 'AI-driven intervjuförberedelse' },
    heroTitle: { en: 'Generate a complete<br>interview package', sv: 'Generera ett komplett<br>intervjupaket' },
    heroSubtitle: {
      en: 'Paste a role description or requirements profile and get structured interview questions, competency frameworks, scorecards, and bias-reduction guidance — all in seconds.',
      sv: 'Klistra in en rollbeskrivning eller kravprofil och få strukturerade intervjufrågor, kompetensramverk, bedömningsmallar och vägledning för att minska bias — på några sekunder.',
    },
    jdLabel: { en: 'Role Description / Requirements Profile', sv: 'Rollbeskrivning / Kravprofil' },
    jdPlaceholder: {
      en: 'Paste the role description or requirements profile here...\n\nInclude role title, responsibilities, requirements, qualifications, and any other details about the position.',
      sv: 'Klistra in rollbeskrivningen eller kravprofilen här...\n\nInkludera rolltitel, ansvarsområden, krav, kvalifikationer och andra detaljer om tjänsten.',
    },
    characters: { en: 'characters', sv: 'tecken' },
    generateBtn: { en: 'Generate Interview Package', sv: 'Generera intervjupaket' },
    tabPaste: { en: 'Paste text', sv: 'Klistra in text' },
    tabFile: { en: 'Upload file', sv: 'Ladda upp fil' },
    dropzoneText: { en: 'Drag and drop a file here, or click to browse', sv: 'Dra och släpp en fil här, eller klicka för att bläddra' },
    dropzoneFormats: { en: 'Supported formats: PDF, Word (.docx)', sv: 'Format som stöds: PDF, Word (.docx)' },
    fileReading: { en: 'Reading file...', sv: 'Läser fil...' },
    fileSuccess: { en: 'File loaded successfully — {chars} characters extracted', sv: 'Filen laddades — {chars} tecken extraherade' },
    fileErrorFormat: { en: 'Unsupported file format. Please use PDF or Word (.docx).', sv: 'Filformatet stöds inte. Använd PDF eller Word (.docx).' },
    fileErrorRead: { en: 'Could not read the file. Please try pasting the text instead.', sv: 'Kunde inte läsa filen. Försök att klistra in texten istället.' },
    fileErrorEmpty: { en: 'No text could be extracted from this file. Please try pasting the text instead.', sv: 'Ingen text kunde extraheras från filen. Försök att klistra in texten istället.' },

    // How it works
    howItWorksTitle: { en: 'How does it work?', sv: 'Hur fungerar det?' },
    step1Title: { en: 'Paste role description', sv: 'Klistra in rollbeskrivning' },
    step1Desc: { en: 'Copy the role description or requirements profile from your job ad or internal document and paste it above.', sv: 'Kopiera rollbeskrivningen eller kravprofilen från din jobbannons eller interna dokument och klistra in den ovan.' },
    step2Title: { en: 'Get your interview kit', sv: 'Få ditt intervjupaket' },
    step2Desc: { en: 'The tool analyzes the role and generates questions, scorecards and evaluation tools tailored to the position.', sv: 'Verktyget analyserar rollen och genererar frågor, bedömningsmallar och utvärderingsverktyg anpassade till tjänsten.' },
    step3Title: { en: 'Conduct the interview', sv: 'Genomför intervjun' },
    step3Desc: { en: 'Use the kit during the interview. Ask the questions, take notes, and score each competency.', sv: 'Använd paketet under intervjun. Ställ frågorna, anteckna och betygsätt varje kompetens.' },
    step4Title: { en: 'Make a fair decision', sv: 'Fatta ett rättvist beslut' },
    step4Desc: { en: 'Use the summary template and comparison framework to make a structured, evidence-based hiring decision.', sv: 'Använd sammanfattningsmallen och jämförelseramverket för att fatta ett strukturerat, evidensbaserat anställningsbeslut.' },

    feat1Title: { en: 'Competency Analysis', sv: 'Kompetensanalys' },
    feat1Desc: { en: 'Technical, behavioral, and leadership competencies with observable indicators', sv: 'Tekniska, beteendemässiga och ledarskapskompetenser med observerbara indikatorer' },
    feat2Title: { en: 'Targeted Questions', sv: 'Riktade frågor' },
    feat2Desc: { en: '15-20 structured questions with follow-ups and evaluation criteria', sv: '15-20 strukturerade frågor med uppföljningar och bedömningskriterier' },
    feat3Title: { en: 'Fair Evaluation', sv: 'Rättvis bedömning' },
    feat3Desc: { en: 'Scorecards, comparison frameworks, and bias-reduction guidance', sv: 'Bedömningsmallar, jämförelseramverk och vägledning för att minska bias' },

    // Loading
    loadingTitle: { en: 'Analyzing role description...', sv: 'Analyserar rollbeskrivning...' },
    loadingSteps: {
      en: [
        'Extracting competencies and requirements',
        'Analyzing seniority level and skills',
        'Building competency framework',
        'Generating interview questions',
        'Creating evaluation scorecards',
        'Finalizing interview package',
      ],
      sv: [
        'Extraherar kompetenser och krav',
        'Analyserar senioritetsnivå och färdigheter',
        'Bygger kompetensramverk',
        'Genererar intervjufrågor',
        'Skapar bedömningsmallar',
        'Slutför intervjupaketet',
      ],
    },

    // Header
    print: { en: 'Print', sv: 'Skriv ut' },
    newAnalysis: { en: 'New Analysis', sv: 'Ny analys' },

    // Sidebar phases
    phaseStart: { en: 'START HERE', sv: 'BÖRJA HÄR' },
    phasePrepare: { en: 'PREPARE', sv: 'FÖRBERED' },
    phaseInterview: { en: 'DURING INTERVIEW', sv: 'UNDER INTERVJUN' },
    phaseEvaluate: { en: 'AFTER INTERVIEW', sv: 'EFTER INTERVJUN' },
    phaseReference: { en: 'REFERENCE', sv: 'REFERENS' },

    // Nav labels
    nav: {
      en: {
        guide: 'Getting Started',
        summary: 'Role Summary',
        bias: 'Bias Checklist',
        compAnalysis: 'Competency Analysis',
        questions: 'Interview Questions',
        followups: 'Follow-Up Questions',
        scorecard: 'Scorecard',
        summaryTemplate: 'Summary Template',
        recommendations: 'Recommendations',
        compLibrary: 'Competency Library',
        bigFive: 'Big Five Indicators',
      },
      sv: {
        guide: 'Kom igång',
        summary: 'Rollsammanfattning',
        bias: 'Biaskontroll',
        compAnalysis: 'Kompetensanalys',
        questions: 'Intervjufrågor',
        followups: 'Uppföljningsfrågor',
        scorecard: 'Bedömningsmall',
        summaryTemplate: 'Sammanfattningsmall',
        recommendations: 'Rekommendationer',
        compLibrary: 'Kompetensbibliotek',
        bigFive: 'Big Five-indikatorer',
      },
    },

    // Guide / Getting Started
    guideTitle: { en: 'Getting Started — Your Interview Guide', sv: 'Kom igång — Din intervjuguide' },
    guideDesc: {
      en: 'This tool gives you everything you need to conduct a professional, fair, and structured interview — even if you have never done one before.',
      sv: 'Det här verktyget ger dig allt du behöver för att genomföra en professionell, rättvis och strukturerad intervju — även om du aldrig har gjort en förut.',
    },
    guideWelcome: {
      en: 'Welcome! You are about to conduct a structured interview. This kit will guide you step by step — from preparation to final decision. Follow the sections in order using the sidebar on the left.',
      sv: 'Välkommen! Du ska genomföra en strukturerad intervju. Det här paketet vägleder dig steg för steg — från förberedelse till slutgiltigt beslut. Följ sektionerna i ordning via menyn till vänster.',
    },
    guideStepsTitle: { en: 'Your interview process in 4 steps', sv: 'Din intervjuprocess i 4 steg' },
    guideStep1: { en: 'Read the Bias Checklist before every interview', sv: 'Läs Biaskontroll före varje intervju' },
    guideStep1Desc: { en: 'This takes 2 minutes and helps you make fairer decisions. It is the single most important thing you can do.', sv: 'Det tar 2 minuter och hjälper dig fatta rättvisare beslut. Det är det viktigaste du kan göra.' },
    guideStep2: { en: 'Review the questions and choose 8-12 to ask', sv: 'Läs igenom frågorna och välj 8-12 att ställa' },
    guideStep2Desc: { en: 'You do not need to ask all questions. Pick the ones most relevant to this role. Ask the same questions to every candidate.', sv: 'Du behöver inte ställa alla frågor. Välj de som är mest relevanta för rollen. Ställ samma frågor till alla kandidater.' },
    guideStep3: { en: 'Use the Scorecard during the interview', sv: 'Använd Bedömningsmallen under intervjun' },
    guideStep3Desc: { en: 'Score each competency as you go. Write short notes about what the candidate said — direct quotes are best.', sv: 'Betygsätt varje kompetens under intervjuns gång. Skriv korta anteckningar om vad kandidaten sa — direktcitat är bäst.' },
    guideStep4: { en: 'Fill in the Summary Template right after', sv: 'Fyll i Sammanfattningsmallen direkt efter' },
    guideStep4Desc: { en: 'Do this within 30 minutes of the interview ending. Your memory fades fast — the sooner you write, the more accurate it will be.', sv: 'Gör detta inom 30 minuter efter att intervjun avslutas. Ditt minne bleknar snabbt — ju snabbare du skriver, desto mer korrekt blir det.' },
    guidePrinciplesTitle: { en: '3 golden rules for fair interviews', sv: '3 gyllene regler för rättvisa intervjuer' },
    guidePrinciple1: {
      en: 'Same questions for all candidates — This is the most important rule. When you ask different questions, you cannot compare fairly.',
      sv: 'Samma frågor till alla kandidater — Det här är den viktigaste regeln. När du ställer olika frågor kan du inte jämföra rättvist.',
    },
    guidePrinciple2: {
      en: 'Evidence over gut feeling — Write down what the candidate actually said, not how you felt. "They described leading a team of 5 through a migration" is better than "Seemed like a good leader."',
      sv: 'Bevis framför magkänsla — Skriv ner vad kandidaten faktiskt sa, inte hur du kände. "Beskrev att de ledde ett team på 5 genom en migrering" är bättre än "Verkade som en bra ledare."',
    },
    guidePrinciple3: {
      en: 'Evaluate after, not during — Focus on listening and taking notes during the interview. Do your scoring and evaluation afterward using your notes.',
      sv: 'Utvärdera efter, inte under — Fokusera på att lyssna och anteckna under intervjun. Gör din betygsättning och utvärdering efteråt med hjälp av dina anteckningar.',
    },

    // Tip boxes
    tipLabel: { en: 'Tip', sv: 'Tips' },
    coachLabel: { en: 'How to use this section', sv: 'Hur du använder den här sektionen' },

    // Section 1
    s1Title: { en: 'Role Summary', sv: 'Rollsammanfattning' },
    s1Desc: { en: 'Key characteristics and requirements extracted from the role description. Review this to understand what the role requires.', sv: 'Nyckelegenskaper och krav extraherade från rollbeskrivningen. Granska detta för att förstå vad rollen kräver.' },
    s1Coach: {
      en: 'Read this summary to familiarize yourself with the role before the interview. Make sure you understand what skills and experience the role requires, so you know what to listen for during the conversation.',
      sv: 'Läs denna sammanfattning för att bekanta dig med rollen före intervjun. Se till att du förstår vilka färdigheter och vilken erfarenhet rollen kräver, så att du vet vad du ska lyssna efter under samtalet.',
    },
    keyResp: { en: 'Key Responsibilities', sv: 'Nyckelansvar' },
    techSkills: { en: 'Technical Skills Identified', sv: 'Identifierade tekniska färdigheter' },
    softSkills: { en: 'Soft Skills Identified', sv: 'Identifierade mjuka färdigheter' },
    collaboration: { en: 'Collaboration', sv: 'Samarbete' },
    leadership: { en: 'Leadership', sv: 'Ledarskap' },
    seniority: {
      en: { entry: 'Entry-Level', mid: 'Mid-Level', senior: 'Senior', executive: 'Executive' },
      sv: { entry: 'Junior', mid: 'Mellannivå', senior: 'Senior', executive: 'Ledningsnivå' },
    },
    collabLevel: { en: { low: 'low', moderate: 'moderate', high: 'high' }, sv: { low: 'låg', moderate: 'medel', high: 'hög' } },
    leaderLevel: { en: { low: 'low', moderate: 'moderate', high: 'high' }, sv: { low: 'låg', moderate: 'medel', high: 'hög' } },

    // Section 2
    s2Title: { en: 'Competency Analysis', sv: 'Kompetensanalys' },
    s2Desc: { en: 'The key competencies (skills and behaviors) needed for this role. Each one describes what to look for during the interview.', sv: 'De viktigaste kompetenserna (färdigheter och beteenden) som behövs för rollen. Varje kompetens beskriver vad du ska leta efter under intervjun.' },
    s2Coach: {
      en: 'You do not need to memorize all of these. Read through them once to get a sense of what the role requires. During the interview, focus on listening — the questions in the next section are designed to reveal these competencies.',
      sv: 'Du behöver inte memorera alla dessa. Läs igenom dem en gång för att få en känsla för vad rollen kräver. Under intervjun, fokusera på att lyssna — frågorna i nästa sektion är utformade för att avslöja dessa kompetenser.',
    },
    compCategories: {
      en: { technical: 'Technical Competencies', behavioral: 'Behavioral Competencies', leadership: 'Leadership Competencies', communication: 'Communication Competencies', problemSolving: 'Problem-Solving Competencies' },
      sv: { technical: 'Tekniska kompetenser', behavioral: 'Beteendekompetenser', leadership: 'Ledarskapskompetenser', communication: 'Kommunikationskompetenser', problemSolving: 'Problemlösningskompetenser' },
    },
    compCatColors: { technical: 'purple', behavioral: 'blue', leadership: 'amber', communication: 'green', problemSolving: 'red' },
    whyMatters: { en: 'Why It Matters', sv: 'Varför det är viktigt' },
    strongLooks: { en: 'What Strong Performance Looks Like', sv: 'Hur stark prestation ser ut' },
    observableBehaviors: { en: 'Observable Behaviors During Interviews', sv: 'Observerbara beteenden under intervjuer' },

    // Section 3
    s3Title: { en: 'Competency Library', sv: 'Kompetensbibliotek' },
    s3Desc: { en: 'Detailed competency definitions with level indicators. Use this as a reference when you are unsure how to rate a candidate.', sv: 'Detaljerade kompetensdefinitioner med nivåindikatorer. Använd detta som referens när du är osäker på hur du ska betygsätta en kandidat.' },
    s3Coach: {
      en: 'This is a reference section — you do not need to read it before the interview. Come back here when filling in the scorecard if you are unsure what level (beginner/mid/senior) a candidate is at for a specific competency.',
      sv: 'Det här är en referenssektion — du behöver inte läsa den före intervjun. Återvänd hit när du fyller i bedömningsmallen om du är osäker på vilken nivå (nybörjare/mellannivå/senior) en kandidat befinner sig på för en specifik kompetens.',
    },
    beginner: { en: 'Beginner', sv: 'Nybörjare' },
    midLevel: { en: 'Mid-Level', sv: 'Mellannivå' },
    seniorLevel: { en: 'Senior', sv: 'Senior' },
    positiveBehaviors: { en: 'Positive Behaviors', sv: 'Positiva beteenden' },
    riskIndicators: { en: 'Risk Indicators', sv: 'Riskindikatorer' },
    exampleEvidence: { en: 'Example Evidence', sv: 'Exempelbevis' },
    evalCriteria: { en: 'Evaluation Criteria', sv: 'Bedömningskriterier' },

    // Section 4
    s4Title: { en: 'Big Five Behavioral Indicators', sv: 'Big Five-beteendeindikatorer' },
    s4Desc: {
      en: 'Workplace behavioral tendencies relevant to this role. These describe how people tend to work — not who they are.',
      sv: 'Arbetsplatsbeteendetendenser relevanta för denna roll. Dessa beskriver hur personer tenderar att arbeta — inte vilka de är.',
    },
    s4Coach: {
      en: 'This is an advanced reference section. The Big Five model describes workplace behavior patterns. You do not need to understand this deeply — the interview questions already cover these areas. Use this if you want to understand why certain questions are included.',
      sv: 'Det här är en avancerad referenssektion. Big Five-modellen beskriver beteendemönster på arbetsplatsen. Du behöver inte förstå detta djupt — intervjufrågorna täcker redan dessa områden. Använd detta om du vill förstå varför vissa frågor ingår.',
    },
    s4Warning: {
      en: 'These indicators describe workplace behavior tendencies, not personality traits. They should inform interview observation, never be used to label or diagnose candidates.',
      sv: 'Dessa indikatorer beskriver tendenser i arbetsplatsbeteende, inte personlighetsdrag. De bör informera intervjuobservation, aldrig användas för att kategorisera eller diagnostisera kandidater.',
    },
    important: { en: 'Important:', sv: 'Viktigt:' },
    idealForRole: { en: 'Ideal for role:', sv: 'Idealiskt för rollen:' },
    low: { en: 'Low', sv: 'Låg' },
    high: { en: 'High', sv: 'Hög' },
    workplaceBehaviors: { en: 'Workplace Behaviors', sv: 'Arbetsplatsbeteenden' },
    interviewSignals: { en: 'Interview Signals', sv: 'Intervjusignaler' },
    bigFiveTraits: {
      en: { openness: 'Openness to Experience', conscientiousness: 'Conscientiousness', extraversion: 'Extraversion', agreeableness: 'Agreeableness', emotionalStability: 'Emotional Stability' },
      sv: { openness: 'Öppenhet för erfarenhet', conscientiousness: 'Samvetsgrannhet', extraversion: 'Extraversion', agreeableness: 'Vänlighet', emotionalStability: 'Emotionell stabilitet' },
    },
    bigFiveIcons: { openness: '🔍', conscientiousness: '📐', extraversion: '🤝', agreeableness: '💬', emotionalStability: '⚖️' },

    // Section 5
    s5Title: { en: 'Interview Questions', sv: 'Intervjufrågor' },
    s5Desc: { en: 'Structured questions to ask during the interview. Click any question to see evaluation guidance.', sv: 'Strukturerade frågor att ställa under intervjun. Klicka på en fråga för att se bedömningsvägledning.' },
    s5Coach: {
      en: 'Choose 8-12 questions from the list below. Ask the SAME questions to every candidate for this role — this is critical for fair comparison. Click on a question to see what a strong answer sounds like and what warning signs to watch for.',
      sv: 'Välj 8-12 frågor från listan nedan. Ställ SAMMA frågor till varje kandidat för denna roll — detta är avgörande för en rättvis jämförelse. Klicka på en fråga för att se hur ett starkt svar låter och vilka varningssignaler du ska vara uppmärksam på.',
    },
    questionCats: {
      en: {
        competency: { label: 'A. Competency-Based Questions', desc: 'Questions about past experiences — these reveal how the candidate actually works' },
        situational: { label: 'B. Situational Questions', desc: 'Hypothetical scenarios — these reveal how the candidate thinks and solves problems' },
        technical: { label: 'C. Technical / Role-Specific Questions', desc: 'Questions about domain expertise and technical depth' },
        bigFive: { label: 'D. Behavioral Style Questions', desc: 'Questions exploring how the candidate prefers to work and collaborate' },
        culture: { label: 'E. Culture & Motivation Questions', desc: 'Questions about values, work environment, and what drives the candidate' },
      },
      sv: {
        competency: { label: 'A. Kompetensbaserade frågor', desc: 'Frågor om tidigare erfarenheter — dessa avslöjar hur kandidaten faktiskt arbetar' },
        situational: { label: 'B. Situationsfrågor', desc: 'Hypotetiska scenarier — dessa avslöjar hur kandidaten tänker och löser problem' },
        technical: { label: 'C. Tekniska / rollspecifika frågor', desc: 'Frågor om domänexpertis och tekniskt djup' },
        bigFive: { label: 'D. Beteendestilsfrågor', desc: 'Frågor som utforskar hur kandidaten föredrar att arbeta och samarbeta' },
        culture: { label: 'E. Kultur- och motivationsfrågor', desc: 'Frågor om värderingar, arbetsmiljö och vad som driver kandidaten' },
      },
    },
    whyQuestion: { en: 'Why This Question Matters', sv: 'Varför denna fråga är viktig' },
    strongSignals: { en: 'Strong Answer Signals', sv: 'Starka svarssignaler' },
    warningSignals: { en: 'Warning Signs', sv: 'Varningssignaler' },
    followUpQ: { en: 'Follow-Up Questions', sv: 'Uppföljningsfrågor' },

    // Section 6
    s6Title: { en: 'Follow-Up Questions', sv: 'Uppföljningsfrågor' },
    s6Desc: { en: 'Ready-to-use follow-up questions for common interview situations. Use these when you need to dig deeper.', sv: 'Färdiga uppföljningsfrågor för vanliga intervjusituationer. Använd dessa när du behöver gräva djupare.' },
    s6Coach: {
      en: 'You do not need to prepare these — just keep this section open during the interview. If a candidate gives a vague answer, or you want to explore something deeper, pick a relevant follow-up from the appropriate category.',
      sv: 'Du behöver inte förbereda dessa — ha bara denna sektion öppen under intervjun. Om en kandidat ger ett vagt svar, eller om du vill utforska något djupare, välj en relevant uppföljning från rätt kategori.',
    },

    // Section 7
    s7Title: { en: 'Interview Scorecard', sv: 'Intervjubedömningsmall' },
    s7Desc: { en: 'Rate each competency during or after the interview. This is your main evaluation tool.', sv: 'Betygsätt varje kompetens under eller efter intervjun. Det här är ditt huvudsakliga utvärderingsverktyg.' },
    s7Coach: {
      en: 'For each competency, give a score from 1 to 5 based on what the candidate demonstrated. Write a short note explaining WHY you gave that score — this is crucial for making fair decisions and explaining your reasoning to others.',
      sv: 'För varje kompetens, ge ett betyg från 1 till 5 baserat på vad kandidaten visade. Skriv en kort anteckning som förklarar VARFÖR du gav det betyget — detta är avgörande för att fatta rättvisa beslut och förklara ditt resonemang för andra.',
    },
    competency: { en: 'Competency', sv: 'Kompetens' },
    category: { en: 'Category', sv: 'Kategori' },
    weight: { en: 'Weight', sv: 'Vikt' },
    score: { en: 'Score (1-5)', sv: 'Poäng (1-5)' },
    notes: { en: 'Notes', sv: 'Anteckningar' },
    evidenceNotes: { en: 'What did the candidate say or demonstrate?', sv: 'Vad sa eller visade kandidaten?' },
    scoringGuide: { en: 'Scoring Guide', sv: 'Bedömningsguide' },
    scoreLabels: {
      en: [
        ['1', 'No Evidence', 'Could not provide any relevant examples'],
        ['2', 'Limited', 'Gave some examples but with significant gaps'],
        ['3', 'Adequate', 'Met basic expectations — acceptable'],
        ['4', 'Strong', 'Clear, detailed evidence with good examples'],
        ['5', 'Exceptional', 'Outstanding — exceeded expectations clearly'],
      ],
      sv: [
        ['1', 'Inga bevis', 'Kunde inte ge några relevanta exempel'],
        ['2', 'Begränsad', 'Gav några exempel men med betydande luckor'],
        ['3', 'Tillräcklig', 'Uppfyllde grundläggande förväntningar — acceptabelt'],
        ['4', 'Stark', 'Tydliga, detaljerade bevis med bra exempel'],
        ['5', 'Exceptionell', 'Enastående — överträffade förväntningar tydligt'],
      ],
    },
    catLabels: {
      en: { technical: 'Technical', behavioral: 'Behavioral', leadership: 'Leadership', communication: 'Communication', problemSolving: 'Problem-Solving' },
      sv: { technical: 'Teknisk', behavioral: 'Beteende', leadership: 'Ledarskap', communication: 'Kommunikation', problemSolving: 'Problemlösning' },
    },

    // Section 8
    s8Title: { en: 'Interview Summary Template', sv: 'Sammanfattningsmall för intervju' },
    s8Desc: { en: 'Fill this in within 30 minutes after the interview — while your memory is still fresh.', sv: 'Fyll i detta inom 30 minuter efter intervjun — medan ditt minne fortfarande är färskt.' },
    s8Coach: {
      en: 'This is one of the most important sections. Fill it in right after the interview ends — do not wait until the next day. Focus on what the candidate actually said and did, not on how you felt about them.',
      sv: 'Det här är en av de viktigaste sektionerna. Fyll i den direkt efter att intervjun avslutats — vänta inte till nästa dag. Fokusera på vad kandidaten faktiskt sa och gjorde, inte på hur du kände för dem.',
    },
    templateSections: {
      en: [
        { title: '📝 Overall Impression', placeholder: 'In 2-3 sentences: What is your overall assessment of this candidate for this specific role?' },
        { title: '💪 Key Strengths (list 3-5)', placeholder: 'What did this candidate do well? Be specific — reference actual answers they gave.\n\nExample: "Described leading a database migration with clear planning and risk management"' },
        { title: '⚠️ Concerns & Gaps', placeholder: 'What are you worried about? What skills or experience were missing?\n\nBe specific — "Could not give an example of handling conflict" is better than "Seemed weak on teamwork"' },
        { title: '🔧 Technical Fit', placeholder: "How well do the candidate's technical skills match what the role requires?\n\nWhat is strong? What is missing?" },
        { title: '👥 Team Fit', placeholder: 'How would this person work with the existing team?\n\nThink about working style, not personality — would their approach complement the team?' },
        { title: '💬 Communication', placeholder: 'How well did the candidate communicate? Were answers clear and structured?\n\nDid they listen well? Did they ask good questions?' },
        { title: '🎯 Growth Potential', placeholder: 'Where could this person grow? How quickly could they ramp up?\n\nWhat development support would they need?' },
        { title: '✅ Recommendation', placeholder: 'Your recommendation: Strong Hire / Hire / Lean Hire / Lean No Hire / No Hire\n\nExplain your reasoning in 2-3 sentences.' },
        { title: '➡️ Next Steps', placeholder: 'What should happen next?\n\nExamples: Second interview, technical assessment, reference check, make offer' },
      ],
      sv: [
        { title: '📝 Helhetsintryck', placeholder: 'I 2-3 meningar: Vad är din övergripande bedömning av kandidaten för denna specifika roll?' },
        { title: '💪 Nyckelstyrkor (lista 3-5)', placeholder: 'Vad gjorde kandidaten bra? Var specifik — referera till faktiska svar de gav.\n\nExempel: "Beskrev att de ledde en databasmigrering med tydlig planering och riskhantering"' },
        { title: '⚠️ Farhågor & luckor', placeholder: 'Vad är du orolig för? Vilka färdigheter eller erfarenheter saknades?\n\nVar specifik — "Kunde inte ge ett exempel på konflikthantering" är bättre än "Verkade svag på teamarbete"' },
        { title: '🔧 Teknisk passning', placeholder: 'Hur väl matchar kandidatens tekniska färdigheter rollens krav?\n\nVad är starkt? Vad saknas?' },
        { title: '👥 Teampassning', placeholder: 'Hur skulle personen fungera med det befintliga teamet?\n\nTänk på arbetssätt, inte personlighet — skulle deras tillvägagångssätt komplettera teamet?' },
        { title: '💬 Kommunikation', placeholder: 'Hur bra kommunicerade kandidaten? Var svaren tydliga och strukturerade?\n\nLyssnade de bra? Ställde de bra frågor?' },
        { title: '🎯 Tillväxtpotential', placeholder: 'Var kan personen växa? Hur snabbt kan de komma igång?\n\nVilket utvecklingsstöd skulle de behöva?' },
        { title: '✅ Rekommendation', placeholder: 'Din rekommendation: Strong Hire / Hire / Lean Hire / Lean No Hire / No Hire\n\nFörklara ditt resonemang i 2-3 meningar.' },
        { title: '➡️ Nästa steg', placeholder: 'Vad bör hända härnäst?\n\nExempel: Andra intervju, teknisk bedömning, referenskontroll, lämna erbjudande' },
      ],
    },

    // Section 10
    s10Title: { en: 'Hiring Recommendations', sv: 'Anställningsrekommendationer' },
    s10Desc: { en: 'Use these categories when making your final recommendation. Match the description that best fits the candidate.', sv: 'Använd dessa kategorier när du gör din slutliga rekommendation. Matcha den beskrivning som bäst passar kandidaten.' },
    s10Coach: {
      en: 'After filling in your scorecard and summary template, use this section to make your final recommendation. Read each category and pick the one that best matches the evidence from the interview. Always be able to explain your choice with specific examples.',
      sv: 'Efter att du fyllt i bedömningsmallen och sammanfattningsmallen, använd denna sektion för att göra din slutliga rekommendation. Läs varje kategori och välj den som bäst matchar bevisen från intervjun. Var alltid beredd att förklara ditt val med specifika exempel.',
    },
    recLevels: {
      en: { strongHire: 'Strong Hire', hire: 'Hire', leanHire: 'Lean Hire', leanNo: 'Lean No Hire', noHire: 'No Hire' },
      sv: { strongHire: 'Stark Hire', hire: 'Hire', leanHire: 'Lean Hire', leanNo: 'Lean No Hire', noHire: 'No Hire' },
    },
    typicalSignals: { en: 'Typical Signals', sv: 'Typiska signaler' },
    risks: { en: 'Risks', sv: 'Risker' },
    confidenceLevel: { en: 'Confidence Level', sv: 'Konfidensnivå' },
    suggestedNextSteps: { en: 'Suggested Next Steps', sv: 'Föreslagna nästa steg' },
    recs: {
      en: [
        { level: 'Strong Hire', cls: 'strong-hire', signals: 'Exceeds expectations across critical competencies. Provides detailed, evidence-rich answers. Demonstrates clear growth trajectory and strong alignment with role requirements.', risks: 'May be over-qualified or have competing offers. Ensure the role provides enough challenge and growth opportunity.', confidence: 'High confidence — multiple data points support the assessment.', next: 'Fast-track to offer. Prioritize competitive compensation discussion. Assign a senior buddy for onboarding.' },
        { level: 'Hire', cls: 'hire', signals: 'Meets or exceeds expectations in most critical competencies. Solid evidence of relevant experience. Good culture contribution and communication skills.', risks: 'May have gaps in 1-2 non-critical areas. Growth curve may require targeted support.', confidence: 'Good confidence — evidence is consistent and sufficient.', next: 'Proceed to offer. Consider targeted onboarding plan for identified growth areas.' },
        { level: 'Lean Hire', cls: 'lean-hire', signals: 'Meets basic expectations in critical competencies. Some evidence of relevant experience but with notable gaps. Shows potential but may need significant development.', risks: 'Longer ramp-up time. May need more support than typical. Some competency gaps could impact performance.', confidence: 'Moderate confidence — additional data would strengthen the decision.', next: 'Consider a second interview or technical assessment to address specific concerns. Gather additional references.' },
        { level: 'Lean No Hire', cls: 'lean-no', signals: 'Falls short in 1-2 critical competencies. Limited evidence of relevant experience. Potential concerns about culture or communication fit.', risks: 'High risk of underperformance in key areas. Investment in development may not yield returns within expected timeline.', confidence: 'Moderate confidence — the decision is close but the evidence leans negative.', next: 'Document specific concerns. If reconsidering, define specific criteria that must be met in a follow-up assessment.' },
        { level: 'No Hire', cls: 'no-hire', signals: 'Does not meet expectations in multiple critical competencies. Concerning signals in behavioral or cultural areas. Significant misalignment with role requirements.', risks: 'High risk of poor performance and potential negative team impact.', confidence: 'High confidence — multiple data points indicate poor fit.', next: 'Decline respectfully with constructive feedback if appropriate. Document rationale for future reference.' },
      ],
      sv: [
        { level: 'Stark Hire', cls: 'strong-hire', signals: 'Överträffar förväntningar inom kritiska kompetenser. Ger detaljerade, bevisrika svar. Visar tydlig tillväxtbana och stark överensstämmelse med rollkrav.', risks: 'Kan vara överkvalificerad eller ha konkurrerande erbjudanden. Säkerställ att rollen erbjuder tillräcklig utmaning och tillväxtmöjlighet.', confidence: 'Hög konfidens — flera datapunkter stödjer bedömningen.', next: 'Snabbspår till erbjudande. Prioritera konkurrenskraftig kompensationsdiskussion. Tilldela en senior fadder för onboarding.' },
        { level: 'Hire', cls: 'hire', signals: 'Uppfyller eller överträffar förväntningar i de flesta kritiska kompetenser. Solida bevis på relevant erfarenhet. Bra kulturbidrag och kommunikationsförmåga.', risks: 'Kan ha luckor i 1-2 icke-kritiska områden. Tillväxtkurvan kan kräva riktat stöd.', confidence: 'God konfidens — bevisen är konsekventa och tillräckliga.', next: 'Fortsätt till erbjudande. Överväg riktad onboarding-plan för identifierade tillväxtområden.' },
        { level: 'Lean Hire', cls: 'lean-hire', signals: 'Uppfyller grundläggande förväntningar i kritiska kompetenser. Vissa bevis på relevant erfarenhet men med märkbara luckor. Visar potential men kan behöva betydande utveckling.', risks: 'Längre uppstartstid. Kan behöva mer stöd än vanligt. Vissa kompetensluckor kan påverka prestationen.', confidence: 'Måttlig konfidens — ytterligare data skulle stärka beslutet.', next: 'Överväg en andra intervju eller teknisk bedömning för att ta itu med specifika farhågor. Samla ytterligare referenser.' },
        { level: 'Lean No Hire', cls: 'lean-no', signals: 'Når inte upp i 1-2 kritiska kompetenser. Begränsade bevis på relevant erfarenhet. Potentiella farhågor kring kultur- eller kommunikationspassning.', risks: 'Hög risk för underprestation inom nyckelområden. Investering i utveckling kanske inte ger avkastning inom förväntad tidsram.', confidence: 'Måttlig konfidens — beslutet är nära men bevisen lutar negativt.', next: 'Dokumentera specifika farhågor. Vid omprövning, definiera specifika kriterier som måste uppfyllas i en uppföljningsbedömning.' },
        { level: 'No Hire', cls: 'no-hire', signals: 'Uppfyller inte förväntningar inom flera kritiska kompetenser. Oroande signaler inom beteende- eller kulturområden. Betydande bristande överensstämmelse med rollkrav.', risks: 'Hög risk för dålig prestation och potentiell negativ teampåverkan.', confidence: 'Hög konfidens — flera datapunkter indikerar dålig passning.', next: 'Avböj respektfullt med konstruktiv feedback om lämpligt. Dokumentera motivering för framtida referens.' },
      ],
    },

    // Section 11
    s11Title: { en: 'Bias Reduction Checklist', sv: 'Checklista för biasreducering' },
    s11Desc: { en: 'Read this before EVERY interview. It takes 2 minutes and makes your decisions significantly fairer.', sv: 'Läs detta före VARJE intervju. Det tar 2 minuter och gör dina beslut betydligt rättvisare.' },
    s11Coach: {
      en: 'This is the most important preparation you can do. Read through each card before the interview starts. You do not need to memorize them — just being aware of these biases makes you less likely to fall for them.',
      sv: 'Det här är den viktigaste förberedelsen du kan göra. Läs igenom varje kort innan intervjun börjar. Du behöver inte memorera dem — bara att vara medveten om dessa bias gör att du är mindre benägen att falla för dem.',
    },
    biases: {
      en: [
        { icon: '🎯', title: 'Focus on Evidence', desc: 'Base your decisions on specific examples the candidate gives — not on gut feelings or overall impressions. Ask yourself: "What specific thing did they say that supports my rating?"' },
        { icon: '📊', title: 'Evaluate Examples, Not Confidence', desc: 'A confident person is not automatically a competent person. Listen to WHAT they say, not HOW they say it. A quiet candidate with great examples is stronger than a confident one with vague answers.' },
        { icon: '❤️', title: 'Separate Likability from Competency', desc: 'You might really enjoy talking to someone who cannot do the job. Ask yourself: "Would I hire this person if I did not enjoy the conversation?"' },
        { icon: '🪞', title: 'Avoid Similarity Bias', desc: 'We tend to favor people who are like us — same school, same hobbies, same background. This is natural but unfair. Focus only on whether they can do the job.' },
        { icon: '⚖️', title: 'Ask the Same Questions', desc: 'The most important rule: ask every candidate the same core questions in the same order. This is the foundation of fair comparison.' },
        { icon: '🎪', title: 'Avoid the Halo/Horn Effect', desc: 'One great answer does not make them perfect. One bad answer does not disqualify them. Rate each competency separately based on what they showed for THAT specific area.' },
        { icon: '🕐', title: 'Avoid Recency Bias', desc: 'The last 10 minutes of an interview should not outweigh the first 50. Take notes throughout — your memory is unreliable.' },
        { icon: '📝', title: 'Write Down Quotes', desc: 'During the interview, write down what the candidate actually says — direct quotes are better than your interpretation. "Led a team of 5" is more useful than "good leader."' },
        { icon: '🔄', title: 'Reset Between Candidates', desc: 'Each candidate should be compared to the job requirements, not to the previous candidate. A mediocre candidate can look great after a bad one.' },
        { icon: '🧠', title: 'Check Your Assumptions', desc: 'If you notice yourself making assumptions based on name, appearance, accent, age, or background — pause. Redirect your attention to what they actually said and demonstrated.' },
      ],
      sv: [
        { icon: '🎯', title: 'Fokusera på bevis', desc: 'Basera dina beslut på specifika exempel som kandidaten ger — inte på magkänslor eller övergripande intryck. Fråga dig själv: "Vad specifikt sa de som stödjer mitt betyg?"' },
        { icon: '📊', title: 'Bedöm exempel, inte självförtroende', desc: 'En självsäker person är inte automatiskt en kompetent person. Lyssna på VAD de säger, inte HUR de säger det. En tystlåten kandidat med bra exempel är starkare än en självsäker med vaga svar.' },
        { icon: '❤️', title: 'Separera sympati från kompetens', desc: 'Du kan verkligen gilla att prata med någon som inte kan göra jobbet. Fråga dig själv: "Skulle jag anställa denna person om jag inte njöt av samtalet?"' },
        { icon: '🪞', title: 'Undvik likhetsbias', desc: 'Vi tenderar att favorisera människor som liknar oss — samma skola, samma hobbies, samma bakgrund. Det är naturligt men orättvist. Fokusera bara på om de kan göra jobbet.' },
        { icon: '⚖️', title: 'Ställ samma frågor', desc: 'Den viktigaste regeln: ställ samma kärnfrågor till varje kandidat i samma ordning. Det här är grunden för rättvis jämförelse.' },
        { icon: '🎪', title: 'Undvik halo/horn-effekten', desc: 'Ett bra svar gör dem inte perfekta. Ett dåligt svar diskvalificerar dem inte. Betygsätt varje kompetens separat baserat på vad de visade för DET specifika området.' },
        { icon: '🕐', title: 'Undvik recency bias', desc: 'De sista 10 minuterna av en intervju bör inte väga tyngre än de första 50. Anteckna under hela intervjun — ditt minne är opålitligt.' },
        { icon: '📝', title: 'Skriv ner citat', desc: 'Under intervjun, skriv ner vad kandidaten faktiskt säger — direktcitat är bättre än din tolkning. "Ledde ett team på 5" är mer användbart än "bra ledare."' },
        { icon: '🔄', title: 'Återställ mellan kandidater', desc: 'Varje kandidat bör jämföras med jobbkraven, inte med den föregående kandidaten. En medioker kandidat kan se bra ut efter en dålig.' },
        { icon: '🧠', title: 'Kontrollera dina antaganden', desc: 'Om du märker att du gör antaganden baserat på namn, utseende, accent, ålder eller bakgrund — pausa. Omdirigera din uppmärksamhet till vad de faktiskt sa och visade.' },
      ],
    },

    // Follow-ups
    followUpTitles: {
      en: { vague: 'When Answers Are Vague', achievements: 'When Probing Strong Achievements', conflict: 'When Exploring Conflict Situations', leadership: 'When Assessing Leadership', technical: 'When Probing Technical Depth', teamwork: 'When Exploring Teamwork', ownership: 'When Clarifying Ownership', learning: 'When Exploring Learning Experiences', failures: 'When Discussing Failures & Setbacks' },
      sv: { vague: 'När svaren är vaga', achievements: 'När man utforskar starka prestationer', conflict: 'När man utforskar konfliktsituationer', leadership: 'När man bedömer ledarskap', technical: 'När man undersöker tekniskt djup', teamwork: 'När man utforskar teamarbete', ownership: 'När man klargör ägarskap', learning: 'När man utforskar lärandeerfarenheter', failures: 'När man diskuterar misslyckanden och motgångar' },
    },

    // Section previews for landing sidebar
    sectionPreviewTitle: { en: 'What\'s included in the interview package', sv: 'Vad som ingår i intervjupaketet' },
    sectionPreviewIntro: {
      en: 'Click on any step to learn more. After you paste a role description, all sections will be generated automatically.',
      sv: 'Klicka på ett steg för att läsa mer. När du klistrar in en rollbeskrivning genereras alla sektioner automatiskt.',
    },
    sectionPreviews: {
      en: {
        guide: { title: 'Getting Started', icon: '📖', desc: 'A step-by-step guide that walks you through the entire interview process — from preparation to final decision. Perfect if you are new to structured interviewing.' },
        summary: { title: 'Role Summary', icon: '📄', desc: 'An overview of the role\'s key requirements, technical skills, soft skills, and seniority level — extracted automatically from the role description you paste in.' },
        bias: { title: 'Bias Checklist', icon: '⚖️', desc: '10 common biases that affect hiring decisions. Read this before every interview — it takes 2 minutes and significantly improves the fairness of your evaluation.' },
        compAnalysis: { title: 'Competency Analysis', icon: '🔍', desc: 'The key competencies (skills and behaviors) the role requires, organized by category. Each competency includes what strong performance looks like and observable behaviors to watch for.' },
        questions: { title: 'Interview Questions', icon: '💬', desc: '15-20 structured interview questions organized by category. Each question includes why it matters, what a strong answer sounds like, warning signs, and follow-up questions.' },
        followups: { title: 'Follow-Up Questions', icon: '🔄', desc: 'Ready-to-use follow-up questions for common interview situations — when answers are vague, when probing achievements, exploring conflicts, assessing leadership, and more.' },
        scorecard: { title: 'Scorecard', icon: '📊', desc: 'A structured evaluation form where you rate each competency from 1 to 5 during or after the interview. Includes space for evidence notes and a scoring guide.' },
        summaryTemplate: { title: 'Summary Template', icon: '📝', desc: 'A template to fill in within 30 minutes after the interview — covering overall impression, key strengths, concerns, technical fit, team fit, and your recommendation.' },
        recommendations: { title: 'Recommendations', icon: '✅', desc: 'Five recommendation levels from Strong Hire to No Hire. Each level describes typical signals, risks, confidence level, and suggested next steps.' },
        compLibrary: { title: 'Competency Library', icon: '📚', desc: 'Detailed competency definitions with beginner, mid-level, and senior indicators. Use as a reference when filling in the scorecard.' },
        bigFive: { title: 'Big Five Indicators', icon: '🧠', desc: 'Workplace behavioral tendencies relevant to the role, based on the Big Five personality model. An advanced reference section for experienced interviewers.' },
      },
      sv: {
        guide: { title: 'Kom igång', icon: '📖', desc: 'En steg-för-steg-guide som leder dig genom hela intervjuprocessen — från förberedelse till slutgiltigt beslut. Perfekt om du är ny på strukturerade intervjuer.' },
        summary: { title: 'Rollsammanfattning', icon: '📄', desc: 'En översikt av rollens nyckelkrav, tekniska färdigheter, mjuka färdigheter och senioritetsnivå — extraherad automatiskt från rollbeskrivningen du klistrar in.' },
        bias: { title: 'Biaskontroll', icon: '⚖️', desc: '10 vanliga bias som påverkar rekryteringsbeslut. Läs detta före varje intervju — det tar 2 minuter och förbättrar rättvisan i din bedömning avsevärt.' },
        compAnalysis: { title: 'Kompetensanalys', icon: '🔍', desc: 'De viktigaste kompetenserna (färdigheter och beteenden) som rollen kräver, organiserade efter kategori. Varje kompetens beskriver hur stark prestation ser ut och vilka beteenden du ska leta efter.' },
        questions: { title: 'Intervjufrågor', icon: '💬', desc: '15-20 strukturerade intervjufrågor organiserade efter kategori. Varje fråga innehåller varför den är viktig, hur ett starkt svar låter, varningssignaler och uppföljningsfrågor.' },
        followups: { title: 'Uppföljningsfrågor', icon: '🔄', desc: 'Färdiga uppföljningsfrågor för vanliga intervjusituationer — när svar är vaga, när du undersöker prestationer, utforskar konflikter, bedömer ledarskap och mer.' },
        scorecard: { title: 'Bedömningsmall', icon: '📊', desc: 'Ett strukturerat utvärderingsformulär där du betygsätter varje kompetens från 1 till 5 under eller efter intervjun. Innehåller plats för anteckningar och en bedömningsguide.' },
        summaryTemplate: { title: 'Sammanfattningsmall', icon: '📝', desc: 'En mall att fylla i inom 30 minuter efter intervjun — som täcker helhetsintryck, nyckelstyrkor, farhågor, teknisk passning, teampassning och din rekommendation.' },
        recommendations: { title: 'Rekommendationer', icon: '✅', desc: 'Fem rekommendationsnivåer från Strong Hire till No Hire. Varje nivå beskriver typiska signaler, risker, konfidensnivå och föreslagna nästa steg.' },
        compLibrary: { title: 'Kompetensbibliotek', icon: '📚', desc: 'Detaljerade kompetensdefinitioner med nybörjar-, mellan- och seniornivåer. Använd som referens när du fyller i bedömningsmallen.' },
        bigFive: { title: 'Big Five-indikatorer', icon: '🧠', desc: 'Arbetsplatsbeteendetendenser relevanta för rollen, baserade på Big Five-personlighetsmodellen. En avancerad referenssektion för erfarna intervjuare.' },
      },
    },
    previewCta: { en: 'Paste a role description above to generate this section', sv: 'Klistra in en rollbeskrivning ovan för att generera denna sektion' },

    // Star ratings
    starLabels: {
      en: ['No Evidence', 'Limited', 'Adequate', 'Strong', 'Exceptional'],
      sv: ['Inga bevis', 'Begränsad', 'Tillräcklig', 'Stark', 'Enastående'],
    },

    // Interview notes
    notesTitle: { en: 'Interview Notes', sv: 'Intervjuanteckningar' },
    notesPlaceholder: {
      en: 'Take notes here during the interview...\n\nTip: Write what the candidate says — direct quotes are best. Mention competency names to help auto-extract later.\n\nExample:\n- Communication: Explained the project clearly, good structure\n- Leadership: Led a team of 5, handled conflict well\n- Concern: Could not give an example of handling failure',
      sv: 'Anteckna här under intervjun...\n\nTips: Skriv vad kandidaten säger — direktcitat är bäst. Nämn kompetensnamn för att underlätta automatisk extrahering.\n\nExempel:\n- Kommunikation: Förklarade projektet tydligt, bra struktur\n- Ledarskap: Ledde ett team på 5, hanterade konflikter bra\n- Farhåga: Kunde inte ge exempel på att hantera misslyckanden',
    },
    extractNotes: { en: 'Extract to Scorecard & Summary', sv: 'Extrahera till bedömningsmall & sammanfattning' },
    extractSuccess: { en: 'Notes extracted to scorecard and summary template', sv: 'Anteckningar extraherade till bedömningsmall och sammanfattningsmall' },
    clearNotes: { en: 'Clear', sv: 'Rensa' },

    // Auto-recommendation
    autoRecTitle: { en: 'Calculated Recommendation', sv: 'Beräknad rekommendation' },
    autoRecBasis: { en: 'Based on your scorecard scores', sv: 'Baserat på dina bedömningspoäng' },
    autoRecAvg: { en: 'Weighted average', sv: 'Viktat genomsnitt' },
    autoRecFill: { en: 'Fill in the scorecard to get an automatic recommendation', sv: 'Fyll i bedömningsmallen för att få en automatisk rekommendation' },
    autoRecLevels: {
      en: { strongHire: 'Strong Hire', hire: 'Hire', leanHire: 'Lean Hire', leanNo: 'Lean No Hire', noHire: 'No Hire' },
      sv: { strongHire: 'Stark Hire', hire: 'Hire', leanHire: 'Lean Hire', leanNo: 'Lean No Hire', noHire: 'No Hire' },
    },

    // Section toggles
    toggleShow: { en: 'Show', sv: 'Visa' },
    toggleHide: { en: 'Hide', sv: 'Dölj' },
    toggleSettings: { en: 'Customize sections', sv: 'Anpassa sektioner' },

    // Floating scorecard panel
    scorecardPanelBtn: { en: 'Scorecard', sv: 'Bedömning' },
    scorecardPanelTitle: { en: '📊 Quick Scorecard', sv: '📊 Snabbedömning' },
    scorecardPanelClose: { en: 'Close', sv: 'Stäng' },
  };

  function get(key) {
    const val = strings[key];
    if (!val) return key;
    if (typeof val === 'object' && val[currentLang] !== undefined) return val[currentLang];
    return val;
  }

  function setLang(lang) {
    currentLang = lang;
  }

  function getLang() {
    return currentLang;
  }

  return { get, setLang, getLang, strings };
})();
