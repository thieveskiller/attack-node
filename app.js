const child_process = require("child_process");
const fs = require("fs");
const os = require("os");
const config = JSON.parse(fs.readFileSync("./config.json").toString());

const logger = (type, title, msg) => {
    let time = new Date();
    if (type == "INFO") {
        console.log(`\x1b[47m\x1b[34m ${time} \x1b[46m\x1b[37m ${title} \x1b[47m\x1b[32m ${msg} \x1b[0m`);
    } else if (type == "WARN") {
        console.warn(`\x1b[47m\x1b[34m ${time} \x1b[46m\x1b[33m ${title} \x1b[47m\x1b[32m ${msg} \x1b[0m`);
    } else if (type == "ERROR") {
        console.error(`\x1b[47m\x1b[34m ${time} \x1b[46m\x1b[31m ${title} \x1b[47m\x1b[32m ${msg} \x1b[0m`);
    }
}

const _code = (code) => {
    if (!code) {
        return true;
    } else {
        let a = String(code).substr(0, 1);
        if (a == "2" || a == "3") {
            return true;
        } else {
            return false;
        }
    }
}

let processNumber = 0;
let processes = new Array();
let restart = true;
let n_fail = 0;
let n_success = 0;
let n_total = 0;
let total = {
    total: 0,
    success: 0,
    fail: 0
};
let codeList = new Object();

if (config.global.processNumber == -1) {
    processNumber = os.cpus().length * 4;
} else {
    processNumber = config.global.processNumber;
}

logger("INFO", `[INFO][Thread-Main]`, `Powered By 黑与白工作室`);
logger("INFO", `[INFO][Thread-Main]`, `Starting...`);
logger("INFO", `[INFO][Thread-Main]`, `Process: ${processNumber}`);
logger("INFO", `[INFO][Thread-Main]`, `Maximum Concurrency: ${(1e3 / config.global.delay) * processNumber * config.stream.length}`);

setInterval(() => {
    logger("INFO", `[INFO][Thread-Main]`, `total: ${n_total}, fail: ${n_fail}, success: ${n_success}`);
    n_total = 0;
    n_fail = 0;
    n_success = 0;
}, 1e3);

for (let i = 0; i < processNumber; i++) {
    processes[i] = child_process.fork('./start.js', {
        env: {
            config: JSON.stringify(config.stream),
            delay: config.global.delay
        }
    });
    processes[i].on('message', (m) => {
        processEvent.msg(i, m);
    });
    processes[i].on('close', (code) => {
        processEvent.exit(i, code);
    });
}

logger("INFO", `[INFO][Thread-Main]`, `Started!`);

var processEvent = {
    msg: (i, msg) => {
        let type = msg.type;

        if (type == "request") {
            let err = msg.data[0];
            let code = msg.data[1];
            total.total++;
            n_total++;
            if (isNaN(codeList[String(code)])) {
                codeList[String(code)] = 1;
            } else {
                codeList[String(code)]++;
            }
            if (_code(code) && !err) {
                n_success++;
                total.success++
            } else if (code != null) {
                n_fail++;
                total.fail++
                logger("WARN", `[WARN][Thread-${i}]`, `Code: ${code}`);
            }
        } else if (type == "console") {
            logger("INFO", `[INFO][Thread-${i}]`, msg.data);
        }
    },
    exit: (i, code) => {
        if (code == 0) {
            logger("WARN", `[WARN][Thread-${i}]`, `exit ${code}`);
        } else {
            logger("ERROR", `[ERROR][Thread-${i}]`, `exit ${code}`);
        }
        if (restart) {
            processes[i] = child_process.fork('./start.js');
        }
    }
}

process.on('SIGINT', function () {
    processes.forEach(e => {
        e.send(["exit"]);
    })
    logger("INFO", `[INFO][Thread-Main]`, `total: ${total.total}, fail: ${total.fail}, success: ${total.success}, unknow: ${total.total - total.fail - total.success}`);
    Object.keys(codeList).forEach(e => {
        if (e != "null") {
            logger("INFO", `[INFO][Thread-Main]`, `${e}: ${codeList[e]}`);
        }
    })
    logger("INFO", `[INFO][Thread-Main]`, `Powered By 黑与白工作室`);
    process.exit(0);
});