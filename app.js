const child_process = require("child_process");
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

let num = 32;   // 进程数
let url = "http://yuhailou.cn/mo/yxdl/s1.asp";  // 链接
let method = "POST";    // 请求方式（POST或GET）
let t = 10;     // 间隔时间，每个进程单独计算
let referer = "http://yuhailou.cn/mo/yxdl/xlogin.asp";  //来源
let data = `username=[QQ]&password=[String_10]`;    // POST发送的数据

logger("INFO", `[INFO][Thread-Main]`, `Starting...`);
logger("INFO", `[INFO][Thread-Main]`, `Maximum Concurrency: ${(1e3 / t) * num}`);

setInterval(() => {
    logger("INFO", `[INFO][Thread-Main]`, `total: ${n_total}, fail: ${n_fail}, success: ${n_success}`);
    n_total = 0;
    n_fail = 0;
    n_success = 0;
}, 1e3);

for (let i = 0; i < num; i++) {
    processes[i] = child_process.fork('./start.js', {
        env: {
            url: url,
            method: method,
            t: t,
            referer: referer,
            data: data
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
        let err = msg[0];
        let code = msg[1];
        let body = msg[2];
        total.total++;
        n_total++;
        if (isNaN(codeList[String(code)])) {
            codeList[String(code)] = 1;
        } else {
            codeList[String(code)]++;
        }
        if (_code(code) && !err) {
            if (success(body)) {
                n_success++;
                total.success++
            } else {
                total.fail++
                logger("WARN", `[WARN][Thread-${i}]`, `Failed`);
            }
        } else if (code != null) {
            n_fail++;
            total.fail++
            logger("WARN", `[WARN][Thread-${i}]`, `Code: ${code}`);
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

const success = (data) => {
    return true;
    /*
    if(data.indexOf("") != -1){
        return true;
    }else{
        return false;
    }
    */
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
    process.exit(0);
});
