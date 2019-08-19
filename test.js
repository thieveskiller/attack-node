const fs = require("fs");
const {fork} = require("child_process");

console.log("start");

let config = fs.readFileSync("./config.json");
let test = JSON.stringify({
    global:{
        processNumber: 1,
        thread: 1,
        delay: 500,
        maxMemory: 120,
        log: {
            log: false,
            level: 3
        }
    },
    stream: [{
        url: "http://baidu.com/${random.number(6)}",
        check: "",
        method: "GET",
        referer: "",
        data: ""
    },{
        url: "http://baidu.com",
        check: "",
        method: "POST",
        referer: "",
        data: "${random.qq()}"
    }]
});
fs.writeFileSync("./config.json",test);

let attack = fork("./start.js");
attack.on("error",(e) => {
    fs.writeFileSync("./config.json",config.toString());
    console.log(e.name);
    console.log(e.message)
    console.log(e.stack)
    process.exit(1);
});

attack.on("exit",(code,signal) => {
    fs.writeFileSync("./config.json",config.toString());
    console.log(`exit ${code} ${signal}`);
    process.exit(code);
})

setTimeout(() => {
    attack.kill("SIGTERM");
    console.log("pass");
    fs.writeFileSync("./config.json",config.toString());
    process.exit(0);
}, 5e3);