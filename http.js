const request = require("request");

const get = (uri,referer,cb) => {
    let options = {
        url: uri,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            'Referer': referer
        }
    };

    request(options,(err,res,body) => {
        if(err){
            cb(err,null,null);
        }else{
            cb(null,res,body);
        }
    })
}

const post = (uri,referer,data,cb) => {
    let options = {
        url: uri,
        method: "POST",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            'Referer': referer
        },
        body: data
    };

    request(options,(err,res,body) => {
        if(err){
            cb(err,null,null);
        }else{
            cb(null,res,body);
        }
    })
}

module.exports = {
    get: get,
    post: post
}