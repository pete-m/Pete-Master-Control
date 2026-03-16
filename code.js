/* PROJECT: PMC (Phase 2) 
   VERSION: 0.6.3 
*/
(function() {
    const HARD_VER = "0.6.3";
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
                    if (r.ok) {
                        dot.style.backgroundColor = "#10b981"; // Emerald
                        dot.style.boxShadow = "0 0 8px #10b981"; // Glow
                    } else {
                        dot.style.backgroundColor = "#27272a"; // Reset to Zinc
                        dot.style.boxShadow = "none";
                    }
                }
            } catch (e) {}
        }
    };

    // Keep your window.runHandshake, window.runInit, window.runPush as they were...
    // Just ensure window.runPush calls updateAssetUI(repo) upon success.

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
                body: JSON.stringify({ message: "PMC Sync", content: btoa(unescape(encodeURIComponent(content))), sha: sha })
            });
            if (push.ok) { 
                log(`✨ ${activeTab} STABILISED.`); 
                updateAssetUI(path); // Update the glow dots immediately
            }
        } catch (e) { log(`❌ FAIL`); }
    };

    log(`ENGINE WARM. v${HARD_VER} SYNCED.`);
})();
