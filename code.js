/* PROJECT: PMC (Phase 2)
   AUTHOR: Peter Maben with Gemini
   VERSION: v0.4.1
   STATUS: Stabilised Fitter Build
*/

(function() {
    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let activeTab = 'index.html';
    let sessionPat = '';
    let userLogin = '';

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter">${m}</div>` + el.innerHTML;
    };

    const init = () => {
        log("<span class='text-emerald-500'>[System] Engine Warm. Gateway Ready.</span>");

        // PHASE 0: GATEWAY HANDSHAKE
        document.getElementById('HANDSHAKE_BTN').onclick = async () => {
            const pat = document.getElementById('ENTRY_TOKEN').value.trim();
            if (!pat) return log("❌ Error: PAT Empty");

            log("📡 Querying Gateway...");
            try {
                const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
                if (r.ok) {
                    const d = await r.json();
                    sessionPat = pat;
                    userLogin = d.login;
                    log(`<span class="text-emerald-400">✅ Handshake Verified: ${d.login}</span>`);
                    document.getElementById('VER_ID').style.color = "#10b981";
                    ['PHASE_1_UI', 'PHASE_2_UI'].forEach(id => {
                        const el = document.getElementById(id);
                        el.style.opacity = "1";
                        el.style.pointerEvents = "auto";
                    });
                } else { log(`❌ Gateway Denied: ${r.status}`); }
            } catch (e) { log("❌ Connection Refused"); }
        };

        // PHASE 1: NAVIGATOR (INIT)
        document.getElementById('INIT_BTN').onclick = async () => {
            const repoName = document.getElementById('INIT_REPO_NAME').value.trim();
            if (!repoName) return log("❌ Name Required");
            log(`[Navigator] Creating ${repoName}...`);
            try {
                const r = await fetch('https://api.github.com/user/repos', {
                    method: 'POST',
                    headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: repoName, auto_init: true })
                });
                if (r.ok) {
                    log(`✅ Repo Created. Routing to Fitter...`);
                    document.getElementById('ENTRY_REPO').value = `${userLogin}/${repoName}`;
                } else { log(`❌ Init Failed: ${r.status}`); }
            } catch (e) { log("❌ Init Error"); }
        };

        // PHASE 2: TAB BUFFERING
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                const area = document.getElementById('MAIN_TEXT');
                buffer[activeTab] = area.value;
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.style.borderColor = "#27272a";
                    b.style.color = "#52525b";
                });
                btn.style.borderColor = "#ea580c";
                btn.style.color = "#ea580c";
                activeTab = btn.id.replace('tab-', '');
                area.value = buffer[activeTab];
                log(`[Fitter] Focus: ${activeTab}`);
            };
        });

        // PHASE 2: COMMISSION (PUSH)
        document.getElementById('PUSH_TRIGGER').onclick = async () => {
            const repo = document.getElementById('ENTRY_REPO').value.trim();
            const content = document.getElementById('MAIN_TEXT').value;
            if (!repo || !content || !sessionPat) return log("⚠️ Lock: Data Missing");

            const fullPath = repo.includes('/') ? repo : `${userLogin}/${repo}`;
            log(`[Batch] Commissioning ${activeTab}...`);
            try {
                const res = await fetch(`https://api.github.com/repos/${fullPath}/contents/${activeTab}`, {
                    headers: { 'Authorization': `token ${sessionPat}` }
                });
                const sha = res.ok ? (await res.json()).sha : null;
                const push = await fetch(`https://api.github.com/repos/${fullPath}/contents/${activeTab}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: `PMC Commission: ${activeTab}`,
                        content: btoa(unescape(encodeURIComponent(content))),
                        sha: sha
                    })
                });
                if (push.ok) log(`<span class="text-emerald-500">✨ ${activeTab} Commissioned in ${repo}</span>`);
                else {
                    const errData = await push.json();
                    log(`❌ Push Failed: ${errData.message}`);
                }
            } catch (e) { log(`❌ Error: ${e.message}`); }
        };
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
