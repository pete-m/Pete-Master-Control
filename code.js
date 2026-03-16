/* PROJECT: PMC (Phase 2) | VERSION: 0.7.6 */
(function() {
    const HARD_VER = "0.7.6";
    const files = ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'];
    let buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let sessionPat = '', userLogin = '', activeTab = 'index.html', isVerifying = false;

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="log-entry">${m}</div>` + el.innerHTML;
    };

    window.runRestart = () => {
        buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
        activeTab = 'index.html';
        document.getElementById('INIT_REPO_NAME').value = '';
        document.getElementById('ENTRY_REPO').value = '';
        document.getElementById('MAIN_TEXT').value = '';
        files.forEach(f => {
            const dot = document.getElementById(`stat-${f}`);
            if(dot) { dot.style.backgroundColor = ""; dot.style.boxShadow = "none"; }
        });
        window.switchTab('tab-index.html');
        log("🔄 PROJECT RESTARTED.");
    };

    window.jsonifyManifest = () => {
        const raw = document.getElementById('MAIN_TEXT').value;
        if (!raw.includes(',')) return log("⚠️ NO COMMAS DETECTED.");
        const list = raw.split(',').map(item => item.trim()).filter(item => item);
        const json = JSON.stringify({ 
            project: "Navigator_Build", 
            timestamp: new Date().toISOString(),
            assets: list 
        }, null, 4);
        document.getElementById('MAIN_TEXT').value = json;
        log("✨ CSV CONVERTED TO MANIFEST.");
    };

    const updateAssetUI = async (repoPath) => {
        for (const f of files) {
            try {
                const r = await fetch(`https://api.github.com/repos/${repoPath}/contents/${f}`, {
                    headers: { 'Authorization': `token ${sessionPat}` }
                });
                const dot = document.getElementById(`stat-${f}`);
                if (dot) {
                    dot.style.backgroundColor = r.ok ? "#10b981" : "#27272a";
                    dot.style.boxShadow = r.ok ? "0 0 8px #10b981" : "none";
                }
            } catch (e) {}
        }
    };

    window.silentHandshake = async () => {
        const pat = document.getElementById('ENTRY_TOKEN').value.trim();
        if (pat.length < 40 || isVerifying) return;
        isVerifying = true;
        log("📡 HANDSHAKING...");
        try {
            const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
            if (r.ok) {
                const d = await r.json();
                sessionPat = pat; userLogin = d.login;
                log(`✅ AUTH: ${d.login}`);
                ['PHASE_1_UI', 'PHASE_2_UI'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) { el.style.opacity = "1"; el.style.pointerEvents = "auto"; }
                });
                document.getElementById('VER_ID').style.color = "#10b981";
            }
        } catch (e) {}
        isVerifying = false;
    };

    window.runInit = async () => {
        const repoName = document.getElementById('INIT_REPO_NAME').value.trim();
        log(`📂 INITIALISING [${repoName}]...`);
        try {
            const r = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: repoName, auto_init: true })
            });
            if (r.ok) {
                log(`✨ REPO CREATED.`);
                const path = `${userLogin}/${repoName}`;
                document.getElementById('ENTRY_REPO').value = path;
                updateAssetUI(path);
            }
        } catch (e) {}
    };

    window.runPush = async () => {
        const repo = document.getElementById('ENTRY_REPO').value.trim();
        const content = document.getElementById('MAIN_TEXT').value;
        log(`🚀 COMMISSIONING: ${activeTab}...`);
        try {
            const path = repo.includes('/') ? repo : `${userLogin}/${repo}`;
            const res = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const sha = res.ok ? (await res.json()).sha : null;
            const push = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "PMC_Sync", content: btoa(unescape(encodeURIComponent(content))), sha: sha })
            });
            if (push.ok) { log(`✨ ${activeTab} STABILISED.`); updateAssetUI(path); }
        } catch (e) {}
    };

    window.switchTab = (t) => {
        buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
        document.querySelectorAll('.pmc-tab').forEach(b => b.classList.remove('active'));
        document.getElementById(t).classList.add('active');
        activeTab = t.replace('tab-', '');
        document.getElementById('MAIN_TEXT').value = buffer[activeTab];
        const mTools = document.getElementById('MANIFEST_TOOLS');
        if (activeTab === 'manifest.js') { mTools.classList.remove('hidden'); } 
        else { mTools.classList.add('hidden'); }
        log(`FOCUS: ${activeTab}`);
    };

    log(`ENGINE_WARM. v${HARD_VER} SYNCED.`);
})();
