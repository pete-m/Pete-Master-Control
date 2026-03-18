/* PROJECT: PMMC | VERSION: 0.8.2.5 | STATUS: DUAL-ANCHOR STABLE */
(function() {
    const files = ['index.html', 'code.js', 'style.css', 'manifest.js', 'README.md'];
    let buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
    let sessionPat = '', userLogin = '', activeTab = 'index.html';

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        if (!el) return;
        const entry = document.createElement('div');
        entry.className = 'log-line';
        entry.textContent = `> ${m}`;
        el.prepend(entry);
    };

    window.toggleLog = () => document.getElementById('LOG_SHELL').classList.toggle('open');

    window.silentHandshake = async () => {
        const pat = document.getElementById('ENTRY_TOKEN').value.trim();
        if (pat.length < 40) return;
        try {
            const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
            if (r.ok) {
                const d = await r.json();
                sessionPat = pat; userLogin = d.login;
                log(`PMMC_AUTH: ${d.login.toUpperCase()} ONLINE`);
                document.getElementById('PHASE_2_UI').classList.remove('phase-locked');
                files.forEach(f => {
                    const saved = localStorage.getItem(`pmmc_v0.8.2.5_${f}`);
                    if (saved) buffer[f] = saved;
                });
                document.getElementById('MAIN_TEXT').value = buffer[activeTab] || "";
            }
        } catch (e) { log("AUTH ERROR"); }
    };

    window.runPush = async () => {
        const targetRepo = document.getElementById('TARGET_REPO_NAME').value.trim();
        const content = document.getElementById('MAIN_TEXT').value;
        if(!targetRepo || !content.trim()) return log(`⚠️ BYPASS: ${activeTab.toUpperCase()} EMPTY`);
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
                const url = `https://${userLogin}.github.io/${targetRepo}/`;
                const dUrl = document.getElementById('DEPLOY_URL');
                dUrl.textContent = url; dUrl.href = url;
                document.getElementById('DEPLOY_LINK_WRAPPER').classList.remove('hidden');
                window.updateAssetUI();
            }
        } catch (e) { log("PUSH ERROR"); }
    };

    window.switchTab = (tId) => {
        buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
        localStorage.setItem(`pmmc_v0.8.2.5_${activeTab}`, buffer[activeTab]);
        
        document.querySelectorAll('.pmmc-tab').forEach(b => b.classList.remove('active'));
        document.getElementById(tId).classList.add('active');
        
        activeTab = tId.replace('tab-', '');
        document.getElementById('MAIN_TEXT').value = buffer[activeTab] || "";
        log(`📂 SWAP: ${activeTab.toUpperCase()}`);
    };

    window.updateAssetUI = async () => {
        const target = document.getElementById('TARGET_REPO_NAME').value.trim();
        if (!target) return;
        for (const f of files) {
            const r = await fetch(`https://api.github.com/repos/${userLogin}/${target}/contents/${f}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const dot = document.getElementById(`stat-${f}`);
            if (dot) dot.className = r.ok ? 'pmmc-dot on' : 'pmmc-dot';
        }
    };

    // INIT
    document.addEventListener('DOMContentLoaded', () => {
        log(`PMMC_OPS_ENGINE v0.8.2.5 ONLINE.`);
    });
})();
        document.getElementById('MAIN_TEXT').focus();
    };

    window.updateAssetUI = async () => {
        const targetRepo = document.getElementById('TARGET_REPO_NAME').value.trim();
        if (!targetRepo) return;
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
