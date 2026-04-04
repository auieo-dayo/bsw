const { EmbedBuilder } = require("discord.js");
const config = require("../../../config/config.js");


async function d(playername,message,channel,couch) {
  if (!channel) return
  if (!config.Discord.notifications.toAdmin.deathInfo.enabled) return
  if (!message) return

  const embed = new EmbedBuilder()
  embed.setTimestamp(new Date())

  embed.setTitle(`[${playername}]の死亡情報`)
  if (config.deathLocationLog.enable) {
    const res = await couch.post("/_find",{ "selector": { "playername": `${playername}` }, "sort": [ { "timestamp": "desc" } ], "limit": 10 })
    const deathdata = res.data.docs
    if (!deathdata[0]) {
      embed.setDescription(`[${playername}]の死亡情報が見つかりませんでした。`)
      embed.setColor(0xed0000)
    } else {
      let text = ""
      deathdata.forEach((v)=>{
      const date = new Date(v.timestamp)
        const dateja = `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}時${String(date.getMinutes()).padStart(2, "0")}分${String(date.getSeconds()).padStart(2, "0")}秒`
        text+=`- ${dateja}\n\`(${v.location.x.toFixed(0)} ${v.location.y.toFixed(0)} ${v.location.z.toFixed(0)},${v.data})\`\n\n`
      })
      embed.setDescription(text)
      embed.setColor(0x1fd15e)
  }
  } else {
    embed.setDescription("# configのdeathLocationLogの設定をしてください")
    embed.setColor(0xed0000)
  }
  
  
  await message.reply({ embeds: [embed] });
}
module.exports = d