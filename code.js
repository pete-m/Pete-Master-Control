/* PROJECT: PMC (Phase 2)
   VERSION: v0.4.0 (Stabilised Build)
   LOGIC: Hardened Split-File Orchestrator
*/

(function() {
    // Internal Buffer to prevent data loss on tab switch
    const buffer = {
        'index.html': '',
        'code.js': '',
        'style.css': '',
        'manifest.js': '',
        'README.md': ''
    };
    
    let activeTab = 'index.html';
    let sessionPat = '';

    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) {
            el.insertAdjacentHTML('afterbegin', `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tight">${msg}</div>`);
        }
    };

    // Initialize Logic once DOM is fully "awake"
    const init = () => {
        log("<span class='text-blue-400'>[System] Logic Streamed. Awaiting PAT...</span>");

        // 1. Handshake Listener
        const handshakeBtn = document.getElementById('HANDSHAKE_BTN');
        if (handshakeBtn) {
            handshakeBtn.addEventListener('click', async () => {
                const pat = document.getElementById('ENTRY_TOKEN').value.trim();
                if(!pat) return log("❌ PAT EMPTY");

                log("📡 Querying Gateway...");
                try {
                    const r = await fetch('https://api.github.com/user', { 
                        headers: {'Authorization': `token ${pat}`} 
                    });
                    if(r.ok) {
                        const d = await r.json();
                        sessionPat = pat;
                        window.USER_LOGIN = d.login;
                        log(`<span class="text-emerald-400">✅ Handshake: ${d.login}</span>`);
                        
                        // Unlock Phase 2
                        document.getElementById('VER_ID').style.color = "#10b981";
                        document.getElementById('PHASE_2_UI').style.opacity = "1";
                        document.getElementById('PHASE_2_UI').style.pointerEvents = "auto";
                    } else {
                        log(`❌ Denied: ${r.status}`);
                    }
                } catch(e) { log(`❌ Error: ${e.message}`); }
            });
        }

        // 2. Tab Switcher Listener
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const textArea = document.getElementById('MAIN_TEXT');
                buffer[activeTab] = textArea.value; // Save current

                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.style.color = "#52525b"; // zinc-500
                    b.style.borderColor = "transparent";
                });
                
                btn.style.color = "#ea580c"; // orange-600
                btn.style.borderBottom = "2px solid #ea580c";

                activeTab = btn.id.replace('tab-', '');
                textArea.value = buffer[activeTab]; // Load new
                log(`[Fitter] Focused: ${activeTab}`);
            });
        });

        // 3. Commission/Push Listener
        const pushBtn = document.getElementById('PUSH_TRIGGER');
        if (pushBtn) {
            pushBtn.addEventListener('click', async () => {
                const repoInput = document.getElementById('ENTRY_REPO').value.trim();
                const content = document.getElementById('MAIN_TEXT').value;
                if(!repoInput || !content || !sessionPat) return log("⚠️ LOCK: Missing Data");

                let repoPath = repoInput.includes('/') ? repoInput : `${window.USER_LOGIN}/${repoInput}`;

                log(`[Batch] Checking SHA for ${activeTab}...`);
                try {
                    const getRef = await fetch(`https://api.github.com/repos/${repoPath}/contents/${activeTab}`, {
                        headers: {'Authorization': `token ${sessionPat}`}
                    });
                    
                    let sha = getRef.ok ? (await getRef.json()).sha : null;

                    log(`[Batch] Commissioning...`);
                    const pushReq = await fetch(`https://api.github.com/repos/${repoPath}/contents/${activeTab}`, {
                        method: 'PUT',
                        headers: {'Authorization': `token ${sessionPat}`},
                        body: JSON.stringify({
                            message: `PMC v0.4.0 Commission: ${activeTab}`,
                            content: btoa(unescape(encodeURIComponent(content))),
                            sha: sha
                        })
                    });

                    if(pushReq.ok) log(`<span class="text-emerald-500">✨ ${activeTab} Stabilised.</span>`);
                    else log("❌ Push Failed");
                } catch(e) { log(`❌ Error: ${e.message}`); }
            });
        }
    };

    // Ensure script doesn't miss the window load event
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
        
        phase2.style.opacity = "1";
        phase2.style.pointerEvents = "auto";
        phase2.classList.remove('opacity-30');
        log("[System] Fitter Online. Awaiting Assets.");
    }

    async function executePush(repo, filename, content) {
        const pat = window.SESSION_PAT;
        log(`[Batch] Checking SHA for ${filename}...`);

        try {
            const getRef = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}`, {
                headers: {'Authorization': `token ${pat}`}
            });
            
            let sha = "";
            if (getRef.ok) {
                const fileData = await getRef.json();
                sha = fileData.sha;
                log(`[Batch] Existing SHA found.`);
            }

            log(`[Batch] Encrypting & Uploading...`);
            const pushReq = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${pat}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `PMC Update: ${filename} (v0.4.0)`,
                    content: btoa(unescape(encodeURIComponent(content))),
                    sha: sha || null
                })
            });

            if (pushReq.ok) {
                log(`<span class="text-emerald-500">✨ ${filename} Commissioned to ${repo}</span>`);
            } else {
                const err = await pushReq.json();
                log(`❌ Push Failed: ${err.message}`);
            }
        } catch (e) {
            log(`❌ Error: ${e.message}`);
        }
    }

    log("[System] Logic v0.4.0 Streamed.");
})();
        
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
