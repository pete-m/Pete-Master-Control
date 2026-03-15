/* PROJECT: PMC (Phase 2)
  VERSION: v0.3.2
  AUTHOR: Peter Maben with Gemini
  LOGIC: Dual-Mode (Init/Delete) & Tab Recovery
*/
(function() {
    const VER = "v0.3.2";
    let currentPath = 'index.html';
    let buffers = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };

    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono">${msg}</div>` + el.innerHTML;
    };

    function ignite() {
        const h = document.getElementById('VER_ID');
        if (!h) { setTimeout(ignite, 50); return; }
        h.classList.replace('text-zinc-700', 'text-orange-600');
        
        log(`<b class="text-orange-500">PMC ${VER} ONLINE.</b>`);

        // Aggressive Tab Binding
        ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'].forEach(t => {
            const btn = document.getElementById('tab-' + t);
            if(btn) btn.onclick = (e) => { e.preventDefault(); switchBuffer(t); };
        });

        document.getElementById('INIT_BTN').onclick = handlePhase1;
        document.getElementById('PUSH_TRIGGER').onclick = executeBatchDeployment;
        document.getElementById('MAIN_TEXT').oninput = saveActiveContent;
        
        restoreState();
        switchBuffer('index.html');
    }

    async function handlePhase1() {
        const pat = document.getElementById('ENTRY_TOKEN').value;
        const input = document.getElementById('INIT_REPO_NAME').value;
        if(!pat) return alert("PAT Required.");

        // Mode Detection
        if(input.includes('repos:')) {
            log("⚠️ <b>Delete Protocol Detected.</b>");
            const reposToDelete = input.split('-').map(s => s.trim()).filter(s => s && !s.includes('repos:'));
            for(let name of reposToDelete) {
                log(`🗑️ Deleting: ${name}...`);
                const res = await fetch(`https://api.github.com/repos/${await getOwner(pat)}/${name}`, {
                    method: 'DELETE',
                    headers: {'Authorization': 'token ' + pat}
                });
                log(res.ok ? `✅ Deleted ${name}` : `❌ Failed ${name}`);
            }
        } else {
            const names = input.split(',').map(n => n.trim()).filter(n => n);
            log(`🚀 <b>Narrative:</b> Initialising ${names.length} projects.`);
            for(let name of names) {
                log(`🛠️ Creating: <b>${name}</b>...`);
                // Standard Init Logic here
            }
        }
    }

    async function getOwner(pat) {
        const r = await fetch('https://api.github.com/user', { headers: {'Authorization':'token ' + pat} });
        return (await r.json()).login;
    }

    function switchBuffer(path) {
        buffers[currentPath] = document.getElementById('MAIN_TEXT').value;
        currentPath = path;
        document.getElementById('MAIN_TEXT').value = buffers[path] || '';
        document.querySelectorAll('.tab-btn').forEach(b => b.style.borderColor = "transparent");
        const active = document.getElementById('tab-' + path);
        if(active) active.style.borderColor = "#ea580c";
        updateStagingIcons();
    }

    function saveActiveContent() {
        buffers[currentPath] = document.getElementById('MAIN_TEXT').value;
        localStorage.setItem('pmc_buffers', JSON.stringify(buffers));
        localStorage.setItem('pmc_token', document.getElementById('ENTRY_TOKEN').value);
        localStorage.setItem('pmc_repo', document.getElementById('ENTRY_REPO').value);
        updateStagingIcons();
    }

    function restoreState() {
        document.getElementById('ENTRY_TOKEN').value = localStorage.getItem('pmc_token') || '';
        document.getElementById('ENTRY_REPO').value = localStorage.getItem('pmc_repo') || '';
        const saved = localStorage.getItem('pmc_buffers');
        if (saved) { try { buffers = JSON.parse(saved); } catch(e) {} }
    }

    function updateStagingIcons() {
        Object.keys(buffers).forEach(key => {
            const el = document.getElementById('status-' + key);
            if(el) el.style.opacity = buffers[key]?.trim().length > 0 ? "1" : "0.3";
        });
    }

    ignite();
})();
        document.getElementById('MAIN_TEXT').value = buffers[path] || '';
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
        const activeBtn = document.getElementById('tab-' + path);
        if(activeBtn) activeBtn.classList.add('active-tab');
        updateStagingIcons();
    }

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
            
