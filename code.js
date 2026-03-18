/* PMC_v0.8.2.5 // BASELINE_LOGIC */
const files = ['index.html', 'code.js', 'manifest.js'];
let buffer = { 'index.html': '', 'code.js': '', 'manifest.js': '' };
let pat = '', user = '', activeTab = 'index.html';

// DIAGNOSTICS
window.log = (m) => {
    const el = document.getElementById('LOG_INNER');
    if (!el) return;
    const div = document.createElement('div');
    div.className = 'log-line';
    div.textContent = `> ${m}`;
    el.prepend(div);
};

// HANDSHAKE (Auto-trigger)
window.handshake = async () => {
    const input = document.getElementById('TOKEN').value.trim();
    if (input.length < 40) return;
    
    try {
        const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${input}` } });
        if (r.ok) {
            const d = await r.json();
            pat = input; user = d.login;
            const status = document.getElementById('STATUS');
            status.textContent = `ONLINE: ${user.toUpperCase()}`;
            status.className = "text-[10px] uppercase text-center font-black text-emerald-500 mt-1";
            log(`AUTH_SUCCESS: ${user}`);
            
            // LOAD PERSISTENCE
            files.forEach(f => {
                const saved = localStorage.getItem(`pmc_v0.8.2.5_${f}`);
                if (saved) buffer[f] = saved;
            });
            document.getElementById('EDITOR').value = buffer[activeTab] || '';
        } else {
            log("AUTH_ERROR: CHECK_TOKEN");
        }
    } catch (e) { log("ERR: CONNECTION_FAILED"); }
};

// TAB LOGIC
window.switchTab = (f) => {
    // Save current state
    buffer[activeTab] = document.getElementById('EDITOR').value;
    localStorage.setItem(`pmc_v0.8.2.5_${activeTab}`, buffer[activeTab]);
    
    // UI Update
    document.querySelectorAll('.pmc-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${f}`).classList.add('active');
    
    // Switch state
    activeTab = f;
    document.getElementById('EDITOR').value = buffer[activeTab] || '';
    log(`TAB_SWAP: ${f.toUpperCase()}`);
};

// COMMISSION
window.push = async () => {
    const repo = document.getElementById('REPO').value.trim();
    const content = document.getElementById('EDITOR').value;
    if (!repo) return log("ERR: MISSING_REPO_NAME");
    if (!pat) return log("ERR: NO_AUTH_FOUND");

    log(`PUSHING: ${activeTab}...`);
    try {
        const res = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${activeTab}`, {
            headers: { 'Authorization': `token ${pat}` }
        });
        const sha = res.ok ? (await res.json()).sha : null;

        const put = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${activeTab}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${pat}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `PMC_v0.8.2.5_Baseline_Push_${activeTab}`,
                content: btoa(unescape(encodeURIComponent(content))),
                sha: sha
            })
        });

        if (put.ok) {
            log(`SECURED: ${activeTab} synced to ${repo}`);
            const url = `https://${user}.github.io/${repo}/`;
            const box = document.getElementById('LINK_BOX');
            const link = document.getElementById('LIVE_LINK');
            link.href = url; link.textContent = url;
            box.classList.remove('hidden');
        } else {
            log(`ERR: PUSH_FAIL_${put.status}`);
        }
    } catch (e) { log("ERR: FATAL_PUSH_ERROR"); }
};

log("PMC_ENGINE_ONLINE");

    const updateAssetUI = async () => {
        if (!currentRepo) return;
        for (const f of files) {
            const r = await fetch(`https://api.github.com/repos/${userLogin}/${currentRepo}/contents/${f}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const dot = document.getElementById(`stat-${f}`);
            if (dot) dot.className = r.ok ? 'pmmc-dot on' : 'pmmc-dot';
        }
    };

    log(`PMMC_OPS_ENGINE v0.8.2.2 ONLINE.`);
})();
