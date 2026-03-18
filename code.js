/* PMC_v0.8.2.5 // INTEGRATED_GOLD */
const files = ['index.html', 'code.js', 'manifest.js', 'README.md'];
let state = { buffer: {}, pat: '', user: '', active: 'index.html' };

window.log = (m) => {
    const div = document.createElement('div');
    div.className = 'log-line';
    div.textContent = `> ${m}`;
    document.getElementById('LOG_INNER').prepend(div);
};

window.toggleLog = () => {
    document.getElementById('LOG_CONTAINER').classList.toggle('collapsed');
    document.getElementById('LOG_CONTAINER').classList.toggle('expanded');
};

window.handshake = async () => {
    const input = document.getElementById('TOKEN').value.trim();
    if (input.length < 40) return;
    try {
        const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${input}` } });
        if (r.ok) {
            const d = await r.json();
            state.pat = input; state.user = d.login;
            const s = document.getElementById('STATUS');
            s.textContent = state.user;
            s.className = "text-[9px] font-black text-emerald-500 uppercase min-w-[60px] text-center";
            log(`READY: ${state.user}`);
            
            files.forEach(f => {
                const val = localStorage.getItem(`pmc_v825_${f}`);
                if (val) state.buffer[f] = val;
            });
            document.getElementById('EDITOR').value = state.buffer[state.active] || '';
        }
    } catch (e) { log("ERR: Handshake failed"); }
};

window.switchTab = (f) => {
    state.buffer[state.active] = document.getElementById('EDITOR').value;
    localStorage.setItem(`pmc_v825_${state.active}`, state.buffer[state.active]);
    
    document.querySelectorAll('.pmc-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${f}`).classList.add('active');
    
    state.active = f;
    document.getElementById('EDITOR').value = state.buffer[f] || '';
    log(`ACTIVE: ${f}`);
};

window.push = async () => {
    const repo = document.getElementById('REPO').value.trim();
    const content = document.getElementById('EDITOR').value;
    if (!repo || !state.pat) return log("ERR: Check Repo/PAT");

    log(`PUSHING: ${state.active}...`);
    try {
        const res = await fetch(`https://api.github.com/repos/${state.user}/${repo}/contents/${state.active}`, {
            headers: { 'Authorization': `token ${state.pat}` }
        });
        const sha = res.ok ? (await res.json()).sha : null;
        const put = await fetch(`https://api.github.com/repos/${state.user}/${repo}/contents/${state.active}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${state.pat}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `PMC_Update_${state.active}`,
                content: btoa(unescape(encodeURIComponent(content))),
                sha: sha
            })
        });
        if (put.ok) {
            log(`SUCCESS: ${state.active}`);
            const url = `https://${state.user}.github.io/${repo}/`;
            document.getElementById('LIVE_LINK').href = url;
            document.getElementById('LIVE_LINK').textContent = url;
            document.getElementById('LINK_BOX').classList.remove('hidden');
        }
    } catch (e) { log("ERR: Push Error"); }
};

window.buildRepo = async () => {
    const name = document.getElementById('NEW_REPO').value.trim();
    if (!name || !state.pat) return log("ERR: Name/PAT required");
    try {
        const r = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: { 'Authorization': `token ${state.pat}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, auto_init: true })
        });
        if (r.ok) {
            log(`BUILT: ${name}`);
            document.getElementById('REPO').value = name;
        }
    } catch (e) { log("ERR: Build failed"); }
};
