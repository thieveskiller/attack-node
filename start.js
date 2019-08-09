const http = require("./http");
const random = require("string-random");
const url = process.env.url;
const method = process.env.method;
const t = process.env.t;
const referer = process.env.referer;
const data = process.env.data;

process.on('message',(msg) => {
    if(msg[0] == "exit"){
        clearInterval(timer);
        process.exit(0);
    }
})

let timer = setInterval(() => {
    if(method == "GET"){
        uri = url.replace('[Phone]',random(11, {letters: false}))
        uri = uri.replace('[QQ]',random(10, {letters: false}))
        uri = uri.replace('[String_10]',random(12));
        uri = uri.replace('[String_12]',random(12));
        uri = uri.replace('[String_16]',random(12));
        uri = uri.replace('[String_20]',random(20));
        http.get(uri,referer,(err,res,body) => {
            try {
                let code = res.statusCode;
                if(err){
                    process.send([err,null,null]);
                }else{
                    process.send([err,code,body]);
                }
            } catch (error) {
                process.send([error,null,null]);
            }
        })
    }else if(method == "POST"){
        dat = data.replace('[Phone]',random(11, {letters: false}))
        dat = dat.replace('[QQ]',random(10, {letters: false}))
        dat = dat.replace('[String_10]',random(12));
        dat = dat.replace('[String_12]',random(12));
        dat = dat.replace('[String_16]',random(12));
        dat = dat.replace('[String_20]',random(20));
        http.post(url,referer,dat,(err,res,body) => {
            try {
                let code = res.statusCode;
                if(err){
                    process.send([err,null,null]);
                }else{
                    process.send([err,code,body]);
                }
            } catch (error) {
                process.send([error,null,null]);
            }
        })
    }
},t)