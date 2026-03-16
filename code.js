/* PROJECT: PMC (Phase 2)
   AUTHOR: Peter Maben with Gemini
   VERSION: 0.5.8
*/

(function() {
    const HARD_VER = "0.5.8"; 

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter text-emerald-500">${m}</div>` + el.innerHTML;
    };

    // Kill the stall immediately
    log(`📡 LOGIC LOADED. CHECKING HANDSHAKE...`);

    // Extract version from own URL
    let requestedVer = "none";
    try {
        const script = document.currentScript || (function() {
            const ss = document.getElementsByTagName('script');
            return ss[ss.length - 1];
        })();
        const url = new URL(script.src, window.location.href);
        requestedVer = url.searchParams.get('v');
    } catch (e) { log("⚠️ VERSION READ ERROR"); }

    // Hard Handshake
    if (requestedVer !== HARD_VER) {
        log(`❌ VERSION MISMATCH: Index sent ${requestedVer}, Logic is ${HARD_VER}`);
        return; 
    }

    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let activeTab = 'index.html';
    let sessionPat = '';
    let userLogin = '';

    window.runHandshake = async () => {
        const btn = document.getElementById('HANDSHAKE_BTN');
        btn.style.background = "#ea580c";
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
                document.getElementById('VER_ID').style.color = "#10b981";
            } else { log(`❌ DENIED: ${r.status}`); }
        } catch (e) { log("❌ NO CONNECTION"); }
        setTimeout(() => btn.style.background = "", 200);
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
            else log(`❌ FAIL: ${push.status}`);
        } catch (e) { log(`❌ ERROR: ${e.message}`); }
    };

    window.switchTab = (t) => {
        buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
        activeTab = t.replace('tab-', '');
        document.getElementById('MAIN_TEXT').value = buffer[activeTab];
        log(`FOCUS: ${activeTab}`);
    };

    log(`ENGINE WARM. SYNC VERIFIED: ${HARD_VER}`);
})();
