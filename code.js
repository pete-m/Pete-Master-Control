/* PROJECT: PMC (Phase 2) 
   VERSION: 0.6.1 
*/
(function() {
    const HARD_VER = "0.6.1";
    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    const files = ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'];
    let activeTab = 'index.html';
    let sessionPat = '', userLogin = '';

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter text-emerald-500">${m}</div>` + el.innerHTML;
    };

    const updateAssetUI = async (repoPath) => {
        log("🔍 SCANNING ASSETS...");
        for (const f of files) {
            try {
                const r = await fetch(`https://api.github.com/repos/${repoPath}/contents/${f}`, {
                    headers: { 'Authorization': `token ${sessionPat}` }
                });
                const btn = document.getElementById(`tab-${f}`);
                if (btn) {
                    btn.style.borderColor = r.ok ? "#10b981" : "#3f3f46";
                    btn.style.color = r.ok ? "#10b981" : "#71717a";
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
                document.getElementById('PHASE_1_UI').style.opacity = "1";
                document.getElementById('PHASE_1_UI').style.pointerEvents = "auto";
                document.getElementById('PHASE_2_UI').style.opacity = "1";
                document.getElementById('PHASE_2_UI').style.pointerEvents = "auto";
            }
        } catch (e) { log("❌ NO CONNECTION"); }
    };

    window.runInit = async () => {
        const repoName = document.getElementById('INIT_REPO_NAME').value.trim();
        log(`PREPARING: ${repoName}...`);
        try {
            const r = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: repoName, auto_init: true })
            });
            if (r.ok) {
                log(`✅ REPO READY.`);
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
            const res = await fetch(`https://api.github.com/repos/${repo}/contents/${activeTab}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const sha = res.ok ? (await res.json()).sha : null;
            const push = await fetch(`https://api.github.com/repos/${repo}/contents/${activeTab}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `PMC Update`, content: btoa(unescape(encodeURIComponent(content))), sha: sha })
            });
            if (push.ok) { log(`✨ ${activeTab} SAVED.`); updateAssetUI(repo); }
        } catch (e) { log(`❌ FAIL`); }
    };

    window.switchTab = (t) => {
        buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
        activeTab = t.replace('tab-', '');
        document.getElementById('MAIN_TEXT').value = buffer[activeTab];
        log(`TAB: ${activeTab}`);
    };

    log(`ENGINE WARM. v${HARD_VER} SYNCED.`);
})();
       
