const chalk = require("chalk")
const { spawn } = require("child_process");
const readline = require("readline");
const config = require("../config/config");
const WebSocket = require("ws");


class BDS {

    constructor(BDS_path,BDS_file,logmng,wss) {
        this.bds = spawn(BDS_file,{
            detached: true,
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: `${BDS_path}`
        });
        this.rl = readline.createInterface({
            input: this.bds.stdout,
            output: this.bds.stdin,
        });
        this.logmng = logmng
        this.wss = wss

        this._spawn = ()=>{}
        this._leave = ()=>{}
        this._started = ()=>{}
        this._line = ()=>{}
        this._close = ()=>{}

        this.bds.on("close",(code)=>{if (typeof this._close == "function" ) this._close(code)})



        this.rl.on("line",(_line)=>{
            const line = _line.replace(/^NO LOG FILE! \- /,"")
            
            if (!line.trim()) return

            let res = ""
            if (typeof this._line == "function" ) res =  this._line(line)

            if (/^\[.* INFO\] Version: .*$/.test(line)) {
                this.BDSver = line.match(/Version:\s*([0-9].*)/)[1]
                if (config.console.bswSystemLogToConsole) console.log(chalk.bgBlue(`BDS-Version:${this.BDSver}`))
            }
            if (/^\[.* INFO\] Server started./.test(line)) {
                if (config.console.bswSystemLogToConsole) console.log(chalk.bgBlue("Server Started"))
                this.server_started = true
                if (typeof this._started == "function" )this._started()
            }


            if (/^\[.* INFO\] Player Spawned: .* xuid: .*, pfid:.*$/.test(line)) {
                const playername = String(line.replace(/^\[.* INFO\] Player Spawned: /,"").replace(/ xuid:.*$/,""))
                // const xuid = Number(line.replace(/^\[.* INFO\] Player Spawned: .* xuid: /,"").replace(/, pfid: .*$/,""))
                const json = {"name":playername,"tags":[""]}
                if (typeof this._spawn == "function" ) res = this._spawn(json)
            }

            if (/^\[.* INFO\] Player disconnected: .*, xuid: .*, pfid:.*$/.test(line)) {
                const playername = String(line.replace(/^\[.* INFO\] Player disconnected: /,"").replace(/, xuid: .*, pfid: .*$/,""))
                // const xuid = Number(line.replace(/^\[.* INFO\] Player disconnected: .*, xuid: /,"").replace(/, pfid: .*$/,""))
                const json = {"name":playername,"tags":[""]}
                if (typeof this._leave == "function" ) res =  this._leave(json)
            }
            
            if (res?.skip) return
            logmng.add({"type":"BDS","data":line,"time":Date.now()})
            console.log(`${line}`);
            // Websocket Broadcast
            this.WSbroadcast({"type":"BDS","data":line})
        })
    }
    /**
     * 
     * @param {"started"|"spawn"|"leave"|"line"|"close"} event 
     * @param {Function} callback 
     * @returns 
     */
    on(event,callback) {
        if (!event) return
        this[`_${event}`] = callback
    }

    exit() {
        this.sendCommand("stop")
    }

    sendCommand(cmd,hidden=false) {
        if (!hidden) {
            console.log(`${chalk.green(cmd)}\n`)
            this.WSbroadcast({"type":"cmd","data":cmd})
            this.logmng.add({"type":"cmd","data":cmd,"time":Date.now()})
        }
        //BDS Input
        this.bds.stdin.write(`${cmd}\n`);
        
        
    }
    
    WSbroadcast(json) {
        this.wss.clients.forEach ((client) => {
            if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(json));
            }
        });
    }
}

module.exports = BDS