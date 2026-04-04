// content[1]
async function pardon(playername,bm,message) {
    if (!playername) return await message.reply("プレイヤー名がありません");
    const res = bm.unban(playername)
    if (!res.delete) return await message.reply({content:"BAN解除に失敗しました"});
    await message.reply(`${res.gamertag}のBAN解除に成功しました。(${res.reason})\n-# BAN時刻:${res.time}`)
}
module.exports = pardon