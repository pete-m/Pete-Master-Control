/* PMC RECOVERY | v0.8.2.5 | SIMPLE LOGIC */
const files = ['index.html', 'code.js', 'manifest.js'];
let buffer = { 'index.html': '', 'code.js': '', 'manifest.js': '' };
let pat = '', user = '', activeTab = 'index.html';

window.log = (m) => {
    const el = document.getElementById('LOG_INNER');
    const div = document.createElement('div');
    div.className = 'log-line';
    div.textContent = `> ${m}`;
    el.prepend(div);
};

window.handshake = async () => {
    pat = document.getElementById('TOKEN').value.trim();
    if (pat.length < 40) return;
    try {
        const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
        const d = await r.json();
        if (r.ok) {
            user = d.login;
            document.getElementById('STATUS').textContent = `Status: Online (${user})`;
            log(`CONNECTED: ${user}`);
            // Restore saved work
            files.forEach(f => {
                const s = localStorage.getItem(`pmc_${f}`);
                if (s) buffer[f] = s;
            });
            document.getElementById('EDITOR').value = buffer[activeTab];
        } else {
            log("AUTH FAILED: Check Token");
        }
    } catch (e) { log("ERR: Connection issue"); }
};

window.switchTab = (f) => {
    // Save current work
    buffer[activeTab] = document.getElementById('EDITOR').value;
    localStorage.setItem(`pmc_${activeTab}`, buffer[activeTab]);
    
    // Update UI
    document.querySelectorAll('.pmc-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${f}`).classList.add('active');
    
    // Switch
    activeTab = f;
    document.getElementById('EDITOR').value = buffer[activeTab] || '';
    log(`TAB: ${f}`);
};

window.push = async () => {
    const repo = document.getElementById('REPO').value.trim();
    const content = document.getElementById('EDITOR').value;
    if (!repo) return log("ERR: No Repo Name");

    log(`PUSHING: ${activeTab}...`);
    try {
        const get = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${activeTab}`, {
            headers: { 'Authorization': `token ${pat}` }
        });
        const sha = get.ok ? (await get.json()).sha : null;

        const put = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${activeTab}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${pat}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `PMC Update ${activeTab}`,
                content: btoa(unescape(encodeURIComponent(content))),
                sha: sha
            })
        });

        if (put.ok) {
            log(`SUCCESS: ${activeTab} deployed`);
            const url = `https://${user}.github.io/${repo}/`;
            document.getElementById('LIVE_LINK').href = url;
            document.getElementById('LIVE_LINK').textContent = url;
            document.getElementById('LINK_BOX').classList.remove('hidden');
        } else {
            log(`ERR: ${put.status}`);
        }
    } catch (e) { log("ERR: Push failed"); }
};

// Start-up
log("PMC ENGINE READY");
        const targetRepo = document.getElementById('TARGET_REPO_NAME').value.trim();
        if (!targetRepo) return log("❌ MAINT: NO TARGET");
        log(`📡 DISPATCHING: ${targetRepo}`);
        await fetch(`https://api.github.com/repos/${userLogin}/${targetRepo}/dispatches`, {
            method: 'POST',
            headers: { 'Authorization': `token ${sessionPat}`, 'Accept': 'application/vnd.github.v3+json' },
            body: JSON.stringify({ event_type: "pmmc_maintenance_trigger" })
        });
        log("✅ SIGNAL SENT");
    };

    window.clearRepos = () => { 
        document.getElementById('NEW_REPO_NAME').value = '';
        document.getElementById('TARGET_REPO_NAME').value = '';
        log("🗑️ FIELDS WIPED"); 
        document.getElementById('MAINT_MODAL').style.display = 'none';
    };

    log(`PMMC_OPS_ENGINE v0.8.2.5 ONLINE.`);
})();
        // log(`📍 PMMC_FOCUS: ${activeTab.toUpperCase()}`); 
    };

    const updateAssetUI = async () => {
        if (!currentRepo) return;
        for (const f of files) {
            const r = await fetch(`https://api.github.com/repos/${userLogin}/${currentRepo}/contents/${f}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const dot = document.getElementById(`stat-${f}`);
            if (dot) dot.className = r.ok ? 'pmmc-dot on' : 'pmmc-dot';
        }
    };

    log(`PMMC_OPS_ENGINE v0.8.2.2 ONLINE.`);
})();
