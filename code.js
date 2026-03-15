/* PROJECT: PMC (Phase 2)
   AUTHOR: Peter Maben with Gemini
   VERSION: v0.4.5
   STATUS: Stabilised Separate Build
*/

(function() {
    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let activeTab = 'index.html';
    let sessionPat = '';
    let userLogin = '';

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter text-emerald-500">${m}</div>` + el.innerHTML;
    };

    window.addEventListener('load', () => {
        log("ENGINE WARM. SEPARATE LOGIC ACTIVE.");

        // Phase 0: Handshake
        document.getElementById('HANDSHAKE_BTN').onclick = async () => {
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
                } else { log(`❌ DENIED: ${r.status}`); }
            } catch (e) { log("❌ NO CONNECTION"); }
        };

        // Phase 1: Navigator (Bare Repo Support)
        document.getElementById('INIT_BTN').onclick = async () => {
            const repoName = document.getElementById('INIT_REPO_NAME').value.trim();
            log(`INIT: ${repoName}...`);
            try {
                const r = await fetch('https://api.github.com/user/repos', {
                    method: 'POST',
                    headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: repoName, auto_init: true })
                });
                if (r.ok) {
                    log(`✅ REPO READY.`);
                    document.getElementById('ENTRY_REPO').value = repoName;
                } else { log(`❌ FAIL: ${r.status}`); }
            } catch (e) { log("❌ ERROR"); }
        };

        // Phase 2: Commission (Bare Repo Name Support)
        document.getElementById('PUSH_TRIGGER').onclick = async () => {
            const repoInput = document.getElementById('ENTRY_REPO').value.trim();
            const content = document.getElementById('MAIN_TEXT').value;
            if (!repoInput || !content || !sessionPat) return log("⚠️ DATA MISSING");
            
            const path = repoInput.includes('/') ? repoInput : `${userLogin}/${repoInput}`;
            log(`🚀 PUSHING TO ${path}...`);
            
            try {
                const res = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                    headers: { 'Authorization': `token ${sessionPat}` }
                });
                const sha = res.ok ? (await res.json()).sha : null;
                const push = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: `PMC: ${activeTab}`,
                        content: btoa(unescape(encodeURIComponent(content))),
                        sha: sha
                    })
                });
                if (push.ok) log(`✨ ${activeTab} STABILISED.`);
                else {
                    const err = await push.json();
                    log(`❌ FAIL: ${err.message}`);
                }
            } catch (e) { log(`❌ ERROR: ${e.message}`); }
        };

        // Tab logic
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
                activeTab = btn.id.replace('tab-', '');
                document.getElementById('MAIN_TEXT').value = buffer[activeTab];
                log(`TAB: ${activeTab}`);
            };
        });
    });
})();
