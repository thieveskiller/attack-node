const http = require("./http");
const random = require("string-random");
const config = JSON.parse(process.env.config);
const delay = process.env.delay;

const success = (data,regexp) => {
    let reg = new RegExp(regexp);
    if (reg.test(data)) {
        return true;
    } else {
        return false;
    }
}

const funs = (str) => {
    str = str.replace('[Phone]', random(11, { letters: false }))
    str = str.replace('[QQ]', random(10, { letters: false }))
    str = str.replace('[String_6]', random(6));
    str = str.replace('[String_10]', random(10));
    str = str.replace('[String_12]', random(12));
    str = str.replace('[String_16]', random(16));
    str = str.replace('[String_20]', random(20));
    return str;
}

process.on('message', (msg) => {
    if (msg[0] == "exit") {
        clearInterval(timer);
        process.exit(0);
    }
})

let timer = setInterval(() => {
    config.forEach(e => {
        let method = e.method;
        let url = e.url;
        let referer = e.referer;
        let data = e.data;

        if (method == "GET") {
            let uri = funs(url);
            http.get(uri, referer, (err, res, body) => {
                try {
                    let code = res.statusCode;
                    if (err) {
                        process.send({
                            type: "request",
                            data: [err, null]
                        });
                    } else {
                        if(success(body,config.check)){
                            process.send({
                                type: "request",
                                data: [err, code]
                            });
                        }else{
                            process.send({
                                type: "request",
                                data: [new Error("fail"), code]
                            });
                        }
                    }
                } catch (error) {
                    process.send({
                        type: "request",
                        data: [err, null, null]
                    });
                }
            })
        } else if (method == "POST") {
            let dat = funs(data);
            http.post(url, referer, dat, (err, res, body) => {
                try {
                    let code = res.statusCode;
                    if (err) {
                        process.send({
                            type: "request",
                            data: [err, null]
                        });
                    } else {
                        process.send({
                            type: "request",
                            data: [err, code]
                        });
                    }
                } catch (error) {
                    process.send({
                        type: "request",
                        data: [err, null]
                    });
                }
            })
        }
    });
}, delay)