/* PROJECT: PMC (Phase 2)
   VERSION: v0.4.0 (Stabilised Build)
   LOGIC: Buffered Fitter & SHA-Validated Push
*/

(function() {
    // Persistent memory for the Fitter session
    const fitterBuffer = {
        'index.html': '',
        'code.js': '',
        'style.css': '',
        'manifest.js': '',
        'README.md': ''
    };
    
    let activeTab = 'index.html';

    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) {
            el.insertAdjacentHTML('afterbegin', `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tight">${msg}</div>`);
        }
    };

    document.addEventListener('click', async function (e) {
        const target = e.target.closest('button');
        if (!target) return;

        // --- 1. THE EMERALD HANDSHAKE ---
        if (target.id === 'HANDSHAKE_BTN') {
            const pat = document.getElementById('ENTRY_TOKEN').value.trim();
            if(!pat) return log("<span class='text-red-500'>❌ PAT REQUIRED</span>");
            
            target.disabled = true;
            target.innerText = "...";
            await verifyIdentity(pat);
            target.disabled = false;
            target.innerText = "Verify";
        }

        // --- 2. THE BUFFERED FITTER (Tab Switching) ---
        if (target.classList.contains('tab-btn')) {
            const textArea = document.getElementById('MAIN_TEXT');
            const newTab = target.id.replace('tab-', '');

            fitterBuffer[activeTab] = textArea.value;

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('text-orange-500', 'border-orange-600');
                btn.classList.add('text-zinc-500', 'border-zinc-800');
            });
            target.classList.add('text-orange-500', 'border-orange-600');
            target.classList.remove('text-zinc-500', 'border-zinc-800');

            activeTab = newTab;
            textArea.value = fitterBuffer[activeTab];
            log(`[Fitter] Focused: ${activeTab}`);
        }

        // --- 3. THE COMMISSION BATCH (GitHub Push) ---
        if (target.id === 'PUSH_TRIGGER') {
            const repoInput = document.getElementById('ENTRY_REPO').value.trim();
            const content = document.getElementById('MAIN_TEXT').value;

            if(!repoInput || !content || !window.SESSION_PAT) {
                return log("<span class='text-orange-500'>⚠️ LOCK ERROR: Check PAT/Repo/Content</span>");
            }

            // Ensure repo format is correct (user/repo)
            // If the user only provides 'repo-name', we'll use the authenticated username
            let repoPath = repoInput;
            if (!repoPath.includes('/')) {
                repoPath = `${window.USER_LOGIN}/${repoInput}`;
            }

            target.disabled = true;
            target.innerText = "COMMISSIONING...";
            await executePush(repoPath, activeTab, content);
            target.disabled = false;
            target.innerText = "Commission Batch";
        }
    });

    async function verifyIdentity(pat) {
        log("📡 Querying Gateway...");
        try {
            const r = await fetch('https://api.github.com/user', { 
                headers: {'Authorization': `token ${pat}`} 
            });
            if(r.ok) {
                const d = await r.json();
                window.USER_LOGIN = d.login; // Store login for path construction
                log(`<span class="text-emerald-400">✅ Handshake: ${d.login}</span>`);
                unlockUI(pat);
            } else {
                log(`<span class="text-red-500">❌ Access Denied: ${r.status}</span>`);
            }
        } catch(e) { log(`❌ Error: ${e.message}`); }
    }

    function unlockUI(pat) {
        window.SESSION_PAT = pat;
        const verId = document.getElementById('VER_ID');
        const phase2 = document.getElementById('PHASE_2_UI');
        
        verId.innerText = "PMC v0.4.0";
        verId.style.color = "#10b981";
        verId.classList.remove('italic');
        
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
