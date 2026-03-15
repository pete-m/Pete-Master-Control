/* PROJECT: PMC (Phase 2)
  VERSION: v0.3.9
  LOGIC: Global Event Listener (Anti-Ghosting)
*/
(function() {
    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tight">${msg}</div>` + el.innerHTML;
    };

    // Global Listener for Mobile Stability
    document.addEventListener('click', function (event) {
        if (event.target.id === 'HANDSHAKE_BTN') {
            log("<b class='text-orange-500'>[Logic] Handshake Received from Index.</b>");
            const pat = document.getElementById('ENTRY_TOKEN').value.trim();
            verifyIdentity(pat);
        }
    });

    async function verifyIdentity(pat) {
        if(!pat) return log("❌ Logic Error: PAT empty.");
        log("📡 Querying GitHub API...");
        try {
            const r = await fetch('https://api.github.com/user', { 
                headers: {'Authorization':'token ' + pat} 
            });
            if(r.ok) {
                const d = await r.json();
                log(`✅ <b>Success: ${d.login}</b>`);
                document.getElementById('VER_ID').style.color = "#10b981";
                document.getElementById('PHASE_2_UI').style.opacity = "1";
                document.getElementById('PHASE_2_UI').style.pointerEvents = "auto";
            } else {
                log(`❌ GitHub Denied: ${r.status}`);
            }
        } catch(e) { log(`❌ Fetch Error: ${e.message}`); }
    }
})();
