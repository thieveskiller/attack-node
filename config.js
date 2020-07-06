const os = require('os');

module.exports = {
  process: os.cpus().length,      // 进程
  thread: 10,                     // 线程（？）
  target: [
    {
      url: 'https://example.com', // Url
      method: 'get',              // Method
      body: undefined,            // body
      headers: {}                 // headers
    }
  ],
  worker: {
    request: {
      timer: 1,                   // 多久发一次请求
    },
    hook: {
      request: {
        // 发送请求前做的事
        befor: async (url, options) => {
          // do something
          return [url, options];
        },
        // 发送请求后做的事
        after: async (res) => {
          // do something
          return res;
        }
      }
    }
  }
}