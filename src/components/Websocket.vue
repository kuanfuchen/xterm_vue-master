<template>
  <div>
    <p v-for="item in messages">
      {{ item }}
    </p>
    <div  ref="xterm" class="xtermStyle"></div>
  </div>
</template>
<style scoped>
  .xtermStyle{
    background:black; 
    width:600px; 
    height:300px;
    padding-left: 10px;
    text-align:left;
  }
</style>
<script setup>
  import 'xterm/css/xterm.css';
  import { Terminal } from "xterm";
  import { FitAddon} from 'xterm-addon-fit';
  // import { AttachAddon } from 'xterm-addon-attach'; 
  import { ref, onMounted,reactive, /* unMounted */} from 'vue';
  const xterm = ref(null);
  const socket = ref(null);
  const messages = reactive([]);
  const fitAddon = new FitAddon();
  let curr_line = '';
  let currPos = 0;
  const storagedCode = [];
  // const attachAddon = new AttachAddon(socket);
  const term = new Terminal({
    fontSize: 14,
    cursorBlink: true,
    rows:20,
    cols:20,
    fontSize: 18,
    // rendererType: 'canvas',
    // theme: defaultTheme,
  });
  term.prompt = () => {
    term.write('\n\r' + curr_line + '\r\n\u001b[32mcode>\u001b[37m')
  };
  const initXterm = ()=>{
    term.loadAddon(fitAddon);
    // term.loadAddon(attachAddon);
    // term.loadAddon(webLinksAddon);
    term.open(xterm.value);
    term.prompt()
    fitAddon.fit();
    term.focus();
    // term.onData((value)=>{
    //   term.write(value)
    //   socket.value.send(value)
    // })
    term.onKey((ev)=>{
      console.log(ev)
      const e = ev.domEvent
      if(e.keyCode === 13){
        const sendCode = storagedCode.join('');
        socket.value.send(sendCode);
        storagedCode.length = 0;
        term.prompt();
      }else if(e.keyCode === 8){
        if(term._core.buffer.x > 5) term.write('\b \b');
        const storagedLen = storagedCode.length - 1;
        storagedCode.splice(storagedLen, 1);
      }else{
        term.write(e.key);
        storagedCode.push(e.key);
      }
    })
  };
  onMounted(() => {
    socket.value = new WebSocket('ws://localhost:3001');
    socket.value.addEventListener('open',()=>{
      console.log('open vue connection')
    })
    initXterm();
  })
  //   destroyed() {
  //     this.socket.close();
  //   },
  // }
</script>