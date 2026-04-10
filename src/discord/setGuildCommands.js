const { ApplicationCommandOptionType } = require("discord.js")

/**
 * @type {import("discord.js").ApplicationCommandDataResolvable}
 */
const commandlist = [
    {
        name:"pl",
        description: "プレイヤーリストを表示します。",
    },
    {
        name:"p",
        description: "特定プレイヤーの情報を取得します。(特定チャンネルのみ)",
        options:[
            {
                name:"gamertag",
                description: "対象プレイヤーのゲーマータグ",
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name:"d",
        description: "特定プレイヤーの死亡ログ取得します。(特定チャンネルのみ)",
        options:[
            {
                name:"gamertag",
                description: "対象プレイヤーのゲーマータグ",
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name:"ban",
        description: "BAN系の操作。(特定チャンネルのみ)",
        options:[
            {
                name:"ban",
                description: "BANします。",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "gamertag",
                        description:"対象プレイヤーのゲーマータグ",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "reason",
                        description:"BAN理由",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "expired",
                        description: "BAN期間(時間)",
                        type: ApplicationCommandOptionType.Number,
                        required: false
                    }
                ]
            },
            {
                name: "isbanned",
                description: "プレイヤーがBANされているか確認します。",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "gamertag",
                        description:"対象プレイヤーのゲーマータグ",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: "list",
                description: "BANリストを表示します。",
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: "pardon",
                description: "プレイヤーのBANを解除します。",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "gamertag",
                        description:"対象プレイヤーのゲーマータグ",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            }
        ]
    },
    {
        name: "backup",
        description: "バックアップ系の操作をします。",
        options: [
            {
                name: "backup",
                description: "バックアップをします",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "isfull",
                        description: "フルバックアップ？",
                        type: ApplicationCommandOptionType.Boolean,
                        required: false
                    }
                ]
            },
            {
                name: "restore",
                description: "復元します(サーバーが一度停止します。)",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "target",
                        description: "どこまで戻すか",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: "list",
                description: "バックアップリストを取得します",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "target",
                        description: "その日のバックアップリストを取得します",
                        type: ApplicationCommandOptionType.String,
                        required: false
                    }
                ]
            }
        ]
    }
]

async function setCommands(client,guildid) {
    const res = await client.application.commands.set(commandlist,String(guildid))
    return res
}
module.exports = {commandlist,setCommands}