/* PMC_v0.8.2.5 // GOLD_MASTER_LOGIC */
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
    const input = document.getElementById('TOKEN').value.trim();
    if (input.length < 40) return;
    try {
        const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${input}` } });
        if (r.ok) {
            const d = await r.json();
            pat = input; user = d.login;
            const s = document.getElementById('STATUS');
            s.textContent = `ONLINE: ${user.toUpperCase()}`;
            s.className = "text-[10px] uppercase text-center font-black text-emerald-500 mt-1";
            log(`CONNECTED: ${user}`);
            files.forEach(f => {
                const val = localStorage.getItem(`pmc_gold_${f}`);
                if (val) buffer[f] = val;
            });
            document.getElementById('EDITOR').value = buffer[activeTab] || '';
        } else { log("ERR: AUTH_FAILED"); }
    } catch (e) { log("ERR: CONNECTION_LOST"); }
};

window.buildRepo = async () => {
    const name = document.getElementById('NEW_REPO').value.trim();
    if (!name || !pat) return log("ERR: Need Name & PAT");
    log(`BUILDING REPO: ${name}...`);
    try {
        const r = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: { 'Authorization': `token ${pat}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, auto_init: true })
        });
        if (r.ok) {
            log(`SUCCESS: ${name} created`);
            document.getElementById('REPO').value = name;
        } else { log(`ERR: ${r.status}`); }
    } catch (e) { log("ERR: Build failed"); }
};

window.switchTab = (f) => {
    buffer[activeTab] = document.getElementById('EDITOR').value;
    localStorage.setItem(`pmc_gold_${activeTab}`, buffer[activeTab]);
    document.querySelectorAll('.pmc-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${f}`).classList.add('active');
    activeTab = f;
    document.getElementById('EDITOR').value = buffer[activeTab] || '';
    log(`TAB: ${f.toUpperCase()}`);
};

window.push = async () => {
    const repo = document.getElementById('REPO').value.trim();
    const content = document.getElementById('EDITOR').value;
    if (!repo || !pat) return log("ERR: Missing Repo/Auth");
    log(`COMMISSIONING: ${activeTab}...`);
    try {
        const res = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${activeTab}`, {
            headers: { 'Authorization': `token ${pat}` }
        });
        const sha = res.ok ? (await res.json()).sha : null;
        const put = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${activeTab}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${pat}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `PMC_Gold_Sync_${activeTab}`,
                content: btoa(unescape(encodeURIComponent(content))),
                sha: sha
            })
        });
        if (put.ok) {
            log(`SECURED: ${activeTab}`);
            const url = `https://${user}.github.io/${repo}/`;
            document.getElementById('LIVE_LINK').href = url;
            document.getElementById('LIVE_LINK').textContent = url;
            document.getElementById('LINK_BOX').classList.remove('hidden');
        } else { log(`ERR: ${put.status}`); }
    } catch (e) { log("ERR: Fatal Push Error"); }
};

log("ENGINE_START_v0.8.2.5");
