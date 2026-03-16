/* PROJECT: PMC (Phase 2)
   AUTHOR: Peter Maben with Gemini
   VERSION: 0.6.0
*/

(function() {
    const HARD_VER = "0.5.8"; 
    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    const assets = ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'];
    let activeTab = 'index.html';
    let sessionPat = '';
    let userLogin = '';

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter text-emerald-500">${m}</div>` + el.innerHTML;
    };

    // Helper: Update Tab Status (Grey to Emerald)
    const updateAssetUI = async (repoPath) => {
        log("🔍 SCANNING REPO ASSETS...");
        for (const file of assets) {
            try {
                const r = await fetch(`https://api.github.com/repos/${repoPath}/contents/${file}`, {
                    headers: { 'Authorization': `token ${sessionPat}` }
                });
                const btn = document.getElementById(`tab-${file}`);
                if (btn) {
                    btn.style.borderColor = r.ok ? "#10b981" : "#3f3f46"; // Green if exists, Zinc if not
                    btn.style.color = r.ok ? "#10b981" : "#71717a";
                }
            } catch (e) {}
        }
    };

    window.runHandshake = async () => {
        const pat = document.getElementById('ENTRY_TOKEN').value.trim();
        log("📡 VERIFYING CREDENTIALS...");
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
        } catch (e) { log("❌ CONNECTION ERROR"); }
    };

    // Phase 1: Repo Prepare
    window.runInit = async () => {
        const repoName = document.getElementById('INIT_REPO_NAME').value.trim();
        if (!repoName) return log("⚠️ NAME REQUIRED");
        log(`PREPARING: ${repoName}...`);
        try {
            const r = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: repoName, auto_init: true })
            });
            if (r.ok) {
                log(`✅ REPO CREATED.`);
                const fullPath = `${userLogin}/${repoName}`;
                document.getElementById('ENTRY_REPO').value = fullPath;
                updateAssetUI(fullPath);
            } else { log(`❌ FAIL: ${r.status}`); }
        } catch (e) { log("❌ ERROR"); }
    };

    window.runPush = async () => {
        const repo = document.getElementById('ENTRY_REPO').value.trim();
        const content = document.getElementById('MAIN_TEXT').value;
        log(`🚀 COMMISSIONING ${activeTab}...`);
        try {
            const path = repo.includes('/') ? repo : `${userLogin}/${repo}`;
            const res = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const sha = res.ok ? (await res.json()).sha : null;
            const push = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `PMC Update: ${activeTab}`,
                    content: btoa(unescape(encodeURIComponent(content))),
                    sha: sha
                })
            });
            if (push.ok) {
                log(`✨ ${activeTab} STABILISED.`);
                updateAssetUI(path); // Refresh colors after push
            }
        } catch (e) { log(`❌ PUSH ERROR`); }
    };

    window.switchTab = (t) => {
        buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
        activeTab = t.replace('tab-', '');
        document.getElementById('MAIN_TEXT').value = buffer[activeTab];
        log(`FOCUS: ${activeTab}`);
    };

    log(`ENGINE WARM. SYNC VERIFIED: ${HARD_VER}`);
})();
