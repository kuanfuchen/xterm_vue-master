<template>
  <div>
    <p>Xterm Component</p>
    <div ref="xterm" class="xtermStyle"></div>
  </div>
</template>

<script setup>
  // import 'xterm/css/xterm.css';
  import { Terminal } from "xterm";
  import { FitAddon} from 'xterm-addon-fit';
  import { ref, onMounted } from 'vue';
  import { WebLinksAddon } from 'xterm-addon-web-links';
  import {LinkProvider} from 'xterm-link-provider';
  // import { AttachAddon } from 'xterm-addon-attach'; 
  let inputApis;
  const xterm = ref(null);
  const userInfo = ref({})
  const _rows = ref(50)
  const onloadElement = defineEmits(['onload']);
  
  const bdpElementInterface = {
    bdpInitialize: (inputApi) =>  {
      console.log(inputApi);
      inputApis = inputApi;
      getUser();
    },
    bdpElementParams$: undefined,
    bdpNotifyChanges: (e) => console.log(e, 'bdpNotifyChanges'),
    bdpIncomingMessage: (e) => console.log(e, 'bdpIncomingMessage')
  }
  const propsItem = defineProps({
    'elementId':String,
  });
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
  // 
  const fitAddon = new FitAddon();
  const storagedCode = [];
  const terminal = new Terminal({
    fontSize: 18,
    cursorBlink: true,
    rows: _rows.value,
    cols:1000,
    rendererType: 'canvas',
    fontWeight:700,
    // letterSpacing:3
    // lineHeight:1.1,
    theme: defaultTheme,
  });
  terminal.prompt = () => {
    terminal.write('\r\n\u001b[32mcode>\u001b[37m');
  };
  const initXterm = ()=>{
    // term.loadAddon(fitAddon);
    // terminal.loadAddon(new WebLinksAddon());
    terminal.write('Welcome to Xtem JS');
    terminal.open(xterm.value);
    terminal.prompt();
    fitAddon.fit();
    terminal.focus();
    
    terminal.onKey(async(ev)=>{
      const e = ev.domEvent;
      getSelectAPI();
      if(e.keyCode === 13){
        // terminal.clear();//OK
        // terminal.dispose();//ok，移除DOM
        const sendCode = storagedCode.join('').trim();
        // socket.value.send(sendCode);
        // terminal.write('\r\n' + chalk.red(sendCode));
        // terminal.write('\r\n' + sendCode);
        terminal.clearSelection();
        terminal.clearTextureAtlas();
        storagedCode.length = 0;
        if(sendCode === 'result'){
          await getApi(sendCode);
        }else if(sendCode === 'file'){
          await getFileAPI(sendCode)
        }
        // selector();
        // attachCustomKeyEventHandlerAPI();
        terminal.prompt();
        // terminal.scrollToBottom();
      }else if(e.keyCode === 8){
        if(terminal._core.buffer.x > 5) terminal.write('\b \b');
        const storagedLen = storagedCode.length - 1;
        storagedCode.splice(storagedLen, 1);
      }else{
        terminal.write(ev.key);
        storagedCode.push(ev.key);
      }
    });
  };
  const getSelectAPI = ()=>{
    const text = terminal.getSelection();
    console.log(text,'text')
  }
  const attachCustomKeyEventHandlerAPI = ()=>{
    terminal.attachCustomKeyEventHandler((ev)=> {
      console.log(ev, 'ev')
    })
  }
  const getFileAPI = (async(inputedCode)=>{
    const listProjects = await inputApis.listProjects();
    terminal.write('\r\n' + `\u001b[33mProject count \u001b[33m${ listProjects.totalCount }`);
    terminal.write('\r\n' + '\u001b[33mFile name \u001b[33mCreate time');
    for(let i = 0 ; listProjects.records.length > i ; i++){
      if(listProjects.records[i].dataFiles.length > 0){
        terminal.write('\r\n' + `\u001b[33mProject name \u001b[36m${listProjects.records[i].name}`);
        listProjects.records[i].dataFiles.forEach((file) => {
          terminal.write('\r\n' + `\u001b[36m${file.name}  \u001b[36m${file.createdAt}`);
          // terminal.onSelectionChange(()=>console.log(file.id,file.name))
        })
        _rows.value = _rows.value + listProjects.records[i].dataFiles.length + 4;
      }else{
        terminal.write('\r\nNo Data');
      }
    }
  })
  const getApi = async(inputedCode)=>{
    const listProjects = await inputApis.listProjects();
    console.log(listProjects, 'listProjects')
    terminal.write('\r\n' + `\u001b[33mProject count \u001b[33m${ listProjects.totalCount }`);
    terminal.write('\r\n' + '\u001b[33mResult name \u001b[33mCreate time');
    // const emojiRegex = /(\p{Emoji_Presentation}+)/gu
    // const emojiRegex = /(CLICKME)/gu
    // terminal.registerLinkProvider(
    //   new LinkProvider(
    //     terminal,
    //     emojiRegex,
    //     (e, text) => {
    //       console.log(text)
    //     }
    //   )
    // )
    // terminal.write('\r\n' + 'click here: CLICKME')
    // const list = [];
    // for(let i = 0 ; listProjects.records.length > i ; i++){
    //   listProjects.records[i].results.forEach((result)=>{
    //     list.push(result)
    //   })
    // };
    // for(let i = 0 ; list.length > i ; i++){
    //   console.log(list[i])
    //   terminal.writeln('\r\n' + `\u001b[33m${list[i].name} \u001b[36m${list[i].createdAt}`);
    // }
    for(let i = 0 ; listProjects.records.length > i ; i++){
      if(listProjects.records[i].results.length > 0){
        terminal.write('\r\n' + `\u001b[33mProject name \u001b[36m${listProjects.records[i].name}`);
        // terminal.write
        listProjects.records[i].results.forEach((result) => {
          // let resultName = /(result.name)/gu;
          const newReg = new RegExp('(' + result.id + ')')
          // console.log(newReg, 'newReg')
          // terminal.write('\r\n' + `\u001b[36m${result.name}  \u001b[36m${result.createdAt}`);
          terminal.registerLinkProvider(
            new LinkProvider(
              terminal,
              newReg,
              (e, text)=>{
                // const txt = terminal.getSelection();
                // console.log(txt)
                // const pos = terminal.getSelectionPosition(($event)=>console.log($event));
                // console.log(pos,'pos')
                console.log(e.target,text)
              }
            )
          )
          terminal.write('\r\n' + `\u001b[36m${result.name}  \u001b[36m${result.id}`);
          // terminal.onSelectionChange(() => console.log(result.id, result.name))
          // terminal.registerCharacterJoiner((ev)=>{
          //   console.log(ev,'ev')
          // })
        //   const hookText = terminal.parser.registerCsiHandler({final:'H'}, params =>{
        //     console.log(result.createdAt)
        //   })
        //   hookText.dispose();
          // terminal.onBell(()=>{console.log(i,'i')})
          // selectResult(result);
        })
        // terminal.resize((cols, rows) => {console.log(cols, rows)});
        _rows.value = _rows.value + listProjects.records[i].results.length + 4;
        // console.log(_rows.value, 'row')
        // terminal.registerMarker((ev)=>console.log(ev))
      }else{
        terminal.write('\r\nNo Data');
      }
    }
    // const packageList = await inputApis.listPackages();
    // console.log(packageList, 'packageList')
    // const resultList = await inputApis.listResults();
    // console.log(resultList,'resultList')
    // const projectInfo= await inputApis.getProjectInfo();
    // console.log(projectInfo , 'projectInfo')
    /* error: listPackages() listResults() */
    // const resultInfo = await inputApis.getResultInfo();
    // console.log(resultInfo,'resultInfo')
  }
  const selectResult = (result)=>{
    terminal.onSelectionChange(()=>console.log(result.id,result.name))
    // const resultObj  = terminal.onSelectionChange(()=>{

    //   return {
    //     name:result.name,
    //     id:result.id
    //   }
    // })
    // console.log(resultObj, 'resultObj')
  }
  // const selector = ()=>{
  //   terminal.select((col) => console.log(col))
  // }
  const getUser = async() => {
    userInfo.value = await inputApis.getCurrentUserInfo();
  }
  onMounted(() => {
    // socket.value = new WebSocket('ws://localhost:3001');
    onloadElement('onload', bdpElementInterface);
    // socket.value = new WebSocket(location.protocol.replace('https','ws') + '//' + location.hostname + ( location.port ? ( ':' + /* location.port */ 3001) : '') + '/');
    // const attAddon = new AttachAddon(socket.value);
    // term.loadAddon(attAddon);
    initXterm();
    
    // attachCustomKeyEventHandlerAPI();
  })
</script>
<style>
  

.xterm {
    cursor: text;
    position: relative;
    user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
}

.xterm.focus,
.xterm:focus {
    outline: none;
}

.xterm .xterm-helpers {
    position: absolute;
    top: 0;
    /**
     * The z-index of the helpers must be higher than the canvases in order for
     * IMEs to appear on top.
     */
    z-index: 5;
}

.xterm .xterm-helper-textarea {
    padding: 0;
    border: 0;
    margin: 0;
    /* Move textarea out of the screen to the far left, so that the cursor is not visible */
    position: absolute;
    opacity: 0;
    left: -9999em;
    top: 0;
    width: 0;
    height: 0;
    z-index: -5;
    /** Prevent wrapping so the IME appears against the textarea at the correct position */
    white-space: nowrap;
    overflow: hidden;
    resize: none;
}

.xterm .composition-view {
    /* TODO: Composition position got messed up somewhere */
    background: #000;
    color: #FFF;
    display: none;
    position: absolute;
    white-space: nowrap;
    z-index: 1;
}

.xterm .composition-view.active {
    display: block;
}

.xterm .xterm-viewport {
    /* On OS X this is required in order for the scroll bar to appear fully opaque */
    background-color: #000;
    overflow-y: scroll;
    cursor: default;
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
}

.xterm .xterm-screen {
    position: relative;
}

.xterm .xterm-screen canvas {
    position: absolute;
    left: 0;
    top: 0;
}

.xterm .xterm-scroll-area {
    visibility: hidden;
}

.xterm-char-measure-element {
    display: inline-block;
    visibility: hidden;
    position: absolute;
    top: 0;
    left: -9999em;
    line-height: normal;
}

.xterm.enable-mouse-events {
    /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
    cursor: default;
}

.xterm.xterm-cursor-pointer,
.xterm .xterm-cursor-pointer {
    cursor: pointer;
}

.xterm.column-select.focus {
    /* Column selection mode */
    cursor: crosshair;
}

.xterm .xterm-accessibility,
.xterm .xterm-message {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    color: transparent;
}

.xterm .live-region {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.xterm-dim {
    opacity: 0.5;
}

.xterm-underline-1 { text-decoration: underline; }
.xterm-underline-2 { text-decoration: double underline; }
.xterm-underline-3 { text-decoration: wavy underline; }
.xterm-underline-4 { text-decoration: dotted underline; }
.xterm-underline-5 { text-decoration: dashed underline; }

.xterm-strikethrough {
    text-decoration: line-through;
}

.xterm-screen .xterm-decoration-container .xterm-decoration {
	z-index: 6;
	position: absolute;
}

.xterm-decoration-overview-ruler {
    z-index: 7;
    position: absolute;
    top: 0;
    right: 0;
    pointer-events: none;
}

.xterm-decoration-top {
    z-index: 2;
    position: relative;
}
.xtermStyle{
    width: 100vw;
    height:100%;
    text-align:left;
    padding-left: 10px;
    background: #000;
    /* margin-left: 10px; */
  }
</style>