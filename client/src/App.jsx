import {useEffect,useState,useRef} from 'react';
const STATIC=import.meta.env.VITE_STATIC==='1',API_SUBJECTS=STATIC?'/data/subjects.json':'/api/subjects',noteUrl=(s,k)=>STATIC?`/notes/${s}/${k}.html`:`/notes/${s}/${k}`;
let SX;async function search(q){if(!STATIC)return fetch('/api/search?q='+encodeURIComponent(q)).then(r=>r.json());SX=SX||await fetch('/data/search.json').then(r=>r.json());
  const v=q.toLowerCase().trim(),out=[];for(const s of SX.meta)for(const u of s.units){const lab=`Unit ${u.n}: ${u.title}`;if(lab.toLowerCase().includes(v))out.push({subject:s.name,unit:lab,title:lab,to:`${s.slug}/${u.key}`});for(const t of u.topics)if(t.title.toLowerCase().includes(v))out.push({subject:s.name,unit:lab,title:t.title,priority:t.priority,to:`${s.slug}/${u.key}/${t.id}`})}
  const seen=new Set(out.map(o=>o.to.split('/').slice(0,2).join('/')));for(const s of SX.meta)for(const u of [...s.units,...(s.extras||[])]){const k=s.slug+'/'+u.key;if(!seen.has(k)&&SX.texts[k]&&SX.texts[k].includes(v))out.push({subject:s.name,unit:'Mentioned in',title:u.n?`Unit ${u.n}: ${u.title}`:u.title,to:k})}return out.slice(0,30)}
const BRAND='Paperlight',AUTHOR='Raushaan Kumar Saw',PHOTO='/bg.jpg',ROMAN=['I','II','III','IV','V','VI','VII','VIII'];
const useRoute=()=>{const get=()=>location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);const[r,s]=useState(get);
  useEffect(()=>{const f=()=>{s(get());scrollTo(0,0)};addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[]);return r};
const useLocal=(k,d)=>{const[v,s]=useState(()=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}});return[v,x=>{s(x);try{localStorage.setItem(k,JSON.stringify(x))}catch{}}]};
const Go=({to,...p})=><a href={'#/'+to} {...p}/>;const Dot=({p})=><i className={'dot '+p} title={p}/>;
const tally=ts=>ts.reduce((a,t)=>(a[t.priority]=(a[t.priority]||0)+1,a),{red:0,yellow:0,black:0,mixed:0});
const Stack=({topics})=>{const c=tally(topics),n=topics.length||1;return<div className="stack">{['red','mixed','yellow','black'].map(k=>c[k]?<b key={k} className={k} style={{flex:c[k]/n}} title={`${c[k]} ${k}`}/>:null)}</div>};
const allTopics=s=>s.units.flatMap(u=>u.topics),ready=s=>s.units.filter(u=>!u.missing),pad=n=>String(n).padStart(2,'0');
const scrollTo_=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});

function Palette({onClose}){const[q,setQ]=useState(''),[res,setRes]=useState([]);
  useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
  useEffect(()=>{if(q.trim().length<2)return setRes([]);const t=setTimeout(()=>search(q).then(setRes),150);return()=>clearTimeout(t)},[q]);
  return<div className="scrim" onClick={onClose}><div className="palette" onClick={e=>e.stopPropagation()}><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search topics, e.g. Bresenham, SLA, hypervisor…"/>
   <div className="plist">{q.trim().length<2?<p className="none">Type at least 2 letters. Searches every topic and the full text of all notes.</p>:res.length?res.map((r,i)=><Go key={i} to={r.to} onClick={onClose}>{r.priority&&<Dot p={r.priority}/>}<span>{r.title}<small>{r.subject} · {r.unit}</small></span></Go>):<p className="none">No match</p>}</div></div></div>}

const Nav=({subjects,open})=><header className="nav"><Go to="" className="brand"><span className="logo">P</span>{BRAND}</Go>
  <nav><Go to="" className="homelink">⌂ Home</Go><button onClick={()=>scrollTo_('subjects')}>Subjects</button><button onClick={()=>scrollTo_('hot')}>High-yield</button><button onClick={()=>scrollTo_('how')}>How it works</button></nav><span className="sp"/>
  <button className="btn ghost" onClick={open}>Search <kbd>Ctrl K</kbd></button>{subjects&&<Go to={subjects[0].slug} className="btn red">Open notes</Go>}</header>;
const Foot=({subjects})=><footer className="foot"><div className="fcols"><div><b className="fb">{BRAND}</b><p>Exam-priority notes for MCA Semester IV, Ranchi University.</p></div>
  <div><h5>Subjects</h5>{subjects?.map(s=><Go key={s.slug} to={s.slug}>{s.name}</Go>)}</div>
  <div><h5>Resources</h5>{subjects?.flatMap(s=>(s.extras||[]).map(e=><Go key={s.slug+e.key} to={s.slug+'/'+e.key}>{e.title}</Go>))}</div></div>
  <div className="fbar"><span>Designed &amp; developed by <b>{AUTHOR}</b></span><span>© {new Date().getFullYear()} · MCA Semester IV</span></div></footer>;

function Home({subjects,done,open}){const[tab,setTab]=useState(0),topics=subjects.flatMap(allTopics),red=topics.filter(t=>t.priority==='red').length,units=subjects.flatMap(ready).length,
  hot=subjects.flatMap(s=>s.units.flatMap(u=>u.topics.filter(t=>t.priority==='red').map(t=>({s,u,t})))),S=subjects[tab],res=subjects.flatMap(s=>(s.extras||[]).map(e=>({s,e})));
  const how=[['Search everything','Find any topic or phrase across the full text of every note.',open,'Try search'],['Spot the red topics','Red marks questions asked directly in the papers. Start there.',()=>scrollTo_('hot'),'See high-yield'],
   ['Filter by priority','Show only red, yellow or black topics inside any subject.',null,'Open a subject',subjects[0].slug],['Jump between topics','A side rail tracks where you are and jumps to any topic.',null,'Open notes',subjects[0].slug+'/'+ready(subjects[0])[0].key],
   ['Track revision','Mark a unit as revised and watch your progress grow.',()=>scrollTo_('subjects'),'See progress'],['Practise with papers','Question banks and important questions, ready to open.',null,res[0]?'Open question bank':'Open notes',res[0]?res[0].s.slug+'/'+res[0].e.key:subjects[0].slug]];
  return<><section className="hero"><div className="hl"><h1>Revision</h1><p>Free up your semester from scattered notes. Find, filter and revise every topic, with the exam-priority ones marked in red.</p>
   <button className="field" onClick={open}><span>Search any topic, e.g. Bresenham…</span><b className="btn red">Search</b></button><small>Searches every topic and the full text of all notes.</small></div>
   <div className="collage"><div className="t t1"><b>{topics.length}</b><span>topics</span></div><div className="t t2"><b>{red}</b><span>red-priority</span></div>
    <Go to={subjects[0].slug} className="t t3"><span className="em">{subjects[0].emoji}</span><strong>{subjects[0].name}</strong><Stack topics={allTopics(subjects[0])}/></Go>
    <div className="t t4"><span className="dots3"><Dot p="red"/><Dot p="yellow"/><Dot p="black"/></span><strong>Priority colours</strong></div>
    <div className="t t5" style={{backgroundImage:`url(${PHOTO})`}}/>{subjects[1]&&<Go to={subjects[1].slug} className="t t6"><span className="em">{subjects[1].emoji}</span><strong>{subjects[1].name}</strong><Stack topics={allTopics(subjects[1])}/></Go>}</div></section>
  <section className="stats"><div className="big"><b>{topics.length}+</b></div><p>topics across {units} units in {subjects.length} subjects, all colour-coded by exam priority.</p></section>
  <div className="logos">{subjects.map(s=><Go key={s.slug} to={s.slug}><span>{s.emoji}</span>{s.name}</Go>)}{res.map(({s,e})=><Go key={s.slug+e.key} to={s.slug+'/'+e.key}><span>📝</span>{e.title}</Go>)}</div>
  <div className="ticker"><div>{[...hot,...hot].map(({s,u,t},i)=><Go key={i} to={`${s.slug}/${u.key}/${t.id}`}><Dot p="red"/>{t.title}</Go>)}</div></div>
  <section className="dk"><div className="dkl"><h2>Designed for every subject.</h2><ul>{subjects.map((s,i)=><li key={s.slug} className={i===tab?'on':''} onMouseEnter={()=>setTab(i)} onClick={()=>setTab(i)}>{s.name}</li>)}</ul></div>
   <div className="dkr" style={{backgroundImage:`url(${PHOTO})`}}><div className="dcard"><h4>{S.emoji} {S.name}</h4>{ready(S).map(u=><Go key={u.key} to={S.slug+'/'+u.key}><span>{pad(u.n)}</span>{u.title}<Stack topics={u.topics}/></Go>)}<Go to={S.slug} className="btn red">Open {S.name}</Go></div></div></section>
  <section className="sec" id="how"><h2>Get going in no time.</h2><div className="g3">{how.map(([t,d,fn,l,to],i)=><div key={i} className="how rv"><h4>{t}</h4><p>{d}</p>{fn?<button onClick={fn}>{l} →</button>:<Go to={to}>{l} →</Go>}</div>)}</div></section>
  <section className="sec" id="hot"><h2>High-yield topics.</h2><div className="g3">{hot.slice(0,9).map(({s,u,t},i)=><Go key={i} to={`${s.slug}/${u.key}/${t.id}`} className="hotc rv"><Dot p="red"/><span>{t.title}<small>{s.name} · Unit {ROMAN[u.n-1]}</small></span></Go>)}</div></section>
  <section className="sec" id="subjects"><h2>Growing marks, one unit at a time.</h2><div className="g3">{subjects.map(s=>{const ok=ready(s),d=ok.filter(u=>done.includes(s.slug+'/'+u.key)).length,pct=ok.length?Math.round(100*d/ok.length):0;
    return<Go key={s.slug} to={s.slug} className="card rv"><span className="em">{s.emoji}</span><h3>{s.name}</h3><div className="meta">{s.code&&s.code+' · '}{ok.length}/{s.units.length} units · {allTopics(s).length} topics</div><Stack topics={allTopics(s)}/><div className="bar"><b style={{width:pct+'%'}}/></div><div className="meta">{pct}% revised</div><span className="go">Open notes →</span></Go>})}</div></section></>}

function Subject({s,done}){const[f,setF]=useState('all'),all=allTopics(s),c=tally(all);
  return<div className="sub"><div className="crumbs"><Go to="">Home</Go> / {s.name}</div><h1 className="title">{s.name}</h1><p className="meta">{s.code&&s.code+' · '}{ready(s).length} units ready · {all.length} topics</p><Stack topics={all}/>
  <div className="chips">{[['all','All topics'],['red',`Red · ${c.red}`],['yellow',`Yellow · ${c.yellow}`],['black',`Black · ${c.black}`]].map(([k,l])=><button key={k} className={(f===k?'on ':'')+k} onClick={()=>setF(k)}>{l}</button>)}</div>
  <div className="rows">{s.units.map(u=>{const ts=u.topics.filter(t=>f==='all'||t.priority===f);if(f!=='all'&&!ts.length)return null;const id=s.slug+'/'+u.key;
   return<div key={u.key} className={'row rv'+(u.missing?' soon':'')}><div className="num">{pad(u.n)}</div><div className="rb"><h3>{u.missing?u.title:<Go to={id}>{u.title}</Go>}{done.includes(id)&&<span className="tick">✓ revised</span>}</h3>
    {u.missing?<div className="meta">Notes not added yet</div>:<><Stack topics={u.topics}/><div className="tchips">{ts.map(t=><Go key={t.id} to={`${id}/${t.id}`} className={'tc '+t.priority}>{t.title}</Go>)}</div></>}</div>{!u.missing&&<Go to={id} className="open">Open →</Go>}</div>})}</div>
  {s.extras?.length>0&&<><h2 className="h2s">Exam resources</h2><div className="g3">{s.extras.map(e=><Go key={e.key} to={s.slug+'/'+e.key} className="card"><span className="em">📝</span><h3>{e.title}</h3><span className="go">Open →</span></Go>)}</div></>}</div>}

const NOTE_CSS=':host{display:block}.nb-body{padding-top:88px!important}[id]{scroll-margin-top:84px}';   // notes keep their own paper look
function NoteView({url,topic,api}){const host=useRef(),[err,setErr]=useState(null);
  useEffect(()=>{let dead=false;fetch(url).then(r=>{if(!r.ok)throw 0;return r.text()}).then(h=>{if(dead)return;const d=new DOMParser().parseFromString(h,'text/html');
    d.querySelectorAll('link[rel=stylesheet]').forEach(l=>{if(!document.querySelector(`link[href="${l.href}"]`)){const n=document.createElement('link');n.rel='stylesheet';n.href=l.href;document.head.appendChild(n)}});
    const css=[...d.querySelectorAll('style')].map(s=>s.textContent).join('\n').replace(/:root/g,':host').replace(/(^|[\s,{}])html(?=[\s,{:.\[])/g,'$1:host').replace(/(^|[\s,{}])body(?=[\s,{:.\[])/g,'$1.nb-body');
    const root=host.current.shadowRoot||host.current.attachShadow({mode:'open'});root.innerHTML=`<style>${css}\n${NOTE_CSS}</style><div class="nb-body">${d.body.innerHTML}</div>`;
    const jump=(id,smooth)=>{const el=id&&root.getElementById(decodeURIComponent(id));el&&el.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'})};jump.root=root;api.current=jump;
    root.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(a){e.preventDefault();jump(a.getAttribute('href').slice(1),true)}});setTimeout(()=>jump(topic),80)}).catch(()=>setErr(true));return()=>{dead=true}},[url]);
  return err?<div className="sub">Could not load these notes.</div>:<div ref={host}/>}

function Reader({s,k,topic,done,setDone}){const api=useRef(),[act,setAct]=useState(null),[p,setP]=useState(0),all=[...ready(s),...s.extras||[]],i=all.findIndex(u=>u.key===k),u=all[i],id=s.slug+'/'+k;
  useEffect(()=>{const f=()=>{setP(Math.round(100*scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));const R=api.current&&api.current.root;if(R&&u&&u.topics){let a=null;for(const t of u.topics){const el=R.getElementById(t.id);if(el&&el.getBoundingClientRect().top<170)a=t.id}setAct(a)}};addEventListener('scroll',f);return()=>removeEventListener('scroll',f)},[]);
  if(!u)return<div className="sub"><h2>Not found</h2><Go to={s.slug}>Back</Go></div>;const prev=all[i-1],next=all[i+1];
  return<>{u.topics?.length>0&&<nav className="rail">{u.topics.map((t,n)=><button key={t.id} className={act===t.id?'on':''} onClick={()=>api.current&&api.current(t.id,true)}><i className={t.priority}/><span>{n+1}. {t.title.replace(/^(Topic\s*)?\d+[.:]?\s*/i,'')}</span></button>)}</nav>}
   <div className="rtool"><Go to="" className="logo">P</Go><Go to="" className="homebtn">⌂ Home</Go><Go to={s.slug}>{s.name}</Go><b>{u.n?`Unit ${ROMAN[u.n-1]} · `:''}{u.title}</b><span className="sp"/>
   {u.topics?.length>0&&<select onChange={e=>api.current&&api.current(e.target.value,true)} defaultValue=""><option value="" disabled>Jump to topic…</option>{u.topics.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select>}
   {u.n&&<button className={done.includes(id)?'on':''} onClick={()=>setDone(done.includes(id)?done.filter(x=>x!==id):[...done,id])}>{done.includes(id)?'✓ Revised':'Mark revised'}</button>}
   {prev&&<Go to={s.slug+'/'+prev.key} className="arrow">←</Go>}{next&&<Go to={s.slug+'/'+next.key} className="arrow">→</Go>}<i className="prog" style={{width:p+'%'}}/></div>
   <NoteView key={k} url={noteUrl(s.slug,k)} topic={topic} api={api}/><div className="rfoot">Designed &amp; developed by <b>{AUTHOR}</b></div></>}

export default function App(){const r=useRoute(),[subjects,setSubjects]=useState(null),[done,setDone]=useLocal('done',[]),[pal,setPal]=useState(false);
  useEffect(()=>{fetch(API_SUBJECTS).then(x=>x.json()).then(setSubjects)},[]);
  useEffect(()=>{const k=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPal(true)}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
  useEffect(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08}),t=setTimeout(()=>document.querySelectorAll('.rv:not(.in)').forEach(n=>io.observe(n)),60);return()=>{clearTimeout(t);io.disconnect()}},[subjects,r.join('/')]);
  const s=subjects?.find(x=>x.slug===r[0]),reading=s&&r[1];
  return<>{pal&&<Palette onClose={()=>setPal(false)}/>}{!subjects?<div className="paper"><div className="sub">Loading…</div></div>:reading?<Reader s={s} k={r[1]} topic={r[2]} done={done} setDone={setDone}/>:
   <div className="paper"><Nav subjects={subjects} open={()=>setPal(true)}/>{s?<Subject key={s.slug} s={s} done={done}/>:<Home subjects={subjects} done={done} open={()=>setPal(true)}/>}<Foot subjects={subjects}/></div>}</>}
