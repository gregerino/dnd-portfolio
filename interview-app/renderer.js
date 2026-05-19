const Renderer = (() => {

  function tipBox(textKey, type) {
    const label = type === 'coach' ? T.get('coachLabel') : T.get('tipLabel');
    const cls = type === 'coach' ? 'coach-box' : 'tip-box';
    return `<div class="${cls}"><strong>${label}:</strong> ${T.get(textKey)}</div>`;
  }

  function renderGuide(data) {
    return `
      <div class="section-header">
        <span class="section-number">📖</span>
        <h2>${T.get('guideTitle')}</h2>
        <p>${T.get('guideDesc')}</p>
      </div>

      <div class="guide-welcome">
        <p>${T.get('guideWelcome')}</p>
      </div>

      <div class="card">
        <h3>${T.get('guideStepsTitle')}</h3>
        <div class="guide-steps">
          <div class="guide-step">
            <div class="guide-step-num">1</div>
            <div>
              <h4>${T.get('guideStep1')}</h4>
              <p>${T.get('guideStep1Desc')}</p>
            </div>
          </div>
          <div class="guide-step">
            <div class="guide-step-num">2</div>
            <div>
              <h4>${T.get('guideStep2')}</h4>
              <p>${T.get('guideStep2Desc')}</p>
            </div>
          </div>
          <div class="guide-step">
            <div class="guide-step-num">3</div>
            <div>
              <h4>${T.get('guideStep3')}</h4>
              <p>${T.get('guideStep3Desc')}</p>
            </div>
          </div>
          <div class="guide-step">
            <div class="guide-step-num">4</div>
            <div>
              <h4>${T.get('guideStep4')}</h4>
              <p>${T.get('guideStep4Desc')}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card golden-rules">
        <h3>${T.get('guidePrinciplesTitle')}</h3>
        <div class="principle">
          <div class="principle-num">1</div>
          <p>${T.get('guidePrinciple1')}</p>
        </div>
        <div class="principle">
          <div class="principle-num">2</div>
          <p>${T.get('guidePrinciple2')}</p>
        </div>
        <div class="principle">
          <div class="principle-num">3</div>
          <p>${T.get('guidePrinciple3')}</p>
        </div>
      </div>
    `;
  }

  function renderSummary(data) {
    const { analysis } = data;
    const allTech = Object.values(analysis.techSkills).flat();
    const seniorityLabel = T.get('seniority')[analysis.seniority];
    const collabLabel = T.get('collabLevel')[analysis.collaboration.level];
    const leaderLabel = T.get('leaderLevel')[analysis.leadership.level];

    let bullets = [];
    if (analysis.responsibilities.length > 0) {
      bullets = analysis.responsibilities.slice(0, 8);
    }

    return `
      <div class="section-header">
        <span class="section-number">📄</span>
        <h2>${T.get('s1Title')}</h2>
        <p>${T.get('s1Desc')}</p>
      </div>

      ${tipBox('s1Coach', 'coach')}

      <div class="card">
        <h3>${esc(analysis.title)}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 16px">
          <span class="tag tag-purple">${esc(seniorityLabel)}</span>
          <span class="tag tag-blue">${T.get('collaboration')}: ${esc(collabLabel)}</span>
          <span class="tag tag-${analysis.leadership.present ? 'amber' : 'gray'}">${T.get('leadership')}: ${esc(leaderLabel)}</span>
          <span class="tag tag-green">${esc(analysis.techVsSoft)}</span>
        </div>

        ${bullets.length > 0 ? `
        <h4>${T.get('keyResp')}</h4>
        <ul>${bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        ` : ''}

        ${allTech.length > 0 ? `
        <h4>${T.get('techSkills')}</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
          ${allTech.map(t => `<span class="tag tag-purple">${esc(t)}</span>`).join('')}
        </div>
        ` : ''}

        ${analysis.softSkills.length > 0 ? `
        <h4>${T.get('softSkills')}</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
          ${analysis.softSkills.map(s => `<span class="tag tag-blue">${esc(s)}</span>`).join('')}
        </div>
        ` : ''}
      </div>
    `;
  }

  function renderCompetencyAnalysis(data) {
    const { competencies } = data;
    const catKeys = ['technical', 'behavioral', 'leadership', 'communication', 'problemSolving'];
    const catColors = T.get('compCatColors');
    const catLabels = T.get('compCategories');
    const catIcons = { technical: '⚙️', behavioral: '🤝', leadership: '👑', communication: '💬', problemSolving: '🧩' };
    let compNum = 0;

    return `
      <div class="section-header">
        <span class="section-number">🔍</span>
        <h2>${T.get('s2Title')}</h2>
        <p>${T.get('s2Desc')}</p>
      </div>

      ${tipBox('s2Coach', 'coach')}

      ${catKeys.map(key => {
        const comps = competencies[key];
        if (!comps || comps.length === 0) return '';
        return `
          <div class="comp-category-group">
            <div class="comp-category-header">
              <span class="comp-cat-icon">${catIcons[key]}</span>
              <span class="tag tag-${catColors[key]}">${catLabels[key]}</span>
              <span class="comp-cat-count">${comps.length}</span>
            </div>
            ${comps.map(comp => {
              compNum++;
              return `
              <div class="comp-accordion" onclick="this.classList.toggle('open')">
                <div class="comp-accordion-header">
                  <div class="comp-accordion-left">
                    <span class="comp-num">${compNum}</span>
                    <div>
                      <div class="comp-accordion-name">${esc(comp.name)}</div>
                      <div class="comp-accordion-preview">${esc(comp.why).substring(0, 80)}…</div>
                    </div>
                  </div>
                  <svg class="comp-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7.5l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div class="comp-accordion-body">
                  <div class="comp-detail-grid">
                    <div class="comp-detail-item">
                      <div class="comp-detail-label">💡 ${T.get('whyMatters')}</div>
                      <p>${esc(comp.why)}</p>
                    </div>
                    <div class="comp-detail-item">
                      <div class="comp-detail-label">🎯 ${T.get('strongLooks')}</div>
                      <p>${esc(comp.strongLooks)}</p>
                    </div>
                  </div>
                  <div class="comp-detail-item" style="margin-top:12px">
                    <div class="comp-detail-label">👁️ ${T.get('observableBehaviors')}</div>
                    <div class="comp-observable-list">
                      ${comp.observable.map(o => `<span class="comp-observable-tag">• ${esc(o)}</span>`).join('')}
                    </div>
                  </div>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        `;
      }).join('')}
    `;
  }

  function renderCompetencyLibrary(data) {
    const { competencyLibrary } = data;

    const roleComps = competencyLibrary.filter(c => c.source === 'role');
    const b5Comps = competencyLibrary.filter(c => c.source === 'bigFive');

    const levelToClass = (l) => !l ? 'medium' : l.includes('high') ? 'high' : l.includes('low') ? 'low' : 'medium';

    function renderCard(comp) {
      const selectedCls = comp.selected ? 'comp-lib-selected' : 'comp-lib-deselected';
      const b5Badge = comp.source === 'bigFive'
        ? `<span class="comp-lib-badge comp-lib-badge-b5">🧠 ${T.get('personalityBased')}</span>`
        : '';
      const recBadge = comp.source === 'role'
        ? `<span class="comp-lib-badge comp-lib-badge-rec">✓ ${T.get('recommended')}</span>`
        : '';
      const b5Meter = comp.source === 'bigFive' && comp.b5Ideal
        ? (() => {
            const pctMap = { 'low': 25, 'medium-low': 35, 'medium': 50, 'medium-high': 70, 'high': 85 };
            const pct = pctMap[comp.b5Ideal] || 50;
            const cls = levelToClass(comp.b5Ideal);
            return `<div class="comp-lib-b5-info">
              <div class="comp-lib-b5-meter">
                <span class="b5-meter-label">${T.get('low')}</span>
                <div class="meter-track"><div class="meter-fill meter-${cls}" style="width:${pct}%"></div></div>
                <span class="b5-meter-label">${T.get('high')}</span>
              </div>
              <p class="comp-lib-b5-rationale">${esc(comp.b5Rationale)}</p>
            </div>`;
          })()
        : '';

      return `
        <div class="comp-lib-card ${selectedCls}" data-comp-id="${esc(comp.id)}">
          <div class="comp-lib-header">
            <div class="comp-lib-header-left">
              <label class="comp-lib-toggle" onclick="event.stopPropagation()">
                <input type="checkbox" ${comp.selected ? 'checked' : ''} data-comp-id="${esc(comp.id)}">
                <span class="comp-toggle-slider"></span>
              </label>
              <div>
                <h3>${esc(comp.name)}</h3>
                <div class="comp-lib-badges">${recBadge}${b5Badge}</div>
              </div>
            </div>
            <svg class="comp-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7.5l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="comp-lib-preview">${esc(comp.description)}</div>
          ${b5Meter}
          <div class="comp-lib-body">
            <div class="comp-levels">
              <div class="comp-level beginner">
                <div class="comp-level-bar beginner-bar"></div>
                <h5>${T.get('beginner')}</h5>
                <p>${esc(comp.levels.beginner)}</p>
              </div>
              <div class="comp-level mid">
                <div class="comp-level-bar mid-bar"></div>
                <h5>${T.get('midLevel')}</h5>
                <p>${esc(comp.levels.mid)}</p>
              </div>
              <div class="comp-level senior">
                <div class="comp-level-bar senior-bar"></div>
                <h5>${T.get('seniorLevel')}</h5>
                <p>${esc(comp.levels.senior)}</p>
              </div>
            </div>
            <div class="comp-indicators-grid">
              <div class="indicator-group positive">
                <h5>✅ ${T.get('positiveBehaviors')}</h5>
                <ul>${comp.positiveBehaviors.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
              </div>
              <div class="indicator-group risk">
                <h5>⚠️ ${T.get('riskIndicators')}</h5>
                <ul>${comp.riskIndicators.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
              </div>
            </div>
            <div class="comp-indicators-grid">
              <div class="indicator-group evidence">
                <h5>💎 ${T.get('exampleEvidence')}</h5>
                <ul>${comp.exampleEvidence.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
              </div>
              <div class="indicator-group criteria">
                <h5>📐 ${T.get('evalCriteria')}</h5>
                <ul>${comp.evaluationCriteria.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
              </div>
            </div>
          </div>
        </div>`;
    }

    return `
      <div class="section-header">
        <span class="section-number">📚</span>
        <h2>${T.get('s3Title')}</h2>
        <p>${T.get('s3Desc')}</p>
      </div>

      ${tipBox('s3Coach', 'coach')}

      <h3 class="comp-lib-group-title">${T.get('roleCompetencies')}</h3>
      <p class="comp-lib-group-desc">${T.get('roleCompetenciesDesc')}</p>
      ${roleComps.map(renderCard).join('')}

      ${b5Comps.length > 0 ? `
        <h3 class="comp-lib-group-title" style="margin-top:32px">🧠 ${T.get('bigFiveCompetencies')}</h3>
        <p class="comp-lib-group-desc">${T.get('bigFiveCompetenciesDesc')}</p>
        ${b5Comps.map(renderCard).join('')}
      ` : ''}
    `;
  }

  function renderBigFive(data) {
    const { bigFive } = data;
    const traitKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotionalStability'];
    const traitLabels = T.get('bigFiveTraits');
    const traitIcons = T.get('bigFiveIcons');

    const levelToPercent = { 'low': 25, 'medium-low': 35, 'medium': 50, 'medium-high': 70, 'high': 85 };
    const levelToClass = (l) => l.includes('high') ? 'high' : l.includes('low') ? 'low' : 'medium';

    return `
      <div class="section-header">
        <span class="section-number">🧠</span>
        <h2>${T.get('s4Title')}</h2>
        <p>${T.get('s4Desc')}</p>
      </div>

      ${tipBox('s4Coach', 'coach')}

      <div style="padding:14px 18px;background:var(--amber-dim);border:1px solid rgba(251,191,36,0.2);border-radius:var(--radius-md);margin-bottom:24px;font-size:13px;color:var(--amber)">
        <strong>${T.get('important')}</strong> ${T.get('s4Warning')}
      </div>

      <!-- Overview dashboard -->
      <div class="b5-overview">
        ${traitKeys.map(key => {
          const t = bigFive[key];
          const pct = levelToPercent[t.ideal] || 50;
          const cls = levelToClass(t.ideal);
          return `
          <div class="b5-overview-item">
            <span class="b5-overview-icon">${traitIcons[key]}</span>
            <span class="b5-overview-name">${traitLabels[key]}</span>
            <div class="b5-overview-meter">
              <div class="meter-track"><div class="meter-fill meter-${cls}" style="width:${pct}%"></div></div>
            </div>
            <span class="tag tag-${cls === 'high' ? 'green' : cls === 'low' ? 'blue' : 'amber'}" style="font-size:10px">${t.ideal}</span>
          </div>`;
        }).join('')}
      </div>

      ${traitKeys.map(key => {
        const t = bigFive[key];
        const pct = levelToPercent[t.ideal] || 50;
        const cls = levelToClass(t.ideal);
        return `
          <div class="b5-trait-card" onclick="this.classList.toggle('open')">
            <div class="b5-trait-header">
              <div class="b5-trait-left">
                <span class="b5-trait-icon">${traitIcons[key]}</span>
                <div>
                  <div class="b5-trait-name">${traitLabels[key]}</div>
                  <div class="b5-trait-summary">${esc(t.rationale).substring(0, 100)}…</div>
                </div>
              </div>
              <div class="b5-trait-right">
                <span class="tag tag-${cls === 'high' ? 'green' : cls === 'low' ? 'blue' : 'amber'}">${t.ideal}</span>
                <svg class="comp-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7.5l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </div>
            <div class="b5-trait-body">
              <div class="b5-trait-meter">
                <span class="b5-meter-label">${T.get('low')}</span>
                <div class="meter-track"><div class="meter-fill meter-${cls}" style="width:${pct}%"></div></div>
                <span class="b5-meter-label">${T.get('high')}</span>
              </div>
              <p class="b5-rationale">${esc(t.rationale)}</p>
              <div class="b5-signals-grid">
                <div class="b5-signal-group">
                  <h4>👁️ ${T.get('workplaceBehaviors')}</h4>
                  <ul>${t.behaviors.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
                </div>
                <div class="b5-signal-group">
                  <h4>🎯 ${T.get('interviewSignals')}</h4>
                  <ul>${t.signals.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    `;
  }

  function renderQuestions(data) {
    const { questions } = data;
    const catKeys = ['competency', 'situational', 'technical', 'bigFive', 'culture'];
    const questionCats = T.get('questionCats');
    let globalNum = 0;

    return `
      <div class="section-header">
        <span class="section-number">💬</span>
        <h2>${T.get('s5Title')}</h2>
        <p>${T.get('s5Desc')}</p>
      </div>

      ${tipBox('s5Coach', 'coach')}

      ${catKeys.map(key => {
        const qs = questions[key];
        if (!qs || qs.length === 0) return '';
        const cat = questionCats[key];
        return `
          <h3 style="margin:24px 0 12px;font-size:16px;font-weight:700;color:var(--text-primary)">${cat.label}</h3>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">${cat.desc}</p>
          ${qs.map(q => {
            globalNum++;
            return `
              <div class="question-card" onclick="this.classList.toggle('open')">
                <div class="question-card-header">
                  <span class="q-number">${globalNum}</span>
                  <div class="q-text">
                    <div class="question">${esc(q.q)}</div>
                    <div class="q-category"><span class="tag tag-gray">${esc(q.category)}</span></div>
                  </div>
                  <svg class="q-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7.5l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div class="question-card-body">
                  <div class="q-detail">
                    <div class="q-detail-label">${T.get('whyQuestion')}</div>
                    <p>${esc(q.why)}</p>
                  </div>
                  <div class="q-detail">
                    <div class="q-detail-label">${T.get('strongSignals')}</div>
                    <p class="signal-good">${esc(q.strong)}</p>
                  </div>
                  <div class="q-detail">
                    <div class="q-detail-label">${T.get('warningSignals')}</div>
                    <p class="signal-warn">${esc(q.warning)}</p>
                  </div>
                  <div class="q-detail">
                    <div class="q-detail-label">${T.get('followUpQ')}</div>
                    <ul>${q.followups.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        `;
      }).join('')}
    `;
  }

  function renderFollowUps(data) {
    const { followUps } = data;
    const titles = T.get('followUpTitles');

    return `
      <div class="section-header">
        <span class="section-number">🔄</span>
        <h2>${T.get('s6Title')}</h2>
        <p>${T.get('s6Desc')}</p>
      </div>

      ${tipBox('s6Coach', 'coach')}

      ${Object.entries(followUps).map(([key, group]) => `
        <div class="followup-group">
          <h3>${esc(titles[key] || group.title)}</h3>
          ${group.questions.map(q => `<div class="followup-item">${esc(q)}</div>`).join('')}
        </div>
      `).join('')}
    `;
  }

  function starRating(compId) {
    const labels = T.get('starLabels');
    return `<div class="star-rating" data-row="${esc(compId)}">
      ${[1,2,3,4,5].map(n => `<span class="star" data-value="${n}" title="${labels[n-1]}">★</span>`).join('')}
      <span class="star-label" data-row="${esc(compId)}"></span>
    </div>`;
  }

  function renderScorecard(data) {
    const { scorecard } = data;
    const catLabels = T.get('catLabels');

    return `
      <div class="section-header">
        <span class="section-number">📊</span>
        <h2>${T.get('s7Title')}</h2>
        <p>${T.get('s7Desc')}</p>
      </div>

      ${tipBox('s7Coach', 'coach')}

      <div id="scorecard-cards">
        ${scorecard.map((c) => `
          <div class="scorecard-row card" data-comp-name="${esc(c.name)}" data-comp-id="${esc(c.id)}" data-weight="${c.weight}">
            <div class="scorecard-row-top">
              <div class="scorecard-comp-info">
                <h4>${esc(c.name)}</h4>
                <div style="display:flex;gap:6px;margin-top:4px">
                  <span class="tag tag-gray">${esc(catLabels[c.category] || c.category)}</span>
                  <span class="weight-badge weight-${c.weight}">${c.weight}</span>
                </div>
              </div>
              ${starRating(c.id)}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card" style="margin-top:20px">
        <h3>${T.get('scoringGuide')}</h3>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px">
          ${T.get('scoreLabels').map(([n, label, desc]) => `
            <div style="text-align:center;padding:12px;background:var(--bg-elevated);border-radius:var(--radius-md)">
              <div style="font-size:22px;font-weight:800;color:var(--accent)">${n}</div>
              <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin:4px 0">${label}</div>
              <div style="font-size:11px;color:var(--text-muted)">${desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderSummaryTemplate() {
    const sections = T.get('templateSections');

    // Split icon from title text
    const parseTitle = (t) => {
      const match = t.match(/^(\S+)\s+(.+)$/);
      return match ? { icon: match[1], text: match[2] } : { icon: '📝', text: t };
    };

    // First section (Overall Impression) and last two (Recommendation, Next Steps) are full width
    const fullWidthIndices = new Set([0, sections.length - 2, sections.length - 1]);

    return `
      <div class="section-header">
        <span class="section-number">📝</span>
        <h2>${T.get('s8Title')}</h2>
        <p>${T.get('s8Desc')}</p>
      </div>

      ${tipBox('s8Coach', 'coach')}

      <div class="interview-notes-panel">
        <div class="notes-panel-header">
          <h3>📝 ${T.get('notesTitle')}</h3>
          <div class="notes-actions">
            <button class="btn-ghost btn-sm" id="extract-notes-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              ${T.get('extractNotes')}
            </button>
            <button class="btn-ghost btn-sm" id="clear-notes-btn">${T.get('clearNotes')}</button>
          </div>
        </div>
        <textarea id="interview-notes" class="interview-notes-textarea" placeholder="${esc(T.get('notesPlaceholder'))}" rows="6"></textarea>
        <div id="extract-status" class="extract-status" style="display:none"></div>
      </div>

      <div class="summ-grid">
        ${sections.map((s, i) => {
          const { icon, text } = parseTitle(s.title);
          const fullWidth = fullWidthIndices.has(i) ? ' summ-full-width' : '';
          return `
          <div class="summ-card${fullWidth}">
            <div class="summ-card-header">
              <span class="summ-card-icon">${icon}</span>
              <span class="summ-card-title">${esc(text)}</span>
            </div>
            <textarea class="template-textarea" data-section-index="${i}" placeholder="${esc(s.placeholder)}" rows="3"></textarea>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  function renderRecommendations() {
    const recs = T.get('recs');

    return `
      <div class="section-header">
        <span class="section-number">✅</span>
        <h2>${T.get('s10Title')}</h2>
        <p>${T.get('s10Desc')}</p>
      </div>

      ${tipBox('s10Coach', 'coach')}

      <!-- Auto-recommendation card -->
      <div id="auto-rec-card" class="auto-rec-card card" style="margin-bottom:24px">
        <h3>🎯 ${T.get('autoRecTitle')}</h3>
        <p class="auto-rec-fill-msg">${T.get('autoRecFill')}</p>
        <div id="auto-rec-result" style="display:none">
          <div class="auto-rec-level" id="auto-rec-level"></div>
          <div class="auto-rec-avg"><span>${T.get('autoRecAvg')}:</span> <strong id="auto-rec-avg-num"></strong> / 5</div>
          <p class="auto-rec-basis">${T.get('autoRecBasis')}</p>
        </div>
      </div>

      ${recs.map(r => `
        <div class="rec-card ${r.cls}" data-rec-level="${r.cls}">
          <div class="rec-label">
            ${esc(r.level)}
            <div class="rec-active-badge">✦ ${T.get('autoRecAvg')}: <strong id="rec-badge-avg-${r.cls}"></strong>/5</div>
          </div>
          <div class="rec-body">
            <h4>${T.get('typicalSignals')}</h4>
            <p>${esc(r.signals)}</p>
            <h4>${T.get('risks')}</h4>
            <p>${esc(r.risks)}</p>
            <h4>${T.get('confidenceLevel')}</h4>
            <p>${esc(r.confidence)}</p>
            <h4>${T.get('suggestedNextSteps')}</h4>
            <p>${esc(r.next)}</p>
          </div>
        </div>
      `).join('')}
    `;
  }

  function renderBias() {
    const biases = T.get('biases');

    return `
      <div class="section-header">
        <span class="section-number">⚖️</span>
        <h2>${T.get('s11Title')}</h2>
        <p>${T.get('s11Desc')}</p>
      </div>

      ${tipBox('s11Coach', 'coach')}

      <div class="bias-grid">
        ${biases.map(b => `
          <div class="bias-card">
            <div class="bias-icon">${b.icon}</div>
            <div>
              <h4>${esc(b.title)}</h4>
              <p>${esc(b.desc)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderAll(data) {
    document.getElementById('section-guide').innerHTML = renderGuide(data);
    document.getElementById('section-summary').innerHTML = renderSummary(data);
    document.getElementById('section-bias').innerHTML = renderBias();
    document.getElementById('section-competency-analysis').innerHTML = renderCompetencyAnalysis(data);
    document.getElementById('section-competency-library').innerHTML = renderCompetencyLibrary(data);
    document.getElementById('section-questions').innerHTML = renderQuestions(data);
    document.getElementById('section-followups').innerHTML = renderFollowUps(data);
    document.getElementById('section-scorecard').innerHTML = renderScorecard(data);
    document.getElementById('section-summary-template').innerHTML = renderSummaryTemplate();
    document.getElementById('section-recommendations').innerHTML = renderRecommendations();
  }

  return {
    renderAll,
    renderQuestions(data) { document.getElementById('section-questions').innerHTML = renderQuestions(data); },
    renderFollowUps(data) { document.getElementById('section-followups').innerHTML = renderFollowUps(data); },
    renderScorecard(data) { document.getElementById('section-scorecard').innerHTML = renderScorecard(data); },
    renderCompetencyLibrary(data) { document.getElementById('section-competency-library').innerHTML = renderCompetencyLibrary(data); },
  };
})();
