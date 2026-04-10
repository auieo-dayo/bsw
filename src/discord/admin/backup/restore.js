function r (backup,target,message,bds) {
    if (!target) return message.editReply("Targetを指定してください")
    const targetdate= new Date(target)
    if (targetdate == "Invalid Date") return message.editReply("日付が無効です")
        

    const onclose = ()=>{
        bds.off(onclose)
        setTimeout(() => {
            backup.restore(target)
                .then(()=>{
                    message.editReply("復元完了しました、再起動します。")
                })
                .catch((e)=>{
                    message.editReply(`バックアップ復元失敗...再起動します。\n-# ${e.message}`)
                })
                .finally(()=>{
                    bds.restart()
                }) 
        },1000*5 );
    }
    bds.on("close",onclose)
    bds.exit()

    
}

module.exports = r