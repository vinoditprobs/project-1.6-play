const S={screen:1,choice:null,coins:0,time:30,running:false,timer:null,form:null,branch:{},started:false,introVisible:false };
const $=id=>document.getElementById(id);
const screenData=$('screen-data');
const bubbleData=$('bubble-data');
const cloneTemplate=(root,selector)=>root.querySelector(selector).content.cloneNode(true);
let typewriterRun=0;
let typewriterTimers=[];
function timerText(){return `${S.time} seconds`}
function startTimer(seconds){clearInterval(S.timer);S.time=seconds;S.running=true;updateStats();S.timer=setInterval(()=>{S.time--;updateStats();if(S.time<=0){clearInterval(S.timer);S.running=false;if(S.screen<27)showTimeoutPopup()}},1000)}
function showTimeoutPopup(){$('timeoutPopup').classList.remove('hide');$('retryTimeout').focus()}
function retryTimeout(){clearInterval(S.timer);S.screen=1;S.coins=0;S.choice=null;S.time=30;S.started=true;S.introVisible=true;$('timeoutPopup').classList.add('hide');render()}
function money(n=S.coins){const fragment=cloneTemplate(document,'#coin');fragment.append(String(n));return fragment}
function updateStats(){
  const leftStat=$('leftStat'),rightStat=$('rightStat');
  leftStat.replaceChildren();rightStat.replaceChildren();
  if(S.running){const timer=document.createElement('b');timer.append(timerText());leftStat.append(cloneTemplate(document,'#timer-icon'),' ',timer)}
  if(S.coins>=0){rightStat.append('Total coins: ',money())}
  const screenTimer=$('screenTimer');
  if(screenTimer)screenTimer.textContent=timerText();
}
function currentFloor(){return S.screen>=22?3:S.screen>=18?2:S.screen>=10?1:0}
function sceneFor(n){const scene=$('scene');scene.replaceChildren(cloneTemplate(document,n>4&&n<27?'#scene-inside':'#scene-lobby'));}
function screenTemplate(n){const choices=screenData.querySelectorAll(`template[data-screen="${n}"]`);return [...choices].find(template=>!template.dataset.choice||Number(template.dataset.choice)===S.choice)||choices[0];}
function screenContent(){
  const content=screenTemplate(S.screen).content.cloneNode(true);
  const ending=content.querySelector('[data-ending-content]');
  if(ending){$('scene').append(ending);return document.createDocumentFragment()}
  content.querySelectorAll('[data-scene-character]').forEach(character=>$('scene').append(character));
  return content
}
function positionBubbles(){
  const scene=$('scene');
  const gameRect=$('game').getBoundingClientRect();
  scene.querySelectorAll('.bubble').forEach(bubble=>{
    const character=scene.querySelector(`.char.${bubble.classList.contains('left')?'left':'right'}`);
    const handoff=scene.querySelector('.ending-handoff');
    if(!character&&!handoff)return;
    const characterRect=character?character.getBoundingClientRect():(()=>{const rect=handoff.getBoundingClientRect();return {left:rect.left+rect.width*.58,top:rect.top+rect.height*.08,width:rect.width*.36,height:rect.height*.7}})();
    const bubbleWidth=bubble.offsetWidth;
    const bubbleHeight=bubble.offsetHeight;
    const margin=8;
    const centeredLeft=characterRect.left-gameRect.left+(characterRect.width-bubbleWidth)/2;
    const left=Math.max(margin,Math.min(centeredLeft,gameRect.width-bubbleWidth-margin));
    const preferredTop=characterRect.top-gameRect.top-bubbleHeight-10;
    const visibleHeight=Math.min(gameRect.height,window.innerHeight);
    const top=Math.max(margin,Math.min(preferredTop,visibleHeight-bubbleHeight-margin));
    bubble.style.left=`${left}px`;
    bubble.style.top=`${top}px`;
    bubble.style.right='auto';
  });
}
function stopTypewriter(){typewriterRun++;typewriterTimers.forEach(clearTimeout);typewriterTimers=[];}
function typeBubble(bubble,run){
  const text=bubble.dataset.typewriterText||'';
  let index=0;
  const typeNext=()=>{
    if(run!==typewriterRun||!bubble.isConnected)return;
    bubble.textContent=text.slice(0,index++);
    positionBubbles();
    if(index<=text.length){typewriterTimers.push(setTimeout(typeNext,28));}
  };
  typeNext();
}
function startTypewriter(){
  const run=typewriterRun;
  document.querySelectorAll('#scene .bubble').forEach(bubble=>{
    typewriterTimers.push(setTimeout(()=>typeBubble(bubble,run),300));
  });
}
function addBubbles(){const scene=$('scene');stopTypewriter();scene.querySelectorAll('.bubble').forEach(element=>element.remove());const templates=[...bubbleData.querySelectorAll(`template[data-screen="${S.screen}"]`)].filter(template=>!template.dataset.choice||Number(template.dataset.choice)===S.choice);templates.forEach(template=>scene.append(template.content.cloneNode(true)));scene.querySelectorAll('.bubble').forEach(bubble=>{if(S.screen===27)bubble.classList.add('ending-bubble');bubble.dataset.typewriterText=bubble.textContent.trim();bubble.textContent=''});requestAnimationFrame(()=>{positionBubbles();startTypewriter()});}
function bindScreen(root){
  root.querySelectorAll('[data-choice]').forEach(element=>element.addEventListener('click',event=>{event.preventDefault();pick(Number(element.dataset.choice))}));
  root.querySelectorAll('[data-next]').forEach(element=>element.addEventListener('click',()=>{go(Number(element.dataset.next));if(element.dataset.startTimer)startTimer(Number(element.dataset.startTimer))}));
  root.querySelectorAll('[data-action]').forEach(element=>element.addEventListener('click',()=>window[element.dataset.action]()));
}
function render(){const resumeThirtySecondTimer=S.running&&S.screen>=6&&S.screen<=8;clearInterval(S.timer);S.running=false;S.screen=Math.max(1,Math.min(28,S.screen));const early=S.started&&S.screen<=4;const ending=S.screen>=27;const final=S.screen===28;const contentRoot=early?$('startContent'):$('screenContent');sceneFor(S.screen);contentRoot.replaceChildren(screenContent());if(early){$('screenContent').replaceChildren();}else{$('startContent').replaceChildren();$('screen').scrollTop=0}$('ui').classList.toggle('hide',!S.started||early||ending);$('start').classList.toggle('hide',final||(!S.introVisible||S.started&&!early));$('start-card').classList.toggle('hide',(!S.started&&!S.introVisible)||ending);$('startIntro').classList.toggle('hide',S.started||final);$('startContent').classList.toggle('hide',!S.started||!S.introVisible||ending);$('endContent').classList.add('hide');$('currentFloor').textContent=currentFloor();document.querySelectorAll('.floor-badge').forEach((element,index)=>element.classList.toggle('active',index===currentFloor()));const activeRoot=early?$('startContent'):$('screenContent');activeRoot.querySelectorAll('.choice[data-choice]').forEach(element=>{const selected=Number(element.dataset.choice)===S.choice;element.classList.toggle('selected',selected);element.setAttribute('aria-pressed',selected?'true':'false')});bindScreen(activeRoot);bindScreen($('scene'));updateStats();addBubbles();if(S.screen===4||S.screen===5)startTimer(30);else if(resumeThirtySecondTimer)startTimer(S.time);else if(S.screen===10)startTimer(60);else if(S.screen>=11&&S.screen<=26)startTimer(Math.max(S.time||60,1));}
function go(n){S.screen=n;S.choice=null;render()}
function pick(i){S.choice=i;$('screen').querySelectorAll('.choice[data-choice]').forEach(element=>{const selected=Number(element.dataset.choice)===i;element.classList.toggle('selected',selected);element.setAttribute('aria-pressed',selected?'true':'false')});}
function quizUSP(){if(S.choice===null)return;if(S.choice===1){S.screen=9;render()}else{S.screen=8;render()}}
function itemChoice(){if(S.choice===null)return;if(S.choice===1){S.screen=12;render()}else{S.screen=13;render()}}
function buyPack(){if(S.coins<20){S.screen=15;render()}else{S.coins-=20;S.screen=17;render()}}
function claim(){const n=$('name').value.trim(),e=$('email').value.trim(),p=$('phone').value.trim(),err=$('formError');if(!n||!e||!p||!e.includes('@')||p.replace(/\D/g,'').length<10){err.textContent='Please enter a valid name, email and 10-digit phone number.';return}S.coins=100;S.screen=16;render()}
function brandChoice(){if(S.choice===null)return;if(S.choice===0){S.screen=21;render()}else{S.coins=Math.max(0,S.coins-30);S.screen=21;render()}}
function websiteChoice(){if(S.choice===null)return;if(S.choice===1){S.screen=24;render()}else{S.coins=Math.max(0,S.coins-40);S.screen=26;render()}}
function restart(){clearInterval(S.timer);S.screen=1;S.choice=null;S.coins=0;S.time=30;render()}
$('begin').onclick=()=>{S.started=true;S.introVisible=true;render()};
$('retryTimeout').onclick=retryTimeout;
window.addEventListener('resize',positionBubbles);
render();
setTimeout(()=>{if(!S.started){S.introVisible=true;render()}},3000);
