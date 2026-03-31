/* PMC_v0.8.2.7 // CORE_RECOVERY */
const pmc = {
    state: { files: ['index.html', 'code.js', 'manifest.js', 'README.md'], active: 'index.html', pat: '', user: '', buffer: {} },

    log: (m) => {
        const div = document.createElement('div');
        div.className = 'log-line';
        div.textContent = `> ${m}`;
        document.getElementById('LOG_INNER').prepend(div);
    },

    toggleLog: () => {
        const el = document.getElementById('LOG_PANEL');
        el.classList.toggle('collapsed');
        el.classList.toggle('expanded');
    },

    toggleMaint: () => document.getElementById('MAINT_PANEL').classList.toggle('hidden'),

    handshake: async () => {
        const val = document.getElementById('TOKEN').value.trim();
        if (val.length < 40) return;
        try {
            const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${val}` } });
            if (r.ok) {
                const d = await r.json();
                pmc.state.pat = val; pmc.state.user = d.login;
                const s = document.getElementById('STATUS');
                s.textContent = pmc.state.user; s.className = "text-[10px] font-black text-emerald-500 uppercase min-w-[80px] text-right";
                pmc.log(`READY: ${pmc.state.user}`);
                pmc.load();
            }
        } catch (e) { pmc.log("ERR: Auth failed"); }
    },

    save: () => {
        const content = document.getElementById('EDITOR').value;
        pmc.state.buffer[pmc.state.active] = content;
        localStorage.setItem(`pmc_v8_${pmc.state.active}`, content);
        pmc.updateUI();
    },

    load: () => {
        pmc.state.files.forEach(f => {
            pmc.state.buffer[f] = localStorage.getItem(`pmc_v8_${f}`) || '';
        });
        document.getElementById('EDITOR').value = pmc.state.buffer[pmc.state.active];
        pmc.updateUI();
    },

    updateUI: () => {
        pmc.state.files.forEach(f => {
            const tab = document.getElementById(`tab-${f}`);
            if (pmc.state.buffer[f] && pmc.state.buffer[f].trim().length > 0) {
                tab.classList.add('dirty');
            } else {
                tab.classList.remove('dirty');
            }
        });
    },

    switchTab: (f) => {
        pmc.state.active = f;
        document.querySelectorAll('.pmc-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${f}`).classList.add('active');
        document.getElementById('EDITOR').value = pmc.state.buffer[f] || '';
        pmc.log(`FOCUS: ${f}`);
    },

    push: async () => {
        const repo = document.getElementById('REPO').value.trim();
        const content = document.getElementById('EDITOR').value;
        if (!repo || !pmc.state.pat) return pmc.log("ERR: Target missing");
        pmc.log(`PUSHING: ${pmc.state.active}...`);
        try {
            const res = await fetch(`https://api.github.com/repos/${pmc.state.user}/${repo}/contents/${pmc.state.active}`, {
                headers: { 'Authorization': `token ${pmc.state.pat}` }
            });
            const sha = res.ok ? (await res.json()).sha : null;
            const put = await fetch(`https://api.github.com/repos/${pmc.state.user}/${repo}/contents/${pmc.state.active}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${pmc.state.pat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `PMC_Sync_${pmc.state.active}`,
                    content: btoa(unescape(encodeURIComponent(content))),
                    sha: sha
                })
            });
            if (put.ok) pmc.log(`SECURED: ${pmc.state.active}`);
        } catch (e) { pmc.log("ERR: Push failed"); }
    },

    initRepo: async () => {
        const names = document.getElementById('NEW_REPO').value.split(',').map(n => n.trim());
        for (const name of names) {
            const r = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: { 'Authorization': `token ${pmc.state.pat}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, auto_init: true })
            });
            if (r.ok) pmc.log(`INIT: ${name}`);
        }
        document.getElementById('REPO').value = names[names.length - 1];
    },

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
