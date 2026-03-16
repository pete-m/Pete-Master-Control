/* PROJECT: PMC (Phase 2) 
   AUTHOR: Peter Maben with Gemini */

// Standard functions (no 'window.' prefix)
async function runHandshake() {
    const btn = document.getElementById('HANDSHAKE_BTN');
    btn.style.background = "#ea580c";
    const logEl = document.getElementById('UI_LOG');
    logEl.innerHTML = '⏳ STARTING...' + logEl.innerHTML;

    const pat = document.getElementById('ENTRY_TOKEN').value.trim();
    try {
        const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${pat}` } });
        if (r.ok) {
            const d = await r.json();
            document.getElementById('UI_LOG').innerHTML = '✅ OK: ' + d.login + document.getElementById('UI_LOG').innerHTML;
            document.getElementById('PHASE_1_UI').style.opacity = "1";
            document.getElementById('PHASE_1_UI').style.pointerEvents = "auto";
            document.getElementById('PHASE_2_UI').style.opacity = "1";
            document.getElementById('PHASE_2_UI').style.pointerEvents = "auto";
        }
    } catch (e) { alert("Network Blocked"); }
    setTimeout(() => btn.style.background = "", 200);
}

// Global buffer for tabs
const buffer = { 'index.html': '', 'code.js': '', 'style.css': '', 'manifest.js': '', 'README.md': '' };
let activeTab = 'index.html';

function switchTab(t) {
    buffer[activeTab] = document.getElementById('MAIN_TEXT').value;
    activeTab = t.replace('tab-', '');
    document.getElementById('MAIN_TEXT').value = buffer[activeTab];
}

console.log("Logic Loaded");
