/* PROJECT: PMC (Phase 2)
  VERSION: v0.3.7
  LOGIC: Manual Verification & Phase 2 UI Unlock
*/
(function() {
    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tight">${msg}</div>` + el.innerHTML;
    };

    function ignite() {
        const h = document.getElementById('VER_ID');
        if (!h || window.PMC_VER !== "v0.3.7") return;
        
        h.classList.replace('text-zinc-700', 'text-orange-600');
        log(`<b>PMC ${window.PMC_VER} ENGINE READY.</b>`);

        document.getElementById('HANDSHAKE_BTN').onclick = () => {
            verifyIdentity(document.getElementById('ENTRY_TOKEN').value);
        };

        document.getElementById('INIT_BTN').onclick = handlePhase1;
        document.getElementById('PUSH_TRIGGER').onclick = executeBatchDeployment;

        ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'].forEach(t => {
            const btn = document.getElementById('tab-' + t);
            if(btn) btn.onclick = (e) => { e.preventDefault(); switchBuffer(t); };
        });

        restoreState();
        switchBuffer('index.html');
    }

    async function verifyIdentity(pat) {
        if(!pat) return log("❌ Error: PAT required.");
        log("📡 Manual Handshake Triggered...");
        try {
            const r = await fetch('https://api.github.com/user', { headers: {'Authorization':'token ' + pat.trim()} });
            if(r.ok) {
                const d = await r.json();
                window.cachedOwner = d.login;
                log(`✅ <b>Hello ${d.login}</b>. Phase 2 Unlocked.`);
                document.getElementById('VER_ID').style.color = "#10b981"; // The Emerald Light
                document.getElementById('PHASE_2_UI').style.opacity = "1";
                document.getElementById('PHASE_2_UI').style.pointerEvents = "auto";
            } else {
                log(`❌ GitHub Rejected PAT: ${r.status}`);
            }
        } catch(e) { log(`❌ Error: ${e.message}`); }
    }

    // Standard support functions (switchBuffer, handlePhase1, etc.) as per v0.3.4 logic
    // ... [Omitted for brevity to stay in lockstep with user build] ...

    ignite();
})();
    </div>

    <script>
        const log = (m) => {
            const el = document.getElementById('UI_LOG');
            if(el) el.innerHTML = m + '<br>' + el.innerHTML;
        };
        
        // Loader forces download of latest code.js by appending a timestamp
        fetch('./code.js?nocache=' + new Date().getTime())
            .then(r => r.text())
            .then(code => {
                const s = document.createElement('script');
                s.textContent = code;
                document.body.appendChild(s);
                log("<span class='text-zinc-400'>[System] Logic Streamed. Handshake pending...</span>");
            })
            .catch(e => log("<span class='text-red-500'>[Error] Logic injection failed.</span>"));
    </script>
</body>
</html>
        });
        const active = document.getElementById('tab-' + path);
        if(active) {
            active.classList.replace('bg-zinc-900', 'bg-zinc-800');
            active.classList.replace('text-zinc-500', 'text-orange-500');
        }
        updateStagingIcons();
    }

    function saveActiveContent() {
        buffers[currentPath] = document.getElementById('MAIN_TEXT').value;
        localStorage.setItem('pmc_buffers', JSON.stringify(buffers));
        localStorage.setItem('pmc_token', document.getElementById('ENTRY_TOKEN').value);
        localStorage.setItem('pmc_repo', document.getElementById('ENTRY_REPO').value);
        localStorage.setItem('pmc_init_repo', document.getElementById('INIT_REPO_NAME').value);
        updateStagingIcons();
    }

    function restoreState() {
        document.getElementById('ENTRY_TOKEN').value = localStorage.getItem('pmc_token') || '';
        document.getElementById('ENTRY_REPO').value = localStorage.getItem('pmc_repo') || '';
        document.getElementById('INIT_REPO_NAME').value = localStorage.getItem('pmc_init_repo') || '';
        const saved = localStorage.getItem('pmc_buffers');
        if (saved) { try { buffers = JSON.parse(saved); } catch(e) {} }
    }

    function updateStagingIcons() {
        Object.keys(buffers).forEach(key => {
            const el = document.getElementById('status-' + key);
            if(el) el.style.color = buffers[key]?.trim().length > 0 ? "#ea580c" : "#3f3f46";
        });
    }

    ignite();
})();

    function saveActiveContent() {
        buffers[currentPath] = document.getElementById('MAIN_TEXT').value;
        localStorage.setItem('pmc_buffers', JSON.stringify(buffers));
        updateStagingIcons();
        localStorage.setItem('pmc_token', document.getElementById('ENTRY_TOKEN').value);
        localStorage.setItem('pmc_repo', document.getElementById('ENTRY_REPO').value);
        localStorage.setItem('pmc_init_repo', document.getElementById('INIT_REPO_NAME').value);
    }

    function updateStagingIcons() {
        Object.keys(buffers).forEach(key => {
            const el = document.getElementById('status-' + key);
            if(el) {
                if(buffers[key]?.trim().length > 0) el.classList.add('staged');
                else el.classList.remove('staged');
            }
        });
    }

    ignite();
})();

function hardReset() {
    if(confirm("Wipe local cache?")) { localStorage.clear(); location.reload(); }
                                      }
            
