const child_process = require('child_process');

const processes = [];

const status = {
  total: 0,
  error: 0,
  success: 0,
  fail: 0,
  status: {},
  rps: 0,
  process: 0,
  startAt: new Date().getTime()
}

const init = () => {
  const config = require('./config')
  for (let i = 0; i < config.process; i++) {
    initProcess();
  }
}

const initProcess = () => {
  const id = processes.length;
  const p = child_process.fork('./worker.js');
  processes[id] = p;
  p.on('exit', (code, sig) => {
    status.process--;
    initProcess();
  })

  p.on('message', msg => {
    onMsg(id, msg);
  })
  status.process++;
}

const onMsg = (id, msg) => {
  if(msg.type == 'request'){
    Object.keys(msg.data).forEach(e => {
      let fail = 0;
      let success = 0;
      let error = 0;
      status.total++;
      if(msg.data[e].status === -1){
        // 错误请求
        error++;
      }else{
        if(msg.data[e].status >= 200 && msg.data[e].status <= 399){
          // 成功请求
          success++;
        }else{
          // 失败请求
          fail++;
        }

        // 记录 statusCode
        if(status.status[msg.data[e].status]){
          status.status[msg.data[e].status]++;
        }else{
          status.status[msg.data[e].status] = 1;
        }
      }
      
      status.error += error;
      status.fail += fail;
      status.success += success;
      status.rps = Math.round((status.success - status.fail)/((new Date().getTime() - status.startAt)/1e3) * 1e3)/1e3;
    })
  }
}

setInterval(() => {
  const t = new Date(new Date().getTime() - status.startAt);
  console.clear();
  console.log(`--------[${t.getHours() - 8}:${t.getMinutes()}:${t.getSeconds()}]--------`);
  console.log(`total:       ${status.total}`);
  console.log(`fail:        ${status.fail}`);
  console.log(`error:       ${status.error}`);
  console.log(`success:     ${status.success}`);
  console.log(`rps:         ${status.rps}/s`);
  console.log(`process:     ${status.process + 1} (${status.process} worker, 1 master)`)
  console.log(`statusCode:  ${JSON.stringify(status.status)}`);
  console.log(`--------[${t.getHours() - 8}:${t.getMinutes()}:${t.getSeconds()}]--------`);
}, 3e2);

init();