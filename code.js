/* PROJECT: PMC (Phase 2)
  VERSION: v0.3.4
  AUTHOR: Peter Maben with Gemini
  LOGIC: PAT Narrative & Identity Diagnostic
  
*/
(function() {
    const VER = "v0.3.4";
    let currentPath = 'index.html';
    let buffers = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };

    const log = (msg) => {
        const el = document.getElementById('UI_LOG');
        if (el) el.innerHTML = `<div class="border-b border-zinc-900 py-1 font-mono text-[9px] uppercase tracking-tight">${msg}</div>` + el.innerHTML;
    };

    function ignite() {
        const h = document.getElementById('VER_ID');
        if (!h) { setTimeout(ignite, 50); return; }
        h.classList.replace('text-zinc-700', 'text-orange-600');
        
        log(`<b class="text-orange-500">PMC ${VER} ONLINE.</b>`);

        // Action Listeners
        document.getElementById('INIT_BTN').onclick = handlePhase1;
        document.getElementById('PUSH_TRIGGER').onclick = executeBatchDeployment;
        document.getElementById('MAIN_TEXT').oninput = saveActiveContent;

        // Restore State
        restoreState();
        
        // Immediate Handshake Narrative if PAT exists
        const pat = document.getElementById('ENTRY_TOKEN').value;
        if(pat) verifyIdentity(pat);
        
        switchBuffer('index.html');
    }

    async function verifyIdentity(pat) {
        log("📡 PAT Invoked: Verifying Identity...");
        try {
            const r = await fetch('https://api.github.com/user', { 
<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>PMC v0.3.4</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-zinc-950 text-zinc-300 p-4 font-sans min-h-screen">
    <div class="max-w-md mx-auto space-y-3 pb-10">
        <header class="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex justify-between items-center shadow-xl">
            <div>
                <h1 id="VER_ID" class="text-xl font-black text-zinc-700 uppercase italic tracking-tighter leading-none transition-colors duration-700">PMC v0.3.4</h1>
                <p class="text-[8px] text-zinc-600 uppercase tracking-[0.2em] font-bold mt-1">PAT Handshake Build</p>
            </div>
            <button onclick="hardReset()" class="text-[9px] font-bold text-red-500/40 uppercase hover:text-red-500">[ Wipe Cache ]</button>
        </header>

        <div id="UI_LOG" class="bg-zinc-950 border border-zinc-900 rounded-xl p-2 text-[10px] font-mono text-zinc-500 text-center italic shadow-inner h-20 overflow-y-auto">
            [Signal] Awaiting Logic Handshake...
        </div>

        <section class="p-4 bg-zinc-900 border-2 border-orange-600/20 rounded-2xl space-y-2 shadow-2xl">
            <span class="text-[9px] uppercase font-black text-orange-600 tracking-widest italic px-1">Gateway: PAT</span>
            <input type="password" id="ENTRY_TOKEN" placeholder="Paste PAT..." class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs outline-none focus:border-orange-600 shadow-inner" oninput="saveActiveContent()">
        </section>

        <section class="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3 shadow-xl">
            <span class="text-[9px] uppercase font-black text-zinc-600 tracking-widest italic px-1">Phase 1: Batch Init / Purge</span>
            <div class="flex gap-2">
                <input type="text" id="INIT_REPO_NAME" placeholder="repo-name OR repos: [list]" class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs outline-none text-blue-400 font-mono" oninput="saveActiveContent()">
                <button id="INIT_BTN" class="bg-orange-600 text-white font-black px-5 rounded-lg text-[9px] uppercase active:scale-95 transition-all italic">Execute</button>
            </div>
        </section>

        <section class="space-y-2">
            <div class="pt-2 px-1 flex justify-between items-end border-b border-zinc-900 pb-1">
                <h2 class="text-[10px] font-black text-orange-600 uppercase tracking-widest italic">Phase 2: File Fitter</h2>
            </div>
            <input type="text" id="ENTRY_REPO" placeholder="Target Repository Name" class="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs outline-none text-blue-400 font-mono shadow-xl focus:border-orange-600 transition-all" oninput="saveActiveContent()">

            <div class="grid grid-cols-5 gap-1">
                <button id="tab-index.html" class="tab-btn bg-zinc-900 border border-zinc-800 p-2 rounded-t-lg text-[7px] font-black uppercase transition-all">HTML</button>
                <button id="tab-code.js" class="tab-btn bg-zinc-900 border border-zinc-800 p-2 rounded-t-lg text-[7px] font-black uppercase transition-all">JS</button>
                <button id="tab-style.css" class="tab-btn bg-zinc-900 border border-zinc-800 p-2 rounded-t-lg text-[7px] font-black uppercase transition-all">CSS</button>
                <button id="tab-manifest.js" class="tab-btn bg-zinc-900 border border-zinc-800 p-2 rounded-t-lg text-[7px] font-black uppercase transition-all">Manifest</button>
                <button id="tab-README.md" class="tab-btn bg-zinc-900 border border-zinc-800 p-2 rounded-t-lg text-[7px] font-black uppercase transition-all">MD</button>
            </div>

            <div class="relative">
                <textarea id="MAIN_TEXT" class="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-b-xl rounded-tr-xl p-4 text-[10px] font-mono focus:border-orange-600 outline-none shadow-inner leading-relaxed resize-none" placeholder="Paste code here..."></textarea>
                <button id="CLEAR_BTN" class="absolute bottom-2 right-2 text-red-500/30 hover:text-red-500 text-[8px] font-bold uppercase tracking-tighter">[ Clear ]</button>
            </div>

            <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
                <div id="STAGING_BAR" class="flex flex-wrap justify-center gap-2 mb-3">
                    <div id="status-index.html" class="status-box">HTML</div>
                    <div id="status-code.js" class="status-box">JS</div>
                    <div id="status-style.css" class="status-box">CSS</div>
                    <div id="status-manifest.js" class="status-box">MANIFEST</div>
                    <div id="status-README.md" class="status-box">MD</div>
                </div>
                <button id="PUSH_TRIGGER" class="w-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold py-3 rounded-lg uppercase text-[9px] tracking-[0.2em] transition-all hover:bg-zinc-700 hover:text-white">Commission Batch</button>
            </div>
        </section>
    </div>

    <script>
        const log = (m) => {
            const el = document.getElementById('UI_LOG');
            if(el) el.innerHTML = m + '<br>' + el.innerHTML;
        };
        
        // Loader forces download of latest code.js by appending a timestamp
        fetch('./code.js?nocache=' + new Date().getTime())
            .then(r => r.text())
            .then(code => {
                const s = document.createElement('script');
                s.textContent = code;
                document.body.appendChild(s);
                log("<span class='text-zinc-400'>[System] Logic Streamed. Handshake pending...</span>");
            })
            .catch(e => log("<span class='text-red-500'>[Error] Logic injection failed.</span>"));
    </script>
</body>
</html>
        });
        const active = document.getElementById('tab-' + path);
        if(active) {
            active.classList.replace('bg-zinc-900', 'bg-zinc-800');
            active.classList.replace('text-zinc-500', 'text-orange-500');
        }
        updateStagingIcons();
    }

    function saveActiveContent() {
        buffers[currentPath] = document.getElementById('MAIN_TEXT').value;
        localStorage.setItem('pmc_buffers', JSON.stringify(buffers));
        localStorage.setItem('pmc_token', document.getElementById('ENTRY_TOKEN').value);
        localStorage.setItem('pmc_repo', document.getElementById('ENTRY_REPO').value);
        localStorage.setItem('pmc_init_repo', document.getElementById('INIT_REPO_NAME').value);
        updateStagingIcons();
    }

    function restoreState() {
        document.getElementById('ENTRY_TOKEN').value = localStorage.getItem('pmc_token') || '';
        document.getElementById('ENTRY_REPO').value = localStorage.getItem('pmc_repo') || '';
        document.getElementById('INIT_REPO_NAME').value = localStorage.getItem('pmc_init_repo') || '';
        const saved = localStorage.getItem('pmc_buffers');
        if (saved) { try { buffers = JSON.parse(saved); } catch(e) {} }
    }

    function updateStagingIcons() {
        Object.keys(buffers).forEach(key => {
            const el = document.getElementById('status-' + key);
            if(el) el.style.color = buffers[key]?.trim().length > 0 ? "#ea580c" : "#3f3f46";
        });
    }

    ignite();
})();

    function saveActiveContent() {
        buffers[currentPath] = document.getElementById('MAIN_TEXT').value;
        localStorage.setItem('pmc_buffers', JSON.stringify(buffers));
        updateStagingIcons();
        localStorage.setItem('pmc_token', document.getElementById('ENTRY_TOKEN').value);
        localStorage.setItem('pmc_repo', document.getElementById('ENTRY_REPO').value);
        localStorage.setItem('pmc_init_repo', document.getElementById('INIT_REPO_NAME').value);
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

    ignite();
})();

function hardReset() {
    if(confirm("Wipe local cache?")) { localStorage.clear(); location.reload(); }
                                      }
            
