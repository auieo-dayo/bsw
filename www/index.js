
let bdsver = ""


let main = true
function set(console=false) {
  if (console) {
    main = false
    document.getElementById("console_disp").style.display = "block"
    document.getElementById("main_disp").style.display = "none"
  } else {
    main = true
    document.getElementById("console_disp").style.display = "none"
    document.getElementById("main_disp").style.display = "block"
  }
}

const modes = [
  "Light",
  "Dark"
]
let mode = 0

function ArrayNext(array=[],now=NaN) {
if (now >= array.length-1) {
  return 0
}
return now+1
}

function ChangeTheme(reload) {
  if (!reload) {
    mode = ArrayNext(modes,mode)
  }
  switch(modes[mode]) {
    case ("Dark"):
      document.body.style.background = "#3a3a5cff"
      document.body.style.color = "#a5a5a5ff"
      document.getElementById("LightDark").src = "./img/light.svg"
      break;
    case ("Light"):
      document.body.style.background = "#b1b1b1"
      document.body.style.color = "#000"
      document.getElementById("LightDark").src = "./img/dark.svg"
      break;
  }

  if (!reload) localStorage.setItem('theme', mode);

}

mode = localStorage.getItem('theme') ?? 0

ChangeTheme(true)



async function get(url) {
  try {
    const res = await fetch(url)
    return res
  } catch(e) {
    console.error(e.message)
  }
};
/**
 * @type {WebSocket}
 */
let socket
(async()=>{
if (location.search == "?debug") return
  // LogGet
  document.getElementById("log").innerHTML = ""
  const logres = await get(`${location.origin}/api/getlog`)
  const logjson = await logres.json()
  document.getElementById("log").innerHTML = ""
  for (const log of logjson) {
    const p = document.createElement("p")
    p.textContent = log.data
    p.dataset.time = log.time
    p.classList.add(log.type)
    document.getElementById("log").appendChild(p)
  }
  document.getElementById("log").scrollTo({"top":document.getElementById("log").scrollHeight})

  // WebSocket
const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
socket = new WebSocket(`${protocol}://${location.hostname}:${location.port}/ws`);

//      socket = new WebSocket(`ws://${location.hostname}:${location.port}/ws`)
  socket.addEventListener("open", () => {
    console.log("接続");
  });

  // メッセージ受け取ったとき
  socket.addEventListener("message", (event) => {
    const json = JSON.parse(event.data)
    const p = document.createElement("p")
    p.textContent = json.data
    p.dataset.time = Date.now()
    p.classList.add(json.type)
    document.getElementById("log").appendChild(p)
    document.getElementById("log").scrollTo({"top":document.getElementById("log").scrollHeight})

  });

  // 接続閉じたとき
  socket.addEventListener("close", () => {
    console.log("切断された");
    alert("コンソールから切断されました")
  });

  // エラー発生したとき
  socket.addEventListener("error", (err) => {
    console.error("エラー:", err);
  });
})()
setInterval(async()=>{
  if (location.search == "?debug") return
  const infores = await get(`${location.origin}/api/info`)
  const infojson = await infores.json()
  document.getElementById("Sname").textContent = infojson.BDS.servername
  document.getElementById("Lname").textContent = infojson.BDS.levelname
  const par = infojson.BDS.player.now / infojson.BDS.player.max
  document.getElementById("Pint").textContent = `${infojson.BDS.player.now}/${infojson.BDS.player.max}(${par.toFixed(0)}%)`

  // System
  document.getElementById("MemFree").textContent = `${infojson.server.mem.free.toFixed(0)}GB`
  document.getElementById("MemTotal").textContent = `${infojson.server.mem.total.toFixed(0)}GB`
  document.getElementById("MemPar").textContent = `${(infojson.server.mem.par).toFixed(0)}%`
  document.getElementById("cpu").textContent = `${infojson.server.cpu.par.toFixed(0)}%`
  document.getElementById("cpupar").value = infojson.server.cpu.par.toFixed(0)
  document.getElementById("mempar").value = infojson.server.mem.par.toFixed(0)

  document.getElementById("nowBDSver").textContent = infojson.BDS.version
  document.getElementById("latestBDSver").textContent = bdsver

  if (bdsver && infojson.BDS.version != bdsver) {
    document.getElementById("alert").style.display = "block"
  }

  // Player
  const playerres = await get(`${location.origin}/api/nowonline`)
  const playerjson = await playerres.json()
  document.getElementById("players").innerHTML = ""
  for (const p of playerjson) {
    const li = document.createElement("li")
    li.textContent = p.name
    document.getElementById("players").appendChild(li)
  }
},1000)
document.getElementById("submit").addEventListener("click",()=>{
  const input = document.getElementById("inputcmd")
  if (!input.value) return
  if (!socket) return
  socket.send(JSON.stringify({"type":"cmd","data":input.value}))
  input.value = ""

});

(async()=>{
  if (location.search == "?debug") return
  const latest_res = await fetch("https://raw.githubusercontent.com/Bedrock-OSS/BDS-Versions/main/versions.json")
  const latest_json = await latest_res.json()
  const latest = latest_json.linux.stable
  bdsver = latest
})()