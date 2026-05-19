(() => {
  const textarea = document.getElementById('jd-input');
  const analyzeBtn = document.getElementById('analyze-btn');
  const charCount = document.getElementById('char-count');
  const newBtn = document.getElementById('new-btn');
  const mainContent = document.getElementById('main-content');

  let lastAnalysisData = null;
  let lastText = '';

  // --- Character count & button state ---
  function updateCharCount() {
    const len = textarea.value.length;
    charCount.textContent = len;
    analyzeBtn.disabled = len < 50;
  }

  textarea.addEventListener('input', updateCharCount);

  // --- Input method tabs (paste vs file) ---
  const inputTabs = document.querySelectorAll('.input-tab');
  const pasteArea = document.getElementById('paste-input-area');
  const fileArea = document.getElementById('file-input-area');

  inputTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const method = tab.dataset.method;
      inputTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      pasteArea.style.display = method === 'paste' ? '' : 'none';
      fileArea.style.display = method === 'file' ? '' : 'none';
    });
  });

  // --- File Upload ---
  const fileUploadInput = document.getElementById('file-upload');
  const dropzone = document.getElementById('file-dropzone');
  const fileStatus = document.getElementById('file-status');
  const fileName = document.getElementById('file-name');
  const fileRemove = document.getElementById('file-remove');
  const fileError = document.getElementById('file-error');

  // Configure pdf.js worker
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // Click to browse
  dropzone.addEventListener('click', () => fileUploadInput.click());

  // Drag & drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // File input change
  fileUploadInput.addEventListener('change', () => {
    if (fileUploadInput.files.length > 0) {
      handleFile(fileUploadInput.files[0]);
    }
  });

  // Remove file
  fileRemove.addEventListener('click', () => {
    textarea.value = '';
    updateCharCount();
    fileUploadInput.value = '';
    fileStatus.style.display = 'none';
    fileError.style.display = 'none';
    dropzone.style.display = '';
  });

  async function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      showFileError(T.get('fileErrorFormat'));
      return;
    }

    // Show loading
    fileError.style.display = 'none';
    dropzone.innerHTML = `<div class="file-loading"><div class="spinner-small"></div><span>${T.get('fileReading')}</span></div>`;

    try {
      let text = '';
      if (ext === 'pdf') {
        text = await extractPdfText(file);
      } else {
        text = await extractDocxText(file);
      }

      // Restore dropzone content
      restoreDropzone();

      text = text.trim();
      if (!text || text.length < 10) {
        showFileError(T.get('fileErrorEmpty'));
        return;
      }

      // Put text into textarea and switch to paste view
      textarea.value = text;
      updateCharCount();

      // Show success status
      dropzone.style.display = 'none';
      fileStatus.style.display = 'flex';
      fileName.textContent = file.name;

      // Show success message with char count
      const msg = T.get('fileSuccess').replace('{chars}', text.length);
      fileError.style.display = 'block';
      fileError.className = 'file-success';
      fileError.textContent = msg;

    } catch (err) {
      restoreDropzone();
      console.error('File read error:', err);
      showFileError(T.get('fileErrorRead'));
    }
  }

  async function extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += pageText + '\n\n';
    }
    return text;
  }

  async function extractDocxText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  function showFileError(msg) {
    fileError.style.display = 'block';
    fileError.className = 'file-error';
    fileError.textContent = msg;
  }

  function restoreDropzone() {
    dropzone.innerHTML = `
      <div class="dropzone-content">
        <div class="dropzone-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <p class="dropzone-text">${T.get('dropzoneText')}</p>
        <p class="dropzone-formats">${T.get('dropzoneFormats')}</p>
      </div>`;
  }

  // --- Analyze ---
  analyzeBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (text.length < 50) return;
    lastText = text;
    runAnalysis(text);
  });

  // --- New Analysis ---
  newBtn.addEventListener('click', () => {
    showPage('landing');
    showFloatingToggle(false);
    document.getElementById('floating-scorecard')?.classList.remove('open');
    document.getElementById('scorecard-panel-toggle')?.classList.remove('panel-open');
    textarea.value = '';
    charCount.textContent = '0';
    analyzeBtn.disabled = true;
    // Reset file upload state
    fileUploadInput.value = '';
    fileStatus.style.display = 'none';
    fileError.style.display = 'none';
    dropzone.style.display = '';
    restoreDropzone();
    // Reset to paste tab
    inputTabs.forEach(t => t.classList.toggle('active', t.dataset.method === 'paste'));
    pasteArea.style.display = '';
    fileArea.style.display = 'none';
    textarea.focus();
  });

  // --- Language Toggle ---
  function setupLangToggles() {
    document.querySelectorAll('.lang-toggle').forEach(toggle => {
      toggle.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const lang = btn.dataset.lang;
          switchLanguage(lang);
        });
      });
    });
  }

  function switchLanguage(lang) {
    T.setLang(lang);

    // Sync all toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update landing page static text
    updateLandingText();

    // Update sidebar nav labels
    updateSidebarNav();

    // Update sidebar phase labels
    updatePhaseLabels();

    // Re-analyze and re-render results if we have data
    if (lastAnalysisData && lastText) {
      const data = Analyzer.analyze(lastText, lang);
      lastAnalysisData = data;
      document.getElementById('role-title-header').textContent = data.analysis.title;
      Renderer.renderAll(data);
      setupScrollSpy();
      setupResultsInteractivity(true);
      // Restore star scores
      Object.entries(scorecardScores).forEach(([row, val]) => {
        const rating = document.querySelector(`.star-rating[data-row="${row}"]`);
        if (rating) {
          rating.querySelectorAll('.star').forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.value) <= val);
          });
          const labels = T.get('starLabels');
          const label = rating.querySelector('.star-label');
          if (label) label.textContent = labels[val - 1];
        }
      });
      updateAutoRecommendation();
    }
  }

  function updateLandingText() {
    // data-t attributes: set textContent
    document.querySelectorAll('[data-t]').forEach(el => {
      const key = el.getAttribute('data-t');
      const val = T.get(key);
      if (val && val !== key) {
        el.textContent = val;
      }
    });

    // data-t-html attributes: set innerHTML (for <br> tags etc)
    document.querySelectorAll('[data-t-html]').forEach(el => {
      const key = el.getAttribute('data-t-html');
      const val = T.get(key);
      if (val && val !== key) {
        el.innerHTML = val;
      }
    });

    // data-t-placeholder attributes
    document.querySelectorAll('[data-t-placeholder]').forEach(el => {
      const key = el.getAttribute('data-t-placeholder');
      const val = T.get(key);
      if (val && val !== key) {
        el.placeholder = val;
      }
    });
  }

  function updateSidebarNav() {
    const navLabels = T.get('nav');
    document.querySelectorAll('[data-t-nav]').forEach(el => {
      const key = el.getAttribute('data-t-nav');
      if (navLabels[key]) {
        el.textContent = navLabels[key];
      }
    });
  }

  function updatePhaseLabels() {
    document.querySelectorAll('.phase-label[data-t]').forEach(el => {
      const key = el.getAttribute('data-t');
      const val = T.get(key);
      if (val && val !== key) {
        el.textContent = val;
      }
    });
  }

  // --- Page Navigation ---
  function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
  }

  // --- Loading Animation ---
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // --- Scroll Spy ---
  let scrollObserver = null;

  function setupScrollSpy() {
    // Disconnect previous observer if exists
    if (scrollObserver) {
      scrollObserver.disconnect();
    }

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    scrollObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          const link = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
          if (link) link.classList.add('active');
        }
      }
    }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });

    sections.forEach(s => observer_observe(s));

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-section');
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      });
    });

    function observer_observe(section) {
      scrollObserver.observe(section);
    }
  }

  // --- Landing Sidebar Previews ---
  function setupLandingPreviews() {
    const previewLinks = document.querySelectorAll('.nav-preview-link');
    const previewPanel = document.getElementById('section-preview-panel');
    const previewIcon = document.getElementById('preview-icon');
    const previewTitle = document.getElementById('preview-title');
    const previewDesc = document.getElementById('preview-desc');
    const previewCta = document.getElementById('preview-cta');

    previewLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const key = link.dataset.preview;
        const previews = T.get('sectionPreviews');
        const info = previews[key];
        if (!info) return;

        // Update active state
        previewLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show preview
        previewIcon.textContent = info.icon;
        previewTitle.textContent = info.title;
        previewDesc.textContent = info.desc;
        previewCta.textContent = T.get('previewCta');
        previewPanel.style.display = 'block';

        // Scroll preview into view
        previewPanel.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      });
    });
  }

  // --- Star Rating Interactivity ---
  let scorecardScores = {}; // { rowIndex: score }

  // Sync all star-rating widgets for a given row across both panels
  function syncStarRow(row, val) {
    const labels = T.get('starLabels');
    document.querySelectorAll(`.star-rating[data-row="${row}"]`).forEach(rating => {
      rating.querySelectorAll('.star').forEach(s => {
        s.classList.toggle('active', val !== undefined && parseInt(s.dataset.value) <= val);
      });
      const label = rating.querySelector('.star-label');
      if (label) label.textContent = val !== undefined ? labels[val - 1] : '';
    });
    // Update floating comp highlight
    document.querySelectorAll(`.floating-comp[data-index="${row}"]`).forEach(comp => {
      comp.classList.toggle('has-score', val !== undefined);
    });
  }

  function attachStarHandlers(container) {
    if (!container) return;

    container.addEventListener('mouseover', (e) => {
      const star = e.target.closest('.star');
      if (!star) return;
      const rating = star.closest('.star-rating');
      const val = parseInt(star.dataset.value);
      rating.querySelectorAll('.star').forEach(s => {
        s.classList.toggle('hover', parseInt(s.dataset.value) <= val);
      });
    });

    container.addEventListener('mouseout', (e) => {
      const star = e.target.closest('.star');
      if (!star) return;
      const rating = star.closest('.star-rating');
      rating.querySelectorAll('.star').forEach(s => s.classList.remove('hover'));
    });

    container.addEventListener('click', (e) => {
      const star = e.target.closest('.star');
      if (!star) return;
      const rating = star.closest('.star-rating');
      const row = parseInt(rating.dataset.row);
      const val = parseInt(star.dataset.value);

      if (scorecardScores[row] === val) {
        delete scorecardScores[row];
        syncStarRow(row, undefined);
      } else {
        scorecardScores[row] = val;
        syncStarRow(row, val);
      }

      updateAutoRecommendation();
    });
  }

  function setupStarRatings() {
    attachStarHandlers(document.getElementById('scorecard-cards'));
  }

  // --- Auto-Recommendation ---
  function updateAutoRecommendation() {
    const recResult = document.getElementById('auto-rec-result');
    const recLevel = document.getElementById('auto-rec-level');
    const recAvg = document.getElementById('auto-rec-avg-num');
    const fillMsg = document.querySelector('.auto-rec-fill-msg');
    if (!recResult || !recLevel || !recAvg) return;

    const rows = document.querySelectorAll('.scorecard-row');
    const totalRows = rows.length;
    const scoredRows = Object.keys(scorecardScores).length;

    if (scoredRows === 0) {
      recResult.style.display = 'none';
      if (fillMsg) fillMsg.style.display = '';
      document.querySelectorAll('.rec-card').forEach(c => c.classList.remove('rec-active'));
      updateFloatingRecSummary();
      return;
    }

    // Calculate weighted average
    let weightedSum = 0;
    let weightTotal = 0;
    const weightMap = { critical: 3, high: 2, medium: 1 };

    rows.forEach((row, i) => {
      if (scorecardScores[i] !== undefined) {
        const w = weightMap[row.dataset.weight] || 1;
        weightedSum += scorecardScores[i] * w;
        weightTotal += w;
      }
    });

    const avg = weightTotal > 0 ? (weightedSum / weightTotal) : 0;
    const levels = T.get('autoRecLevels');

    let levelKey, levelClass;
    if (avg >= 4.5) { levelKey = 'strongHire'; levelClass = 'strong-hire'; }
    else if (avg >= 3.5) { levelKey = 'hire'; levelClass = 'hire'; }
    else if (avg >= 2.8) { levelKey = 'leanHire'; levelClass = 'lean-hire'; }
    else if (avg >= 2.0) { levelKey = 'leanNo'; levelClass = 'lean-no'; }
    else { levelKey = 'noHire'; levelClass = 'no-hire'; }

    recLevel.textContent = levels[levelKey];
    recLevel.className = 'auto-rec-level ' + levelClass;
    recAvg.textContent = avg.toFixed(1);

    if (fillMsg) fillMsg.style.display = 'none';
    recResult.style.display = '';

    // Highlight matching rec-card
    document.querySelectorAll('.rec-card').forEach(card => {
      card.classList.remove('rec-active');
    });
    const activeCard = document.querySelector(`.rec-card[data-rec-level="${levelClass}"]`);
    if (activeCard) {
      activeCard.classList.add('rec-active');
      // Update the badge avg
      const badge = activeCard.querySelector('.rec-active-badge strong');
      if (badge) badge.textContent = avg.toFixed(1);
    }

    // Also update the recommendation textarea if it exists
    const templateSections = document.querySelectorAll('#section-summary-template .summ-card');
    templateSections.forEach(section => {
      const title = section.querySelector('.summ-card-title') || section.querySelector('h3');
      if (title && (title.textContent.includes('Rekommendation') || title.textContent.includes('Recommendation'))) {
        const ta = section.querySelector('.template-textarea');
        if (ta && !ta.dataset.userEdited) {
          ta.value = `${levels[levelKey]} (${T.get('autoRecAvg')}: ${avg.toFixed(1)}/5)`;
        }
      }
    });

    updateFloatingRecSummary();
  }

  // --- Notes Extraction ---
  function setupNotesExtraction() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#extract-notes-btn')) {
        extractNotes();
      }
      if (e.target.closest('#clear-notes-btn')) {
        const textarea = document.getElementById('interview-notes');
        if (textarea) textarea.value = '';
        const status = document.getElementById('extract-status');
        if (status) status.style.display = 'none';
      }
    });

    // Mark template textareas as user-edited when typed in
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('template-textarea')) {
        e.target.dataset.userEdited = 'true';
      }
    });
  }

  function extractNotes() {
    const notesArea = document.getElementById('interview-notes');
    const status = document.getElementById('extract-status');
    if (!notesArea || !notesArea.value.trim()) return;

    const text = notesArea.value.trim();
    const lines = text.split('\n').filter(l => l.trim());

    // --- Extract to summary template ---
    const templateSections = document.querySelectorAll('#section-summary-template .summ-card');
    let matchedTemplate = 0;

    // Each section has:
    //   prefixes: line-start markers that route with high confidence (checked with startsWith)
    //   keywords: broader terms matched anywhere in the line
    // A line can match multiple sections only via keywords; prefix match is exclusive.
    const sectionRules = [
      {
        // Helhetsintryck / Overall Impression
        titles: ['Helhetsintryck', 'Overall Impression'],
        prefixes: ['helhetsintryck:', 'overall:', 'övergripande:', 'sammanfattning:', 'summering:', 'summary:', 'impression:', 'generellt:', 'general:'],
        keywords: ['helhetsintryck', 'overall impression', 'övergripande bedömning', 'sammanfattningsvis', 'sammantaget', 'totalt sett', 'på det hela', 'generellt sett', 'slutsats', 'min bedömning', 'my assessment', 'in summary', 'all in all', 'on the whole', 'bottom line']
      },
      {
        // Nyckelstyrkor / Key Strengths
        titles: ['Nyckelstyrkor', 'Key Strengths'],
        prefixes: ['styrka:', 'styrkor:', 'strength:', 'strengths:', 'plus:', 'fördel:', 'fördelar:', 'bra:', 'positivt:', 'imponerande:', '+:'],
        keywords: ['styrka', 'strength', 'imponera', 'utmärk', 'excellent', 'outstanding', 'fantastisk', 'exceptional', 'superb', 'gedigen', 'övertygande', 'convincing', 'kompetent', 'skicklig', 'duktig', 'talang', 'uppvisar', 'demonstrerade', 'visade prov', 'väl utvecklad', 'impressed', 'strong suit', 'highlight', 'lysande', 'mycket bra', 'överträffa', 'exceeded', 'leverera', 'delivered', 'nailed', 'fördel']
      },
      {
        // Farhågor & luckor / Concerns & Gaps
        titles: ['Farhågor', 'Concerns'],
        prefixes: ['svaghet:', 'svagheter:', 'weakness:', 'weaknesses:', 'oro:', 'concern:', 'risk:', 'minus:', 'negativt:', 'problem:', 'brist:', 'gap:', 'varning:', 'warning:', 'flag:', 'röd flagg:', 'red flag:', '-:'],
        keywords: ['svaghet', 'weakness', 'oro ', 'orolig', 'concern', 'brist', 'sakna', 'saknas', 'gap', 'risk', 'tveksam', 'tveksamhet', 'hesitant', 'uncertain', 'osäker', 'otydlig', 'vag svar', 'vague', 'unclear', 'undvik', 'avoided', 'inte kunna', 'could not', 'couldn\'t', 'unable', 'struggled', 'problematisk', 'problemat', 'röd flagg', 'red flag', 'varning', 'warning', 'bristfällig', 'insufficient', 'inadequate', 'limited experience', 'begränsad', 'ej erfarenhet', 'saknar erfarenhet', 'no experience', 'inte visat', 'did not show', 'missade', 'missed', 'förbättr', 'improve', 'utvecklingsområde', 'nackdel']
      },
      {
        // Teknisk passning / Technical Fit
        titles: ['Teknisk', 'Technical'],
        prefixes: ['teknisk:', 'tekniskt:', 'tech:', 'technical:', 'kod:', 'code:', 'arkitektur:', 'architecture:', 'system:', 'infrastruktur:', 'infra:', 'stack:', 'verktyg:'],
        keywords: ['teknisk', 'technical', 'kodkvalitet', 'kodning', 'kodgranskning', 'code review', 'code quality', 'codebase', 'programmering', 'programming', 'arkitektur', 'architect', 'system design', 'systemdesign', 'databas', 'database', 'sql', 'api', 'backend', 'frontend', 'fullstack', 'full-stack', 'ramverk', 'framework', 'react', 'angular', 'vue', 'node.js', 'python', 'java ', 'typescript', 'javascript', 'devops', 'ci/cd', 'pipeline', 'deploy', 'infrastruktur', 'infrastructure', 'moln', 'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'microservice', 'monolith', 'legacy', 'refaktor', 'refactor', 'algoritm', 'algorithm', 'git', 'versionshantering', 'testning', 'testing', 'debugging', 'debug', 'server', 'skalbar', 'scalab', 'prestanda', 'performance', 'säkerhet', 'security', 'implementer', 'implement']
      },
      {
        // Teampassning / Team Fit
        titles: ['Teampassning', 'Team Fit'],
        prefixes: ['team:', 'teamarbete:', 'teamwork:', 'samarbete:', 'collaboration:', 'kultur:', 'culture:', 'grupp:', 'kolleg:'],
        keywords: ['team', 'samarbete', 'collaborat', 'kolleg', 'colleague', 'grupp', 'group', 'kultur', 'culture', 'arbetssätt', 'working style', 'work style', 'passar in', 'fit in', 'komplement', 'complement', 'tillför', 'contribute', 'dynamik', 'dynamic', 'agil', 'agile', 'scrum', 'sprint', 'tvärfunktion', 'cross-function', 'inkluder', 'inclusive', 'respekt', 'respect', 'öppen', 'open', 'feedback', 'hjälpsam', 'helpful', 'stödj', 'support', 'konflikt', 'conflict', 'medhåll', 'consensus', 'anpass', 'adapt', 'flexib', 'atmosfär', 'environment', 'miljö', 'trivs', 'thrive', 'passa', 'mesh', 'gemenskap', 'belong']
      },
      {
        // Kommunikation / Communication
        titles: ['Kommunikation', 'Communication'],
        prefixes: ['kommunikation:', 'communication:', 'comm:', 'presentation:', 'present:'],
        keywords: ['kommunik', 'communicat', 'tydlig', 'otydlig', 'unclear', 'artikuler', 'articulat', 'lyssnade', 'listened', 'lyssnande', 'listening', 'presenterade', 'presented', 'presentation', 'förklara', 'explain', 'uttryck', 'express', 'formuler', 'formulat', 'resonera', 'reason', 'övertygande', 'persuasi', 'retorisk', 'rhetor', 'verbal', 'skriftlig', 'written', 'koncis', 'concise', 'ordrik', 'verbose', 'nervös', 'nervous', 'självsäker', 'confident', 'karisma', 'charisma', 'engagerande', 'engaging', 'dialog', 'dialogue', 'berättande', 'storytell', 'samtal', 'conversation', 'svarade', 'answered', 'välformulerad', 'well-spoken']
      },
      {
        // Tillväxtpotential / Growth Potential
        titles: ['Tillväxtpotential', 'Growth'],
        prefixes: ['tillväxt:', 'growth:', 'potential:', 'utveckling:', 'development:', 'framtid:', 'future:'],
        keywords: ['tillväxt', 'growth', 'potential', 'utvecklas', 'utveckling', 'develop further', 'lära sig', 'learn', 'nyfiken', 'curious', 'ambitiös', 'ambitious', 'motiverad', 'motivated', 'framtid', 'future', 'karriärplan', 'career plan', 'career path', 'befordra', 'promot', 'avancer', 'advanc', 'tech lead', 'senior roll', 'ledarroll', 'ramp up', 'mentor', 'coacha', 'coach', 'utbild', 'training', 'kurva', 'curve', 'mognad', 'maturity', 'växa', 'grow']
      },
      {
        // Rekommendation / Recommendation
        titles: ['Rekommendation', 'Recommendation'],
        prefixes: ['rekommendation:', 'recommendation:', 'beslut:', 'decision:', 'verdict:'],
        keywords: ['rekommend', 'recommend', 'strong hire', 'stark hire', 'no hire', 'lean hire', 'lean no', 'anställ', 'hire', 'avslå', 'reject', 'erbjudande', 'offer', 'beslut', 'decision', 'verdict', 'slutgiltig', 'final']
      },
      {
        // Nästa steg / Next Steps
        titles: ['Nästa steg', 'Next Steps'],
        prefixes: ['nästa steg:', 'next step:', 'next steps:', 'uppföljning:', 'follow-up:', 'åtgärd:', 'action:'],
        keywords: ['nästa steg', 'next step', 'uppföljning', 'follow up', 'follow-up', 'referenskontroll', 'referenstagning', 'reference check', 'andra intervju', 'second interview', 'tekniskt test', 'technical test', 'case-uppgift', 'prövotid', 'probation', 'erbjudande', 'offer', 'avvakta', 'wait', 'återkoppla', 'get back', 'kontakta', 'contact', 'bakgrundskontroll', 'background check', 'löneförhandling', 'salary negotiation', 'startdatum', 'start date', 'onboarding', 'åtgärd', 'action item', 'boka ', 'schedule']
      }
    ];

    // Two-pass matching:
    // Pass 1: Identify lines that start with a known prefix — route exclusively to that section
    // Pass 2: Remaining lines matched by keywords (can go to multiple sections)

    // Build section-to-textarea map
    const sectionMap = [];
    templateSections.forEach(section => {
      const titleEl = section.querySelector('.summ-card-title') || section.querySelector('h3');
      if (!titleEl) return;
      const title = titleEl.textContent;
      const textarea = section.querySelector('.template-textarea');
      if (!textarea || textarea.dataset.userEdited) return;
      const rule = sectionRules.find(r => r.titles.some(t => title.includes(t)));
      if (!rule) return;
      sectionMap.push({ rule, textarea, matched: [] });
    });

    // Pass 1: prefix-based exclusive routing
    const prefixMatched = new Set(); // line indices that already matched via prefix
    lines.forEach((line, lineIdx) => {
      const lower = line.toLowerCase().trim();
      for (const entry of sectionMap) {
        if (entry.rule.prefixes.some(p => lower.startsWith(p))) {
          entry.matched.push(line.trim());
          prefixMatched.add(lineIdx);
          break; // exclusive: only one section per prefix match
        }
      }
    });

    // Pass 2: keyword matching for non-prefix lines
    lines.forEach((line, lineIdx) => {
      if (prefixMatched.has(lineIdx)) return;
      const lower = line.toLowerCase().trim();
      for (const entry of sectionMap) {
        if (entry.rule.keywords.some(kw => lower.includes(kw))) {
          entry.matched.push(line.trim());
        }
      }
    });

    // Apply results
    sectionMap.forEach(entry => {
      if (entry.matched.length > 0) {
        const existing = entry.textarea.value.trim();
        entry.textarea.value = existing ? existing + '\n' + entry.matched.join('\n') : entry.matched.join('\n');
        matchedTemplate += entry.matched.length;
      }
    });

    // Show status
    if (status) {
      status.textContent = T.get('extractSuccess') + ` (${matchedTemplate} ${T.getLang() === 'sv' ? 'rader matchade' : 'lines matched'})`;
      status.style.display = 'block';
      setTimeout(() => { status.style.display = 'none'; }, 4000);
    }
  }

  // --- Section Toggles ---
  function setupSectionToggles() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Remove existing toggles to avoid duplicates on re-render
    sidebar.querySelectorAll('.section-toggle').forEach(t => t.remove());

    const navLinks = sidebar.querySelectorAll('.nav-link[data-section]');

    navLinks.forEach(link => {
      const sectionId = link.dataset.section;

      // Create toggle inside the nav-link
      const toggle = document.createElement('label');
      toggle.className = 'section-toggle';
      toggle.title = T.get('toggleHide');
      toggle.innerHTML = `<input type="checkbox" checked><span class="toggle-slider"></span>`;
      toggle.addEventListener('click', (e) => e.stopPropagation());

      const checkbox = toggle.querySelector('input');
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        const section = document.getElementById(sectionId);
        if (!section) return;

        if (checkbox.checked) {
          section.classList.remove('section-hidden');
          link.classList.remove('section-disabled');
          toggle.title = T.get('toggleHide');
        } else {
          section.classList.add('section-hidden');
          link.classList.add('section-disabled');
          toggle.title = T.get('toggleShow');
        }
      });

      link.appendChild(toggle);
    });
  }

  // --- Floating Scorecard Panel ---
  function buildFloatingScorecard() {
    const body = document.getElementById('floating-scorecard-body');
    if (!body) return;

    const rows = document.querySelectorAll('.scorecard-row');
    const labels = T.get('starLabels');
    const catLabels = T.get('catLabels');

    let html = '';
    rows.forEach((row, i) => {
      const name = row.dataset.compName;
      const weight = row.dataset.weight;
      html += `
        <div class="floating-comp" data-index="${i}">
          <div class="floating-comp-top">
            <span class="floating-comp-name">${name}</span>
            <span class="weight-badge weight-${weight}">${weight}</span>
          </div>
          <div class="star-rating" data-row="${i}">
            ${[1,2,3,4,5].map(n => `<span class="star" data-value="${n}" title="${labels[n-1]}">★</span>`).join('')}
            <span class="star-label" data-row="${i}"></span>
          </div>
        </div>`;
    });

    body.innerHTML = html;
    attachStarHandlers(body);

    // Restore any existing scores
    Object.entries(scorecardScores).forEach(([row, val]) => {
      syncStarRow(row, val);
    });
  }

  function updateFloatingRecSummary() {
    const footer = document.getElementById('floating-scorecard-footer');
    if (!footer) return;

    const scoredCount = Object.keys(scorecardScores).length;
    if (scoredCount === 0) {
      footer.innerHTML = `<div class="floating-rec-empty" data-t="autoRecFill">${T.get('autoRecFill')}</div>`;
      return;
    }

    const rows = document.querySelectorAll('.scorecard-row');
    const weightMap = { critical: 3, high: 2, medium: 1 };
    let weightedSum = 0, weightTotal = 0;

    rows.forEach((row, i) => {
      if (scorecardScores[i] !== undefined) {
        const w = weightMap[row.dataset.weight] || 1;
        weightedSum += scorecardScores[i] * w;
        weightTotal += w;
      }
    });

    const avg = weightTotal > 0 ? (weightedSum / weightTotal) : 0;
    const levels = T.get('autoRecLevels');
    let levelKey, levelClass;
    if (avg >= 4.5) { levelKey = 'strongHire'; levelClass = 'strong-hire'; }
    else if (avg >= 3.5) { levelKey = 'hire'; levelClass = 'hire'; }
    else if (avg >= 2.8) { levelKey = 'leanHire'; levelClass = 'lean-hire'; }
    else if (avg >= 2.0) { levelKey = 'leanNo'; levelClass = 'lean-no'; }
    else { levelKey = 'noHire'; levelClass = 'no-hire'; }

    footer.innerHTML = `
      <div class="floating-rec-summary">
        <span class="floating-rec-level ${levelClass}">${levels[levelKey]}</span>
        <span class="floating-rec-avg"><strong>${avg.toFixed(1)}</strong> / 5</span>
      </div>`;
  }

  function setupFloatingPanel() {
    const toggleBtn = document.getElementById('scorecard-panel-toggle');
    const panel = document.getElementById('floating-scorecard');
    const closeBtn = document.getElementById('floating-scorecard-close');
    if (!toggleBtn || !panel) return;

    toggleBtn.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      toggleBtn.classList.toggle('panel-open', isOpen);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
        toggleBtn.classList.remove('panel-open');
      });
    }
  }

  function showFloatingToggle(show) {
    const btn = document.getElementById('scorecard-panel-toggle');
    if (btn) btn.style.display = show ? 'flex' : 'none';
  }


  // --- Post-render setup (called after Renderer.renderAll) ---
  function setupResultsInteractivity(preserveScores) {
    setupStarRatings();
    setupSectionToggles();
    buildFloatingScorecard();
    showFloatingToggle(true);
    if (!preserveScores) {
      scorecardScores = {};
    }
  }

  async function runAnalysis(text) {
    showPage('loading');
    const statusEl = document.getElementById('loading-status');
    const loadingMessages = T.get('loadingSteps');

    for (let i = 0; i < loadingMessages.length; i++) {
      statusEl.textContent = loadingMessages[i];
      await sleep(300 + Math.random() * 200);
    }

    const data = Analyzer.analyze(text, T.getLang());
    lastAnalysisData = data;

    document.getElementById('role-title-header').textContent = data.analysis.title;
    Renderer.renderAll(data);

    showPage('results');
    mainContent.scrollTop = 0;
    window.scrollTo(0, 0);

    setupScrollSpy();
    setupResultsInteractivity();
  }

  // --- Init ---
  setupLangToggles();
  setupLandingPreviews();
  updateLandingText();
  setupNotesExtraction();
  setupFloatingPanel();
})();
