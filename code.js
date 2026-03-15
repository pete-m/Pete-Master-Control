// Data State
let currentPath = 'index.html';
let buffers = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
let cachedUser = null;

const WORKFLOWS = {
    static: "name: deploy_static\non: [push, workflow_dispatch]\npermissions: { contents: read, pages: write, id-token: write }\njobs:\n  deploy:\n    environment: { name: github-pages }\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/configure-pages@v5\n      - uses: actions/upload-pages-artifact@v3\n        with: { path: '.' }\n      - uses: actions/deploy-pages@v4"
};

// This function MUST run to wake up the UI
function startup() {
    const logEl = document.getElementById('UI_LOG');
    logEl.innerHTML = "<b class='text-white'>[READY] System Logic Engaged.</b>";
    
    // Manual wiring of listeners
    document.getElementById('INIT_BTN').onclick = batchInit;
    document.getElementById('PUSH_TRIGGER').onclick = executeBatchDeployment;
    document.getElementById('CLEAR_BTN').onclick = clearCurrentBuffer;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => switchBuffer(btn.id.replace('tab-', ''));
    });

    // Load Credentials
    document.getElementById('ENTRY_TOKEN').value = localStorage.getItem('pmc_token') || '';
    document.getElementById('ENTRY_REPO').value = localStorage.getItem('pmc_repo') || '';
    document.getElementById('INIT_REPO_NAME').value = localStorage.getItem('pmc_init_repo') || '';
    
    const saved = localStorage.getItem('pmc_buffers');
    if (saved) { try { buffers = JSON.parse(saved); } catch(e) {} }
    
    switchBuffer('index.html');
}

function saveCreds() {
    localStorage.setItem('pmc_token', document.getElementById('ENTRY_TOKEN').value);
    localStorage.setItem('pmc_repo', document.getElementById('ENTRY_REPO').value);
    localStorage.setItem('pmc_init_repo', document.getElementById('INIT_REPO_NAME').value);
}

function saveActiveContent() {
    buffers[currentPath] = document.getElementById('MAIN_TEXT').value;
    localStorage.setItem('pmc_buffers', JSON.stringify(buffers));
    updateStagingIcons();
}

function switchBuffer(path) {
    buffers[currentPath] = document.getElementById('MAIN_TEXT').value;
    currentPath = path;
    document.getElementById('MAIN_TEXT').value = buffers[path] || '';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    document.getElementById('tab-' + path).classList.add('active-tab');
    updateStagingIcons();
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

function updateLog(msg) {
    const log = document.getElementById('UI_LOG');
    log.innerHTML = msg + '<br>' + log.innerHTML;
}

async function getUsername(pat) {
    if(cachedUser) return cachedUser;
    const r = await fetch('https://api.github.com/user', { headers: {'Authorization':'token ' + pat} });
    if(r.ok) { const d = await r.json(); cachedUser = d.login; return d.login; }
    return null;
}

async function batchInit() {
    const pat = document.getElementById('ENTRY_TOKEN').value;
    const names = document.getElementById('INIT_REPO_NAME').value.split(',').map(n => n.trim()).filter(n => n);
    if(!pat || !names.length) return alert("Check inputs.");
    const user = await getUsername(pat);
    for(let name of names) {
        updateLog("Creating " + name + "...");
        const res = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {'Authorization': 'token ' + pat, 'Content-Type': 'application/json'},
            body: JSON.stringify({ name: name, auto_init: true })
        });
        if(res.ok) {
            await pushFile(pat, user, name, '.github/workflows/static.yml', WORKFLOWS.static);
            updateLog("Success: " + name);
        } else { updateLog("Failed: " + name); }
    }
}

async function executeBatchDeployment() {
    const pat = document.getElementById('ENTRY_TOKEN').value;
    const repo = document.getElementById('ENTRY_REPO').value;
    const user = await getUsername(pat);
    const files = Object.keys(buffers).filter(k => buffers[k].trim().length > 0);
    updateLog("Deploying to " + repo + "...");
    for (const file of files) {
        const ok = await pushFile(pat, user, repo, file, buffers[file]);
        updateLog((ok ? "OK: " : "FAIL: ") + file);
    }
}

async function pushFile(pat, user, repo, path, content) {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}`;
    let sha = null;
    const g = await fetch(url, {headers:{'Authorization':'token ' + pat}});
    if(g.ok) { const d = await g.json(); sha = d.sha; }
    const res = await fetch(url, {
        method: 'PUT',
        headers: {'Authorization':'token ' + pat, 'Content-Type':'application/json'},
        body: JSON.stringify({ message: "Update", content: btoa(unescape(encodeURIComponent(content))), sha: sha })
    });
    return res.ok;
}

function clearCurrentBuffer() {
    document.getElementById('MAIN_TEXT').value = '';
    saveActiveContent();
}

function hardReset() {
    if(confirm("Reset?")) { localStorage.clear(); location.reload(); }
}

// Fire the startup
startup();
        } else {
            updateLog("Failed: " + name);
        }
    }
}

async function executeBatchDeployment() {
    const pat = document.getElementById('ENTRY_TOKEN').value;
    const repo = document.getElementById('ENTRY_REPO').value;
    const files = Object.keys(buffers).filter(k => buffers[k].trim().length > 0);
    
    if(!pat || !repo || files.length === 0) return alert("Missing Data.");
    const user = await getUsername(pat);
    
    updateLog("Pushing to " + repo + "...");
    for (const file of files) {
        const success = await pushFile(pat, user, repo, file, buffers[file]);
        updateLog((success ? "OK: " : "FAIL: ") + file);
    }
}

async function pushFile(pat, user, repo, path, content) {
    const url = 'https://api.github.com/repos/' + user + '/' + repo + '/contents/' + path;
    let sha = null;
    const g = await fetch(url, {headers:{'Authorization':'token ' + pat}});
    if(g.ok) { const d = await g.json(); sha = d.sha; }

    const res = await fetch(url, {
        method: 'PUT',
        headers: {'Authorization':'token ' + pat, 'Content-Type':'application/json'},
        body: JSON.stringify({
            message: "PMC v0.2.5 Update",
            content: btoa(unescape(encodeURIComponent(content))),
            sha: sha
        })
    });
    return res.ok;
}

function clearCurrentBuffer() {
    document.getElementById('MAIN_TEXT').value = '';
    saveActiveContent();
}

function hardReset() {
    if(confirm("Wipe local cache?")) { localStorage.clear(); location.reload(); }
}
            method: 'POST',
            headers: {'Authorization': 'token ' + pat, 'Content-Type': 'application/json'},
            body: JSON.stringify({ name: name, auto_init: true })
        });
        if (res.ok) {
            await pushFile(pat, user, name, '.github/workflows/static.yml', WORKFLOWS.static);
            await pushFile(pat, user, name, '.github/workflows/clear_out.yml', WORKFLOWS.clearout);
            updateLog("Success: " + name);
        } else {
            updateLog("Error: " + name);
        }
    }
}

async function executeBatchDeployment() {
    const pat = document.getElementById('ENTRY_TOKEN').value;
    const repo = document.getElementById('ENTRY_REPO').value;
    const files = Object.keys(buffers).filter(k => buffers[k].trim().length > 0);
    
    if (!pat || !repo || files.length === 0) return alert("Check Assets/Repo/PAT.");
    const user = await getUsername(pat);
    if (!user) return updateLog("Auth Failed.");

    updateLog("Starting deployment...");
    for (const file of files) {
        updateLog("Pushing: " + file);
        const success = await pushFile(pat, user, repo, file, buffers[file]);
        if (success) updateLog("Confirmed: " + file);
        else updateLog("Error: " + file);
    }
    updateLog("Batch Finished.");
}

async function pushFile(pat, user, repo, path, content) {
    const url = 'https://api.github.com/repos/' + user + '/' + repo + '/contents/' + path;
    let sha = null;
    try {
        const g = await fetch(url, {headers:{'Authorization':'token ' + pat}});
        if (g.ok) { const d = await g.json(); sha = d.sha; }

        const res = await fetch(url, {
            method: 'PUT',
            headers: {'Authorization':'token ' + pat, 'Content-Type':'application/json'},
            body: JSON.stringify({
                message: "PMC Update",
                content: btoa(unescape(encodeURIComponent(content))),
                sha: sha
            })
        });
        return res.ok;
    } catch(e) { return false; }
}

function clearCurrentBuffer() {
    document.getElementById('MAIN_TEXT').value = '';
    saveActiveContent();
}

function hardReset() {
    if (confirm("Wipe local cache?")) { localStorage.clear(); location.reload(); }
}

async function pushFile(pat, user, repo, path, content) {
    const url = 'https://api.github.com/repos/' + user + '/' + repo + '/contents/' + path;
    let sha = null;
    try {
        const g = await fetch(url, {headers:{'Authorization':'token ' + pat}});
        if(g.ok) { const d = await g.json(); sha = d.sha; }

        const res = await fetch(url, {
            method: 'PUT',
            headers: {'Authorization':'token ' + pat, 'Content-Type':'application/json'},
            body: JSON.stringify({
                message: "PMC Update",
                content: btoa(unescape(encodeURIComponent(content))),
                sha: sha
            })
        });
        return res.ok;
    } catch(e) { return false; }
}

function clearCurrentBuffer() {
    document.getElementById('MAIN_TEXT').value = '';
    saveActiveContent();
}

function hardReset() {
    if(confirm("Wipe local cache?")) { localStorage.clear(); location.reload(); }
}
