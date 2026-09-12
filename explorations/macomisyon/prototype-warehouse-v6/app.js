import {project,missions,createStore,statusFor,completedMainCount,deriveWorldState} from './model.js';
import {createWorld} from './world.js';
import {icon,missionIcon} from './icons.js';
const $=id=>document.getElementById(id);
const store=createStore();
const motionKey='macomisyon-warehouse-v6-motion';
let motionPaused=false;
try{motionPaused=localStorage.getItem(motionKey)==='paused';}catch{}
function motionControlHTML(){return `${icon(motionPaused?'play':'pause')}<span>${motionPaused?'Reprendre':'Pause'}</span>`;}
function updateMotionControl(){
 const button=$('motionButton');button.innerHTML=motionControlHTML();
 button.setAttribute('aria-pressed',String(motionPaused));button.setAttribute('aria-label',motionPaused?'Reprendre les animations du dépôt':'Mettre les animations du dépôt en pause');button.title=button.getAttribute('aria-label');
 world?.setMotionPaused(motionPaused);
}
function toggleMotion(){
 motionPaused=!motionPaused;
 try{localStorage.setItem(motionKey,motionPaused?'paused':'running');}catch{}
 updateMotionControl();if(panel?.type==='demo'){renderPanel();$('sheetBody').querySelector('[data-motion-toggle]')?.focus({preventScroll:true});}
 $('live').textContent=motionPaused?'Animations du dépôt en pause.':'Le dépôt reprend son activité.';
}

const names={open:'En cours',completed:'Accomplie',blocked:'Verrouillée'};
const hints={retours:'Le dépôt fait déjà parler de lui. Des recommandations peuvent arriver avant que Q soit remis sur ses roues.',boutiques:'De nouvelles adresses attendent de rejoindre les rayons. Les trouvailles reçues seront conservées.'};
let world=null,selected=null,panel=null,returnFocus=null,timer,previous=store.getState(),revealLocked=false,locating=0;
const getMission=id=>missions.find(m=>m.id===id);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hiddenMission=(id,state)=>statusFor(id,state)==='blocked'&&!revealLocked;
const worldState=state=>({...deriveWorldState(state,selected),revealLocked});
function clearAnnouncement(){clearTimeout(timer);$('announcement').classList.remove('visible');}
function announce(title,text){$('announceTitle').textContent=title;$('announceText').textContent=text;$('announcement').classList.add('visible');$('live').textContent=`${title}. ${text}`;clearTimeout(timer);timer=setTimeout(clearAnnouncement,4500);}
function updateDock(state){
 const n=completedMainCount(state);$('repairCount').innerHTML=`${n}<span>/3</span>`;[...$('repairTrack').children].forEach((e,i)=>e.classList.toggle('filled',i<n));
 if(selected){
  const m=getMission(selected),blocked=m&&hiddenMission(selected,state);
  $('depotTitle').textContent=selected==='project'?'FENWICK N°Q':blocked?'ÉTAPE VERROUILLÉE':m.short.toUpperCase();
  $('depotText').textContent=selected==='project'?'Le cœur du dépôt. Ouvre le dossier du projet.':blocked?'Un indice est disponible au toucher.':`${names[statusFor(selected,state)]} · ${state.counts[selected]}/${m.goal}`;
  $('missionsButton').innerHTML=`${icon(selected==='project'?'book':blocked?'lock':missionIcon(selected))}<span>${selected==='project'?'Dossier du projet':blocked?'Lire l’indice':'Ouvrir la Komisyon'}</span>${icon('arrow')}`;
  $('infoButton').textContent='Inventaire';
 }else{
  $('depotTitle').textContent=state.repaired?'LE QUAI EST OUVERT !':n?'ON RELÈVE LE DÉPÔT.':'Q EST À TERRE.';
  $('depotText').textContent=state.repaired?'Les colis circulent. Le quai est en service.':n?'Chaque réussite remet une pièce en place.':'Colis éparpillés. Trois missions pour repartir.';
  $('missionsButton').innerHTML=`${icon('crate')}<span>Inventaire des missions</span>${icon('arrow')}`;
  $('infoButton').textContent='Le projet';
 }
}
function closePanel(){panel=null;$('sheetWrap').hidden=true;$('mapUI').inert=false;$('hardware').inert=false;const target=returnFocus?.isConnected&&returnFocus.getClientRects().length?returnFocus:$('missionsButton');target.focus({preventScroll:true});}
function openPanel(type,id){
 clearAnnouncement();if(!panel)returnFocus=document.activeElement;panel={type,id};if(type==='mission')selected=id;else if(type==='project')selected='project';
 world?.setState(worldState(store.getState()),{animate:false});updateDock(store.getState());$('mapUI').inert=true;$('hardware').inert=true;$('sheetWrap').hidden=false;renderPanel();$('sheetBody').scrollTop=0;$('sheetClose').focus({preventScroll:true});
}
async function locate(id){
 const token=++locating;if(panel)closePanel();clearAnnouncement();selected=id;world?.setState(worldState(store.getState()),{animate:false});updateDock(store.getState());
 await world?.focusNode(id);if(token!==locating)return;
 $('live').textContent=id==='project'?'Fenwick Q localisé. Ouvrir le dossier du projet.':hiddenMission(id,store.getState())?'Étape verrouillée localisée. Lire son indice.':`${getMission(id).short} localisée. Ouvrir la Komisyon.`;
 $('missionsButton').focus({preventScroll:true});
}
function statusChip(id,state){const status=statusFor(id,state),ready=state.counts[id]>=getMission(id).goal;return `<span class="game-status ${status}">${icon(status==='completed'?'check':status==='blocked'?'lock':'lightning')}${status==='blocked'&&ready?'Objectif reçu · verrouillé':names[status]}</span>`;}
function inventoryHTML(state){
 const n=completedMainCount(state);
 return `<h2 id="sheetTitle">INVENTAIRE</h2><div class="inventory-summary"><span>${icon('tools')}REMISE EN SERVICE</span><strong>${n} / 3</strong></div><p class="panel-intro">Choisis une Komisyon pour rejoindre son point dans le dépôt.</p><div class="inventory-grid">${missions.map((m,i)=>{
  const status=statusFor(m.id,state),masked=hiddenMission(m.id,state),ready=state.counts[m.id]>=m.goal;
  return `<button class="inventory-slot ${status}" data-locate="${m.id}" aria-label="Localiser ${masked?'l’étape verrouillée '+(i+1):escape(m.title)}"><span class="slot-top"><span>${m.role==='bonus'?'BONUS':`K${String(i+1).padStart(2,'0')}`}</span>${icon(status==='completed'?'check':status==='blocked'?'lock':'target')}</span><span class="slot-art">${icon(masked?'lock':missionIcon(m.id))}</span><strong>${masked?'ÉTAPE VERROUILLÉE':escape(m.short.toUpperCase())}</strong><span class="slot-state">${status==='blocked'&&ready?'RÉSERVE COMPLÈTE':names[status].toUpperCase()}</span><span class="slot-progress"><i style="transform:scaleX(${Math.min(1,state.counts[m.id]/m.goal)})"></i></span><span class="slot-count">${state.counts[m.id]}<small> / ${m.goal}</small></span></button>`;
 }).join('')}</div><div class="game-tip">${icon('target')}<p>Localise le point, puis touche-le pour ouvrir son briefing. Les contributions reçues à l’avance sont conservées.</p></div><button class="secondary" data-close>${icon('back')}Reprendre l’exploration</button>`;
}
function projectHTML(state){const story=state.repaired?{title:'LE DÉPÔT EST EN ACTIVITÉ',text:'Les trois missions sont accomplies. Q assure ses allers-retours vers le quai et les colis partent. Le dépôt tourne grâce aux contributions réunies.'}:state.completed.includes('retours')?{title:'LES COLIS SONT RASSEMBLÉS',text:'Q est debout et sa cargaison est réunie sur la palette. Il reste à compléter les boutiques pour ouvrir le quai et faire partir les colis.'}:state.completed.includes('boutiques')?{title:'LE QUAI EST PRÊT',text:'Q est debout et la mission des boutiques est accomplie. Les recommandations doivent encore réunir la cargaison avant le départ des colis.'}:state.completed.includes('inscrits')?{title:'Q EST DE NOUVEAU DEBOUT',text:'Les dix inscrits ont remis Q sur ses roues. Les recommandations rassemblent la cargaison ; les boutiques préparent l’ouverture du quai. Ces deux missions avancent en parallèle.'}:{title:'REMETTRE LE DÉPÔT EN ROUTE',text:'Q s’est renversé et sa cargaison est au sol. Réunissons les contributions nécessaires pour le relever, rassembler les colis et ouvrir le quai.'};return `<h2 id="sheetTitle">QUILIVREOÙ</h2><div class="project-cartridge"><span class="cartridge-q">Q</span><div><strong>LE DÉPÔT DES POSSIBLES</strong><p>${project.tagline}</p></div></div><p>${project.description}</p><a class="game-monitor" href="${project.site}" target="_blank" rel="noopener" aria-label="Ouvrir l’annuaire QuiLivreOù"><img src="${project.image}" alt="Aperçu réel de l’annuaire QuiLivreOù"><span>ACCÈS À L’ANNUAIRE ${icon('arrow')}</span></a><div class="project-mission"><span>${icon('tools')}</span><div><h3>${story.title}</h3><p>${story.text}</p></div></div><div class="sheet-actions"><a class="action" href="${project.site}" target="_blank" rel="noopener">${icon('arrow')}Ouvrir QuiLivreOù</a>${project.video?`<a class="secondary" href="${project.video}" target="_blank" rel="noopener">${icon('play')}Voir la vidéo</a>`:`<span class="unavailable">${icon('play')}Vidéo indisponible</span>`}</div><button class="secondary" data-view="inventory">${icon('crate')}Inventaire des Komisyon</button><p class="note">La scène raconte les obstacles à la livraison. QuiLivreOù est un annuaire, pas un transporteur.</p>`;}
function lockedHTML(m,state){const ready=state.counts[m.id]>=m.goal,required=getMission(m.requires);return `<h2 id="sheetTitle">SIGNAL VERROUILLÉ</h2><div class="mission-art locked-art">${icon('lock')}<span>?</span></div>${statusChip(m.id,state)}<p class="clue">${hints[m.id]||'Une nouvelle étape attend son tour.'}</p><div class="resource-meter"><div><span>CONTRIBUTIONS EN RÉSERVE</span><strong>${state.counts[m.id]} <small>/ ${m.goal}</small></strong></div><div class="power-bar"><i style="transform:scaleX(${Math.min(1,state.counts[m.id]/m.goal)})"></i></div><p>${ready?'Tout est déjà réuni. La mission s’accomplira dès que son prérequis sera validé.':'Le compteur peut avancer dès maintenant. La réparation attend le déblocage de cette étape.'}</p></div><div class="unlock-requirement">${icon('lock')}<div><span>PRÉREQUIS</span><strong>${escape(required.title)}</strong></div></div><button class="action" data-locate="${required.id}">${icon('target')}Rejoindre l’étape requise</button><button class="secondary" data-close>${icon('back')}Retour au dépôt</button>`;}
function missionHTML(id,state){
 const m=getMission(id);if(hiddenMission(id,state))return lockedHTML(m,state);
 const status=statusFor(id,state),done=status==='completed',blocked=status==='blocked',required=m.requires?getMission(m.requires):null;
 return `<h2 id="sheetTitle">${escape(m.title)}</h2><div class="mission-art">${icon(missionIcon(id))}${statusChip(id,state)}</div><p class="mission-objective">${escape(m.description)}</p><div class="resource-meter"><div><span>${done?'OBJECTIF ACCOMPLI':'CONTRIBUTIONS RÉUNIES'}</span><strong>${state.counts[id]} <small>/ ${m.goal}</small></strong></div><div class="power-bar" role="progressbar" aria-label="${escape(m.title)}" aria-valuemin="0" aria-valuemax="${m.goal}" aria-valuenow="${Math.min(m.goal,state.counts[id])}" aria-valuetext="${state.counts[id]} sur ${m.goal}"><i style="transform:scaleX(${Math.min(1,state.counts[id]/m.goal)})"></i></div></div><div class="reward-slot"><span>${icon(m.role==='bonus'?'flag':'tools')}</span><div><h3>${m.role==='bonus'?'EFFET BONUS':'EFFET SUR LE DÉPÔT'}</h3><p>${escape(m.effect)}</p></div></div>${blocked?`<p class="note">Les contributions sont conservées ; il reste à accomplir « ${escape(required.title)} ».</p><button class="action" data-locate="${required.id}">${icon('target')}Rejoindre l’étape requise</button>`:done?`<button class="action" data-close>${icon('check')}Voir le résultat dans le dépôt</button>`:`<a class="action" href="${project.site}" target="_blank" rel="noopener">${icon('arrow')}Participer sur QuiLivreOù</a><p class="note">Dans cette démo, la console DÉMO permet de jouer l’arrivée des contributions.</p>`}<button class="secondary" data-locate="${id}">${icon('target')}Localiser cette Komisyon</button>`;
}
function demoHTML(state){const presets=[['start','L’accident','Q renversé, colis au sol.'],['ahead','Des recos avant l’heure','2 inscrits, 5 recommandations déjà reçues.'],['progress','Deux missions ouvertes','Q debout, recos et boutiques en parallèle.'],['repaired','Le dépôt en activité','Q charge, livre au quai et revient à vide.'],['bonus','Le bonus seul','Le dépôt s’enrichit, Q reste à terre.']];return `<h2 id="sheetTitle">CONSOLE DE DÉMO</h2><p>Joue l’arrivée des contributions et observe le dépôt. Ces commandes modifient uniquement la démonstration dans ce navigateur.</p><div class="motion-settings"><div>${icon('lightning')}<p>Le dépôt vit à chaque visite. ${motionPaused?'Les animations sont en pause.':'Les balises respirent, les missions s’animent et Q reprend ses tournées une fois réparé.'}</p></div><button class="secondary" data-motion-toggle  aria-pressed="${motionPaused}">${motionControlHTML()}</button></div><h3>ENVOYER UNE CONTRIBUTION</h3><div class="credit-grid">${missions.map(m=>`<button class="credit-button" data-credit="${m.id}" ${statusFor(m.id,state)==='completed'?'disabled':''}>${icon(missionIcon(m.id))}<span>${escape(m.short)}<small>${state.counts[m.id]} / ${m.goal}</small></span><strong>+1</strong></button>`).join('')}</div><p class="note">Même verrouillée, une étape reçoit ses contributions. Sa réparation attend les prérequis. Une réussite ferme cette console pour montrer son effet.</p><h3>CHARGER UN SCÉNARIO</h3><div class="preset-list">${presets.map(([id,title,desc])=>`<button class="preset" data-preset="${id}"><span>${icon(id==='ahead'?'lock':id==='repaired'?'door':id==='bonus'?'flag':id==='start'?'rewind':'tools')}</span><span><strong>${title}</strong><small>${desc}</small></span>${icon('arrow')}</button>`).join('')}</div><label class="reveal-option"><input id="revealLocked" type="checkbox" ${revealLocked?'checked':''}>Afficher les noms des étapes verrouillées</label><p class="note">Par défaut, seuls les indices sont visibles. Les scénarios remplacent l’avancement de la démo ; aucune inscription ni recommandation réelle n’est envoyée.</p><button class="secondary" id="resetDemo">${icon('rewind')}Réinitialiser le dépôt</button>`;}
function renderPanel(){
 if(!panel)return;const state=store.getState(),focusCredit=document.activeElement?.dataset?.credit;
 $('sheetBack').hidden=panel.type==='inventory'||panel.type==='demo';
 $('sheetBody').innerHTML=panel.type==='project'?projectHTML(state):panel.type==='mission'?missionHTML(panel.id,state):panel.type==='demo'?demoHTML(state):inventoryHTML(state);
 $('sheetBody').querySelectorAll('[data-locate]').forEach(b=>b.onclick=()=>locate(b.dataset.locate));
 $('sheetBody').querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>openPanel(b.dataset.view));
 $('sheetBody').querySelectorAll('[data-close]').forEach(b=>b.onclick=closePanel);
 $('sheetBody').querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{selected=null;closePanel();world?.resetView();store.preset(b.dataset.preset);});
 $('sheetBody').querySelectorAll('[data-credit]').forEach(b=>b.onclick=()=>{const before=store.getState().completed.length;store.contribute(b.dataset.credit,crypto.randomUUID());if(store.getState().completed.length>before&&panel)closePanel();});
 if($('revealLocked'))$('revealLocked').onchange=e=>{revealLocked=e.target.checked;world?.setState(worldState(store.getState()),{animate:false});updateDock(store.getState());};
 $('sheetBody').querySelectorAll('[data-motion-toggle]').forEach(b=>b.onclick=toggleMotion);
 if($('resetDemo'))$('resetDemo').onclick=()=>{selected=null;closePanel();store.reset();world?.resetView();};
 if(focusCredit)$('sheetBody').querySelector(`[data-credit="${focusCredit}"]`)?.focus({preventScroll:true});
}
store.subscribe(state=>{
 const newly=state.completed.filter(id=>!previous.completed.includes(id)),final=state.repaired&&!previous.repaired;if(final){++locating;selected=null;world?.resetView();}updateDock(state);world?.setState(worldState(state),{animate:newly.length>0});renderPanel();
 if(final){announce('DÉPÔT REMIS EN SERVICE','OUVERTURE DU QUAI.');}
 else if(newly.length>1)announce('LES RÉSERVES ÉTAIENT PRÊTES',`${newly.length} KOMISYON ACCOMPLIES !`);
 else if(newly.length===1)announce(newly[0]==='bonus'?'BONUS ACQUIS':'KOMISYON ACCOMPLIE',newly[0]==='inscrits'?'Q RETROUVE SES ROUES.':newly[0]==='retours'?'LES COLIS SONT RASSEMBLÉS.':newly[0]==='bonus'?'UNE NOUVELLE TOUCHE AU DÉPÔT.':'LE QUAI SE PRÉPARE.');
 else clearAnnouncement();previous=state;
});
$('missionsButton').onclick=()=>selected?openPanel(selected==='project'?'project':'mission',selected):openPanel('inventory');
$('infoButton').onclick=()=>openPanel(selected?'inventory':'project');$('projectButton').onclick=()=>openPanel('project');$('demoButton').onclick=()=>openPanel('demo');$('hardwareAction').onclick=()=>openPanel('inventory');
$('sheetBack').onclick=()=>openPanel('inventory');$('sheetClose').onclick=closePanel;$('sheetWrap').onclick=e=>{if(e.target===$('sheetWrap'))closePanel();};$('dismissAnnouncement').onclick=clearAnnouncement;
$('motionButton').onclick=toggleMotion;
$('zoomIn').onclick=()=>world?.zoomBy(1.2);$('zoomOut').onclick=()=>world?.zoomBy(1/1.2);$('recenter').onclick=()=>{++locating;selected=null;world?.setState(worldState(store.getState()),{animate:false});world?.resetView();updateDock(store.getState());};$('hardwareView').onclick=$('recenter').onclick;
$('sheet').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closePanel();}else if(e.key==='Tab'){const all=[...$('sheet').querySelectorAll('button:not(:disabled):not([hidden]),a[href],input')].filter(el=>el.getClientRects().length),first=all[0],last=all.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus({preventScroll:true});}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus({preventScroll:true});}}});
$('scene').addEventListener('webglcontextlost',()=>{$('fallback').hidden=false;});$('scene').addEventListener('webglcontextrestored',()=>{$('fallback').hidden=true;});
updateDock(previous);
try{world=createWorld({canvas:$('scene'),container:$('world'),labels:$('labels'),onSelect:id=>{++locating;openPanel(id==='project'?'project':'mission',id);}});world.setMotionPaused(motionPaused);world.setState(worldState(previous),{animate:true,arrival:true});$('loading').hidden=true;}catch(error){$('loading').hidden=true;$('fallback').hidden=false;console.error(error);}
updateMotionControl();
window.__demo={getState:()=>store.getState(),getWorld:()=>world?.getDebug(),projectPoint:id=>world?.projectPoint(id),getPanel:()=>panel?{...panel}:null};
window.addEventListener('pagehide',e=>{if(!e.persisted)world?.dispose();});
