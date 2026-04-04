// content[1],content[2]
async function ban(playername,reason,bm,onlinePlayer,stdin,message,author) {
    
    if (!playername) return await message.reply("プレイヤー名がありません");
    if (!reason) return await message.reply("理由がありません");
    bm.ban(playername,reason,author)
    if (onlinePlayer.players.has(playername)) {
        stdin.write(`kick ${playername}\n`)
    };
    await message.reply({content:`${playername}を${reason}でBANしました`})
}
module.exports = ban