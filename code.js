/* PROJECT: PMC (Phase 2)
   AUTHOR: Peter Maben with Gemini
   VERSION: v0.5.2
   STATUS: Delayed Execution for Mobile Stability
*/

const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
let activeTab = 'index.html';
let sessionPat = '';
let userLogin = '';

const log = (m) => {
    const el = document.getElementById('UI_LOG');
    if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter text-emerald-500">${m}</div>` + el.innerHTML;
};

window.runHandshake = async () => {
    const btn = document.getElementById('HANDSHAKE_BTN');
    btn.style.background = "#ea580c";
    log("⏳ PAUSING FOR STABILISATION..."); 

    // THE DELAY: Allows browser to clear popups/focus
    setTimeout(async () => {
        btn.style.background = "";
        const pat = document.getElementById('ENTRY_TOKEN').value.trim();
        
        if (!pat) {
            log("❌ ERROR: PAT EMPTY");
            return;
        }

        log("📡 CONNECTING...");
        try {
            const r = await fetch('https://api.github.com/user', { 
                headers: { 'Authorization': `token ${pat}` } 
            });

            if (r.ok) {
                const d = await r.json();
                sessionPat = pat; userLogin = d.login;
                log(`✅ SUCCESS: ${d.login}`);
                
                // UI Unlock
                document.getElementById('PHASE_1_UI').style.opacity = "1";
                document.getElementById('PHASE_1_UI').style.pointerEvents = "auto";
                document.getElementById('PHASE_2_UI').style.opacity = "1";
                document.getElementById('PHASE_2_UI').style.pointerEvents = "auto";
                document.getElementById('VER_ID').style.color = "#10b981";
            } else { 
                log(`❌ GITHUB REJECTED: ${r.status}`);
            }
        } catch (e) { 
            log(`❌ BROWSER ERROR: ${e.message}`);
        }
    }, 400); // 400ms delay to ensure the 'tap' is fully registered
};

window.runPush = async () => {
    log("⏳ PREPARING COMMISSION...");
    setTimeout(async () => {
        const repoInput = document.getElementById('ENTRY_REPO').value.trim();
        const content = document.getElementById('MAIN_TEXT').value;
        if (!repoInput || !content || !sessionPat) return log("⚠️ DATA MISSING");
        
        const path = repoInput.includes('/') ? repoInput : `${userLogin}/${repoInput}`;
        log(`🚀 PUSHING ${activeTab}...`);
        
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
            else log(`❌ FAIL: ${push.status}`);
        } catch (e) { log(`❌ ERROR: ${e.message}`); }
    }, 300);
};

window.switchTab = (tabId) => {
    buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
    activeTab = tabId.replace('tab-', '');
    document.getElementById('MAIN_TEXT').value = buffer[activeTab];
    log(`TAB: ${activeTab}`);
};

log("ENGINE WARM. GLOBALS INJECTED.");
