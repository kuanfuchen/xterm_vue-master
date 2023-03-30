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
  // import color from 'ansi-colors';
  // import chalk from 'chalk';
  // import { AttachAddon } from 'xterm-addon-attach'; 
  let inputApis;
  const xterm = ref(null);
  const userInfo = ref({});
  const _rows = ref(50);
  const onloadElement = defineEmits(['onload']);
  let tempStorageSiganal = '';
  let terminalPath = '';
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
  const terminalContent = {
    projectName: '',
    projectId: '',
    resultName: '',
    resultId: '',
    fileName:'',
    fileId: '',
    recordProject: {},
  };
  const displayedText = ()=>{
    terminalPath = terminalContent.projectName === '' ? '': 'projectName>' + terminalContent.projectName + '>';
  };
  terminal.prompt = () => {
    terminal.write(`\r\n\x1b[28m\u001b[32mcode>${terminalPath}\u001b[37m`);
  };
  const initXterm = ()=>{
    // term.loadAddon(fitAddon);
    // terminal.loadAddon(new WebLinksAddon());
    // terminal.write(color.green('Welcome to Xtem JS'));
    terminal.write('Welcome to Xtem JS');
    terminal.open(xterm.value);
    terminal.prompt();
    fitAddon.fit();
    terminal.focus();
    terminal.onKey(async(ev)=>{
      const e = ev.domEvent;
      // getSelectAPI();
      if(e.keyCode === 13){
        // terminal.clear();//OK
        // terminal.dispose();//ok，移除DOM
        const sendCode = storagedCode.join('').trim();
        // console.log(green('this is string'));
        // terminal.write('\r\n'+'test color' + red(sendCode));
        // terminal.write('\r\n' + sendCode);
        terminal.clearSelection();
        terminal.clearTextureAtlas();
        storagedCode.length = 0;
        if(sendCode.length > 0){
          const checkedBehavior = sendCode.split(' ');
          if(checkedBehavior[0] === 'cd'){
            await textCMDEnterPath(checkedBehavior);
          }else{
            await textCMDgetlist(sendCode);
          }
        }
        // selector();
        // attachCustomKeyEventHandlerAPI();
        terminal.prompt();
        terminal.scrollToBottom();
      }else if(e.keyCode === 8){
        const len = terminalContent.projectName.length;
        if(terminal._core.buffer.x > 5 + len ) terminal.write('\b \b');
        const storagedLen = storagedCode.length - 1;
        storagedCode.splice(storagedLen, 1);
      }else{
        terminal.write(ev.key);
        storagedCode.push(ev.key);
      }
    });
  };
  const textCMDEnterPath= async(checkedBehavior) => {
    checkedBehavior.shift();
    const splitedPathName = checkedBehavior.join(" ");
    console.log(splitedPathName, 'splitedPathName');
    if(splitedPathName === '..'){
      terminalContent.projectName = '';
      terminalContent.projectId = '';
      terminalPath = '';
      terminalContent.recordProject = {};
      return
    }
    const listProjects = await inputApis.listProjects();
    const checkedSameProject = [];
    listProjects.records.forEach((item)=>{if(item.name === splitedPathName) checkedSameProject.push(item)});
    if(checkedSameProject.length === 1){
      terminalContent.projectName = checkedSameProject[0].name;
      terminalContent.projectId = checkedSameProject[0].id;
      terminalContent.recordProject = checkedSameProject[0];
      displayedText();
    }else if(checkedSameProject.length > 1){
      terminal.write('\r\n' + '\u001b[36mProject name | \u001b[37mCreate time');
      for(let i = 0 ; checkedSameProject.length > i ; i++){
        const timeNewStyle = checkedSameProject[i].createdAt.split(' GMT').shift();
        const regIdName = new RegExp('(' + `${item.name} ${ timeNewStyle} ${item.id}` + ')');
        getLinkId(regIdName, 'openProject')
        terminal.write('\r\n' + `\u001b[36m${checkedSameProject[i].name} \u001b[37m${timeNewStyle} \x1b[8m${checkedSameProject[i].id}\x1b[28m`);
      }
    }else{
      terminal.write(`\r\n don't ProjectName`)
    }
  }
  const textCMDgetlist = async(sendCode)=>{
    const splitText = sendCode.split('-');
    switch(splitText[0].trim()){
      case 'ls result':
        terminal.write('\r\n' + `\u001b[37m${sendCode}`);
        await getListResultOrFileAPI('results');
        break;
      case 'ls datafile':
        terminal.write('\r\n' + `\u001b[37m${sendCode}`);
        await getListResultOrFileAPI('dataFiles');
        break;
      case 'ls project':
        if(splitText.length > 1){
          const projectOptions = splitText[splitText.length - 1];
          if(projectOptions === 'public' || projectOptions === 'share'){
            await getListProjectAPI(projectOptions)
          }else{
            terminal.write('\r\nNo data!');
            return
          }
        }else{
          terminal.write(`\r\n\u001b[37m${sendCode}`);
          await getListProjectAPI('default');
        }
        break;
      case 'ls package':
        terminal.write(`\r\n\u001b[37m${sendCode}`);
        await getListResultOrFileAPI('packages');
        break;
      default:
        terminal.write(`\r\n\u001b[33mDon't correct signal, please`);
    }
  };
  
  const getListProjectAPI = async(projectOptions)=>{
    const listProjects = await inputApis.listProjects(null,null,projectOptions);
    console.log(listProjects, 'listProjects');
    terminal.write('\r\n' + `\u001b[36mProject count \u001b[36m${ listProjects.totalCount }`);
    terminal.write('\r\n' + '\u001b[36mProject name | \u001b[37mCreate time');
    for(let i = 0 ; listProjects.records.length > i ; i++){
      const timeNewStyle = listProjects.records[i].createdAt.split(' GMT').shift();
      terminal.write('\r\n' + `\u001b[36m${listProjects.records[i].name} \u001b[37m${ timeNewStyle } \x1b[8m${listProjects.records[i].id}\x1b[28m`);
      const regIdName = new RegExp('(' + `${listProjects.records[i].name} ${ timeNewStyle } ${listProjects.records[i].id}` + ')');
      getLinkId(regIdName, 'openProject')
    }
  }
  // const getSelectAPI = ()=>{
  //   const text = terminal.getSelection();
  //   console.log(text,'text')
  // }
  const attachCustomKeyEventHandlerAPI = ()=>{
    terminal.attachCustomKeyEventHandler((ev)=> {
      console.log(ev, 'ev')
    })
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
  const getListResultOrFileAPI = async(type)=>{
    const projectObj = Object.keys(terminalContent.recordProject);
    console.log(terminalContent.recordProject)
    if(projectObj.length === 0) {
      terminal.write('\r\n' + `Don't select project`);
      return 
    };
    console.log(terminalContent, 'terminalContent')
    //dataFiles//results
    if(terminalContent.recordProject[type].length === 0){
      terminal.write('\r\n' + `${type} no data`);
      return
    }
    terminal.write(`\r\n\u001b[36m${type} | \u001b[37m Create Time`)
    terminalContent.recordProject[type].forEach((item)=>{
      const timeNewStyle = item.createdAt.split(' GMT').shift();
      const regIdName = new RegExp('(' + `${item.name} ${ timeNewStyle} ${item.id}` + ')');
      getLinkId(regIdName, type);
      terminal.write('\r\n' + `\x1b[28m\u001b[36m${item.name} \u001b[37m${timeNewStyle} \x1b[8m${item.id}`);
    })
  }
  const savedProject = async() => {
    const listProjects = await inputApis.listProjects();
    listProjects.records.forEach((record)=>{
      if(terminalContent.projectId === record.id) terminalContent.recordProject = record;
    })
  }
  const getLinkId = (regIdName, option)=>{
    terminal.registerLinkProvider(
      new LinkProvider(
        terminal,
        regIdName,
        async(e, idName)=>{
          const splitTxt = idName.split(' ');
          const id = splitTxt[splitTxt.length - 1];
          const name = splitTxt[0];
          // await inputApis.navigateToBdpResult(id);
          if(option === 'results'){
            await inputApis.openResultLink(id);
          }else if(option === 'dataFiles'){
            await inputApis.openFileLink(id)
          }else if(option === 'openProject'){
            terminalContent.projectName = name;
            terminalContent.projectId = id;
            displayedText();
            terminal.prompt();
            savedProject();
          }        
        }
      )
    )
  }
  // const selectResult = (result)=>{
  //   terminal.onSelectionChange(()=> console.log(result.id,result.name));
  // }
  // const selector = ()=>{
  //   terminal.select((col) => console.log(col))
  // }
  const getUser = async() => {
    userInfo.value = await inputApis.getCurrentUserInfo();
  }
  onMounted(() => {
    onloadElement('onload', bdpElementInterface);
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