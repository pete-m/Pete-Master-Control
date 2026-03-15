/* PMC v0.4.0 - RESTORED BASELINE */

(function() {
    const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let activeTab = 'index.html';
    let sessionPat = '';

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase text-emerald-500">${m}</div>` + el.innerHTML;
    };

    // LOGIC START CONFIRMATION
    log("SYSTEM READY");

    // 1. Handshake
    document.getElementById('HANDSHAKE_BTN').onclick = function() {
        const pat = document.getElementById('ENTRY_TOKEN').value.trim();
        log("📡 Verifying...");
        
        fetch('https://api.github.com/user', {
            headers: { 'Authorization': 'token ' + pat }
        })
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(d => {
            sessionPat = pat;
            log("✅ Hello " + d.login);
            document.getElementById('VER_ID').style.color = "#10b981";
            document.getElementById('PHASE_2_UI').style.opacity = "1";
            document.getElementById('PHASE_2_UI').style.pointerEvents = "auto";
        })
        .catch(err => log("❌ Denied: " + err));
    };

    // 2. Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = function() {
            const area = document.getElementById('MAIN_TEXT');
            buffer[activeTab] = area.value;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.style.borderColor = "#27272a");
            btn.style.borderColor = "#ea580c";

            activeTab = btn.id.replace('tab-', '');
            area.value = buffer[activeTab];
            log("Tab: " + activeTab);
        };
    });

    // 3. Push
    document.getElementById('PUSH_TRIGGER').onclick = function() {
        const repo = document.getElementById('ENTRY_REPO').value.trim();
        const content = document.getElementById('MAIN_TEXT').value;
        if (!repo || !content || !sessionPat) return log("⚠️ Check Inputs");

        log("🚀 Commissioning " + activeTab);
        
        fetch('https://api.github.com/repos/' + repo + '/contents/' + activeTab, {
            headers: { 'Authorization': 'token ' + sessionPat }
        })
        .then(r => r.ok ? r.json() : { sha: null })
        .then(file => {
            return fetch('https://api.github.com/repos/' + repo + '/contents/' + activeTab, {
                method: 'PUT',
                headers: { 'Authorization': 'token ' + sessionPat },
                body: JSON.stringify({
                    message: "PMC Update",
                    content: btoa(unescape(encodeURIComponent(content))),
                    sha: file.sha || null
                })
            });
        })
        .then(r => r.ok ? log("✨ Success") : log("❌ Failed"))
        .catch(e => log("❌ Error"));
    };
})();
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
