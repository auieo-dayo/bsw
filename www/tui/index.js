const url = location.origin;

async function get(path) {
  const res = await fetch(`${url}${path}`);
  return await res.json();
}

function appendLog(el, text, type="log") {
  const span = document.createElement("span");
  span.className = `console-${type}`;
  span.textContent = text + "\n";
  el.appendChild(span);
  el.scrollTop = el.scrollHeight;
}

async function reloadAPI() {
  const backupBody = document.getElementById("backup-body")
  const statusBody = document.getElementById("status-body");
  // 初期 API
  const info = await get("/api/info");
  statusBody.textContent = 
    `Server: ${info.BDS.servername}\nWorld: ${info.BDS.levelname}\nMode: ${info.BDS.gamemode}/${info.BDS.difficulty}\nPlayers: ${info.BDS.player.now}/${info.BDS.player.max}\nVersion: ${info.BDS.version}`;
  document.getElementById("cpu").getElementsByClassName("par")[0].textContent = `${Number(info.server.cpu.par).toFixed(0)}%`
  document.getElementById("cpu").getElementsByClassName("fill")[0].style.width = `${Number(info.server.cpu.par).toFixed(0)}%`

  document.getElementById("mem").getElementsByClassName("par")[0].textContent = `${Number(info.server.mem.par).toFixed(0)}%(${(info.server.mem.total - info.server.mem.free).toFixed(0)}GB/${info.server.mem.total.toFixed(0)}GB)`
  document.getElementById("mem").getElementsByClassName("fill")[0].style.width = `${Number(info.server.mem.par).toFixed(0)}%`
  const backup = await get("/api/backuplist")
  backupBody.innerText = ""
  backup.todaybackuplist.forEach(l => {
    let type = "backup"
    if (l.full) type = "full" ;
    appendLog(backupBody,`${l.fullpathja}`,type)
  })
  appendLog(backupBody,`Today:${backup.today} | All:${backup.allbackup}`)
}

async function init() {
  const consoleBody = document.getElementById("console-body");
  const chatBody = document.getElementById("chat-body");
  await reloadAPI()
  const logs = await get("/api/getlog");
  logs.forEach(l => {
    if(l.type === "chat") appendLog(chatBody, l.data, "chat");
    else appendLog(consoleBody, `[${l.type}] ${l.data}`, l.type);
  });
  // WebSocket
  const ws = new WebSocket(url.replace("http", "ws") + "/ws");
  ws.onmessage = (ev) => {
    console.log(ev.data)
    try {
      const data = JSON.parse(ev.data);
      console.log(data)
      if(data.type === "chat") appendLog(chatBody, data.data, "chat");
      else appendLog(consoleBody, `[${data.type}] ${data.data}`, data.type);
    } catch(e) {
      console.error(e);
    }
  }
  document.getElementById("submit").addEventListener("click",(ev)=>{
    const cmd = document.getElementById("cmdinput")
    if (!cmd) return
    ws.send(JSON.stringify({"type":"cmd","data":cmd.value}))
    cmd.value = ""
    })

    setInterval(reloadAPI,1000*10)
}
document.getElementById("cmdinput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    document.getElementById("submit").click();
  }
});


document.addEventListener("DOMContentLoaded", init);

