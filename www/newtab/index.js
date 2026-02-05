
const base = location.origin


function addplayer(player) {
    const span = document.createElement("span")
    span.textContent = player
    document.getElementById("players").appendChild(span)
}

function addchatlog(json) {
    let prefix = ""
    if (json.source == "Discord") prefix = "d"; else prefix = "mc"

    const span = document.createElement("span")
    span.classList.add(prefix)
    let chat = `${json.player}:${json.message}`
    span.textContent = `[${prefix.toLocaleUpperCase()}]${chat}\n`

    const chats = document.getElementById("chats")
    chats.appendChild(span)
    chats.scroll({"top":chats.scrollHeight})
}

function googlesearch() {
    const value = document.getElementById("search_value")
    location.href = "https://google.com/search?q=" + value.value
    value.value = ""
}

document.addEventListener("DOMContentLoaded",()=>{
    (async ()=>{
        const info = await fetch(`${base}/api/info`)
        const infojson = await info.json()
        const cpu = document.getElementById("cpu")
        cpu.querySelector(".par").textContent = `${infojson.server.cpu.par.toFixed(0)}%`
        cpu.querySelector(".fill").style.width = `${infojson.server.cpu.par.toFixed(0)}%`
        const mem = document.getElementById("mem")
        mem.querySelector(".par").textContent = `${infojson.server.mem.par.toFixed(0)}%`
        mem.querySelector(".fill").style.width = `${infojson.server.mem.par.toFixed(0)}%`

        const player = await fetch(`${base}/api/nowonline`)
        const playerjson = await player.json()
        for (const value of playerjson) {
            addplayer(value.name)
        }

        const log = await fetch(`${base}/api/getlog`)
        const logjson = await log.json()
        for (const value of logjson.filter(n=>n.type == "chat")) {
            addchatlog(value)
        }

    })()
    // document.getElementById("search_value").addEventListener("keydown",(ev)=>{
    //     if (ev.code == "Enter") {
    //         googlesearch()
    //     }
    // })
    document.getElementById("search").addEventListener("click",()=>{googlesearch()})
    for (const ele of document.getElementById("links").querySelectorAll("li")) {
        const a = document.createElement("a")
        a.href = ele.dataset.url
        a.textContent = ele.textContent
        ele.innerText = ""
        ele.appendChild(a)
    }
})