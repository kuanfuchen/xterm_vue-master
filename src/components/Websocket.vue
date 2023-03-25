<template>
  <div>
    <div ref="xterm" class="xtermStyle"></div>
  </div>
</template>
<style scoped>
  .xtermStyle{
    width:100vw;
    height:30vh;
    text-align: left;
    padding-left: 10px;
    /* margin-left: 10px; */
  }
</style>
<script setup>
  import 'xterm/css/xterm.css';
  import { Terminal } from "xterm";
  import { FitAddon} from 'xterm-addon-fit';
  // import { printTable } from 'console-table-printer';
  import chalk from 'chalk'; 
  // import { AttachAddon } from 'xterm-addon-attach'; 
  // import { WebLinksAddon } from 'xterm-addon-web-links';
  import { ref, onMounted, watch, /* unMounted */} from 'vue';
  const xterm = ref(null);
  const socket = ref(null);
  const fitAddon = new FitAddon();
  const testCases = [
  { index: 3, text: 'I would like some gelb bananen bitte', value: 100 },
  { index: 4, text: 'I hope batch update is working', value: 300 },
];
  let curr_line = '';
  let currPos = 0;
  const storagedCode = [];
  const defaultTheme = {
    foreground: '#ffffff', // 字体
    background: '#1b212f', // 背景色
    cursor: '#ffffff', // 设置光标
    selection: 'rgba(255, 255, 255, 0.3)',
    black: '#000000',
    brightBlack: '#808080',
    red: '#ce2f2b',
    brightRed: '#f44a47',
    green: '#00b976',
    brightGreen: '#05d289',
    yellow: '#e0d500',
    brightYellow: '#f4f628',
    magenta: '#bd37bc',
    brightMagenta: '#d86cd8',
    blue: '#1d6fca',
    brightBlue: '#358bed',
    cyan: '#00a8cf',
    brightCyan: '#19b8dd',
    white: '#e5e5e5',
    brightWhite: '#ffffff'
  };
  const term = new Terminal({
    fontSize: 18,
    cursorBlink: true,
    rows: 20,
    cols: 20,
    rendererType: 'canvas',
    // fontWeight:700
    theme: defaultTheme,
  });
  // const attachAddon = new AttachAddon(socket.value);
  term.prompt = () => {
    term.write('\r\n\u001b[32m\u001b[1mcode>\u001b[37m');
    // term.write('\n\r' + curr_line + '\r\n\u001b[32mcode>\u001b[37m')
  };
  const initXterm = ()=>{
    term.loadAddon(fitAddon);
    // term.loadAddon(attachAddon);
    // term.loadAddon(webLinksAddon);
    term.write('Welcome to Xtem JS');
    term.open(xterm.value);
    term.prompt();
    fitAddon.fit();
    term.focus();
    // term.onData((value)=>{
    //   term.write(value)
    //   socket.value.send(value)
    // })
    term.onKey((ev)=>{
      const e = ev.domEvent;
      // console.log(term._core.buffer.x,'x')
      if(e.keyCode === 13){
        const sendCode = storagedCode.join('').trim();
        socket.value.send(sendCode);
        // const p = new Table();
        // testCases
        // printTable(testCases);
        term.write('\r\n' + '============================')
        term.write('\r\n' + chalk.red(sendCode))
        for(let i = 0 ; testCases.length > i ; i++){
          term.write(`\r\n${testCases[i].text} ${testCases[i].value}`);
        }
        // term.write(`\r\n\b${sendCode}`);
        term.write('\r\n' + '============================')
        storagedCode.length = 0;
        term.prompt();
      }else if(e.keyCode === 8){
        if(term._core.buffer.x > 5) term.write('\b \b');
        const storagedLen = storagedCode.length - 1;
        storagedCode.splice(storagedLen, 1);
      }else{
        term.write(ev.key);
        storagedCode.push(ev.key);
      }
    })
  };
  // watch('socket', (oldval,newval)=>{
  //   console.log(oldval, newval)
  // })
  onMounted(() => {
    socket.value = new WebSocket('ws://localhost:3001');
    // socket.value = new WebSocket(location.protocol.replace('http','ws') + '//' + location.hostname + ( location.port ? ( ':' + location.port ) : '') + '/');
    // term.loadAddon(new WebLinksAddon());
    // socket.value.addEventListener('open',()=>{
    //   console.log('open vue connection')
    // })
    initXterm();
  })
  //   destroyed() {
  //     this.socket.close();
  //   },
  // }
</script>