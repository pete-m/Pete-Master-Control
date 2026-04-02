/* PMMC v0.8.0 GOLD | RESTORED JAN BUILD */
(function() {
    let sessionPat = '', userLogin = '', activeTab = 'index.html';
    let buffers = { 'index.html': '', 'code.js': '', 'style.css': '' };

    const log = (m) => {
        const el = document.getElementById('UI_LOG');
        const d = document.createElement('div');
        d.textContent = `> ${m}`;
        el.prepend(d);
    };

    // The PAT Listener Logic
    document.getElementById('ENTRY_TOKEN').addEventListener('input', async (e) => {
        const pat = e.target.value.trim();
        if (pat.length < 40) return;
        
        try {
            const r = await fetch('https://api.github.com/user', {
                headers: { 'Authorization': `token ${pat}` }
            });
            if (r.ok) {
                const data = await r.json();
                sessionPat = pat;
                userLogin = data.login;
                log(`AUTH_SUCCESS: WELCOME ${data.login.toUpperCase()}`);
                document.getElementById('FACTORY_ZONE').classList.remove('phase-locked');
                document.getElementById('WORKBENCH_ZONE').classList.remove('phase-locked');
            }
        } catch (err) { log("AUTH_FAILED"); }
    });

    window.batchInit = async () => {
        const raw = document.getElementById('REPO_LIST').value;
        const repos = raw.split(',').map(s => s.trim()).filter(s => s);
        
        for (const name of repos) {
            log(`INIT_START: ${name}`);
            try {
                const r = await fetch('https://api.github.com/user/repos', {
                    method: 'POST',
                    headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, auto_init: true })
                });
                if (r.ok || r.status === 422) {
                    log(`STABILISED: ${name}`);
                    document.getElementById('TARGET_REPO').value = name;
                }
            } catch (e) { log(`FAILED: ${name}`); }
        }
    };

    window.setTab = (file) => {
        buffers[activeTab] = document.getElementById('MAIN_TEXT').value;
        activeTab = file;
        document.getElementById('MAIN_TEXT').value = buffers[file];
        document.getElementById('PREVIEW_HEADER').textContent = `Editing: ${file}`;
        log(`SWITCHED_TO: ${file.toUpperCase()}`);
    };

    window.commission = async () => {
        const target = document.getElementById('TARGET_REPO').value.trim();
        const content = document.getElementById('MAIN_TEXT').value;
        if (!target || !content) return log("MISSING_TARGET_OR_DATA");

        log(`PUSHING: ${activeTab} -> ${target}`);
        try {
            const res = await fetch(`https://api.github.com/repos/${userLogin}/${target}/contents/${activeTab}`, {
                headers: { 'Authorization': `token ${sessionPat}` }
            });
            const sha = res.ok ? (await res.json()).sha : null;

            const push = await fetch(`https://api.github.com/repos/${userLogin}/${target}/contents/${activeTab}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${sessionPat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: "PMMC_GOLD_SYNC", 
                    content: btoa(unescape(encodeURIComponent(content))), 
                    sha 
                })
            });
            if (push.ok) log(`COMMISSIONED: ${activeTab} SUCCESS`);
        } catch (e) { log("PUSH_ERROR"); }
    };

    log("PMMC_ENGINE_STABLE_v0.8.0");
})();
            pmc.files.forEach(f => localStorage.removeItem(`pmc_v8_${f}`));
            location.reload();
        }
    }
};

    deleteRepo: async () => {
        const repo = document.getElementById('REPO').value.trim();
        if(!confirm(`Delete ${repo}?`)) return;
        const r = await fetch(`https://api.github.com/repos/${pmc.state.user}/${repo}`, {
            method: 'DELETE',
            headers: { 'Authorization': `token ${pmc.state.pat}` }
        });
        if (r.ok) pmc.log(`DELETED: ${repo}`);
    },

    clearStorage: () => {
        if(confirm("Wipe cache?")) {
            pmc.state.files.forEach(f => localStorage.removeItem(`pmc_v8_${f}`));
            location.reload();
        }
    }
};
window.pmc = pmc;
    deleteRepo: async () => {
        const repo = document.getElementById('REPO').value.trim();
        if(!confirm(`Delete ${repo}?`)) return;
        const r = await fetch(`https://api.github.com/repos/${pmc.state.user}/${repo}`, {
            method: 'DELETE',
            headers: { 'Authorization': `token ${pmc.state.pat}` }
        });
        if (r.ok) pmc.log(`DELETED: ${repo}`);
    },

    clearStorage: () => {
        if(confirm("Wipe cache?")) {
            pmc.state.files.forEach(f => localStorage.removeItem(`pmc_v8_${f}`));
            location.reload();
        }
    }
};
window.pmc = pmc;
