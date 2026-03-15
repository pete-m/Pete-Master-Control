/* PROJECT: PMC (Phase 2)
   VERSION: v0.4.0
   LOGIC: Hardened Fitter Orchestrator
*/

(function() {
    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let activeTab = 'index.html';
    let sessionPat = '';
    let userLogin = '';

    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) {
            // Newest logs at the top
            el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter">${msg}</div>` + el.innerHTML;
        }
    };

    // Wake up confirmation
    log("<span class='text-blue-400'>[System] Engine Warm. Awaiting PAT...</span>");

    // Helper: Reset Tab Borders
    const resetTabs = () => {
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.style.borderColor = "#27272a";
            b.style.color = "#52525b";
        });
    };

    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = btn.id;

        // 1. Handshake Verification
        if (id === 'HANDSHAKE_BTN') {
            const patInput = document.getElementById('ENTRY_TOKEN');
            const pat = patInput.value.trim();
            if (!pat) return log("❌ PAT Error: Input Empty");

            log("📡 Contacting GitHub Gateway...");
            try {
                const r = await fetch('https://api.github.com/user', {
                    headers: { 'Authorization': `token ${pat}` }
                });

                if (r.ok) {
                    const d = await r.json();
                    sessionPat = pat;
                    userLogin = d.login;
                    log(`<span class="text-emerald-400">✅ Handshake Verified: ${d.login}</span>`);
                    
                    // Unlock Fitter
                    document.getElementById('VER_ID').classList.add('text-emerald-500');
                    document.getElementById('VER_ID').style.color = "#10b981";
                    document.getElementById('PHASE_2_UI').style.opacity = "1";
                    document.getElementById('PHASE_2_UI').style.pointerEvents = "auto";
                } else {
                    log(`❌ Gateway Denied: ${r.status}`);
                }
            } catch (err) {
                log(`❌ Connection Failure: ${err.message}`);
            }
        }

        // 2. Tab Buffering
        if (btn.classList.contains('tab-btn')) {
            const textArea = document.getElementById('MAIN_TEXT');
            buffer[activeTab] = textArea.value; // Store current work

            resetTabs();
            btn.style.borderColor = "#ea580c";
            btn.style.color = "#ea580c";

            activeTab = id.replace('tab-', '');
            textArea.value = buffer[activeTab]; // Recall saved work
            log(`[Fitter] Switched to ${activeTab}`);
        }

        // 3. Commission Batch
        if (id === 'PUSH_TRIGGER') {
            const repo = document.getElementById('ENTRY_REPO').value.trim();
            const content = document.getElementById('MAIN_TEXT').value;
            
            if (!repo || !content || !sessionPat) {
                return log("<span class='text-orange-500'>⚠️ Lock: Data Incomplete</span>");
            }

            const path = repo.includes('/') ? repo : `${userLogin}/${repo}`;
            log(`[Batch] Commissioning ${activeTab} to ${path}...`);

            try {
                // Fetch SHA
                const res = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                    headers: { 'Authorization': `token ${sessionPat}` }
                });
                const sha = res.ok ? (await res.json()).sha : null;

                // Push
                const push = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                    method: 'PUT',
                    headers: { 
                        'Authorization': `token ${sessionPat}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        message: `PMC Update: ${activeTab}`,
                        content: btoa(unescape(encodeURIComponent(content))),
                        sha: sha
                    })
                });

                if (push.ok) log(`<span class="text-emerald-500">✨ ${activeTab} Successfully Commissioned.</span>`);
                else log("❌ Push Failed.");
            } catch (err) {
                log(`❌ Error: ${err.message}`);
            }
        }
    });
})();
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
