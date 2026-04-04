function p(stdin,message,content){
    message.reply({content:"取得中..."})
        const json = JSON.stringify({"type":"getplayerinfo","playername":content}).replaceAll("\"","'").replaceAll("\\","\\\\'")
        stdin.write(`send "${json}"\n`)
}
module.exports = p