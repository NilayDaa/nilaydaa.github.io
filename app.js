/* ==========================================================================
   app.js — Nilay Das portfolio
   Shared interactions + interactive SOC panel + project engine.
   ========================================================================== */

/* ---------- chrome: year, motion, mobile nav, reveal ---------- */
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const motionButton = document.getElementById('motion-toggle');
const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = false;
function setMotion(paused){
  motionPaused = paused;
  document.documentElement.classList.toggle('paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
  motionButton.title = paused ? 'Resume animations' : 'Pause animations';
  motionButton.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
}
if (motionButton) {
  try { if (localStorage.getItem('nilay-motion') === 'paused') setMotion(true); } catch (_) {}
  motionButton.addEventListener('click', () => {
    setMotion(!motionPaused);
    try { localStorage.setItem('nilay-motion', motionPaused ? 'paused' : 'running'); } catch (_) {}
  });
}
motionMedia.addEventListener('change', e => setMotion(e.matches));

const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
if (menuToggle && mobileNav) {
  const closeMenu = () => { mobileNav.hidden = true; menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Open navigation'); };
  menuToggle.addEventListener('click', () => {
    const open = mobileNav.hidden;
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

document.documentElement.classList.add('js-reveal');
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const copyEmail = document.getElementById('copy-email');
if (copyEmail) copyEmail.addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText('nilaydas.ndc@gmail.com');
    status.textContent = 'Email copied';
  } catch (_) { status.textContent = 'Select the email link to send a message.'; }
});

/* ---------- about portrait parallax ---------- */
const portrait3d = document.getElementById('portrait3d');
if (portrait3d) {
  portrait3d.addEventListener('pointermove', e => {
    const r = portrait3d.getBoundingClientRect();
    const y = ((e.clientY - r.top) / r.height - .5) * 2;
    const x = ((e.clientX - r.left) / r.width - .5) * 2;
    portrait3d.style.transform = `perspective(1000px) rotateY(${8 - x * 7}deg) rotateX(${3 - y * 5}deg)`;
  });
  portrait3d.addEventListener('pointerleave', () => { portrait3d.style.transform = ''; });
}

/* ==========================================================================
   Interactive SOC panel (home hero)
   ========================================================================== */
const stage = document.getElementById('ops-stage');
if (stage) {
  const rig = document.getElementById('ops-rig');
  const rack = document.getElementById('rack');
  const ticker = document.getElementById('dash-ticker');
  const titleEl = document.getElementById('ops-title');
  const subEl = document.getElementById('ops-subtitle');
  const posEl = document.getElementById('ops-position');
  const readoutEl = document.getElementById('ops-readout-text');
  const alertText = document.getElementById('alert-text');

  const STATIONS = [
    {
      title: 'SOC LAB', sub: 'Wazuh · Suricata · TheHive · network taps',
      blades: ['WAZUH-INDEX', 'SURICATA-01', 'THEHIVE-CASE', 'AGENT-UPLINK'],
      readouts: {
        traffic: 'NETFLOW: 1,283 PPS · 2 TUNNELS',
        threats: 'CRIT — BRUTE-FORCE SSH 10.0.0.117 → 10.0.0.5',
        defense: '3 HOSTS QUARANTINED · CASE #482 OPEN'
      },
      logs: ['10.0.0.117 ssh brute-force attempt — blocked', 'suricata: TLS anomaly on 443 — flagged', 'wazuh: FIM — /etc/ssh/sshd_config modified', 'thehive: case #482 promoted to alert']
    },
    {
      title: 'SIEM DASHBOARD', sub: 'Alert pipeline · dashboards · KPI telemetry',
      blades: ['EVENT-INDEX', 'ALERT-QUEUE', 'RULE-ENGINE', 'KPI-DASH'],
      readouts: {
        traffic: 'INGEST: 94 EPS · 2.1 GB/DAY',
        threats: 'ALERT STORM: 214 FAILED LOGINS / 5 MIN',
        defense: 'PIPELINE HEALTHY · 0 DROPPED EVENTS'
      },
      logs: ['postgres: query latency 41ms — nominal', "rule 'brute_force_login' fired ×12", 'correlation: host-compromise chain candidate', 'dashboard kpi refreshed 03:00:12']
    },
    {
      title: 'ENDPOINT DEFENSE', sub: '42 agents · EDR console · patch pipeline',
      blades: ['AGENT-POOL', 'EDR-CONSOLE', 'PATCH-THRIDGE', 'REPO-MIRROR'],
      readouts: {
        traffic: 'HEARTBEAT: 42/42 AGENTS ONLINE',
        threats: 'RANSOMWARE BEHAVIOR — SCRIPT BLOCKED ON WS-014',
        defense: '42/42 AGENTS CLEAN · PATCH 98.1%'
      },
      logs: ['endpoint ws-014: lsass access attempt blocked', 'edr: parent-child chain flagged (imphash match)', 'patch thridge: KB staging complete', 'agent pool: policy push ok']
    },
    {
      title: 'CLOUD ATTACK SURFACE', sub: 'Azure · NSGs · Key Vault · RBAC',
      blades: ['NSG-RULES', 'KEY-VAULT', 'RBAC-POLICY', 'AZ-MONITOR'],
      readouts: {
        traffic: 'AZ TRAFFIC: 5 SUBS · 18 NSG FLOWS',
        threats: 'VAULT KEY-01 ACCESS SPIKE — ROTATED',
        defense: 'RBAC LOCKDOWN: OWNER = 2 PRINCIPALS'
      },
      logs: ['az monitor: nsg flowlog anomaly — 445 egress', 'key vault: access policy changed (ticket 1921)', 'rbac: role assignments reviewed weekly', 'sentinel: 3 detections onboarded']
    },
    {
      title: 'AI DEFENSE', sub: 'LLM gateway · guardrails · prompt audit',
      blades: ['LLM-GATEWAY', 'GUARDRAILS', 'PROMPT-LOG', 'EMBED-INDEX'],
      readouts: {
        traffic: 'TOKENS: 1.1M/DAY · 14 MODELS',
        threats: 'OBFUSCATED PROMPT INJECTION — BLOCKED',
        defense: 'GUARDRAILS ON · PII REDACTED · 0 BYPASSES'
      },
      logs: ['gateway: jailbreak pattern 3.2 detected — 401', 'guardrail: pii redaction engaged (20 tokens)', 'embed-index: vector db sync ok', 'audit: prompt log shipped to siem']
    }
  ];

  let station = 0;
  let mode = 'traffic';
  let logIdx = 0;

  function applyStation() {
    const s = STATIONS[station];
    stage.dataset.station = String(station);
    posEl.textContent = `0${station + 1} / 05`;
    titleEl.textContent = s.title;
    subEl.textContent = s.sub;
    rack.querySelectorAll('.blade-label').forEach((el, i) => { el.textContent = s.blades[i] || ''; });
    alertText.textContent = s.readouts.threats;
    readoutEl.textContent = s.readouts[mode];
    logIdx = 0;
    ticker.textContent = s.logs[0];
  }
  function applyMode() {
    stage.dataset.mode = mode;
    readoutEl.textContent = STATIONS[station].readouts[mode];
    document.querySelectorAll('.ops-controls button').forEach(b => {
      const on = b.dataset.mode === mode;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  document.getElementById('ops-prev').addEventListener('click', () => { station = (station + 5 - 1) % 5; applyStation(); });
  document.getElementById('ops-next').addEventListener('click', () => { station = (station + 1) % 5; applyStation(); });
  document.querySelectorAll('.ops-controls button').forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; applyMode(); }));

  setInterval(() => {
    const s = STATIONS[station];
    logIdx = (logIdx + 1) % s.logs.length;
    ticker.textContent = s.logs[logIdx];
  }, 2600);

  /* drag to rotate */
  let drag = null, rx = 26, ry = -14;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    drag = { x: e.clientX, y: e.clientY, rx, ry };
    if (e.pointerType !== 'touch') stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!drag) return;
    ry = Math.max(-65, Math.min(65, drag.ry + (e.clientX - drag.x) * .35));
    rx = Math.max(-5, Math.min(60, drag.rx - (e.clientY - drag.y) * .25));
    rig.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(-9deg)`;
  });
  const endDrag = () => { drag = null; };
  window.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);
  document.getElementById('reset-view').addEventListener('click', () => { rx = 26; ry = -14; rig.style.transform = ''; });

  applyStation();
  applyMode();
}

/* ==========================================================================
   Projects engine
   ========================================================================== */
const projectGroups = [
  { key: 'detection', label: 'DETECTION & SOC' },
  { key: 'ai', label: 'AI / ML ENGINEERING' },
  { key: 'web', label: 'WEB & AUTOMATION' }
];

const projects = [
  {
    id: 'ai-job-agent', type: 'ai', group: 'ai', label: 'AGENT / AUTOMATION',
    name: 'AI Job Agent',
    description: 'An autonomous job-hunt copilot: scrapes fresh listings with Playwright, embeds them with sentence-transformers, and scores them against my own CV — scheduled with Redis/RQ, served by FastAPI.',
    tags: ['Python', 'FastAPI', 'Playwright', 'PostgreSQL', 'Redis/RQ', 'Docker'],
    repo: 'ai-job-agent', url: 'https://github.com/NilayDaa/ai-job-agent',
    notes: [
      'How to turn a boring daily task (scanning job boards) into a scheduled pipeline instead of a script: queue, worker, persistent store.',
      'Embedding + cosine similarity is a genuinely better CV-to-posting matcher than keyword grep — it catches postings that mean the same thing with different words.',
      'A side effect of running it: I now treat my CV as a data model, and every resume edit is a schema migration.'
    ],
    status: 'FLAGSHIP — RUNNING DAILY, MATCHING ME WITH FRESH FINNISH POSTINGS.'
  },
  {
    id: 'lorris-online', type: 'web', group: 'web', label: 'WEB / GAME',
    name: 'Lorris Online',
    description: 'A live 3v3 trick-taking card game: Java/Spring on the backend, React on the front, real-time rooms. My first shipped web app — and my favourite place to test the networking behaviours I read about in class.',
    tags: ['Java', 'Spring', 'React', 'WebSockets', 'MySQL'],
    repo: 'lorris', url: 'https://lorris.nilaydas.com', repoUrl: 'https://github.com/NilayDaa/lorris',
    notes: [
      'Session and live-update bugs surface fast when an opponent drops mid-match — reconnect logic became a small project of its own.',
      'WebSockets in production taught me more about state consistency than any tutorial: the server is the source of truth, the client is a liar.',
      'Now used as a playground — my AI agents play 3v3 against me while I watch the traffic.'
    ],
    status: 'LIVE SINCE 2025 — PLAYABLE AT LORRIS.NILAYDAS.COM.'
  },
  {
    id: 'cyber-roadmap', type: 'web', group: 'web', label: 'AUTOMATION / STUDY',
    name: 'Cyber-Sec & AI Cloud Roadmap',
    description: 'A 12-week, 72-task self-study program covering SOC operations, Azure, DevSecOps and AI security — generated and tracked entirely by a GitHub Actions scheduler as an issue checklist.',
    tags: ['GitHub Actions', 'Python', 'Automation', 'Checklist', 'Public'],
    repo: 'cybersec-cloud-ai-roadmap', url: 'https://github.com/NilayDaa/cybersec-cloud-ai-roadmap',
    notes: [
      'Consistency beats intensity: the scheduler opens today\'s tasks, the repo says whether yesterday got done.',
      'Because every day is a tracked issue, the whole plan is auditable — recruiters can see 72 days of evidence, not a promise.',
      'Splitting the plan into six tracks (SOC, Azure, DevSecOps, AI/LLM, AI security, labs) keeps each week coherent.'
    ],
    status: 'RUNNING — 72/72 TASKS PRE-OPENED, DAILY CHECKLIST ACTIVE.'
  },
  {
    id: 'wazuh-soc-lab', type: 'detection', group: 'detection', label: 'DETECTION / SOC',
    name: 'Wazuh SOC Home Lab',
    description: 'A Wazuh-based detection environment I run for practice: agents, custom rules and alerts, tuned against common attack scenarios and mapped to MITRE ATT&CK.',
    tags: ['Wazuh', 'SIEM', 'Linux', 'MITRE ATT&CK', 'Rule tuning'],
    repo: '', url: '',
    notes: [
      'Alert fatigue is the real enemy: every rule I write has to justify itself against the noise it generates.',
      'Labbing brute-force and webshell scenarios lets me see what the detection signals actually look like before an attacker does it for real.',
      'Mapping detections to ATT&CK techniques keeps the collection honest — it shows which parts of the kill chain I can currently see.'
    ],
    status: 'ONGOING PRACTICE LAB — DETECTION RULES ITERATED WEEKLY.'
  },
  {
    id: 'threat-hunting', type: 'detection', group: 'detection', label: 'DETECTION / SOC',
    name: 'Threat-Hunting Practice',
    description: 'Daily log triage and hunting drills: suspicious login patterns, C2-style beacons and odd egress traffic — written up after every exercise.',
    tags: ['Log analysis', 'Sigma', 'Suricata', 'Triage', 'Writing'],
    repo: '', url: '',
    notes: [
      'The habit loop: hunt a scenario, write the finding down, teach the machine the rule. Understanding beats tool-hopping.',
      'Sigma-first thinking makes detections portable — same rule idea anywhere, not vendor-locked.',
      'Egress anomalies are the highest-signal thing a beginner can actually find: most lab traffic should not be phoning home.'
    ],
    status: 'ONGOING — LOGGED IN THE LEARNING REPO WEEKLY.'
  },
  {
    id: 'llm-security', type: 'ai', group: 'ai', label: 'AI / SECURITY',
    name: 'LLM & AI Security Notes',
    description: 'Prompts, red teaming and guardrails for AI-enabled applications: OWASP LLM Top 10, prompt-injection testing and secure RAG design — tried against my own prototypes.',
    tags: ['OWASP LLM Top 10', 'Red teaming', 'RAG', 'Prompt injection'],
    repo: '', url: '',
    notes: [
      'Injection is the new injection: an LLM that cannot tell instructions from data is a security bug in prose form.',
      'Guardrails are the SOC playbook applied to models — monitor, log, alert, block — with the same triage discipline.',
      'PII redaction at the gateway beats praying the model is careful: controls belong where you can inspect them.'
    ],
    status: 'ON THE ROADMAP — GUARDRAIL DEMO BUILT FOR MY OWN FASTAPI APP.'
  }
];

function svgStyle(c) {
  return `<style>.pv-flow{fill:none;stroke:${c};stroke-width:1.6;stroke-dasharray:6 9;animation:pvflow 1.4s linear infinite}@keyframes pvflow{to{stroke-dashoffset:-30}}.pv-blink{animation:pvblink 1.7s ease-in-out infinite}.pv-blink2{animation:pvblink 1.7s ease-in-out infinite;animation-delay:-.85s}@keyframes pvblink{0%,100%{opacity:.15}50%{opacity:1}}.pv-sway{animation:pvsway 6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes pvsway{0%,100%{transform:translateY(2px)}50%{transform:translateY(-5px)}}.pv-bar{animation:pvbar 2.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:bottom}@keyframes pvbar{from{transform:scaleY(.35)}to{transform:scaleY(1)}}</style>`;
}

function detectionVisual() {
  return `<svg viewBox="0 0 320 150" aria-hidden="true">${svgStyle('#e0b45f')}
    <rect x="14" y="18" width="292" height="116" rx="6" fill="#10170f" stroke="#3f4a3c"/>
    <rect x="14" y="18" width="292" height="22" rx="6" fill="#1a241b" stroke="#3f4a3c"/><circle cx="26" cy="29" r="3" fill="#ff6a5a"/><circle cx="37" cy="29" r="3" fill="#ffc857"/><circle cx="48" cy="29" r="3" fill="#9be564"/>
    <text x="66" y="32.5" font="8px monospace" fill="#6f8274">wazuh.log — live tail</text>
    <g font="8px monospace">
      <text x="26" y="62" fill="#9aa99c">[triage] 10.0.0.117 ssh attempt — blocked</text>
      <text x="26" y="80" fill="#9aa99c">[rule] brute_force ×12 in 60s <tspan class="pv-blink" fill="#ff6a5a">▲ escalate</tspan></text>
      <text x="26" y="98" fill="#7f918a">[fim] sshd_config modified — verifying baseline</text>
      <rect class="pv-flow" x="26" y="104" width="160" height="0"/>
    </g>
    <g class="pv-blink"><rect x="240" y="52" width="58" height="14" fill="none" stroke="#ff6a5a"/><text x="269" y="62" text-anchor="middle" font="8px monospace" fill="#ff6a5a">ALERT ×12</text></g>
    <g class="pv-bar"><rect x="230" y="98" width="12" height="26" fill="#ffc857" opacity=".85"/></g>
    <g class="pv-bar" style="animation-delay:-.7s"><rect x="248" y="98" width="12" height="26" fill="#e0b45f" opacity=".75"/></g>
    <g class="pv-bar" style="animation-delay:-1.4s"><rect x="266" y="98" width="12" height="26" fill="#9be564" opacity=".8"/></g>
  </svg>`;
}

function aiVisual() {
  return `<svg viewBox="0 0 320 150" aria-hidden="true">${svgStyle('#e0b45f')}
    <g class="pv-sway">
      <circle cx="60" cy="75" r="16" fill="none" stroke="#e0b45f" stroke-width="1.6"/>
      <text x="60" y="79" text-anchor="middle" font="7px monospace" fill="#c8a35c">CV</text>
      <circle cx="160" cy="38" r="13" fill="none" stroke="#c8a35c"/><text x="160" y="42" text-anchor="middle" font="7px monospace" fill="#b39a58">EMB</text>
      <circle cx="250" cy="38" r="13" fill="none" stroke="#c8a35c"/><text x="250" y="42" text-anchor="middle" font="7px monospace" fill="#b39a58">JOB</text>
      <rect x="138" y="82" width="44" height="24" rx="4" fill="#10170f" stroke="#5b6e52"/><text x="160" y="97" text-anchor="middle" font="7px monospace" fill="#9aa99c">RANK</text>
    </g>
    <path class="pv-flow" d="M74 72 C 108 62, 132 50, 148 42"/>
    <path class="pv-flow" d="M172 42 C 196 32, 218 34, 238 39" style="animation-delay:-.5s"/>
    <path class="pv-flow" d="M160 52 C 156 64, 152 74, 150 82"/>
    <g class="pv-blink"><circle cx="160" cy="104" r="4" fill="#9be564"/><text x="168" y="107" font="7px monospace" fill="#9be564">0.94 match</text></g>
    <g class="pv-blink2"><circle cx="252" cy="66" r="4" fill="#ffc857"/><text x="262" y="69" font="7px monospace" fill="#c8a35c">fetched</text></g>
  </svg>`;
}

function webVisual() {
  return `<svg viewBox="0 0 320 150" aria-hidden="true">${svgStyle('#e0b45f')}
    <g class="pv-sway">
      <rect x="20" y="26" width="170" height="104" rx="6" fill="#10170f" stroke="#3f4a3c"/>
      <rect x="20" y="26" width="170" height="20" rx="6" fill="#1a241b" stroke="#3f4a3c"/><circle cx="32" cy="36" r="2.6" fill="#ff6a5a"/><circle cx="42" cy="36" r="2.6" fill="#ffc857"/><circle cx="52" cy="36" r="2.6" fill="#9be564"/>
      <text x="66" y="39.5" font="8px monospace" fill="#6f8274">lorris.nilaydas.com</text>
      <g font="7px monospace" fill="#9aa99c"><text x="34" y="70">room: helsinki-3v3</text><text x="34" y="86">players: 6/6</text><text x="34" y="102" fill="#c8a35c">status: <tspan class="pv-blink" fill="#9be564">● live</tspan></text></g>
    </g>
    <g class="pv-blink"><rect x="228" y="40" width="60" height="22" rx="4" fill="#10170f" stroke="#5b6e52"/><text x="258" y="55" text-anchor="middle" font="7px monospace" fill="#9aa99c">client</text></g>
    <g class="pv-blink2"><rect x="228" y="92" width="60" height="22" rx="4" fill="#10170f" stroke="#5b6e52"/><text x="258" y="107" text-anchor="middle" font="7px monospace" fill="#9aa99c">server</text></g>
    <path class="pv-flow" d="M258 52 C 240 64, 210 66, 194 72"/>
    <path class="pv-flow" d="M258 92 C 240 80, 208 80, 194 74" style="animation-delay:-.7s"/>
  </svg>`;
}

const visualByType = { detection: detectionVisual, ai: aiVisual, web: webVisual };

function projectCard(p, i) {
  const gh = p.repo ? `href="${p.url}"` : '';
  const ghLabel = p.repo ? 'GitHub ↗' : '';
  return `<article class="project-card reveal" data-category="${p.type}" data-project="${p.id}">
    <div class="project-visual"><span class="visual-label">${p.label}</span>${visualByType[p.type]()}<span class="visual-caption">ILLUSTRATIVE WORKFLOW</span></div>
    <div class="project-body"><span class="project-index">${String(i + 1).padStart(2, '0')} / ${p.type.toUpperCase()}</span><h4>${p.name}</h4><p>${p.description}</p>
      <div class="tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
      <div class="project-links"><button type="button" data-project="${p.id}" aria-label="Read project notes for ${p.name}">Project notes ↗</button>${gh ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="View ${p.name} repository on GitHub">${ghLabel}</a>` : ''}</div>
    </div>
  </article>`;
}

const groupsContainer = document.getElementById('project-groups');
if (groupsContainer) {
  const allProjects = projects;
  const counts = {};
  allProjects.forEach(p => { counts[p.group] = (counts[p.group] || 0) + 1; });
  document.getElementById('count-all').textContent = allProjects.length;
  document.querySelectorAll('#count-detection, #count-ai, #count-web').forEach(el => (el.textContent = counts[el.id.replace('count-', '')]));

  function render(filter) {
    const visible = [];
    projectGroups.forEach(g => {
      const items = allProjects.filter(p => p.group === g.key && (filter === 'all' || p.type === filter));
      visible.push(...items);
      const grid = document.createElement('div');
      if (items.length) {
        grid.className = 'project-group reveal';
        grid.innerHTML = `<div class="project-group-heading"><h3>${g.label}</h3><span>${items.length} PROJECT${items.length > 1 ? 'S' : ''}</span></div><div class="project-grid">${items.map((p, i) => projectCard(p, i)).join('')}</div>`;
      }
      groupsContainer.appendChild(grid);
    });
    document.getElementById('project-count').textContent = `${visible.length} / ${allProjects.length} ITEMS`;
    return visible;
  }

  document.querySelectorAll('.filters button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(x => { x.classList.toggle('selected', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    groupsContainer.innerHTML = '';
    render(b.dataset.filter);
    requestAnimationFrame(() => document.querySelectorAll('.project-group .reveal').forEach(el => revealObserver.observe(el)));
  }));

  const dialog = document.getElementById('project-dialog');
  const closeDialog = document.getElementById('close-dialog');
  let trigger = null;
  function openDialog(id) {
    const p = allProjects.find(x => x.id === id);
    if (!p) return;
    document.getElementById('dialog-title').textContent = p.name;
    document.getElementById('dialog-meta').textContent = `${p.label} — PROJECT NOTES`;
    document.getElementById('dialog-intro').textContent = p.description;
    document.getElementById('dialog-notes').innerHTML = p.notes.map(n => `<li>${n}</li>`).join('');
    document.getElementById('dialog-status').textContent = p.status;
    const link = document.getElementById('dialog-link');
    if (p.repoUrl || p.url) {
      link.href = p.repoUrl || p.url;
      link.innerHTML = p.repoUrl ? 'View on GitHub <span aria-hidden="true">↗</span>' : 'Open site <span aria-hidden="true">↗</span>';
      link.style.display = 'inline-flex';
    } else { link.style.display = 'none'; }
    trigger = document.querySelector(`[data-project="${id}"]`);
    dialog.showModal();
  }
  groupsContainer.addEventListener('click', e => {
    const b = e.target.closest('button[data-project]');
    if (b) openDialog(b.dataset.project);
  });
  closeDialog.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); }
  });
  dialog.addEventListener('close', () => { if (trigger) trigger.focus(); });

  render('all');
  requestAnimationFrame(() => document.querySelectorAll('.project-group .reveal').forEach(el => revealObserver.observe(el)));
}
