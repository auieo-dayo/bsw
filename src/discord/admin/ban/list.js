const { EmbedBuilder } = require("discord.js");

async function list(bm,message) {
    let md = ""
    for (const p of bm.allbanlist()) {
    md+=`- ${p.gamertag}(${p.reason})\n`
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