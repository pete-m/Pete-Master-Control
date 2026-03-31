/* PMC_v0.8.2.8 // RECOVERY_SCRIPT */
const pmc = {
    files: ['index.html', 'code.js', 'manifest.js', 'README.md'],
    state: { active: 'index.html', pat: '', user: '', buffer: {} },

    log: (m) => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `> ${m}`;
        document.getElementById('LOG_INNER')?.prepend(entry) || document.getElementById('LOG_BOX').prepend(entry);
    },

    toggle: (id) => {
        const el = document.getElementById(id);
        el.style.display = (el.style.display === 'none' || el.classList.contains('show') === false) ? 'block' : 'none';
        if(id === 'MAINT_AREA') el.classList.toggle('show');
    },

    auth: async () => {
        const val = document.getElementById('TOKEN').value.trim();
        if (val.length < 40) return;
        try {
            const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${val}` } });
            if (r.ok) {
                const d = await r.json();
                pmc.state.pat = val; pmc.state.user = d.login;
                document.getElementById('USER_TAG').textContent = pmc.state.user;
                document.getElementById('USER_TAG').className = "text-emerald-500 text-[9px] font-bold uppercase pt-1";
                pmc.log(`AUTH: ${pmc.state.user}`);
                pmc.load();
            }
        } catch (e) { pmc.log("ERR: Handshake"); }
    },

    write: () => {
        pmc.state.buffer[pmc.state.active] = document.getElementById('EDITOR').value;
        localStorage.setItem(`pmc_v8_${pmc.state.active}`, pmc.state.buffer[pmc.state.active]);
        pmc.refreshUI();
    },

    load: () => {
        pmc.files.forEach(f => {
            pmc.state.buffer[f] = localStorage.getItem(`pmc_v8_${f}`) || '';
        });
        document.getElementById('EDITOR').value = pmc.state.buffer[pmc.state.active];
        pmc.refreshUI();
    },

    setTab: (f) => {
        pmc.state.active = f;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`t-${f}`).classList.add('active');
        document.getElementById('EDITOR').value = pmc.state.buffer[f] || '';
        pmc.log(`TAB: ${f}`);
    },

    refreshUI: () => {
        let pending = [];
        pmc.files.forEach(f => {
            const tab = document.getElementById(`t-${f}`);
            if (pmc.state.buffer[f] && pmc.state.buffer[f].trim().length > 0) {
                tab.classList.add('dirty');
                pending.push(f);
            } else {
                tab.classList.remove('dirty');
            }
        });
        document.getElementById('STATUS_PREVIEW').textContent = `Pending: ${pending.join(', ') || 'None'}`;
    },

    push: async () => {
        const repo = document.getElementById('REPO').value.trim();
        const content = document.getElementById('EDITOR').value;
        if (!repo || !pmc.state.pat) return pmc.log("ERR: Setup Incomplete");
        pmc.log(`PUSHING: ${pmc.state.active}`);
        try {
            const res = await fetch(`https://api.github.com/repos/${pmc.state.user}/${repo}/contents/${pmc.state.active}`, {
                headers: { 'Authorization': `token ${pmc.state.pat}` }
            });
            const sha = res.ok ? (await res.json()).sha : null;
            const put = await fetch(`https://api.github.com/repos/${pmc.state.user}/${repo}/contents/${pmc.state.active}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${pmc.state.pat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `PMC_Update`, content: btoa(unescape(encodeURIComponent(content))), sha: sha })
            });
            if (put.ok) pmc.log(`SUCCESS: ${pmc.state.active}`);
        } catch (e) { pmc.log("ERR: Push"); }
    },

    build: async () => {
        const names = document.getElementById('NEW_REPO').value.split(',').map(n => n.trim());
        for (const name of names) {
            const r = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: { 'Authorization': `token ${pmc.state.pat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, auto_init: true })
            });
            if (r.ok) pmc.log(`CREATED: ${name}`);
        }
        document.getElementById('REPO').value = names[names.length - 1];
    },

    wipe: () => {
        if(confirm("Clear local data?")) {
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
