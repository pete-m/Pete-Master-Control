/* PROJECT: PMC (Phase 2)
   VERSION: v0.4.0
   LOGIC: Direct Handshake & Fitter Buffer
*/

(function() {
    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let activeTab = 'index.html';
    let sessionPat = '';
    let userLogin = '';

    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) {
            el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tighter animate-pulse">${msg}</div>` + el.innerHTML;
        }
    };

    // Immediate confirmation of script execution
    log("<span class='text-blue-400'>[System] Engine Warm. Awaiting PAT...</span>");

    // 1. HANDSHAKE
    const hsBtn = document.getElementById('HANDSHAKE_BTN');
    if (hsBtn) {
        hsBtn.onclick = async () => {
            const pat = document.getElementById('ENTRY_TOKEN').value.trim();
            if (!pat) return log("❌ Error: PAT required");

            log("📡 Verifying...");
            try {
                const r = await fetch('https://api.github.com/user', {
                    headers: { 'Authorization': `token ${pat}` }
                });
                if (r.ok) {
                    const d = await r.json();
                    sessionPat = pat;
                    userLogin = d.login;
                    log(`<span class="text-emerald-400">✅ Handshake: ${d.login}</span>`);
                    
                    document.getElementById('VER_ID').style.color = "#10b981";
                    const phase2 = document.getElementById('PHASE_2_UI');
                    phase2.style.opacity = "1";
                    phase2.style.pointerEvents = "auto";
                } else {
                    log(`❌ Access Denied: ${r.status}`);
                }
            } catch (e) {
                log("❌ Connection Failed");
            }
        };
    }

    // 2. FITTER TABS
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            const area = document.getElementById('MAIN_TEXT');
            // Save current work
            buffer[activeTab] = area.value;

            // Update UI
            document.querySelectorAll('.tab-btn').forEach(b => b.style.borderColor = "#27272a");
            btn.style.borderColor = "#ea580c";

            // Switch content
            activeTab = btn.id.replace('tab-', '');
            area.value = buffer[activeTab];
            log(`[Fitter] Tab: ${activeTab}`);
        };
    });

    // 3. COMMISSION BATCH
    const pushBtn = document.getElementById('PUSH_TRIGGER');
    if (pushBtn) {
        pushBtn.onclick = async () => {
            const repo = document.getElementById('ENTRY_REPO').value.trim();
            const content = document.getElementById('MAIN_TEXT').value;
            if (!repo || !content || !sessionPat) return log("⚠️ Lock Error: Data Missing");

            const path = repo.includes('/') ? repo : `${userLogin}/${repo}`;
            log(`[Batch] Checking SHA for ${activeTab}...`);

            try {
                const res = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                    headers: { 'Authorization': `token ${sessionPat}` }
                });
                const sha = res.ok ? (await res.json()).sha : null;

                log(`[Batch] Commissioning...`);
                const push = await fetch(`https://api.github.com/repos/${path}/contents/${activeTab}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: `PMC Update: ${activeTab}`,
                        content: btoa(unescape(encodeURIComponent(content))),
                        sha: sha
                    })
                });

                if (push.ok) log(`<span class="text-emerald-500">✨ ${activeTab} Commissioned.</span>`);
                else log("❌ Push Failed");
            } catch (e) {
                log(`❌ Error: ${e.message}`);
            }
        };
    }
})();
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
