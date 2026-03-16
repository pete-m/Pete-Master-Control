/* PROJECT: PMC (Phase 2)
   AUTHOR: Peter Maben with Gemini
   VERSION: 0.5.6
*/

(function() {
    const HARD_VER = "0.4.1"; // The logic's internal ID

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter text-emerald-500">${m}</div>` + el.innerHTML;
    };

    // 1. Dynamic Handshake Detection
    const script = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    
    const url = new URL(script.src, window.location.href);
    const requestedVer = url.searchParams.get('v');

    // 2. The Protocol Check
    if (requestedVer !== HARD_VER) {
        log(`❌ SYNC MISMATCH: Index (${requestedVer}) vs Logic (${HARD_VER})`);
        // We halt here to prevent erratic behaviour
        return; 
    }

    // --- Verified Logic Stream ---
    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let activeTab = 'index.html';
    let sessionPat = '';
    let userLogin = '';

    window.runHandshake = async () => {
        const pat = document.getElementById('ENTRY_TOKEN').value.trim();
        log("📡 VERIFYING CREDENTIALS...");
        try {
            const r = await fetch('https://api.github.com/user', { 
                headers: { 'Authorization': `token ${pat}` } 
            });
            if (r.ok) {
                const d = await r.json();
                sessionPat = pat; userLogin = d.login;
                log(`✅ SYNCED: ${d.login}`);
                
                // Visual Unlock
                document.getElementById('PHASE_1_UI').classList.remove('opacity-30', 'pointer-events-none');
                document.getElementById('PHASE_2_UI').classList.remove('opacity-30', 'pointer-events-none');
                document.getElementById('VER_ID').style.color = "#10b981";
            } else { log(`❌ GITHUB DENIED: ${r.status}`); }
        } catch (e) { log("❌ NETWORK ERROR"); }
    };

    window.runPush = async () => {
        const repo = document.getElementById('ENTRY_REPO').value.trim();
        const content = document.getElementById('MAIN_TEXT').value;
        if (!repo || !content || !sessionPat) return log("⚠️ DATA MISSING");
        
        const path = repo.includes('/') ? repo : `${userLogin}/${repo}`;
        log(`🚀 COMMISSIONING ${activeTab}...`);
        
        try {
            const res = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const sha = res.ok ? (await res.json()).sha : null;
            const push = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `PMC ${HARD_VER}: ${activeTab}`,
                    content: btoa(unescape(encodeURIComponent(content))),
                    sha: sha
                })
            });
            if (push.ok) log(`✨ ${activeTab} STABILISED.`);
            else log(`❌ PUSH FAIL.`);
        } catch (e) { log(`❌ ERROR: ${e.message}`); }
    };

    window.switchTab = (t) => {
        buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
        const target = t.replace('tab-', '');
        activeTab = target;
        document.getElementById('MAIN_TEXT').value = buffer[activeTab];
        log(`FOCUS: ${activeTab}`);
    };

    log(`ENGINE WARM. SYNC VERIFIED: ${HARD_VER}`);
})();
