/* PROJECT: PMMC | VERSION: 0.8.2.5 | STATUS: DUAL-ANCHOR STABLE */
(function() {
    const files = ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'];
    let buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let sessionPat = '', userLogin = '', activeTab = 'index.html';

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
                log(`PMMC_AUTH: ${d.login.toUpperCase()} ONLINE`);
                document.getElementById('PHASE_1_UI').classList.remove('phase-locked');
                document.getElementById('PHASE_2_UI').classList.remove('phase-locked');
            }
        } catch (e) { log("PMMC_AUTH: ERROR"); }
    };

    window.runInit = async () => {
        const name = document.getElementById('NEW_REPO_NAME').value.trim();
        if(!name) return;
        log(`🔨 FACTORY: BUILDING [${name}]`);
        try {
            const r = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, auto_init: true })
            });
            if (r.ok || r.status === 422) {
                log(`✅ BUILD COMPLETE: ${name}`);
                // SET SMART DEFAULT FOR PHASE 2
                document.getElementById('TARGET_REPO_NAME').value = name;
                
                const yaml = `name: PMMC_Ops\non:\n  repository_dispatch:\n    types: [pmmc_maintenance_trigger]\njobs:\n  ops:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "PMMC_OPS_ACTIVE"`;
                await fetch(`https://api.github.com/repos/${userLogin}/${name}/contents/.github/workflows/pmmc-ops.yml`, {
                    method: 'PUT',
                    headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: "PMMC_System_Init", content: btoa(unescape(encodeURIComponent(yaml))) })
                });
                window.updateAssetUI();
            }
        } catch (e) { log("❌ FACTORY: ERROR"); }
    };

    window.runPush = async () => {
        const targetRepo = document.getElementById('TARGET_REPO_NAME').value.trim();
        const content = document.getElementById('MAIN_TEXT').value;
        if(!targetRepo || !content) return log("❌ WORKBENCH: NO TARGET/DATA");
        
        log(`📡 COMMISSIONING: ${activeTab.toUpperCase()} -> ${targetRepo}`);
        try {
            const res = await fetch(`https://api.github.com/repos/${userLogin}/${targetRepo}/contents/${activeTab}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const sha = res.ok ? (await res.json()).sha : null;
            const push = await fetch(`https://api.github.com/repos/${userLogin}/${targetRepo}/contents/${activeTab}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "PMMC_Sync", content: btoa(unescape(encodeURIComponent(content))), sha })
            });
            if (push.ok) {
                log(`💎 SECURED: ${activeTab.toUpperCase()}`);
                window.updateAssetUI();
            }
        } catch (e) { log("❌ PUSH ERROR"); }
    };

    window.switchTab = (tId) => {
        buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
        document.querySelectorAll('.pmmc-tab').forEach(b => b.classList.remove('active'));
        document.getElementById(tId).classList.add('active');
        activeTab = tId.replace('tab-', '');
        document.getElementById('MAIN_TEXT').value = buffer[activeTab] || "";
        document.getElementById('MAIN_TEXT').focus();
    };

    window.updateAssetUI = async () => {
        const targetRepo = document.getElementById('TARGET_REPO_NAME').value.trim();
        if (!targetRepo) return;
        log(`🔍 SYNCING: ${targetRepo}`);
        for (const f of files) {
            try {
                const r = await fetch(`https://api.github.com/repos/${userLogin}/${targetRepo}/contents/${f}`, {
                    headers: { 'Authorization': `token ${sessionPat}` }
                });
                const dot = document.getElementById(`stat-${f}`);
                if (dot) dot.className = r.ok ? 'pmmc-dot on' : 'pmmc-dot';
            } catch (e) {}
        }
    };

    window.invokeYAML = async () => {
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
    log(`PMMC_OPS_ENGINE v0.8.2.2 ONLINE.`);
})();
