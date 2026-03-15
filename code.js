/* PROJECT: PMC (Phase 2)
  VERSION: v0.3.0
  AUTHOR: Peter Maben with Gemini
  LOGIC: Batch Commissioning Engine
*/
(function() {
    const VER = "v0.3.0";
    let currentPath = 'index.html';
    let buffers = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };

    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<span class="block border-b border-zinc-900 py-1">${msg}</span>` + el.innerHTML;
    };

    function ignite() {
        const h = document.getElementById('VER_ID');
        if (!h) { setTimeout(ignite, 50); return; }

        // Heartbeat visual: turn header orange to prove script is running
        h.classList.replace('text-zinc-700', 'text-orange-600');
        
        log(`<b class="text-white uppercase tracking-widest text-[9px]">Handshake: Logic ${VER} Engaged</b>`);

        // Attach Listeners
        document.getElementById('INIT_BTN').onclick = batchInit;
        document.getElementById('PUSH_TRIGGER').onclick = executeBatchDeployment;
        document.getElementById('CLEAR_BTN').onclick = clearCurrentBuffer;
        document.getElementById('MAIN_TEXT').oninput = saveActiveContent;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => switchBuffer(btn.id.replace('tab-', ''));
        });

        // Restore State
        document.getElementById('ENTRY_TOKEN').value = localStorage.getItem('pmc_token') || '';
        document.getElementById('ENTRY_REPO').value = localStorage.getItem('pmc_repo') || '';
        document.getElementById('INIT_REPO_NAME').value = localStorage.getItem('pmc_init_repo') || '';
        
        const saved = localStorage.getItem('pmc_buffers');
        if (saved) { try { buffers = JSON.parse(saved); } catch(e) {} }
        
        switchBuffer('index.html');
    }

    async function batchInit() {
        const pat = document.getElementById('ENTRY_TOKEN').value;
        const names = document.getElementById('INIT_REPO_NAME').value.split(',').map(n => n.trim()).filter(n => n);
        if(!pat || !names.length) return alert("Credentials/Names missing.");
        
        const r = await fetch('https://api.github.com/user', { headers: {'Authorization':'token ' + pat} });
        if(!r.ok) return log("❌ Auth failed.");
        const user = (await r.json()).login;

        log(`🚀 Initialising ${names.length} project(s)...`);

        for(let name of names) {
            log(`🛠️ Creating Repo: <b>${name}</b>`);
            const res = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: {'Authorization': 'token ' + pat, 'Content-Type': 'application/json'},
                body: JSON.stringify({ name: name, auto_init: true })
            });

            if(res.ok) {
                log(`✅ Repo Created. Injecting Workflow...`);
                const staticWF = "name: deploy_static\non: [push, workflow_dispatch]\npermissions: { contents: read, pages: write, id-token: write }\njobs:\n  deploy:\n    environment: { name: github-pages }\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/configure-pages@v5\n      - uses: actions/upload-pages-artifact@v3\n        with: { path: '.' }\n      - uses: actions/deploy-pages@v4";
                await pushFile(pat, user, name, '.github/workflows/static.yml', staticWF);
                log(`✨ <b>${name}</b> is LIVE.`);
            } else {
                log(`❌ Failed: Repo might already exist.`);
            }
        }
    }

    async function executeBatchDeployment() {
        const pat = document.getElementById('ENTRY_TOKEN').value;
        const repo = document.getElementById('ENTRY_REPO').value;
        const r = await fetch('https://api.github.com/user', { headers: {'Authorization':'token ' + pat} });
        const user = (await r.json()).login;
        const files = Object.keys(buffers).filter(k => buffers[k].trim().length > 0);
        
        log(`📡 Transferring Assets to <b>${repo}</b>...`);
        for (const file of files) {
            const ok = await pushFile(pat, user, repo, file, buffers[file]);
            log((ok ? "🟢 Pushed: " : "🔴 Error: ") + file);
        }
        log("🏁 <b>Batch Transfer Complete.</b>");
    }

    async function pushFile(pat, user, repo, path, content) {
        const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}`;
        let sha = null;
        try {
            const g = await fetch(url, {headers:{'Authorization':'token ' + pat}});
            if(g.ok) { const d = await g.json(); sha = d.sha; }
            const res = await fetch(url, {
                method: 'PUT',
                headers: {'Authorization':'token ' + pat, 'Content-Type':'application/json'},
                body: JSON.stringify({ message: `PMC ${VER} Sync`, content: btoa(unescape(encodeURIComponent(content))), sha: sha })
            });
            return res.ok;
        } catch(e) { return false; }
    }

    function switchBuffer(path) {
        buffers[currentPath] = document.getElementById('MAIN_TEXT').value;
        currentPath = path;
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
            
