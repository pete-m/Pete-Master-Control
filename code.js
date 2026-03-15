(function() {
    let currentPath = 'index.html';
    let buffers = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let cachedUser = null;

    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<span class="block border-b border-zinc-900 py-1">${msg}</span>` + el.innerHTML;
    };

    const WORKFLOWS = {
        static: "name: deploy_static\non: [push, workflow_dispatch]\npermissions: { contents: read, pages: write, id-token: write }\njobs:\n  deploy:\n    environment: { name: github-pages }\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/configure-pages@v5\n      - uses: actions/upload-pages-artifact@v3\n        with: { path: '.' }\n      - uses: actions/deploy-pages@v4"
    };

    function ignite() {
        const initBtn = document.getElementById('INIT_BTN');
        if (!initBtn) {
            setTimeout(ignite, 100);
            return;
        }

        initBtn.onclick = batchInit;
        document.getElementById('PUSH_TRIGGER').onclick = executeBatchDeployment;
        document.getElementById('CLEAR_BTN').onclick = clearCurrentBuffer;
        document.getElementById('MAIN_TEXT').oninput = saveActiveContent;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => switchBuffer(btn.id.replace('tab-', ''));
        });

        document.getElementById('ENTRY_TOKEN').value = localStorage.getItem('pmc_token') || '';
        document.getElementById('ENTRY_REPO').value = localStorage.getItem('pmc_repo') || '';
        document.getElementById('INIT_REPO_NAME').value = localStorage.getItem('pmc_init_repo') || '';
        
        const saved = localStorage.getItem('pmc_buffers');
        if (saved) { try { buffers = JSON.parse(saved); } catch(e) {} }
        
        switchBuffer('index.html');
        log("<b class='text-orange-500'>[SYSTEM] Architecture Locked. Ready.</b>");
    }

    async function batchInit() {
        const pat = document.getElementById('ENTRY_TOKEN').value;
        const names = document.getElementById('INIT_REPO_NAME').value.split(',').map(n => n.trim()).filter(n => n);
        if(!pat || !names.length) return alert("Credentials/Names missing.");
        
        const user = await getUsername(pat);
        if(!user) return log("❌ Auth failed. Check PAT.");

        log(`🚀 Initialising ${names.length} project(s)...`);

        for(let name of names) {
            log(`🛠️ Creating Repo: <b>${name}</b>`);
            const res = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: {'Authorization': 'token ' + pat, 'Content-Type': 'application/json'},
                body: JSON.stringify({ name: name, auto_init: true })
            });

            if(res.ok) {
                log(`✅ Repo Created. Injecting CI/CD Workflow...`);
                const wfOk = await pushFile(pat, user, name, '.github/workflows/static.yml', WORKFLOWS.static);
                if(wfOk) log(`✨ <b>${name}</b> is LIVE and Pages-ready.`);
                else log(`⚠️ Repo created, but Workflow failed.`);
            } else {
                const err = await res.json();
                log(`❌ Failed: ${err.message}`);
            }
        }
    }

    async function executeBatchDeployment() {
        const pat = document.getElementById('ENTRY_TOKEN').value;
        const repo = document.getElementById('ENTRY_REPO').value;
        const user = await getUsername(pat);
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
                body: JSON.stringify({ message: "PMC Sync", content: btoa(unescape(encodeURIComponent(content))), sha: sha })
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

    async function getUsername(pat) {
        if(cachedUser) return cachedUser;
        const r = await fetch('https://api.github.com/user', { headers: {'Authorization':'token ' + pat} });
        if(r.ok) { const d = await r.json(); cachedUser = d.login; return d.login; }
        return null;
    }

    function clearCurrentBuffer() {
        document.getElementById('MAIN_TEXT').value = '';
        saveActiveContent();
    }

    ignite();
})();

function hardReset() {
    if(confirm("Wipe local cache?")) { localStorage.clear(); location.reload(); }
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

    async function getUsername(pat) {
        if(cachedUser) return cachedUser;
        const r = await fetch('https://api.github.com/user', { headers: {'Authorization':'token ' + pat} });
        if(r.ok) { const d = await r.json(); cachedUser = d.login; return d.login; }
        return null;
    }

    function clearCurrentBuffer() {
        document.getElementById('MAIN_TEXT').value = '';
        saveActiveContent();
    }

    ignite();
})();

function hardReset() {
    if(confirm("Wipe local cache?")) { localStorage.clear(); location.reload(); }
                }
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

    async function getUsername(pat) {
        if(cachedUser) return cachedUser;
        const r = await fetch('https://api.github.com/user', { headers: {'Authorization':'token ' + pat} });
        if(r.ok) { const d = await r.json(); cachedUser = d.login; return d.login; }
        return null;
    }

    function clearCurrentBuffer() {
        document.getElementById('MAIN_TEXT').value = '';
        saveActiveContent();
    }

    // Start the search for elements
    ignite();
})();

function hardReset() {
    if(confirm("Wipe local cache?")) { localStorage.clear(); location.reload(); }
}
