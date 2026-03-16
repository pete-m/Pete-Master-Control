/* PROJECT: PMC (Phase 2) 
   VERSION: 0.7.0 
*/
(function() {
    const HARD_VER = "0.7.0";
    const files = ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'];
    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let sessionPat = '', userLogin = '', activeTab = 'index.html';

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter text-emerald-500">${m}</div>` + el.innerHTML;
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

    window.runHandshake = async () => {
        const pat = document.getElementById('ENTRY_TOKEN').value.trim();
        log("📡 VERIFYING...");
        try {
            const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
            if (r.ok) {
                const d = await r.json();
                sessionPat = pat; userLogin = d.login;
                log(`✅ OK: ${d.login}`);
                ['PHASE_1_UI', 'PHASE_2_UI'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) { el.style.opacity = "1"; el.style.pointerEvents = "auto"; }
                });
                document.getElementById('VER_ID').style.color = "#10b981";
            } else { log(`❌ FAIL: ${r.status}`); }
        } catch (e) { log("❌ NO_CONNECTION"); }
    };

    window.runInit = async () => {
        const repoName = document.getElementById('INIT_REPO_NAME').value.trim();
        if(!repoName) return log("⚠️ NAME_REQ.");
        log(`PREPARING: ${repoName}...`);
        try {
            const r = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: repoName, auto_init: true })
            });
            if (r.ok) {
                log(`✅ REPO_READY.`);
                const path = `${userLogin}/${repoName}`;
                document.getElementById('ENTRY_REPO').value = path;
                updateAssetUI(path);
            }
        } catch (e) { log("❌ ERROR"); }
    };

    window.runPush = async () => {
        const repo = document.getElementById('ENTRY_REPO').value.trim();
        const content = document.getElementById('MAIN_TEXT').value;
        log(`🚀 PUSHING ${activeTab}...`);
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
            if (push.ok) { 
                log(`✨ ${activeTab} SAVED.`); 
                updateAssetUI(path); 
            }
        } catch (e) { log(`❌ FAIL`); }
    };

    window.switchTab = (t) => {
        buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
        activeTab = t.replace('tab-', '');
        document.getElementById('MAIN_TEXT').value = buffer[activeTab];
        log(`TAB: ${activeTab}`);
    };

    log(`ENGINE_WARM. v${HARD_VER} SYNCED.`);
})();
