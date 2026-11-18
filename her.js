/* Fitted to Hiwiye: she prays, works 10am–10pm, Sundays off (sometimes Saturdays too).
   A short welcome quiz sets her colour, music taste and how she likes to unwind after a shift. */

/* prayer is part of her day */
if(!lsGet('gentle-routines')){
 selectedRoutines = ['prayAM','prayPM','breakfast','selfcare','sleptOnTime'];
 lsSet('gentle-routines', JSON.stringify(selectedRoutines));
}

/* ---------- her answers ---------- */
const QUIZ = [
 {key:'colour', q:'Pick your colour 🎨', opts:['💗 Pink','💜 Purple','🍑 Peach','🌿 Green']},
 {key:'music', q:'What music do you love? 🎵', opts:['🎤 English songs','🇪🇹 Ethiopian songs','💫 Both']},
 {key:'unwind', q:'After a long shift, what helps you most? 🌙', opts:['🍵 A warm cup of Karak chai','🎧 Music','📞 Talking to someone','😴 Just sleep']}
];
const COLOUR_THEME = ['rose','lavender','peach','sage'];
const answers = () => { try{ return JSON.parse(lsGet('quiz')||'{}'); }catch(e){ return {}; } };

/* a pinker theme, so "Pink" has its own */
THEMES.push({id:'rose', name:'Rose', need:15, sw:'#c25d84'});
const themeOpenBase = themeOpen;
themeOpen = t => themeOpenBase(t) || COLOUR_THEME[answers().colour]===t.id;

function showQuiz(done){
 let i = 0; const picked = answers();
 const step = () => {
  welcome.replaceChildren();
  const box = mk('div','wbox quiz'), q = QUIZ[i];
  box.append(mk('small','qstep',`${i+1} of ${QUIZ.length} · so this space feels like yours`), mk('h2',null,q.q));
  const opts = mk('div','qopts');
  q.opts.forEach((o,j)=>{ const b = mk('button', picked[q.key]===j?'on':'', o); b.type = 'button';
   b.onclick = () => { picked[q.key] = j; lsSet('quiz', JSON.stringify(picked)); i++; i<QUIZ.length ? step() : finish(); };
   opts.append(b); });
  const skip = mk('button','link','Skip'); skip.type = 'button'; skip.onclick = () => { i++; i<QUIZ.length ? step() : finish(); };
  box.append(opts, skip); welcome.append(box);
 };
 const finish = () => {
  lsSet('quiz-done','1');
  const a = answers();
  if(a.colour!=null){ const th = COLOUR_THEME[a.colour]; lsSet('palette', th); const seen = (lsGet('themes-seen')||'plum').split(','); if(!seen.includes(th)) lsSet('themes-seen', [...seen, th].join(',')); applyPalette(); renderThemes(); }
  done(); petals(); renderLittle(); applyTimeOfDay();
 };
 step();
}
/* run the quiz right after "Let's begin" the first time */
const renderWelcomeBase = renderWelcome;
renderWelcome = function(){
 renderWelcomeBase();
 const go = welcome.querySelector('.btn'); if(!go) return;
 const close = go.onclick;
 go.onclick = () => { if(lsGet('quiz-done')) return close(); showQuiz(close); };
};
if(!welcome.hidden) renderWelcome();

/* ---------- her week ---------- */
const isSat = k => fromKey(k).getDay()===6, isSun = k => fromKey(k).getDay()===0;
const isOff = k => isSun(k) || (isSat(k) && !!(S.days[k]||{}).off);

/* bigger dares on days off; songs by taste */
const BIG_DARES = [
 'Visit a place you have never been, even just a new café.',
 'Cook something you have never cooked before.',
 'Spend one hour with no phone and notice how it feels.',
 'Take yourself on a little date: a walk and a treat.',
 'Call someone you have not talked to in a while.',
 'Rearrange one corner of your room so it feels new.',
 'Pick one thing from your "want to try" list and do it today.'
];
const SONGS = {
 en:[['Here Comes the Sun · The Beatles'],['Lovely Day · Bill Withers'],['Unwritten · Natasha Bedingfield'],['Rise Up · Andra Day'],['Count on Me · Bruno Mars'],['Golden Hour · JVKE'],['Three Little Birds · Bob Marley']],
 et:[ // her favourite artists; the link searches the artist so she picks the song
  ['Put on your favourite Veronica Adane song 🎶','Veronica Adane'],
  ['A Teddy Afro song you have not heard in a while 🎶','Teddy Afro'],
  ['Start the day with Abinet Agonafer 🎶','Abinet Agonafer'],
  ['Tamrat Desta for your mood today 🎶','Tamrat Desta'],
  ['Sing along to Veronica Adane today 🎶','Veronica Adane'],
  ['Your Teddy Afro favourite, on repeat 🎶','Teddy Afro'],
  ['Something soft from Abinet Agonafer 🎶','Abinet Agonafer'],
  ['Your favourite Tamrat Desta song, full volume 🎶','Tamrat Desta']
 ]
};
const surpriseBase = pickSurprise;
pickSurprise = function(k){
 const sp = surpriseBase(k), n = dayIdx(k);
 if(sp[1]==='Tiny dare' && isOff(k)) return ['🌸','Day-off dare', BIG_DARES[n % BIG_DARES.length]];
 if(sp[1]==='Song for today'){
  const m = answers().music, list = m===0 ? SONGS.en : m===1 ? SONGS.et : (n%2 ? SONGS.et : SONGS.en);
  const song = list[Math.floor(n/4) % list.length]; return ['🎵','Song for today', song[0], song[1]];
 }
 return sp;
};

/* ---------- greetings that follow her day ---------- */
const UNWIND = ['Maybe a warm cup of Karak chai first? 🍵','Maybe put on a song you love 🎧','Maybe call someone you love 📞','Then straight to sleep. You deserve the rest 😴'];
function herMode(){
 const real = new Date(), h = real.getHours();
 if(isOff(TODAY)) return 'off';
 if(h>=22 || h<DAY_START_HOUR) return 'night';
 if(h>=10) return 'work';
 return 'morning';
}
const HER_TOD = {
 morning:{eyebrow:'Good morning ☀️', title:'Before your day starts.', intro:'One tap now, and the rest can wait until tonight.', tint:'morning'},
 work:{eyebrow:'Busy day? 💼', title:'One tap is enough.', intro:'Check in quickly now, or come back after your shift.', tint:''},
 night:{eyebrow:"Shift's done 🌙", title:'Rest your mind.', intro:'Put the day down here, then let it go until tomorrow.', tint:'night'},
 off:{eyebrow:"It's your day off 🌸", title:'Today is yours.', intro:'Rest, wander, try something new. Nothing is required.', tint:'off'}
};
const offChip = mk('button','offchip'); offChip.type = 'button';
const nudge = mk('p','nudge');
applyTimeOfDay = function(){
 const m = herMode(), c = HER_TOD[m]; document.body.dataset.tod = c.tint;
 const a = document.querySelector('.arrival'); if(!a) return;
 const eb = a.querySelector('.eyebrow'), h2 = a.querySelector('h2'), intro = a.querySelector('h2 + p');
 if(eb) eb.textContent = c.eyebrow; if(h2) h2.textContent = c.title;
 if(intro) intro.textContent = c.intro + (m==='night' && answers().unwind!=null ? ' ' + UNWIND[answers().unwind] : '');
 const mark = a.querySelector('.arrival-mark'); if(mark) mark.textContent = m==='morning' ? '☀︎' : m==='night' ? '☾' : m==='off' ? '✿' : '✳';
 // Saturday: one tap to mark it as a day off
 const showChip = VIEW===TODAY && isSat(TODAY);
 offChip.hidden = !showChip;
 if(showChip){ const on = !!(S.days[TODAY]||{}).off; offChip.textContent = on ? '🌸 Day off today ✓' : '🌸 Day off today?'; offChip.classList.toggle('on', on); }
 if(!offChip.isConnected) a.append(offChip);
 // day off: a nudge toward something she wants to try
 nudge.hidden = m!=='off';
 if(m==='off'){
  const open = (S.tries||[]).filter(t=>!t.done);
  nudge.textContent = open.length ? `✨ From your want-to-try list: ${open[dayIdx(TODAY)%open.length].title}` : '✨ Something new to try today? Add ideas in Tasks.';
  if(!nudge.isConnected) a.append(nudge);
 }
};
offChip.onclick = async () => { const d = day(TODAY); d.off = !d.off; await saveDay(d, true); applyTimeOfDay(); renderLittle(); };

/* ---------- her answers in "All about me" + change them in settings ---------- */
const aboutBase = aboutCard;
aboutCard = function(){
 const card = aboutBase(), a = answers();
 const mine = QUIZ.map(q=>a[q.key]!=null ? q.opts[a[q.key]] : null).filter(Boolean)
  .map(t=>t==='🍵 A warm cup of Karak chai' ? '🍵 Karak chai after work' : t);
 if(!mine.length) return card;
 let chips = card.querySelector('.aboutchips');
 if(!chips){ card.querySelector('.hint')?.remove(); chips = mk('div','aboutchips'); card.append(chips); }
 mine.reverse().forEach(t=>chips.prepend(mk('span','mine',t)));
 return card;
};
(function(){
 const s = document.getElementById('settings'); if(!s) return;
 const b = mk('button','link','✏️ Change my colour, music and unwind answers'); b.type = 'button';
 b.onclick = () => { document.getElementById('settingsPanel').hidden = true; welcome.hidden = false; document.body.style.overflow = 'hidden'; showQuiz(()=>{ welcome.hidden = true; document.body.style.overflow = ''; }); };
 const holder = s.querySelector('.xsettings'); holder ? holder.append(b) : s.append(b);
})();
