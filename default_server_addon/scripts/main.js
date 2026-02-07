// Bedrock Server Wrapper  - Default-Server-Addon
import {CommandPermissionLevel, system , world, CustomCommandParamType, PlayerCursorInventoryComponent, Entity, BlockTypes, Player, EntityComponentTypes, DimensionType, DimensionTypes, EffectType, EffectTypes, EntityDamageCause, EntityComponent, EquipmentSlot, InputButton, GameMode } from"@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { SecretString, transferPlayer } from "@minecraft/server-admin";
import * as net from "@minecraft/server-net"

async function post(body) {
    let status_code=NaN
    try {
        if (!body.type) return
        const req = new net.HttpRequest(`http://localhost:3000/api/bds/send`)
        req.setMethod("Post")
        const basic = new SecretString("Basic QkRTX1NlbmQ6QkRTX1NlbmQ=")
        req.addHeader("authorization",basic)
        req.addHeader('Content-Type', 'application/json')
        req.setBody(JSON.stringify(body))
        const res = await net.http.request(req)
        status_code = res.status
        if (res.status == 200) {
            // 成功
        } else {
            console.log(`[Sending] - ${res.status}`)
            world.getDimension("overworld").runCommand(`titleraw @a actionbar {"rawtext":[{"text":"§a送信に失敗しました:${res.status}\n管理者に連絡してください..."}]}`)
        }
    } catch(e) {
        console.error(e.message)
        world.getDimension("overworld").runCommand(`titleraw @a actionbar {"rawtext":[{"text":"§a送信に失敗しました:${status_code}\n管理者に連絡してください..."}]}`)
    }
}




world.beforeEvents.playerLeave.subscribe((ev)=>{
    const player = ev.player
    console.log(JSON.stringify({"type":"Logger","cmd":"playerLeave","source":`${player.name}(${player.location.x} ${player.location.y} ${player.location.z})`,"data":"","isEntity":true}))
})
world.beforeEvents.chatSend.subscribe((ev)=>{
    const msg = ev.message
    const sender = ev.sender
    const body = {"type":"chat","sender":sender.name,msg}
    post(body)

    if (msg.startsWith("!debug ") && sender.hasTag("admin")) {
        
        const cmd = msg.replace("!debug ","")
        sender.sendMessage(`debug....${cmd}`)
        switch(cmd) {
            default:
                break;
        }
    }
})
world.afterEvents.entityDie.subscribe((ev)=>{
    const source = ev.damageSource
    const die = ev.deadEntity

    if (die.typeId != "minecraft:player") return
    const cause = source.cause
    let info = ""
    if (source.damagingProjectile) {
        info = source.damagingProjectile.typeId
    }
    if (source.damagingEntity) {
        if (source.damagingEntity.typeId == "minecraft:player") {
            if (info != "") info+= "|"
            info += source.damagingEntity.name
        } else {
            if (info != "") info+= "|"
            info += source.damagingEntity.typeId
        }
    }
    const location = die.location
    const body = {"type":"death","source":`${die.name}`,"reason":`${cause}(${info})`,location}
    post(body)
})

system.beforeEvents.startup.subscribe((ev)=>{
    ev.customCommandRegistry.registerCommand({
        name:"auieo:backup",
        description:"バックアップ開始指示を送ります...",
        permissionLevel : CommandPermissionLevel.GameDirectors,
        mandatoryParameters:[
        ],
        optionalParameters:[
            {name:"auieo:isfull",type:CustomCommandParamType.Boolean}
        ]
    },(origin, arg) => {
        system.runTimeout(() => {
            let name = ""
            if (typeof origin.sourceEntity != "undefined") {
                name = origin.sourceEntity.name
            }
            let entity = true
            if (!origin?.sourceEntity || !(origin?.sourceEntity instanceof Player)) entity = false
            let isfull = false
            if (arg) {
                isfull = true
            }
            const body = {"type":"backup","source":`${name}`,isfull,"isEntity":entity}
            post(body)
            if (entity) origin.sourceEntity.sendMessage("§aバックアップ開始指示を送りました...")
        })
      })
    ev.customCommandRegistry.registerCommand({
        name:"auieo:backuplist",
        description:"バックアップのリストを送ります...",
        permissionLevel : CommandPermissionLevel.GameDirectors,
        mandatoryParameters:[
        ],
        optionalParameters:[
        ]
    },(origin, arg) => {
        system.runTimeout(() => {
            if (!origin?.sourceEntity || !(origin?.sourceEntity instanceof Player)) return
            console.log(JSON.stringify({"type":"servercommand","cmd":`backuplist`,"source":origin.sourceEntity.name,"data":"","isEntity":true}))
        })
      })
    ev.customCommandRegistry.registerCommand({
        name:"auieo:addonreload",
        description:"デフォルトアドオンのコピーとすべてのアドオンの再読み込みを行います...",
        permissionLevel : CommandPermissionLevel.GameDirectors,
        mandatoryParameters:[
        ],
        optionalParameters:[
        ]
    },(origin, arg) => {
        system.runTimeout(() => {
            let name = ""
            if (typeof origin.sourceEntity != "undefined") {
                name = origin.sourceEntity.name
            }
            let entity = true
            if (!origin?.sourceEntity || !(origin?.sourceEntity instanceof Player)) entity = false
            console.log(JSON.stringify({"type":"servercommand","cmd":"reloadaddon","source":name,"data":"","isEntity":entity}))

        })
      })
    ev.customCommandRegistry.registerCommand({
        name:"auieo:send",
        description:"BDSへ情報を送るためのコマンド",
        permissionLevel : CommandPermissionLevel.Owner,
        mandatoryParameters:[
            {"name":"data","type":CustomCommandParamType.String}
        ],
        optionalParameters:[
        ]
    },(origin, arg) => {
        system.runTimeout(() => {
            const json = JSON.parse(arg.replace(/'/g, '"'))
            if (json.type == "backuplist") {
                const {source,data} = json
                let text = "§aバックアップリスト(本日分)"
                const date = new Date()
                const today = []
                for (const p of world.getAllPlayers()) {
                    if (p.name == source) {
                        for (const d of data.todaybackuplist) {
                            today.push(d)
                            text+=`\n${d.fullpathja}`
                        }
                        text+=`\n全期間:${data.allbackup} | 本日分:${today.length}`
                        p.sendMessage(text)
                    }
                }
            } else if (json.type == "getplayerinfo") {
                const {playername,messageid} = json
                
                const returnjson = {"type":"playerinfo",playername,"iserr":false,messageid,"data": {
                    "dimension": "",
                    "location": {"x": NaN,"y": NaN,"z": NaN},
                    "hp": {"now":NaN,"max":20},
                    "gamemode": "",
                    "mainhand": ""
                }}

                const player = world.getAllPlayers().find((p)=>{
                    return p.name == playername
                })

                if (!player) returnjson.iserr = true; else {

                    returnjson.data.dimension = player.dimension.id
                    returnjson.data.location = player.location
                    returnjson.data.hp.now = player.getComponent("minecraft:health").currentValue.toFixed(0)
                    returnjson.data.gamemode = player.getGameMode()
                    returnjson.data.mainhand = player.getComponent(EntityComponentTypes.Equippable).getEquipment(EquipmentSlot.Mainhand).typeId

                }
                post(returnjson)
            }
        })
      })
})
