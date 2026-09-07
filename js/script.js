const S={screen:1,choice:null,coins:0,time:30,running:false,timer:null,form:null,branch:{} };
const $=id=>document.getElementById(id);
const screenData=$('screen-data');
const bubbleData=$('bubble-data');
const cloneTemplate=(root,selector)=>root.querySelector(selector).content.cloneNode(true);
function timerText(){return `${S.time} seconds`}
function startTimer(seconds){clearInterval(S.timer);S.time=seconds;S.running=true;updateStats();S.timer=setInterval(()=>{S.time--;updateStats();if(S.time<=0){clearInterval(S.timer);S.running=false;if(S.screen<27){alert('Time is up — Riya left the elevator. Try again.');S.screen=1;S.coins=0;S.choice=null;render();}}},1000)}
function money(n=S.coins){const fragment=cloneTemplate(document,'#coin');fragment.append(String(n));return fragment}
function updateStats(){
  const leftStat=$('leftStat'),rightStat=$('rightStat');
  leftStat.replaceChildren();rightStat.replaceChildren();
  if(S.running){const timer=document.createElement('b');timer.append(timerText());leftStat.append(cloneTemplate(document,'#timer-icon'),' ',timer)}
  if(S.coins>=0){rightStat.append('Total coins: ',money())}
}
function sceneFor(n){const scene=$('scene');scene.replaceChildren(cloneTemplate(document,n>4&&n!==27?'#scene-inside':'#scene-lobby'));}
function screenTemplate(n){const choices=screenData.querySelectorAll(`template[data-screen="${n}"]`);return [...choices].find(template=>!template.dataset.choice||Number(template.dataset.choice)===S.choice)||choices[0];}
function screenContent(){
  const content=screenTemplate(S.screen).content.cloneNode(true);
  content.querySelectorAll('[data-scene-character]').forEach(character=>$('scene').append(character));
  return content
}
function positionBubbles(){
  const scene=$('scene');
  const sceneRect=scene.getBoundingClientRect();
  scene.querySelectorAll('.bubble').forEach(bubble=>{
    const character=scene.querySelector(`.char.${bubble.classList.contains('left')?'left':'right'}`);
    if(!character)return;
    const characterRect=character.getBoundingClientRect();
    const bubbleRect=bubble.getBoundingClientRect();
    const margin=8;
    const centeredLeft=characterRect.left-sceneRect.left+(characterRect.width-bubbleRect.width)/2;
    const left=Math.max(margin,Math.min(centeredLeft,sceneRect.width-bubbleRect.width-margin));
    const top=Math.max(margin,characterRect.top-sceneRect.top-bubbleRect.height-10);
    bubble.style.left=`${left}px`;
    bubble.style.top=`${top}px`;
    bubble.style.right='auto';
  });
}
function addBubbles(){const scene=$('scene');scene.querySelectorAll('.bubble').forEach(element=>element.remove());const templates=[...bubbleData.querySelectorAll(`template[data-screen="${S.screen}"]`)].filter(template=>!template.dataset.choice||Number(template.dataset.choice)===S.choice);templates.forEach(template=>scene.append(template.content.cloneNode(true)));requestAnimationFrame(positionBubbles);}
function bindScreen(){
  $('screen').querySelectorAll('[data-choice]').forEach(element=>element.addEventListener('click',event=>{event.preventDefault();pick(Number(element.dataset.choice))}));
  $('screen').querySelectorAll('[data-next]').forEach(element=>element.addEventListener('click',()=>{go(Number(element.dataset.next));if(element.dataset.startTimer)startTimer(Number(element.dataset.startTimer))}));
  $('screen').querySelectorAll('[data-action]').forEach(element=>element.addEventListener('click',()=>window[element.dataset.action]()));
}
function render(){clearInterval(S.timer);S.running=false;S.screen=Math.max(1,Math.min(27,S.screen));sceneFor(S.screen);$('screen').replaceChildren(screenContent());$('screen').scrollTop=0;$('screen').querySelectorAll('.choice[data-choice]').forEach(element=>{const selected=Number(element.dataset.choice)===S.choice;element.classList.toggle('selected',selected);element.setAttribute('aria-pressed',selected?'true':'false')});bindScreen();$('stage').textContent=`SCREEN ${S.screen} / 27`;document.querySelectorAll('.floor-badge').forEach((element,index)=>element.classList.toggle('active',index===(S.screen>=22?3:S.screen>=18?2:S.screen>=10?1:0)));updateStats();addBubbles();if(S.screen===4||S.screen===5)startTimer(30);else if(S.screen===10)startTimer(60);else if(S.screen>=11&&S.screen<=26)startTimer(Math.max(S.time||60,1));}
function go(n){S.screen=n;S.choice=null;render()}
function pick(i){S.choice=i;$('screen').querySelectorAll('.choice[data-choice]').forEach(element=>{const selected=Number(element.dataset.choice)===i;element.classList.toggle('selected',selected);element.setAttribute('aria-pressed',selected?'true':'false')});}
function quizUSP(){if(S.choice===null)return;if(S.choice===1){S.screen=9;render()}else{S.screen=8;render()}}
function itemChoice(){if(S.choice===null)return;if(S.choice===1){S.screen=12;render()}else{S.screen=13;render()}}
function buyPack(){if(S.coins<20){S.screen=15;render()}else{S.coins-=20;S.screen=17;render()}}
function claim(){const n=$('name').value.trim(),e=$('email').value.trim(),p=$('phone').value.trim(),err=$('formError');if(!n||!e||!p||!e.includes('@')||p.replace(/\D/g,'').length<10){err.textContent='Please enter a valid name, email and 10-digit phone number.';return}S.coins=100;S.screen=16;render()}
function brandChoice(){if(S.choice===null)return;if(S.choice===0){S.screen=21;render()}else{S.coins=Math.max(0,S.coins-30);S.screen=21;render()}}
function websiteChoice(){if(S.choice===null)return;if(S.choice===1){S.screen=24;render()}else{S.coins=Math.max(0,S.coins-40);S.screen=26;render()}}
function restart(){clearInterval(S.timer);S.screen=1;S.choice=null;S.coins=0;S.time=30;render()}
$('begin').onclick=()=>{$('start').classList.add('hide');render()};
window.addEventListener('resize',positionBubbles);
render();
