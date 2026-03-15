/* PROJECT: PMC (Phase 2)
   AUTHOR: Peter Maben with Gemini
   VERSION: v0.4.2
   STATUS: Stabilised Fitter Build
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

    const attachLogic = () => {
        const handshakeBtn = document.getElementById('HANDSHAKE_BTN');
        const initBtn = document.getElementById('INIT_BTN');
        const pushBtn = document.getElementById('PUSH_TRIGGER');

        // Check if elements exist before proceeding
        if (!handshakeBtn || !initBtn || !pushBtn) return false;

        log("ENGINE WARM. BUTTONS HOOKED.");

        // Phase 0: Handshake
        handshakeBtn.onclick = async () => {
            const pat = document.getElementById('ENTRY_TOKEN').value.trim();
            log("📡 Verifying...");
            try {
                const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
                if (r.ok) {
                    const d = await r.json();
                    sessionPat = pat; userLogin = d.login;
                    log(`✅ Verified: ${d.login}`);
                    document.getElementById('VER_ID').style.color = "#10b981";
                    ['PHASE_1_UI', 'PHASE_2_UI'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) { el.style.opacity = "1"; el.style.pointerEvents = "auto"; }
                    });
                } else { log(`❌ Denied: ${r.status}`); }
            } catch (e) { log("❌ Connection Refused"); }
        };

        // Phase 1: Navigator (Bare Repo Support)
        initBtn.onclick = async () => {
            const repoName = document.getElementById('INIT_REPO_NAME').value.trim();
            log(`[Navigator] Creating ${repoName}...`);
            try {
                const r = await fetch('https://api.github.com/user/repos', {
                    method: 'POST',
                    headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: repoName, auto_init: true })
                });
                if (r.ok) {
                    log(`✅ Repo Ready.`);
                    document.getElementById('ENTRY_REPO').value = repoName;
                } else { log(`❌ Failed: ${r.status}`); }
            } catch (e) { log("❌ Error"); }
        };

        // Phase 2: Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
                document.querySelectorAll('.tab-btn').forEach(b => { b.style.borderColor = "#27272a"; b.style.color = "#52525b"; });
                btn.style.borderColor = "#ea580c"; btn.style.color = "#ea580c";
                activeTab = btn.id.replace('tab-', '');
                document.getElementById('MAIN_TEXT').value = buffer[activeTab];
                log(`Focus: ${activeTab}`);
            };
        });

        // Phase 2: Commission (Bare Repo Name Detection)
        pushBtn.onclick = async () => {
            const repoInput = document.getElementById('ENTRY_REPO').value.trim();
            const content = document.getElementById('MAIN_TEXT').value;
            
            if (!repoInput || !content || !sessionPat) return log("⚠️ Data Missing");
            
            // Logic: If no '/', prepend userLogin automatically
            const path = repoInput.includes('/') ? repoInput : `${userLogin}/${repoInput}`;
            
            log(`🚀 Commissioning ${activeTab} to ${path}...`);
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
                    log(`❌ Push Failed: ${err.message}`);
                }
            } catch (e) { log(`❌ Error: ${e.message}`); }
        };

        return true;
    };

    // Retry loop to ensure buttons are hooked even if script loads fast
    const retryHook = setInterval(() => {
        if (attachLogic()) {
            clearInterval(retryHook);
        }
    }, 100);

})();
    else run();
})();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
