// Bedrock Server Wrapper
const { spawn } = require('child_process');
const readline = require('readline');
const path = require("path")
const WebSocket = require('ws');
const dotenv = require("dotenv");
dotenv.config();
const PropertiesReader = require('properties-reader');
const fs = require("fs-extra")
const chalk = require('chalk');
const crypto = require("crypto");
const axios = require("axios");
const discord = require("discord.js")

const config = require('./config/config');

const nowtime = require("./src/nowtime")



// lastlocationlog
/**
 * @type {import('axios').AxiosInstance | undefined}
 */
let couch
if (config.lastLocationLog.saveLocationLog) {
  couch = axios.create({
    baseURL: `${config.lastLocationLog.CouchDB.baseurl}/${config.lastLocationLog.CouchDB.dbname}`,
    auth: {
      username: `${config.lastLocationLog.CouchDB.user.name}`,
      password: `${config.lastLocationLog.CouchDB.user.pass}`
    }
});
}



// project-root

const root = __dirname

// Backup Setting

const BackupInterval = config.backup.interval


// BDS Online Players

const onlinePlayer = []

// BDS Version

let BDSver = NaN

// BDS Paths

const BDS_path = path.join(root,"bds")
const BDS_file = path.join(BDS_path,"bedrock_server")


// Log path

const BSWStart = new Date()
const pad = (n) => n.toString().padStart(2, '0');

const logPath = {
  "folder": path.join(root,"log"),
  "file": ()=>{
    const now = new Date()
    return `${BSWStart.getTime()}_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}.jsonl`
  }
}
fs.ensureDirSync(logPath.folder)

let server_started = false
let worldname = process.env["level-name"]
let servername = process.env["server-name"]

// time



// logMNG
const logmng = {
  "add": (json = {type:"",data:"",datatype:"",time:NaN}) => {
    try {
      if (!json.type || !json.data || !json.time) return;
      pm.emit(json.type,json)
      fs.ensureDirSync(logPath.folder);

      const filepath = path.join(logPath.folder, logPath.file());
      fs.appendFileSync(filepath, JSON.stringify(json)+"\n");
    } catch (err) {}
  }
}

// Plugin

const PluginManager = require("./src/pluginManager")

const apis = {
  snedChat(name,msg){apis.sendCommand(`/tellraw ${JSON.stringify({"rawtext":[{"text":`${name}:${msg}`}]})}`,true)},
  getPlayerList(){return onlinePlayer ?? []},
  getBackupList(getAllBackupList=false){
    const blist = get_backuplist("",getAllBackupList)
    return blist?.data ?? []   
  },
  sendCommand(cmd,ishidden=false){sendCommand(cmd,ishidden)}
}

const pm = new PluginManager(apis)
pm.loadPlugins()


// BDS properties Path

const properties_path = path.join(BDS_path,"server.properties")
const properties = PropertiesReader(properties_path);

// BDS properties edit

const env_list = [
"server-name",
"gamemode",
"difficulty",
"allow-cheats",
"max-players",
"server-port",
"server-portv6",
"level-seed",
"level-name"
]

for (const item of env_list) {
if (typeof process.env[item] == "undefined") continue;
properties.set(item,process.env[item])
}
properties.set("content-log-console-output-enabled","true")
properties.save(properties_path);


// default_server_addon module config

const DSD_modules = [
    "@minecraft/server",
    "@minecraft/server-ui",
    "@minecraft/server-admin",
    "@minecraft/server-net"
]
const DSD_modules_path = path.join(BDS_path,"config","default","permissions.json")
const nowDSD_modules = fs.readJSONSync(DSD_modules_path)
DSD_modules.map((item)=>{
  if (!nowDSD_modules.allowed_modules.includes(item)) {
    nowDSD_modules.allowed_modules.push(item)
  }
})
fs.writeJSONSync(DSD_modules_path,nowDSD_modules)



// WebServer
const express = require('express');
const app = express();
const http = require("http");
const server = http.createServer(app);

const basicAuth = require('express-basic-auth');

const PORT = config.webUi.port;

const os = require('os');
const { getCpuUsage } = require("./src/cpuusage");






// CROS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // 全オリジン許可
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // プリフライト対応
  }
  next();
});

// JSON
app.use(express.json());

// By BDS Basic
app.use('/api/bds/', basicAuth({
  users: { "BDS_Send" : "BDS_Send" },
  challenge: false,           // 認証ダイアログを出す
  realm: 'BDS-Send-Path-Login'         // ダイアログに表示される領域名
}));
app.post('/api/bds/send',async (req,res,next)=>{
  try {
    const body = req.body
    switch(body.type) {
      case "chat":{
        const {msg,sender} = body
        chatmng.sendtoDis(sender,msg)
        res.status(200).type("json").send({"status":true})
        break;
      }
      case "death":{
        const {source,reason,location} = body
        DeathtoDis(source,reason)
        logmng.add({"type":"death","player":source,"data":`${source}(${reason})`,"reason":`${reason}`,"location":location,"time":Date.now()})
        res.status(200).type("json").send({"status":true})
        break;
      }
      case "backup":{
          const {source,isfull,isEntity} = body
          if (isfull) {
            await backup(true,true)
            if (isEntity && source) sendCommand(`tellraw ${source} {"rawtext":[{"text":"§cFull Backup Success"}]}`)
          } else {
            await backup(true)
            if (isEntity && source) sendCommand(`tellraw ${source} {"rawtext":[{"text":"§cBackup Success"}]}`)
          }
          res.status(200).type("json").send({"status":true})
        break;
      }
      case "playerinfo": {
          PlayerinfotoDis(body)
          res.status(200).type("json").send({"status":true})
          break;
      }
      default:{
        res.sendStatus(400).type("json").send({"status":false})
        break;
      }
    }
    
  } catch(err) {
    next(err)
  }
})

// app.post('/api/bds/pluginsend',async (req,res,next)=>{
//   try {
//     const body = req.body
//     const {id,data} = body
//     if (!id || !data) return res.sendStatus(400)
//     pm.emit(`PLUGIN_EVENT_${id}`,data)
//   } catch(err) {
//     next(err)
//   }
// })

//  Basic
app.use('/', basicAuth({
  users: { [config.webUi.username ?? "admin"] : config.webUi.password ?? "admin" },
  challenge: true,           // 認証ダイアログを出す
  realm: 'BSW-DashBoard-Login'         // ダイアログに表示される領域名
}));

app.get('/api/getlog', async (req, res, next) => {
  try {
    const {limit = 300} = req.query
    const content = await fs.readFile(path.join(logPath.folder,logPath.file()),{"encoding":"utf-8"})
    
    const json = content  
      .trim()
      .split("\n")
      .slice(-limit)
      .map(JSON.parse);

    res.type("json").send(JSON.stringify(json,null,2))
  }catch (err) {
    next(err)
  }
  
});

app.get('/api/nowonline', (req, res) => {
  res.type("json").send(JSON.stringify(onlinePlayer,null,2))
});

app.get('/api/info', async (req, res, next) => {
  try {

    const cpu = await getCpuUsage(100)
    const json = {
      "BDS": {
        "servername":`${process.env["server-name"]}`,
        "levelname":`${process.env["level-name"]}`,
        "gamemode": `${process.env["gamemode"]}`,
        "difficulty":`${process.env["difficulty"]}`,
        "player": {
          "max": Number(process.env["max-players"]),
          "now": onlinePlayer.length
        },
        "version": BDSver
      },
    "server": {
      "mem": {
        "free": os.freemem()/1073741824,
        "total": os.totalmem()/1073741824,
        "par": 100-((os.freemem() / os.totalmem()) * 100)
      },
      "cpu": {
        "par": cpu
      }
      
    }
    }
    res.type("json").send(JSON.stringify(json,null,2))

  } catch(err) {
    next(err);
  }
});

app.get('/api/backuplist', async(req, res, next) => {
  try {
    const blist = await get_backuplist("",false)
    res.type("json").send(JSON.stringify(blist.data,null,2))
  }catch(err) {
    next(err)
  }
});


app.use(express.static(path.join(root,"www")))

app.use((err, req, res, next) => {
  console.error(chalk.red('[WEB-ERROR]'), err);
  res.status(500).json({
    error: 'internal_error',
    message: err.message
  });
});


// Websocket Server

const wss = new WebSocket.Server({ noServer: true, path: "/ws" });

if (config.console.bswSystemLogToConsole) console.log(chalk.bgBlue(`WebSocket Ready`))

server.on("upgrade", (req, socket, head) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    socket.destroy();
    return;
  }

  const [type, token] = auth.split(" ");
  if (type !== "Basic") {
    socket.destroy();
    return;
  }

  const decoded = Buffer.from(token, "base64").toString();
  const [user, pass] = decoded.split(":");

  if (user !== config.webUi.username ||pass !== config.webUi.password) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, ws => {
    wss.emit("connection", ws, req);
  });
});



wss.on('connection', (ws) => {

ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message)
      if (msg.type == "cmd") {
        sendCommand(`${String(msg.data)}`)
      }
      if (msg.type == "servercmd") {
        if (msg.data == "playerlist") {
          ws.send(JSON.stringify({"type":"server","datatype":"playerlist","data":onlinePlayer}))
        } else if (msg.data == "backup") {
          ws.send(JSON.stringify({"type":"server","datatype":"str","data":"BackupStarted"}))
          backup(true)
        }
      }
    } catch(e) {
      console.error(chalk.red(e.message))
    }
  });
});



const start = async () => {
  server.listen(PORT,"0.0.0.0",() => {
    if (config.console.bswSystemLogToConsole) console.log(chalk.bgBlue(`WebServer&WebSocket Ready(http://localhost:${PORT})`))
  });
};

start();

function WSbroadcast(json) {
  wss.clients.forEach ((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(json));
    }
  });
}

// Discord

const client = new discord.Client({
    intents: [
      discord.GatewayIntentBits.Guilds, // サーバーに関するイベント
      discord.GatewayIntentBits.GuildMessages, // メッセージ関連
      discord.GatewayIntentBits.MessageContent, // メッセージの内容を取得（超重要！）
    ]
  });

async function sendLongMessage(channel, text, limit = 2000) {
try {
  for (let i = 0; i < text.length; i += limit) {
    await channel.send(text.slice(i, i + limit));
  }
}catch(e){
}
}


/**
 * @type {{
 *   chat: import("discord.js").TextChannel,
 *   serverStatus: import("discord.js").TextChannel
 *   playerinfo: import("discord.js").TextChannel
 * }}
 */
const channels = {
  "chat": null,
  "serverStatus": null,
  "playerinfo": null
}

async function LLtoDis(name,type) {
  if (!channels.chat) return
  if (!client.isReady()) return
  if (!config.Discord.notifications.chat.enabled) return
  let hex
  if (type === "logout") {
    type = "ログアウトしました"
    hex = 0xD20000
  } else if (type === "join") {
    type = "ログインしました"
    hex = 0x00bd0f
  }
  const embed = new discord.EmbedBuilder()
  .setTitle(`${name}が${type}`)
  .setDescription(`[${servername}]${worldname}`)
  .setColor(hex)
  .setFooter({ text: `Time:${nowtime().full}` })
  await channels.chat.send({ embeds: [embed] });
}

async function DeathtoDis(name,data) {
  WSbroadcast({ type: "death", data: `${name}(${data})`})
  if (config.console.deathLogToConsole) console.log(chalk.magenta(`${name}(${data})`))
  if (!client.isReady()) return
  if (!channels.chat) return
  if (!config.Discord.notifications.chat.playerDeath) return
  const embed = new discord.EmbedBuilder()
  .setTitle(`${name}(${data})`)
  .setDescription(`[${servername}]${worldname}`)
  .setColor(0xad0000)
  .setFooter({ text: `Time:${nowtime().full}` })
  await channels.chat.send({ embeds: [embed] });
}

async function PlayerinfotoDis(json) {
  if (!client.isReady()) return
  if (!channels.playerinfo) return
  if (!config.Discord.notifications.playerInfoToAdmin.enabled) return

  const {playername,iserr,messageid,data} = json

  const embed = new discord.EmbedBuilder()
  embed.setFooter({ text: `Time:${nowtime().full}` })

  if (iserr) {
    embed.setTitle(`[${playername}]が見つかりませんでした`)
    embed.setDescription(`Error`)
    embed.setColor(0xed0000)
  } else {
    embed.setTitle(`[${playername}]の基本情報`)
    const dim = `Dimension: \`${data.dimension}\``
    const location = `Location: \`${data.location.x.toFixed(0)} ${data.location.y.toFixed(0)} ${data.location.z.toFixed(0)}\``
    const hp = `HP: \`${data.hp.now}/${data.hp.max}\``
    const gm = `GameMode: \`${data.gamemode}\``
    const mainhand = `MainHandItem: \`${data.mainhand}\``
    embed.setDescription(`${dim}\n${location}\n${hp}\n${gm}\n${mainhand}`)
    embed.setColor(0xabd656)
  }

  const message = await channels.playerinfo.messages.fetch(messageid)
  await message.reply({ embeds: [embed] });
}

const chatmng = {
  "sendtoMC": async(name,message) => {
    if (config.console.chatLogToConsole) console.log(chalk.yellow(`[D]${name}:${message}`))
    const returnText = `§3[D]${name}§r:${message}`
    logmng.add({"type":"chat","data":`[D]${name}:${message}`,"player":`${name}`,"message":`${message}`,"source":"Discord","time":Date.now()})
    WSbroadcast({ type: "chat", data: `[D]${name}:${message}`})
    const rawtext = {"rawtext":[{"text":`${returnText.replace(/\n/g,"\\n")}`}]}
    if (onlinePlayer.length != 0) sendCommand(`tellraw @a ${JSON.stringify(rawtext)}`,true)

  },
  "sendtoDis": async(name,message) => {
    if (config.console.chatLogToConsole) console.log(chalk.yellow(`${name}:${message}`))
    const returnText = `\`${name}\`:${message}`

    WSbroadcast({ type: "chat", data: `${name}:${message}`})
    logmng.add({"type":"chat","data":`${name}:${message}`,"player":`${name}`,"message":`${message}`,"source":"Minecraft","time":Date.now()})


    if (!config.Discord.notifications.chat.enabled) return
    if (!client.isReady()) return
    sendLongMessage(channels.chat,returnText)
  }
}


client.once(discord.Events.ClientReady, async () => {
    if (config.console.bswSystemLogToConsole) console.log(chalk.bgBlue(`[Discord]Login success: ${client.user.tag}`));
    try {
        if (config.Discord.notifications.chat.enabled) {
          channels.chat = await client.channels.fetch(`${config.Discord.notifications.chat.channelId}`,{force: true,allowUnknownGuild: true});
        }

        if (config.Discord.notifications.playerInfoToAdmin.enabled) {
          channels.playerinfo = await client.channels.fetch(`${config.Discord.notifications.playerInfoToAdmin.channelId}`,{force: true,allowUnknownGuild: true});
        }


        if (config.Discord.notifications.serverStatus.enabled) {
          channels.serverStatus = await client.channels.fetch(`${config.Discord.notifications.serverStatus.channelId}`,{force: true,allowUnknownGuild: true});
          const serverStartEmbed = new discord.EmbedBuilder()
          .setTitle("サーバーがスタートしました。")
          .setDescription(`[${servername}]${worldname}`)
          .setColor(0x6ff542)
          .setFooter({ text: `Time:${nowtime().full}` })
          await channels.serverStatus.send({embeds:[serverStartEmbed]})
        }

    } catch (error) {
        console.error(chalk.red(`${error}`));
    }
});

client.on(discord.Events.MessageCreate, message => {
  if (message.channelId == config.Discord.notifications.chat.channelId) {
    if (message.author.bot) return;
    if (message.content == "?playerlist" || message.content == "?pl") {
      (async()=>{
        let list = "player...\n\n"
        onlinePlayer.forEach((value)=>{
          list+=`- <${value.name}>\n`
        });
        const embed = new discord.EmbedBuilder()
        .setTitle("プレイヤー一覧")
        .setDescription(`${list}`)
        .setColor(0xff4778)
        .setFooter({ text: `Time:${nowtime().full}` })
        await channels.chat.send({ embeds: [embed] });
      })()
      return
    }
    // チャットを送信
    chatmng.sendtoMC(message.author.displayName,message.content)

    } else if (config.Discord.notifications.playerInfoToAdmin.enabled && message.channelId == config.Discord.notifications.playerInfoToAdmin.channelId) {
      // プレフィックスで始まっていたら
      if (config.Discord.notifications.playerInfoToAdmin.prefix.some(pre => message.content.startsWith(pre))) {
        const prefix = config.Discord.notifications.playerInfoToAdmin.prefix.find(pre =>
          message.content.startsWith(`${pre} `)
        )
      if (!prefix) return
      const content = message.content.slice(prefix.length+1)
      const json = JSON.stringify({"type":"getplayerinfo","playername":content,"messageid":message.id}).replaceAll("\"","\'").replaceAll("\\","\\\\'")
      sendCommand(`send "${json}"`)
      }
    }
});




// Backup

const backup_path = path.join(root,"backup",servername,worldname)


async function hashFile(filePath) {
  const hash = crypto.createHash("sha1");
  const stream = fs.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    stream.on("data", d => hash.update(d));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

async function buildSnapshot(dir) {
  const result = {};

  async function walk(current, relative = "") {
    const items = await fs.readdir(current);
    for (const item of items) {
      const full = path.join(current, item);
      const rel = path.join(relative, item);
      const stat = await fs.stat(full);

      if (stat.isDirectory()) {
        await walk(full, rel);
      } else {
        result[rel] = await hashFile(full);
      }
    }
  }

  await walk(dir);
  return result;
}

let beforeBackupTime = Date.now()
async function backup(notskip = false, full = false) {
  try {
    const elapsed = Date.now() - beforeBackupTime;
    const intervalMs = config.backup.interval * 60 * 1000;

    if (!notskip && (typeof onlinePlayer[0] == "undefined" && config.backup.pauseIfNoPlayer)) return;
    if (!notskip && elapsed < intervalMs) return
    const realPlayers = onlinePlayer.filter(p => !config.backup.skipForPlayers.includes(p.name));
    if (!notskip && config.backup.pauseIfNoPlayer && realPlayers.length === 0) return;    
    const start = Date.now();
    beforeBackupTime = start
    const worldDir = path.join(BDS_path, "worlds", worldname);

    await fs.ensureDir(backup_path);

    // snapshot ファイル
    const snapshotFile = path.join(backup_path, "snapshot.json");
    let oldSnap = {};
    if (!full && await fs.pathExists(snapshotFile)) {
      oldSnap = await fs.readJSON(snapshotFile);
    }

    // 新しいスナップショット作成
    const newSnap = await buildSnapshot(worldDir);

    // バックアップ先フォルダ
    const date = new Date();
    let folderName = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    if (full) folderName += "_FULL";

    const backup_folder = path.join(
      backup_path,
      `${date.getFullYear()}`,
      `${date.getMonth() + 1}`,
      `${date.getDate()}`,
      folderName
    );
    await fs.ensureDir(backup_folder);

    if (full) {
      // フルバックアップは単純コピー
      await fs.copy(worldDir, backup_folder);
    } else {
      // 差分コピー
      for (const [rel, hash] of Object.entries(newSnap)) {
        if (oldSnap[rel] !== hash) {
          const src = path.join(worldDir, rel);
          const dest = path.join(backup_folder, rel);
          await fs.ensureDir(path.dirname(dest));
          await fs.copy(src, dest);
        }
      }

      // 削除されたファイルをバックアップ側でも削除
      for (const rel of Object.keys(oldSnap)) {
        if (!newSnap[rel]) {
          const delPath = path.join(backup_folder, rel);
          if (await fs.pathExists(delPath)) {
            await fs.remove(delPath);
          }
        }
      }

      // snapshot 更新
      await fs.writeJSON(snapshotFile, newSnap, { spaces: 2 });
    }

    const stop = Date.now();
    const log = `BackupSuccessful(${full ? "FULL" : "diff"})(${((stop - start)/1000).toFixed(2)} Seconds)`;
    if (config.console.backupLogToConsole) console.log(chalk.bgBlue(log));

    WSbroadcast({ type: "server", datatype: "str", data: log })

    logmng.add({"type":"server","datatype":"str","data":`${log}`,"time":Date.now()})

  } catch (e) {
    console.error(`[NODE-ERR]${chalk.red(e.message)}`);
  }
}

// 自動0時フルバックアップ

function scheduleDailyFullBackup() {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // 明日
    0, 0, 0, 0         // 0時0分0秒
  );
  const msUntilMidnight = nextMidnight - now;

  setTimeout(() => {
    if (config.console.backupLogToConsole) console.log(chalk.bgMagenta("Starting daily FULL backup..."));
    backup(true, true); // notskip=true, full=true

    // その後は24時間ごとに繰り返す
    setInterval(() => {
      if (config.console.backupLogToConsole) console.log(chalk.bgMagenta("Starting daily FULL backup..."));
      backup(true, true);
    }, 24 * 60 * 60 * 1000);

  }, msUntilMidnight);
}

scheduleDailyFullBackup();



async function get_backuplist(source,returnfullbackup=false) {
  const date = new Date();
  const yyyy_now = date.getFullYear();
  const MM_now   = date.getMonth() + 1;
  const dd_now   = date.getDate();

  await fs.ensureDir(backup_path);

  const all_list = [];
  const today_list = [];

  // helper: ディレクトリだけ返す
  const onlyDirs = async (target) => {
    const list = await fs.readdir(target);
    const dirs = [];
    for (const item of list) {
      const p = path.join(target, item);
      try {
        if ((await fs.stat(p)).isDirectory()) dirs.push(item);
      } catch {}
    }
    return dirs;
  };

  for (const yyyy of await onlyDirs(backup_path)) {
    for (const MM of await onlyDirs(path.join(backup_path, yyyy))) {
      for (const dd of await onlyDirs(path.join(backup_path, yyyy, MM))) {
        for (const folder of await onlyDirs(path.join(backup_path, yyyy, MM, dd))) {

          const isFull = folder.includes("_FULL");        // フルバックアップ判定
          const folderName = folder.replace("_FULL", ""); // 日付部分だけ取り出す
          const [hh, mm, ss] = folderName.split("-");

          // hh-mm-ss が正常じゃないフォルダも無視
          if (!hh || !mm || !ss) continue;

          const fullpath = path.join(yyyy, MM, dd, folder);
          const full_date_ja =
            `${yyyy}年${MM}月${dd}日 ${hh}時${mm}分${ss}秒` +
            (isFull ? " (FULL)" : "");

          const item = {
            fullpath: fullpath,
            date: {
              yyyy: Number(yyyy),
              MM: Number(MM),
              dd: Number(dd),
              hh: Number(hh),
              mm: Number(mm),
              ss: Number(ss)
            },
            fullpathja: full_date_ja,
            full: isFull
          };

          all_list.push(item);

          // 今日分だけ
          if (yyyy == yyyy_now && MM == MM_now && dd == dd_now) {
            today_list.push(item);
          }
        }
      }
    }
  }
  return {
      type: "backuplist",
      source: source,
      data: {
        allbackup: all_list.length,
        today: today_list.length,
        todaybackuplist: today_list,
        ...(returnfullbackup && { fullbackuplist: all_list })
      }
  }
}




// addon

async function addon_copy() {
try {
    const addon_path = path.join(root,"default_server_addon")
    const dev_addon = path.join("bds","development_behavior_packs","default_server_addon")
    await fs.ensureDir(dev_addon)
    await fs.copy(addon_path,dev_addon)
    const manifest = JSON.parse(await fs.readFile(path.join(addon_path,"manifest.json")))
    const addon_uuid = manifest.header.uuid
    const worldpath = path.join(BDS_path,"worlds",worldname)
    await fs.ensureDir(worldpath)
    const bp_packlist_path = path.join(worldpath,"world_behavior_packs.json")
    await fs.ensureFile(bp_packlist_path)
    let bp_packlist_rawjson = await fs.readFile(bp_packlist_path)
    if (bp_packlist_rawjson == "") bp_packlist_rawjson = "[]"
    const bp_packlist = JSON.parse(bp_packlist_rawjson)
    let search_flag = false
    let search_index = NaN
    bp_packlist.forEach((element,index) => {
        if (element.pack_id == addon_uuid) {
            search_flag = true
            search_index = index
        }
    });
    if (search_flag) bp_packlist[search_index].version = manifest.header.version
    if (!search_flag) bp_packlist.push({"pack_id":addon_uuid,"version":manifest.header.version})
    await fs.writeFile(path.join(bp_packlist_path),JSON.stringify(bp_packlist,null,2))
    if (config.console.bswSystemLogToConsole) (chalk.bgBlue("defaultAdd-on copy success"))
    logmng.add({"type":"server","datatype":"str","data":"defaultAdd-on copy success","time":Date.now()})
    
    WSbroadcast({"type":"server","datatype":"str","data":"defaultAdd-on copy success"})

}catch(e) {
  console.error(chalk.red(e.message))
}
};

backup(true)
addon_copy()

// BDS Run
const bds = spawn(BDS_file,{
  detached: true,
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: `${BDS_path}`
});
let startedBackup = false;

const waitBackup = setInterval(() => {
  if (server_started && !startedBackup) {
    startedBackup = true;
    clearInterval(waitBackup);
    // 定期バックアップ
    setInterval(() => {
      backup();
    }, 1000 * 60 * BackupInterval);
  }
}, 500); // 0.5秒ごとにチェック


// BDS InOut Setting

const rl = readline.createInterface({
  input: bds.stdout,
  output: bds.stdin,
});

// BDS Runcommand
function sendCommand(cmd,hidden=false) {
  if (!hidden) {
    console.log(`${chalk.green(cmd)}\n`)
    WSbroadcast({"type":"cmd","data":cmd})
    logmng.add({"type":"cmd","data":cmd,"time":Date.now()})
    }
  
  //BDS Input
  bds.stdin.write(`${cmd}\n`);
  
}


// BDS Output

rl.on('line', (line) => {
    //serverVersion
    // [2025-12-13 17:42:36:209 INFO] Version: 1.21.130.4
    if (/^\[.* INFO\] Version: .*$/.test(line)) {
      BDSver = line.match(/Version:\s*([0-9].*)/)[1]
      if (config.console.bswSystemLogToConsole) console.log(chalk.bgBlue(`BDS-Version:${BDSver}`))
    }

    // PlayerSpawned

    if (/^\[.* INFO\] Player Spawned: .* xuid: .*, pfid:.*$/.test(line)) {
        const playername = String(line.replace(/^\[.* INFO\] Player Spawned: /,"").replace(/ xuid:.*$/,""))
        const xuid = Number(line.replace(/^\[.* INFO\] Player Spawned: .* xuid: /,"").replace(/, pfid: .*$/,""))
        const json = {"name":playername,"xuid":xuid}
        logmng.add({"type":"PlayerJoin","data":playername,"time":Date.now()})
        WSbroadcast({"type":"PlayerJoin","data":playername})
        onlinePlayer.push(json)
        LLtoDis(json.name,"join")
        if (config.console.joinPlayerLogToConsole) console.log(chalk.bgBlue(`PlayerJoin:${playername}`))
    }

    // PlayerLeave

    if (/^\[.* INFO\] Player disconnected: .*, xuid: .*, pfid:.*$/.test(line)) {
        const playername = String(line.replace(/^\[.* INFO\] Player disconnected: /,"").replace(/, xuid: .*, pfid: .*$/,""))
        const xuid = Number(line.replace(/^\[.* INFO\] Player disconnected: .*, xuid: /,"").replace(/, pfid: .*$/,""))
        const json = {"name":playername,"xuid":xuid}

        logmng.add({"type":"PlayerLeave","data":playername,"time":Date.now()})
        WSbroadcast({"type":"PlayerLeave","data":playername})

        onlinePlayer.forEach((value,index)=>{
            if (JSON.stringify(value) == JSON.stringify(json)) {
                onlinePlayer.splice(index,1)
            }
        })
        LLtoDis(json.name,"logout")
        backup(true)
        if (config.console.leavePlayerLogToConsole) console.log(chalk.bgBlue(`PlayerLeave:${playername}`))
    }
    if (/^\[.* INFO\] Server started./.test(line)) {
      if (config.console.bswSystemLogToConsole) console.log(chalk.bgBlue("Server Started"))
      server_started = true
      if (config.Discord.enabled) client.login(config.Discord.TOKEN);
    }

    if (/^\[.* INFO\] \[Json\] .* \| .* \| .* \| For entity .*, "attack_interval" is disabled \(max <= 0\); goal will fall back to "scan_interval" \(ticks\)\./.test(line)) {
      return
    }

    if (/^\[.* INFO\] Server stop requested\./.test(line)) {
      sendCommand("stop")
    }

    if (!line.trim()) return

    if (/^\[.* INFO\] \[Scripting\] \{"type":".*","cmd":".*","source":".*","data":".*","isEntity":.*\}/.test(line)) {
      const json = JSON.parse(line.match(/\{"type":".*","cmd":".*","source":".*","data":".*","isEntity":.*\}/)[0])


      if (json.type == "servercommand" && json.cmd == "reloadaddon") {
        const {source,isEntity} = json;
        (async()=>{
          await addon_copy()
          sendCommand("reload")
          if (!isEntity) return
          sendCommand(`tellraw ${source} {"rawtext":[{"text":"§cDefaultAddonCopy & AddonReload Success"}]}`)
        })()
      }

      if (json.type == "servercommand" && json.cmd == "backuplist") {
        const {source,isEntity} = json;
        (async()=>{
          const json = await get_backuplist(source)
          if (!isEntity) return
          sendCommand(`send "${JSON.stringify(json).replaceAll("\"","\'").replaceAll("\\","\\\\'")}"`,true)
        })()
      }

      if (json.type == "Logger" && json.cmd == "playerLeave") {
        const {source,isEntity} = json;
        if (!config.lastLocationLog.saveLocationLog) return
        (async()=>{
          try {
            const playername = source.replace(/\(.* .* .*\)/,"")
            const [x, y, z] = source.replace(playername,"").replace("(","").replace(")","").split(" ").map(Number)
            const json = {playername,"location":{x,y,z},"timestamp":Date.now(),worldname}
            const res = await couch.post("/",json)
            if (res.status < 200 || res.status >= 300) {
              const errtext = `(${res.status})${res.data}`
              console.error(`[NODE-ERR]${chalk.red(errtext)}`);
            }
          } catch(e) {
              console.error(`[NODE-ERR]${chalk.red(e.message)}`);
          }
        })()
        return
      }
    }



    console.log(`${line}`);
    if (!line || line == "") return
    logmng.add({"type":"BDS","data":line,"time":Date.now()})

    // Websocket Broadcast
    WSbroadcast({"type":"BDS","data":line})

});


let stop = false
// Ctrl+C

process.on('SIGINT', () => {
  console.log(chalk.green("stoping BDS..."))
  stop = true
  sendCommand("stop")
});

process.on('SIGTERM', () => {
  console.log(chalk.green("stoping BDS..."))
  stop = true
  sendCommand("stop")
});

// Exit
process.on("exit",()=>{
  if (!stop) {
    chatmng.sendtoDis("Server",`サーバー管理ソフトが終了しました。管理者に連絡してください。`)
  }
  sendCommand("stop")
})

// エラーハンドリングしてない例外処理

function OnError(err) {
  console.error(chalk.red('UNHANDLED REJECTION:'), err);
  logmng.add({"type":"server","datatype":"str","data":`ERROR - ${err.name} | ${err.message}`,"time":Date.now()});

  (async()=>{
    if (config.Discord.enabled && channels.serverStatus &&config.Discord.notifications.serverStatus.enabled&&client.isReady()) {
      const serverErrEmbed = new discord.EmbedBuilder()
      .setTitle(`サーバーで例外エラーが発生しました${err.name}(${err.message})`)
      .setDescription(`[${servername}]${worldname}`)
      .setColor(0xf54242)
      .setFooter({ text: `Time:${nowtime().full}` })
      await channels.serverStatus.send({embeds:[serverErrEmbed]})
    }
  })();

 fs.ensureDirSync(path.join(root,"log","error"))
  const content = err.stack || JSON.stringify(err, null, 2)
 fs.writeFileSync(path.join(root,"log","error",`${Date.now()}-ERROR.err`),content)
}

process.on('unhandledRejection', err => {
  OnError(err)
});
process.on('uncaughtException',err => {
  OnError(err)
})


// BDS Close

bds.on('close', async(code) => {
  console.log(chalk.green(`BDS終了(${code})`));

  if (config.Discord.enabled && channels.serverStatus &&config.Discord.notifications.serverStatus.enabled&&client.isReady()) {
    const serverStopEmbed = new discord.EmbedBuilder()
    .setTitle("サーバーが停止しました。")
    .setDescription(`[${servername}]${worldname}`)
    .setColor(0xf54242)
    .setFooter({ text: `Time:${nowtime().full}` })
    await channels.serverStatus.send({embeds:[serverStopEmbed]})
    
    await client.destroy()
  }
  
  process.exit(0);
});