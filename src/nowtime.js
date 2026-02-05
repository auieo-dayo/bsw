function nowtime() {
  const date = new Date();

  // JSTに変換（UTC + 9時間）
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);

  // 各要素をゼロ埋め
  const year = jst.getUTCFullYear();
  const month = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  const hour = String(jst.getUTCHours()).padStart(2, "0");
  const minute = String(jst.getUTCMinutes()).padStart(2, "0");
  const second = String(jst.getUTCSeconds()).padStart(2, "0");

  // 好きな形式でreturn（例：カスタムフォーマットで返す）
  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    full: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
    foldername:`${year}-${month}-${day}`,
    filename: `${hour}-${minute}-${second}`,
    log: `${month}/${day}_${hour}:${minute}:${second}`,
    ymd: `${year}/${month}/${day}`,
    time: `${hour}:${minute}:${second}`
  };
}
module.exports = nowtime