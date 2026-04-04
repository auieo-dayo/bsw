const { EmbedBuilder } = require("discord.js");

async function list(bm,message) {
    let md = ""
    for (const p of bm.allbanlist()) {
    let expiredtimetext = ``
    if (!p.expiredtime) expiredtimetext = "**無期限**"; else {
        expiredtimetext = `<t:${Math.floor((Date.now() - p.expiredtime)/1000)}:R>`
    }
    md+=`- ${p.gamertag}(${p.reason})(${expiredtimetext})\n`
    }
    const embed = new EmbedBuilder()
        .setTitle("BAN List")
        .setTimestamp(new Date())
        .setDescription(md || "Error")
        .setColor(0xebba34)
        .setTimestamp(new Date())
    await message.reply({embeds:[embed]})
}
module.exports = list