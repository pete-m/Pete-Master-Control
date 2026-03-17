/* PROJECT: PMC | VERSION: 0.8.1 */
(function() {
    const HARD_VER = "0.8.1";
    const files = ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'];
    let buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let sessionPat = '', userLogin = '', activeTab = 'index.html', currentRepo = '';

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        const entry = document.createElement('div');
        entry.className = 'log-line';
        entry.textContent = `> ${m}`;
        el.prepend(entry);
    };

    window.toggleLog = () => {
        const shell = document.getElementById('LOG_SHELL');
        shell.classList.toggle('open');
        shell.classList.toggle('shut');
    };

    window.silentHandshake = async () => {
        const pat = document.getElementById('ENTRY_TOKEN').value.trim();
        if (pat.length < 40) return;
        log("INITIATING AUTH...");
        try {
            const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
            if (r.ok) {
                const d = await r.json();
                sessionPat = pat; userLogin = d.login;
                log(`AUTH SECURED: ${d.login.toUpperCase()}`);
                ['PHASE_1_UI', 'PHASE_2_UI'].forEach(id => {
                    const el = document.getElementById(id);
                    el.style.opacity = "1"; el.style.pointerEvents = "auto";
                });
            }
        } catch (e) { log("AUTH FAILURE"); }
    };

    window.runInit = async () => {
        const name = document.getElementById('INIT_REPO_NAME').value.trim();
        if(!name) return;
        log(`ANCHORING REPO: ${name}...`);
        try {
            const r = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, auto_init: true })
            });
            if (r.ok || r.status === 422) {
                currentRepo = name;
                log(`REPO STABILISED: ${name}`);
                updateAssetUI();
            }
        } catch (e) { log("INIT ERROR"); }
    };

    window.runPush = async () => {
        const content = document.getElementById('MAIN_TEXT').value;
        if(!currentRepo || !content) return log("DATA MISSING");
        log(`COMMISSIONING: ${activeTab}...`);
        try {
            const res = await fetch(`https://api.github.com/repos/${userLogin}/${currentRepo}/contents/${activeTab}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const sha = res.ok ? (await res.json()).sha : null;
            const push = await fetch(`https://api.github.com/repos/${userLogin}/${currentRepo}/contents/${activeTab}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "PMC_Sync", content: btoa(unescape(encodeURIComponent(content))), sha })
            });
            if (push.ok) {
                log(`ASSET SECURED: ${activeTab}`);
                const tx = document.getElementById('MAIN_TEXT');
                tx.classList.add('lit');
                setTimeout(() => tx.classList.remove('lit'), 2000);
                updateAssetUI();
            }
        } catch (e) { log("PUSH FAILED"); }
    };

    window.invokeYAML = async () => {
        if (!currentRepo) return log("❌ NO REPO ANCHORED");
        log(`📡 DISPATCHING YAML: ${currentRepo}`);
        try {
            const r = await fetch(`https://api.github.com/repos/${userLogin}/${currentRepo}/dispatches`, {
                method: 'POST',
                headers: { 'Authorization': `token ${sessionPat}`, 'Accept': 'application/vnd.github.v3+json' },
                body: JSON.stringify({ event_type: "pmc_maintenance_trigger" })
            });
            if (r.ok || r.status === 204) log("✅ YAML WORKFLOW TRIGGERED");
        } catch (e) { log("❌ DISPATCH ERROR"); }
    };

    window.clearRepos = () => { currentRepo = ''; log("REPO ANCHOR RELEASED"); document.getElementById('MAINT_MODAL').style.display = 'none'; };
    window.clearCommits = () => { log("COMMITS RESET REQUESTED"); document.getElementById('MAINT_MODAL').style.display = 'none'; };
    window.purgeTab = () => { document.getElementById('MAIN_TEXT').value = ""; buffer[activeTab] = ""; log("TAB WIPED"); };
    
    window.switchTab = (t) => {
        buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
        document.querySelectorAll('.pmc-tab').forEach(b => b.classList.remove('active'));
        document.getElementById(t).classList.add('active');
        activeTab = t.replace('tab-', '');
        document.getElementById('MAIN_TEXT').value = buffer[activeTab];
        log(`FOCUS: ${activeTab}`);
    };

    const updateAssetUI = async () => {
        for (const f of files) {
            const r = await fetch(`https://api.github.com/repos/${userLogin}/${currentRepo}/contents/${f}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const dot = document.getElementById(`stat-${f}`);
            if (dot) dot.className = r.ok ? 'pmc-dot on' : 'pmc-dot';
        }
    };

    log(`OPS ENGINE v${HARD_VER} ONLINE.`);
})();
