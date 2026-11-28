import {useEffect,useState,useRef} from 'react';
import {ChevronDown,Menu,X} from 'lucide-react';
import BranchedMenu from './BranchedMenu.jsx';
const STATIC=import.meta.env.VITE_STATIC==='1',API_SUBJECTS=STATIC?'/data/subjects.json':'/api/subjects',noteUrl=(s,k)=>STATIC?`/notes/${s}/${k}.html`:`/notes/${s}/${k}`;
let SX;async function search(q){if(!STATIC)return fetch('/api/search?q='+encodeURIComponent(q)).then(r=>r.json());SX=SX||await fetch('/data/search.json').then(r=>r.json());
  const v=q.toLowerCase().trim(),out=[];for(const s of SX.meta)for(const u of s.units){const lab=`Unit ${u.n}: ${u.title}`;if(lab.toLowerCase().includes(v))out.push({subject:s.name,unit:lab,title:lab,to:`${s.slug}/${u.key}`});for(const t of u.topics)if(t.title.toLowerCase().includes(v))out.push({subject:s.name,unit:lab,title:t.title,priority:t.priority,to:`${s.slug}/${u.key}/${t.id}`})}
  const seen=new Set(out.map(o=>o.to.split('/').slice(0,2).join('/')));for(const s of SX.meta)for(const u of [...s.units,...(s.extras||[])]){const k=s.slug+'/'+u.key;if(!seen.has(k)&&SX.texts[k]&&SX.texts[k].includes(v))out.push({subject:s.name,unit:'Mentioned in',title:u.n?`Unit ${u.n}: ${u.title}`:u.title,to:k})}return out.slice(0,30)}
const BRAND='Paperlight',AUTHOR='Raushan Kumar Saw',ROMAN=['I','II','III','IV','V','VI','VII','VIII'];
const useRoute=()=>{const get=()=>location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);const[r,s]=useState(get);
  useEffect(()=>{const f=()=>{s(get());scrollTo(0,0)};addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[]);return r};
const useLocal=(k,d)=>{const[v,s]=useState(()=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}});return[v,x=>{s(x);try{localStorage.setItem(k,JSON.stringify(x))}catch{}}]};
const Go=({to,...p})=><a href={'#/'+to} {...p}/>;const Dot=({p})=><i className={'dot '+p} title={p}/>;
const tally=ts=>ts.reduce((a,t)=>(a[t.priority]=(a[t.priority]||0)+1,a),{red:0,yellow:0,black:0,mixed:0});
const Stack=({topics})=>{const c=tally(topics),n=topics.length||1;return<div className="stack">{['red','mixed','yellow','black'].map(k=>c[k]?<b key={k} className={k} style={{flex:c[k]/n}} title={`${c[k]} ${k}`}/>:null)}</div>};
const allTopics=s=>s.units.flatMap(u=>u.topics),ready=s=>s.units.filter(u=>!u.missing),pad=n=>String(n).padStart(2,'0');
const scrollTo_=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});

const Bg=()=>{const v=useRef();useEffect(()=>{const f=()=>{if(v.current)v.current.playbackRate=.4};f();v.current?.addEventListener("loadedmetadata",f);v.current?.addEventListener("play",f)},[]);return<div className="bg"><video ref={v} src="/hero.mp4" autoPlay loop muted playsInline/></div>};
function Palette({onClose}){const[q,setQ]=useState(''),[res,setRes]=useState([]);
  useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
  useEffect(()=>{if(q.trim().length<2)return setRes([]);const t=setTimeout(()=>search(q).then(setRes),150);return()=>clearTimeout(t)},[q]);
  return<div className="scrim" onClick={onClose}><div className="palette" onClick={e=>e.stopPropagation()}><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search topics, e.g. Bresenham, SLA, hypervisor…"/>
   <div className="plist">{q.trim().length<2?<p className="none">Type at least 2 letters. Searches every topic and the full text of all notes.</p>:res.length?res.map((r,i)=><Go key={i} to={r.to} onClick={onClose}>{r.priority&&<Dot p={r.priority}/>}<span>{r.title}<small>{r.subject} · {r.unit}</small></span></Go>):<p className="none">No match</p>}</div></div></div>}

const Diamond=()=><svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M14 2L26 14L14 26L2 14L14 2Z" fill="white" fillOpacity="0.9"/><path d="M14 8L20 14L14 20L8 14L14 8Z" fill="white" fillOpacity="0.5"/></svg>;
const Nav=({subjects,open})=>{const[m,setM]=useState(null),[mob,setMob]=useState(false),
  res=subjects.flatMap(s=>(s.extras||[]).map(e=>({label:e.title,to:s.slug+'/'+e.key}))),
  sec=id=>{setMob(false);setM(null);if(!location.hash.replace(/^#\/?/,''))scrollTo_(id);else{location.hash='#/';setTimeout(()=>scrollTo_(id),450)}},
  items=[{label:'Home',to:''},{label:'Subjects',sec:'subjects',list:subjects.map(s=>({label:s.emoji+' '+s.name,to:s.slug}))},{label:'How to use',sec:'how'},res.length&&{label:'Question banks',list:res}].filter(Boolean),
  first=subjects[0];
  return<nav className="fp relative z-20 flex items-center justify-between w-full px-5 sm:px-6 md:px-12 lg:px-16 py-4 sm:py-5">
   <div className="flex items-center gap-8 lg:gap-10"><Go to="" className="flex items-center gap-2"><Diamond/><span className="brandname text-white text-lg sm:text-xl font-medium tracking-tight">{BRAND}</span></Go>
    <div className="hidden md:flex items-center gap-6 lg:gap-8">{items.map(n=><div key={n.label} className="relative" onMouseEnter={()=>n.list&&setM(n.label)} onMouseLeave={()=>setM(null)}>
      {n.to!==undefined?<Go to={n.to} className="text-white/90 hover:text-white text-sm font-medium transition-colors">{n.label}</Go>:
      <button onClick={()=>n.sec&&sec(n.sec)} className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium transition-colors">{n.label}{n.list&&<ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${m===n.label?'rotate-180':''}`}/>}</button>}
      {n.list&&m===n.label&&<div className="liquid-glass !absolute top-full left-0 rounded-none py-3 px-2 min-w-[200px] shadow-xl animate-dropdown z-30">{n.list.map(l=><Go key={l.to} to={l.to} onClick={()=>setM(null)} className="block px-3 py-2 text-white/80 hover:text-white text-sm rounded-none hover:bg-white/5 transition-colors">{l.label}</Go>)}</div>}</div>)}</div></div>
   <div className="hidden md:flex items-center gap-5"><button onClick={open} className="text-white/90 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">Search <kbd>Ctrl K</kbd></button>{first&&<Go to={first.slug} className="liquid-glass rounded-none px-5 py-2 text-white text-sm font-medium">Open notes</Go>}</div>
   <button className="md:hidden relative w-8 h-8 text-white" onClick={()=>setMob(o=>!o)} aria-label={mob?'Close menu':'Open menu'}><Menu className={`absolute inset-0 m-auto w-6 h-6 transition-all duration-300 ${mob?'opacity-0 rotate-90 scale-50':'opacity-100 rotate-0 scale-100'}`}/><X className={`absolute inset-0 m-auto w-6 h-6 transition-all duration-300 ${mob?'opacity-100 rotate-0 scale-100':'opacity-0 -rotate-90 scale-50'}`}/></button>
   <div className={`md:hidden absolute top-full left-0 right-0 mx-5 sm:mx-6 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${mob?'opacity-100 translate-y-0 pointer-events-auto':'opacity-0 -translate-y-3 pointer-events-none'}`}><div className="bg-[#2C221C]/95 backdrop-blur-xl rounded-none p-6"><ul className="flex flex-col gap-4">{items.map(n=><li key={n.label}>
     {n.to!==undefined?<Go to={n.to} onClick={()=>setMob(false)} className="block text-white text-base font-medium">{n.label}</Go>:<button onClick={()=>n.sec?sec(n.sec):null} className="block text-white text-base font-medium">{n.label}</button>}
     {n.list&&<ul className="mt-2 ml-4 flex flex-col gap-2">{n.list.map(l=><li key={l.to}><Go to={l.to} onClick={()=>setMob(false)} className="block text-white/70 hover:text-white text-sm">{l.label}</Go></li>)}</ul>}</li>)}</ul>
    <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-4"><button onClick={()=>{setMob(false);open()}} className="text-white/90 text-sm font-medium">Search</button>{first&&<Go to={first.slug} onClick={()=>setMob(false)} className="liquid-glass rounded-none px-5 py-2 text-white text-sm font-medium">Open notes</Go>}</div></div></div></nav>};
const Foot=({subjects})=><footer className="foot"><div className="fcols"><div><b className="fb">{BRAND}</b><p>Exam-priority notes for MCA Semester IV, Ranchi University.</p></div>
  <div><h5>Subjects</h5>{subjects?.map(s=><Go key={s.slug} to={s.slug}>{s.name}</Go>)}</div>
  <div><h5>Resources</h5>{subjects?.flatMap(s=>(s.extras||[]).map(e=><Go key={s.slug+e.key} to={s.slug+'/'+e.key}>{e.title}</Go>))}</div></div>
  <div className="fbar"><span>Designed &amp; developed by <b>{AUTHOR}</b></span><span>© {new Date().getFullYear()} · MCA Semester IV</span></div></footer>;

function Home({subjects,done,open}){const first=subjects[0],topics=subjects.flatMap(allTopics),units=subjects.flatMap(ready).length,
  how=[['Search everything','Find any topic across the full text of all notes.',open,'Try search'],['Spot the red topics','Red marks topics asked directly in past papers. Start there.',null,'Open notes',first.slug],['Track revision','Mark each unit as revised and watch your progress grow.',()=>scrollTo_('subjects'),'See progress']];
  return<><section className="hero"><div className="eyebrow">MCA Semester IV · Ranchi University</div><h1>Revise<br/><em>what matters.</em></h1><p>Exam-priority notes for every subject, colour-coded so you always know where to start.</p>
   <div className="cta"><Go to={first.slug} className="btn">Open notes →</Go><button className="btn glass" onClick={open}>Search topics <kbd>Ctrl K</kbd></button></div>
   <div className="strip">{[[topics.length,'topics'],[units,'units'],[subjects.length,'subjects']].map(([n,l])=><div key={l}><b>{n}</b><span>{l}</span></div>)}</div></section>
  <section className="sec" id="how"><div className="lab"><i>01</i>How to use</div><div className="g3">{how.map(([t,d,fn,l,to],i)=><div key={i} className="how rv"><span className="stepn">0{i+1}</span><h4>{t}</h4><p>{d}</p>{fn?<button onClick={fn}>{l} →</button>:<Go to={to}>{l} →</Go>}</div>)}</div></section>
  <section className="sec" id="subjects"><div className="lab"><i>02</i>Subjects</div><div className="g3">{subjects.map((s,i)=>{const ok=ready(s),d=ok.filter(u=>done.includes(s.slug+'/'+u.key)).length,pct=ok.length?Math.round(100*d/ok.length):0;
    return<Go key={s.slug} to={s.slug} className="card rv"><div className="top"><span className="idx">0{i+1}</span><span className="em">{s.emoji}</span></div><h3>{s.name}</h3><div className="meta">{s.code&&s.code+' · '}{ok.length}/{s.units.length} units · {allTopics(s).length} topics</div><Stack topics={allTopics(s)}/><div className="bar"><b style={{width:pct+'%'}}/></div><div className="meta">{pct}% revised</div><span className="go">Open notes →</span></Go>})}</div></section></>}

function Subject({s,done}){const[f,setF]=useState('all'),all=allTopics(s),c=tally(all);
  return<div className="sub"><div className="head"><div className="crumbs"><Go to="">Home</Go> / {s.name}</div><h1 className="title">{s.name}</h1><p className="meta">{s.code&&s.code+' · '}{ready(s).length} units ready · {all.length} topics</p><Stack topics={all}/>
  <div className="chips">{[['all','All topics'],['red',`Red · ${c.red}`],['yellow',`Yellow · ${c.yellow}`],['black',`Black · ${c.black}`]].map(([k,l])=><button key={k} className={(f===k?'on ':'')+k} onClick={()=>setF(k)}>{l}</button>)}</div></div>
  <div className="rows">{s.units.map(u=>{const ts=u.topics.filter(t=>f==='all'||t.priority===f);if(f!=='all'&&!ts.length)return null;const id=s.slug+'/'+u.key;
   return<div key={u.key} className={'row rv'+(u.missing?' soon':'')}><div className="num">{pad(u.n)}</div><div className="rb"><h3>{u.missing?u.title:<Go to={id}>{u.title}</Go>}{done.includes(id)&&<span className="tick">✓ revised</span>}</h3>
    {u.missing?<div className="meta">Notes not added yet</div>:<><Stack topics={u.topics}/><div className="tchips">{ts.map(t=><Go key={t.id} to={`${id}/${t.id}`} className={'tc '+t.priority}>{t.title}</Go>)}</div></>}</div>{!u.missing&&<Go to={id} className="open">Open →</Go>}</div>})}</div>
  {s.extras?.length>0&&<><h2 className="h2s">Exam resources</h2><div className="g3">{s.extras.map(e=><Go key={e.key} to={s.slug+'/'+e.key} className="card"><span className="em">📝</span><h3>{e.title}</h3><span className="go">Open →</span></Go>)}</div></>}</div>}

const NOTE_CSS=":host{display:block;max-width:100%;overflow-x:clip;scrollbar-width:none}*{scrollbar-width:none}*::-webkit-scrollbar{display:none}:host{background:transparent!important}:host .nb-body,.nb-body.nb-body{background:transparent!important;background-image:none!important;padding:88px 16px 24px!important}.nb-body.nb-body>.ux-side,.nb-body>.ux-menu,.nb-body>.ux-progress{display:none!important}[id]{scroll-margin-top:84px}";   // notes keep their own original fonts and paper look; only the empty surround shows the video
function NoteView({url,topic,api}){const host=useRef(),[err,setErr]=useState(null);
  useEffect(()=>{let dead=false;fetch(url).then(r=>{if(!r.ok)throw 0;return r.text()}).then(h=>{if(dead)return;const d=new DOMParser().parseFromString(h,'text/html');
    d.querySelectorAll('link[rel=stylesheet]').forEach(l=>{if(!document.querySelector(`link[href="${l.href}"]`)){const n=document.createElement('link');n.rel='stylesheet';n.href=l.href;document.head.appendChild(n)}});
    const css=[...d.querySelectorAll('style')].map(s=>s.textContent).join('\n').replace(/:root/g,':host').replace(/(^|[\s,{}])html(?=[\s,{:.\[])/g,'$1:host').replace(/(^|[\s,{}])body(?=[\s,{:.\[])/g,'$1.nb-body');
    const root=host.current.shadowRoot||host.current.attachShadow({mode:'open'});root.innerHTML=`<style>${css}\n${NOTE_CSS}</style><div class="nb-body">${d.body.innerHTML}</div>`;
    const jump=(id,smooth)=>{const el=id&&root.getElementById(decodeURIComponent(id));el&&el.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'})};jump.root=root;api.current=jump;
    root.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(a){e.preventDefault();jump(a.getAttribute('href').slice(1),true)}});setTimeout(()=>jump(topic),80)}).catch(()=>setErr(true));return()=>{dead=true}},[url]);
  return err?<div className="sub">Could not load these notes.</div>:<div ref={host}/>}

function TopicTree({s,k,act,onPick}){const units=ready(s).filter(u=>u.topics?.length),
  items=[...units.map(u=>({label:`Unit ${ROMAN[u.n-1]} · ${u.title}`,children:u.topics.map(t=>({value:u.key+'/'+t.id,label:t.title.replace(/^(Topic\s*)?\d+[.:]?\s*/i,''),icon:<i className={'dot '+t.priority} style={{margin:0,width:8,height:8}}/>}))})),
   ...(s.extras||[]).map(e=>({label:e.title,value:'x/'+e.key}))],
  cur=units.findIndex(u=>u.key===k),first=units[cur]?.topics?.[0];
  return<BranchedMenu key={s.slug+k} items={items} width={310} rowHeight={34} indent={34} fontSize={13} color="#ffffff" accentColor="#FFD21F" lineColor="#8c8c94"
   defaultOpen={cur>=0?cur:-1} defaultActive={cur>=0?k+'/'+(act||first?.id):''} active={act&&cur>=0?k+'/'+act:undefined} onSelect={(v)=>{const[a,b]=v.split('/');onPick(a==='x'?{extra:b}:{unit:a,topic:b})}}/>}

const useWide=()=>{const q='(min-width:1200px)',[w,set]=useState(()=>matchMedia(q).matches);useEffect(()=>{const m=matchMedia(q),f=()=>set(m.matches);m.addEventListener('change',f);return()=>m.removeEventListener('change',f)},[]);return w};

function Reader({s,k,topic,done,setDone}){const api=useRef(),[act,setAct]=useState(null),[p,setP]=useState(0),wide=useWide(),[tree,setTree]=useState(()=>innerWidth>=1200),all=[...ready(s),...s.extras||[]],i=all.findIndex(u=>u.key===k),u=all[i],id=s.slug+'/'+k;
  useEffect(()=>{setAct(null);const f=()=>{setP(Math.round(100*scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));const R=api.current&&api.current.root;if(R&&u&&u.topics){let a=null;for(const t of u.topics){const el=R.getElementById(t.id);if(el&&el.getBoundingClientRect().top<170)a=t.id}setAct(a)}};addEventListener('scroll',f);return()=>removeEventListener('scroll',f)},[k]);
  useEffect(()=>{setTree(wide)},[wide]);
  useEffect(()=>{if(!tree||wide)return;const k=e=>e.key==='Escape'&&setTree(false);addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[tree,wide]);
  if(!u)return<div className="sub"><h2>Not found</h2><Go to={s.slug}>Back</Go></div>;const prev=all[i-1],next=all[i+1];
  const pick=({unit,topic:t,extra})=>{if(!wide)setTree(false);if(extra)location.hash='#/'+s.slug+'/'+extra;else if(unit===k&&api.current)api.current(t,true);else location.hash='#/'+s.slug+'/'+unit+'/'+t};
  const aside=tree&&<aside className={'tree'+(wide?' docked':'')} aria-label="Topics"><div className="treeh"><b>{s.name}</b><button onClick={()=>setTree(false)} aria-label="Close topic tree">×</button></div><div className="tscroll"><TopicTree s={s} k={k} act={act} onPick={pick}/></div></aside>;
  return<>{tree&&!wide&&<div className="tscrim" onClick={()=>setTree(false)}/>}
   <div className={'rtool'+(tree&&wide?' dk':'')}><Go to="" className="logo"><Diamond/></Go><Go to="" className="homebtn">⌂ Home</Go><Go to={s.slug} className="csub">{s.name}</Go><b className="ctitle">{u.n?`Unit ${ROMAN[u.n-1]} · `:''}{u.title}</b><span className="sp"/>
   <button className={'tbtn'+(tree?' on':'')} onClick={()=>setTree(t=>!t)} aria-expanded={tree}>☰ Topics</button>
   {u.n&&<button className={done.includes(id)?'on':''} onClick={()=>setDone(done.includes(id)?done.filter(x=>x!==id):[...done,id])}>{done.includes(id)?'✓ Revised':'Mark revised'}</button>}
   {prev&&<Go to={s.slug+'/'+prev.key} className="arrow">←</Go>}{next&&<Go to={s.slug+'/'+next.key} className="arrow">→</Go>}<i className="prog" style={{width:p+'%'}}/></div>
   <div className={'rwrap'+(tree&&wide?' dk':'')}>{aside}<div className="rbody"><NoteView key={k} url={noteUrl(s.slug,k)} topic={topic} api={api}/><div className="rfoot">Designed &amp; developed by <b>{AUTHOR}</b></div></div></div>
   {!tree&&<button className="tfab" onClick={()=>setTree(true)}>☰ Topics</button>}</>}

export default function App(){const r=useRoute(),[subjects,setSubjects]=useState(null),[done,setDone]=useLocal('done',[]),[pal,setPal]=useState(false);
  useEffect(()=>{fetch(API_SUBJECTS).then(x=>x.json()).then(setSubjects)},[]);
  useEffect(()=>{const k=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPal(true)}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
  useEffect(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08}),t=setTimeout(()=>document.querySelectorAll('.rv:not(.in)').forEach(n=>io.observe(n)),60);return()=>{clearTimeout(t);io.disconnect()}},[subjects,r.join('/')]);
  const s=subjects?.find(x=>x.slug===r[0]),reading=s&&r[1];
  return<><Bg/>{pal&&<Palette onClose={()=>setPal(false)}/>}{!subjects?<div className="paper"><div className="sub">Loading…</div></div>:reading?<Reader s={s} k={r[1]} topic={r[2]} done={done} setDone={setDone}/>:
   <div className={"paper"+(s?"":" home")}><Nav subjects={subjects} open={()=>setPal(true)}/>{s?<Subject key={s.slug} s={s} done={done}/>:<Home subjects={subjects} done={done} open={()=>setPal(true)}/>}<Foot subjects={subjects}/></div>}</>}
