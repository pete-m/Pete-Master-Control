/* PROJECT: PMC (Phase 2)
   AUTHOR: Peter Maben with Gemini
   VERSION: 0.4.1
*/

(function() {
    const HARD_VER = "0.4.1"; 

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter text-emerald-500">${m}</div>` + el.innerHTML;
    };

    // 1. KILL THE "AWAITING" MESSAGE IMMEDIATELY
    log("📡 LOGIC STREAM RECEIVED. CHECKING SYNC...");

    // 2. Extract version with a fallback
    let requestedVer = "unknown";
    try {
        const script = document.currentScript || (function() {
            const ss = document.getElementsByTagName('script');
            return ss[ss.length - 1];
        })();
        const url = new URL(script.src, window.location.href);
        requestedVer = url.searchParams.get('v') || "none";
    } catch (e) {
        log("⚠️ VERSION EXTRACTION FAILED");
    }

    // 3. The Protocol Check
    if (requestedVer !== HARD_VER) {
        log(`❌ SYNC ERROR: Index wants [${requestedVer}], but I am [${HARD_VER}]`);
        // We continue anyway but warn, to avoid the 'Awaiting' stall
    }

    // --- Core Logic ---
    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let activeTab = 'index.html';
    let sessionPat = '';
    let userLogin = '';

    window.runHandshake = async () => {
        const pat = document.getElementById('ENTRY_TOKEN').value.trim();
        log("📡 VERIFYING...");
        try {
            const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
            if (r.ok) {
                const d = await r.json();
                sessionPat = pat; userLogin = d.login;
                log(`✅ SYNCED: ${d.login}`);
                document.getElementById('PHASE_1_UI').style.opacity = "1";
                document.getElementById('PHASE_1_UI').style.pointerEvents = "auto";
                document.getElementById('PHASE_2_UI').style.opacity = "1";
                document.getElementById('PHASE_2_UI').style.pointerEvents = "auto";
                document.getElementById('VER_ID').style.color = "#10b981";
            } else { log(`❌ AUTH FAIL: ${r.status}`); }
        } catch (e) { log("❌ CONNECTION ERROR"); }
    };

    window.runPush = async () => {
        const repo = document.getElementById('ENTRY_REPO').value.trim();
        const content = document.getElementById('MAIN_TEXT').value;
        if (!repo || !content || !sessionPat) return log("⚠️ DATA MISSING");
        const path = repo.includes('/') ? repo : `${userLogin}/${repo}`;
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
        activeTab = t.replace('tab-', '');
        document.getElementById('MAIN_TEXT').value = buffer[activeTab];
        log(`FOCUS: ${activeTab}`);
    };

    log(`ENGINE WARM. VERSION: ${HARD_VER}`);
})();
