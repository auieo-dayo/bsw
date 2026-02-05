const WebSocket = require('ws');
const chalk = require('chalk');
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const socket = new WebSocket('ws://127.0.0.1:3535/ws');

socket.on('open', () => {
  console.log('接続完了');
  json_ask()
});

socket.on('message', (data) => {
    try {
    const json = JSON.parse(data)
    if (json.type == "BDS") {
        console.log(json.data)
    }
    if (json.type == "cmd") {
        console.log(chalk.green(json.data))
    }
    if (json.type == "server") {
        if (json.datatype == "playerlist") {
            console.log(chalk.blueBright(JSON.stringify(json.data,null,2)))
        } else {
          console.log(chalk.blue(json.data))
        }
    }
    } catch(e){
        console.error(chalk.red(e.message))
    }

});

socket.on('close', () => {
  console.log('接続切断');
  rl.close()
});

socket.on('error', (err) => {
  console.error('エラー:', err);
});


function json_ask() {
  rl.question('', (input) => {
    socket.send(JSON.stringify({"type":"cmd","data":`${input}`}))

    json_ask(); // 再帰でループ
  });
}

