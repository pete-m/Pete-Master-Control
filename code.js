/* PROJECT: PMC (Phase 2)
  VERSION: v0.3.3
  AUTHOR: Peter Maben with Gemini
  LOGIC: Narrative-First Build / Delete Protocol / Tab Restoration
*/
(function() {
    const VER = "v0.3.3";
    let currentPath = 'index.html';
    let buffers = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };

    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tight">${msg}</div>` + el.innerHTML;
    };

    function ignite() {
        const h = document.getElementById('VER_ID');
        if (!h) { setTimeout(ignite, 50); return; }
        
        // Pulse Green on Success
        h.classList.replace('text-zinc-700', 'text-emerald-500');
        setTimeout(() => h.classList.replace('text-emerald-500', 'text-orange-600'), 1000);
        
        log(`<b class="text-orange-500">PMC ${VER} Handshake Verified.</b>`);

        // Hard-Binding Phase 2 Tabs
        ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'].forEach(t => {
            const btn = document.getElementById('tab-' + t);
            if(btn) btn.onclick = (e) => { e.preventDefault(); switchBuffer(t); };
        });

        // Binding Primary Actions
        document.getElementById('INIT_BTN').onclick = handlePhase1;
        document.getElementById('PUSH_TRIGGER').onclick = executeBatchDeployment;
        document.getElementById('MAIN_TEXT').oninput = saveActiveContent;
        
        restoreState();
        switchBuffer('index.html');
    }

    // --- PHASE 1: NARRATIVE ENGINE (INIT & PURGE) ---
    async function handlePhase1() {
        const pat = document.getElementById('ENTRY_TOKEN').value;
        const input = document.getElementById('INIT_REPO_NAME').value.trim();
        if(!pat) return log("❌ Error: PAT Required.");

        const owner = await getOwner(pat);

        // MODE: PURGE (YAML Detection)
        if(input.includes('repos:')) {
            const lines = input.split('\n');
            const targets = lines.filter(l => l.trim().startsWith('-')).map(l => l.replace('-', '').trim());
            
            log(`⚠️ <b>Purge Sequence:</b> Removing ${targets.length} repos.`);
            for(let name of targets) {
                const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
                    method: 'DELETE',
                    headers: {'Authorization': 'token ' + pat}
                });
                log(res.ok ? `🗑️ Deleted: ${name}` : `❌ Failed: ${name} (Not found)`);
            }
            return;
        }

        // MODE: INIT (Repo Creation)
        const names = input.split(',').map(n => n.trim()).filter(n => n);
        log(`🚀 <b>Narrative:</b> Spinning up ${names.length} instances.`);
        
        for(let name of names) {
            log(`🛠️ Creating: <b>${name}</b>...`);
            const res = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: {'Authorization': 'token ' + pat, 'Content-Type': 'application/json'},
                body: JSON.stringify({ name: name, auto_init: true })
            });

            if(res.ok) {
                log(`✅ Repo Born. Injecting Workflow...`);
                const wf = "name: deploy_static\non: [push, workflow_dispatch]\npermissions: { contents: read, pages: write, id-token: write }\njobs:\n  deploy:\n    environment: { name: github-pages }\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/configure-pages@v5\n      - uses: actions/upload-pages-artifact@v3\n        with: { path: '.' }\n      - uses: actions/deploy-pages@v4";
                await pushFile(pat, owner, name, '.github/workflows/static.yml', wf);
                log(`✨ <b>${name}</b> is LIVE.`);
            } else {
                log(`❌ Conflict: ${name} already exists.`);
            }
        }
    }

    // --- PHASE 2: COMMISSIONING ENGINE ---
    async function executeBatchDeployment() {
        const pat = document.getElementById('ENTRY_TOKEN').value;
        const repo = document.getElementById('ENTRY_REPO').value;
        if(!pat || !repo) return log("❌ Error: Target/PAT missing.");
        
        const owner = await getOwner(pat);
        const files = Object.keys(buffers).filter(k => buffers[k].trim().length > 0);
        
        log(`📡 <b>Commissioning Batch</b> to ${repo}...`);
        for (const file of files) {
            const ok = await pushFile(pat, owner, repo, file, buffers[file]);
            log((ok ? "🟢 Pushed: " : "🔴 Fail: ") + file);
        }
        log("🏁 <b>Batch Transfer Finalised.</b>");
    }

    // --- SHARED UTILITIES ---
    async function pushFile(pat, user, repo, path, content) {
        const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}`;
        let sha = null;
        try {
            const g = await fetch(url, {headers:{'Authorization':'token ' + pat}});
            if(g.ok) { const d = await g.json(); sha = d.sha; }
            const res = await fetch(url, {
                method: 'PUT',
                headers: {'Authorization':'token ' + pat, 'Content-Type':'application/json'},
                body: JSON.stringify({ message: `PMC ${VER} Commission`, content: btoa(unescape(encodeURIComponent(content))), sha: sha })
            });
            return res.ok;
        } catch(e) { return false; }
    }

    async function getOwner(pat) {
        if(window.cachedOwner) return window.cachedOwner;
        const r = await fetch('https://api.github.com/user', { headers: {'Authorization':'token ' + pat} });
        const d = await r.json();
        window.cachedOwner = d.login;
        return d.login;
    }

    function switchBuffer(path) {
        buffers[currentPath] = document.getElementById('MAIN_TEXT').value;
        currentPath = path;
        document.getElementById('MAIN_TEXT').value = buffers[path] || '';
        
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('bg-zinc-800', 'text-orange-500');
            b.classList.add('bg-zinc-900', 'text-zinc-500');
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
            
