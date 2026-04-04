const { EmbedBuilder } = require("discord.js");

// content[1]
async function isbanned(bm,playername,message) {
    if (!playername) {
    return await message.reply("プレイヤー名がありません")
    }
    const info = bm.getinfo(playername)
    const {expiredtime} = info
    let expiredtimetext = ``
    if (!expiredtime) expiredtimetext = "**無期限**"; else {
        expiredtimetext = `<t:${Math.floor((Date.now() - expiredtime)/1000)}:R>`
    }

    const embed = new EmbedBuilder()
    .setTitle(`[${playername}]のBAN情報`)
    .setTimestamp(new Date())
    .setColor(0xeb7734)
    .setTimestamp(new Date())
    if (!info) embed.setDescription("BANされていません");else embed.setDescription(`BANされています。\n理由:${info.reason}\n期限:${expiredtimetext}\n-# BANした人:${info.author.author}(${info.author.isdiscord ? "Discord" : "Minecraft"})\n-# BAN時刻:${info.time}`)
    await message.reply({embeds:[embed]})
}
module.exports = isbanned

