<template>
  <div>
    <p>Xterm Component</p>
    <div ref="xterm" class="xtermStyle"></div>
  </div>
</template>
<style scoped>
  .xtermStyle{
    width:1024px;
    height:300px;
    text-align:left;
    padding-left: 10px;
    background: #000;
    /* margin-left: 10px; */
  }
  .xterm-helpers{
    display: none !important;
  }
</style>
<script setup>
  import 'xterm/css/xterm.css';
  import { Terminal } from "xterm";
  import { FitAddon} from 'xterm-addon-fit';
  // import chalk from 'chalk';
  import { ref, onMounted, watch, /* unMounted */} from 'vue';
  let inputApis;
  const xterm = ref(null);
  const socket = ref(null);
  const onloadElement = defineEmits(['onload']);
  const bdpElementInterface = {
    bdpInitialize: (inputApi) =>  {
      console.log(inputApi);
      inputApis = inputApi;
      getUser();
      console.log('app')},
    bdpElementParams$: undefined,
    bdpNotifyChanges: (e) => console.log(e, 'bdpNotifyChanges'),
    bdpIncomingMessage: (e) => console.log(e, 'bdpIncomingMessage')
  }
  const propsItem = defineProps({
    'elementId':String,
  })
  // 
  const fitAddon = new FitAddon();
  const storagedCode = [];
  const term = new Terminal({
    fontSize: 18,
    cursorBlink: true,
    rows:20,
    cols:20,
    rendererType: 'canvas',
    fontWeight:700
  });
  term.prompt = () => {
    term.write('\r\n\u001b[32mcode>\u001b[37m');
  };
  const initXterm = ()=>{
    term.loadAddon(fitAddon);
    term.write('Welcome to Xtem JS');
    term.open(xterm.value);
    term.prompt()
    fitAddon.fit();
    term.focus();
    term.onKey(async(ev)=>{
      const e = ev.domEvent;
      if(e.keyCode === 13){
        const sendCode = storagedCode.join('').trim();
        socket.value.send(sendCode);
        // term.write('\r\n' + chalk.red(sendCode));
        term.write('\r\n' + sendCode);
        storagedCode.length = 0;
        term.prompt();
        // const resultInfo = await inputApis.getCurrentResultInfo();
        // console.log(resultInfo)
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
  const getUser = async()=>{
    const user = await inputApis.getCurrentUserInfo();
    console.log(user)
  }
  onMounted(() => {
    socket.value = new WebSocket('ws://localhost:3001');
    initXterm();
    onloadElement('onload', bdpElementInterface);
  })
</script>