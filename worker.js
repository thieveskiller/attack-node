const got = require('got');
const config = require('./config');

let dataCache = [];

setTimeout(() => {
  process.exit();
}, 1e4);

for (let i = 0; i < config.thread; i++) {
  setInterval(() => {
    config.target.forEach(async e => {
      let url = e.url;
      let options = {
        method: e.method,
        body: e.body || undefined,
        headers: e.headers
      };
      
      [url, options] = await config.worker.hook.request.befor(url, options);
      
      try {
        let res = await got(url, options);
        res = await config.worker.hook.request.after(res);
        dataCache.push({
          status: res.statusCode,
        })
      } catch (error) {
        dataCache.push({
          status: -1,
        })
      }
    })
  }, config.worker.request.timer);
}

setInterval(() => {
  if(dataCache.length > 0){
    process.send({
      type: 'request',
      data: dataCache
    })
    dataCache = [];
  }
}, 100);