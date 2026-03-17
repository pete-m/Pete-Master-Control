/* PROJECT: PMMC | VERSION: 0.8.2.2 | STATUS: STABLE-RESTORED */
(function() {
    const files = ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'];
    let buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let sessionPat = '', userLogin = '', activeTab = 'index.html', currentRepo = '';

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        const entry = document.createElement('div');
        entry.className = 'log-line';
        entry.textContent = `> ${m}`;
        el.prepend(entry);
    };

    window.toggleLog = () => {
        const shell = document.getElementById('LOG_SHELL');
        shell.classList.toggle('open');
        shell.classList.toggle('shut');
    };

    window.silentHandshake = async () => {
        const pat = document.getElementById('ENTRY_TOKEN').value.trim();
        if (pat.length < 40) return;
        try {
            const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
            if (r.ok) {
                const d = await r.json();
                sessionPat = pat; userLogin = d.login;
                log(`PMMC_AUTH: ${d.login.toUpperCase()} SECURED`);
                document.getElementById('PHASE_1_UI').style.opacity = "1";
                document.getElementById('PHASE_1_UI').style.pointerEvents = "auto";
            }
        } catch (e) { log("PMMC_AUTH: FAILED"); }
    };

    window.runInit = async () => {
        const name = document.getElementById('INIT_REPO_NAME').value.trim();
        if(!name) return;
        log(`🔨 PMMC_INIT: [${name}]`);
        try {
            const r = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, auto_init: true })
            });
            if (r.ok || r.status === 422) {
                currentRepo = name;
                document.getElementById('PHASE_2_UI').style.opacity = "1";
                document.getElementById('PHASE_2_UI').style.pointerEvents = "auto";
                
                const yaml = `name: PMMC_Ops\non:\n  repository_dispatch:\n    types: [pmmc_maintenance_trigger]\njobs:\n  ops:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "PMMC_OPS_ACTIVE"`;
                await fetch(`https://api.github.com/repos/${userLogin}/${name}/contents/.github/workflows/pmmc-ops.yml`, {
                    method: 'PUT',
                    headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: "PMMC_System_Init", content: btoa(unescape(encodeURIComponent(yaml))) })
                });
                log("✨ PMMC_ENGINE: STABILISED");
                updateAssetUI();
            }
        } catch (e) { log("❌ PMMC_INIT: ERROR"); }
    };

    window.runPush = async () => {
        const content = document.getElementById('MAIN_TEXT').value;
        if(!currentRepo || !content) return log("❌ DEPLOY: NO ANCHOR/DATA");
        log(`📡 COMMISSIONING: ${activeTab.toUpperCase()}`);
        try {
            const res = await fetch(`https://api.github.com/repos/${userLogin}/${currentRepo}/contents/${activeTab}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const sha = res.ok ? (await res.json()).sha : null;
            const push = await fetch(`https://api.github.com/repos/${userLogin}/${currentRepo}/contents/${activeTab}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "PMMC_Sync", content: btoa(unescape(encodeURIComponent(content))), sha })
            });
            if (push.ok) {
                log(`💎 SECURED: ${activeTab.toUpperCase()}`);
                updateAssetUI();
            }
        } catch (e) { log("❌ PUSH ERROR"); }
    };

    window.invokeYAML = async () => {
        if (!currentRepo) return log("❌ MAINT: NO ANCHOR");
        log(`📡 DISPATCHING: ${currentRepo}`);
        await fetch(`https://api.github.com/repos/${userLogin}/${currentRepo}/dispatches`, {
            method: 'POST',
            headers: { 'Authorization': `token ${sessionPat}`, 'Accept': 'application/vnd.github.v3+json' },
            body: JSON.stringify({ event_type: "pmmc_maintenance_trigger" })
        });
        log("✅ SIGNAL SENT");
    };

    window.clearRepos = () => { 
        currentRepo = ''; 
        document.getElementById('PHASE_2_UI').style.opacity = "0.3";
        document.getElementById('PHASE_2_UI').style.pointerEvents = "none";
        log("🗑️ ANCHOR RELEASED"); 
        document.getElementById('MAINT_MODAL').style.display = 'none';
    };

    window.switchTab = (t) => {
        buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
        document.querySelectorAll('.pmmc-tab').forEach(b => b.classList.remove('active'));
        document.getElementById(t).classList.add('active');
        activeTab = t.replace('tab-', '');
        document.getElementById('MAIN_TEXT').value = buffer[activeTab];
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
