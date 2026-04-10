
async function l(backup,message,target) {
    if (!target) return message.editReply("Targetを指定してください");
    const targetDate= new Date(target)
    if (targetDate == "Invalid Date") return message.editReply("日付が無効です");

    const blist = await backup.getlist("",true)
        
    targetDate.setHours(23, 59, 59, 999);

    const list = blist.data.fullbackuplist.filter(b => {
        const d = new Date(b.date.yyyy, b.date.MM - 1, b.date.dd, b.date.hh, b.date.mm, b.date.ss);
        
        return d <= targetDate;
    })
    .sort((a, b) => {
        const da = new Date(a.date.yyyy, a.date.MM - 1, a.date.dd, a.date.hh, a.date.mm, a.date.ss);
        const db = new Date(b.date.yyyy, b.date.MM - 1, b.date.dd, b.date.hh, b.date.mm, b.date.ss);
        return da - db;
    });

    const startIndex = list.map(v => v.full).lastIndexOf(true);

    if (startIndex === -1) {
        throw new Error("FULL backup not found");
    }

    const applyList = list.slice(startIndex);

    let md = ""
    for (const b of applyList) {
        md+=b.fullpathja + "\n"
    }

    message.editReply(md)
    
}
module.exports = l