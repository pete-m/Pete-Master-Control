/* PROJECT: PMC (Phase 2)
   VERSION: v0.4.0 (Stabilised Build)
   LOGIC: Global Orchestrator & Handshake Protocol
   TARGET: Mobile/Desktop Cross-Compatibility
*/

(function() {
    /**
     * System Log: Updates the UI_LOG element with timestamped or status entries.
     * @param {string} msg - The message to display.
     */
    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) {
            // Using afterbegin to keep the latest log at the top of the scroll
            el.insertAdjacentHTML('afterbegin', `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tight">${msg}</div>`);
        }
    };

    /**
     * Primary Event Listener: Captures all button interactions globally 
     * to prevent event-ghosting on mobile touch targets.
     */
    document.addEventListener('click', async function (e) {
        const target = e.target.closest('button');
        if (!target) return;

        // --- HANDSHAKE LOGIC ---
        if (target.id === 'HANDSHAKE_BTN') {
            const patInput = document.getElementById('ENTRY_TOKEN');
            const pat = patInput.value.trim();

            if(!pat) {
                log("<span class='text-red-500'>[Security] PAT Required for Gateway</span>");
                return;
            }

            // UI Feedback during async operation
            target.disabled = true;
            const originalText = target.innerText;
            target.innerText = "VERIFYING...";
            
            await verifyIdentity(pat);
            
            target.disabled = false;
            target.innerText = originalText;
        }

        // --- FITTER TAB LOGIC ---
        if (target.classList.contains('tab-btn')) {
            const fileName = target.id.split('-')[1];
            
            // Reset tab styles
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.style.color = "#52525b"; // zinc-500
                btn.style.borderColor = "#27272a"; // zinc-800
            });

            // Highlight active tab
            target.style.color = "#ea580c"; // orange-600
            target.style.borderColor = "#ea580c";
            
            log(`[Fitter] File Context: ${fileName}`);
        }

        // --- COMMISSION LOGIC (Placeholder for v0.4.1) ---
        if (target.id === 'PUSH_TRIGGER') {
            const repo = document.getElementById('ENTRY_REPO').value.trim();
            if(!repo) return log("<span class='text-orange-500'>[Fitter] Target Repo Required</span>");
            log(`[Batch] Commissioning upload to: ${repo}...`);
        }
    });

    /**
     * GitHub API Verification: Validates the PAT and unlocks Phase 2 UI.
     * @param {string} pat - The Personal Access Token.
     */
    async function verifyIdentity(pat) {
        log("📡 Initiating Emerald Handshake...");
        
        try {
            const response = await fetch('https://api.github.com/user', { 
                headers: {
                    'Authorization': `token ${pat}`,
                    'Accept': 'application/vnd.github.v3+json'
                } 
            });
            
            if(response.ok) {
                const userData = await response.json();
                log(`<span class="text-emerald-400">✅ Authenticated: ${userData.login}</span>`);
                
                unlockPhase2(pat);
            } else {
                log(`<span class="text-red-500">❌ GitHub Denied: ${response.status}</span>`);
            }
        } catch(error) { 
            log(`<span class="text-red-500">❌ Network Error: ${error.message}</span>`); 
        }
    }

    /**
     * UI State Transition: Activates the Phase 2 Fitter.
     * @param {string} pat - Validated token to be held in volatile memory.
     */
    function unlockPhase2(pat) {
        const verId = document.getElementById('VER_ID');
        const phase2 = document.getElementById('PHASE_2_UI');
        
        // Apply Emerald Handshake Visuals
        verId.innerText = "PMC v0.4.0";
        verId.style.color = "#10b981"; 
        verId.classList.remove('italic');
        verId.classList.add('emerald-handshake');
        
        // Transition Fitter UI
        phase2.style.opacity = "1";
        phase2.style.pointerEvents = "auto";
        phase2.classList.remove('opacity-30', 'translate-y-1');

        // Store PAT for current session use
        window.SESSION_PAT = pat;
        
        log("[System] Phase 2 Fitter Unlocked.");
    }

    log("[PMC] Logic v0.4.0 Loaded.");
})();
