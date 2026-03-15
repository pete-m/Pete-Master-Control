/* PROJECT: PMC (Phase 2)
   AUTHOR: Peter Maben with Gemini
   VERSION: v0.4.3
   STATUS: Hard-Wired Initialization
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

    const boot = () => {
        const hBtn = document.getElementById('HANDSHAKE_BTN');
        const iBtn = document.getElementById('INIT_BTN');
        const pBtn = document.getElementById('PUSH_TRIGGER');

        if (!hBtn || !iBtn || !pBtn) {
            return false; // Elements not ready yet
        }

        log("SYSTEM: BUTTONS LOCATED.");

        // 0. Handshake
        hBtn.onclick = async () => {
            const pat = document.getElementById('ENTRY_TOKEN').value.trim();
            log("📡 VERIFYING...");
            try {
                const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
                if (r.ok) {
                    const d = await r.json();
                    sessionPat = pat; userLogin = d.login;
                    log(`✅ OK: ${d.login}`);
                    document.getElementById('VER_ID').style.color = "#10b981";
                    ['PHASE_1_UI', 'PHASE_2_UI'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) { el.style.opacity = "1"; el.style.pointerEvents = "auto"; }
                    });
                } else { log(`❌ DENIED: ${r.status}`); }
            } catch (e) { log("❌ NO CONNECTION"); }
        };

        // 1. Navigator (Bare Repo Support)
        iBtn.onclick = async () => {
            const repoName = document.getElementById('INIT_REPO_NAME').value.trim();
            log(`INIT: ${repoName}...`);
            try {
                const r = await fetch('https://api.github.com/user/repos', {
                    method: 'POST',
                    headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: repoName, auto_init: true })
                });
                if (r.ok) {
                    log(`✅ REPO CREATED.`);
                    document.getElementById('ENTRY_REPO').value = repoName;
                } else { log(`❌ INIT FAIL: ${r.status}`); }
            } catch (e) { log("❌ ERROR"); }
        };

        // 2. Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
                document.querySelectorAll('.tab-btn').forEach(b => { b.style.borderColor = "#27272a"; b.style.color = "#52525b"; });
                btn.style.borderColor = "#ea580c"; btn.style.color = "#ea580c";
                activeTab = btn.id.replace('tab-', '');
                document.getElementById('MAIN_TEXT').value = buffer[activeTab];
                log(`TAB: ${activeTab}`);
            };
        });

        // 3. Commission (Bare Repo Name Detection)
        pBtn.onclick = async () => {
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

        return true;
    };

    // Immediate check + fallback interval
    if (!boot()) {
        const retry = setInterval(() => {
            if (boot()) {
                log("SYSTEM: LATE HOOK SUCCESS.");
                clearInterval(retry);
            }
        }, 200);
        // Stop trying after 5 seconds to save battery
        setTimeout(() => clearInterval(retry), 5000);
    }
})();
