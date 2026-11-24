// Reads /content, writes server/data/meta.json and (if MONGODB_URI is set) upserts every note into MongoDB.
const fs=require('fs'),path=require('path'),subjects=require('./config');
const txt=s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const P={tr:'red',ty:'yellow',tb:'black',tm:'mixed'};
function topics(h){const out=[];let m;
 const a=/<section id="([^"]+)" class="topic-section tp (\w+)">[\s\S]*?<\/span>([^<]*)<\/span><span class="tprio">/g;   // finished-design notes
 while((m=a.exec(h)))out.push({id:m[1],title:txt(m[3]),priority:P[m[2]]});
 if(out.length)return out;
 const b=/<section class="tp (t\w)"[^>]*>\s*(?:<hr\/?>)?\s*<h1([^>]*)>([\s\S]*?)<\/h1>/g;                                  // older notebook notes
 while((m=b.exec(h)))out.push({id:(/id="([^"]+)"/.exec(m[2])||[])[1],title:txt(m[3]),priority:P[m[1]]||'black'});
 const c=/<a class="index-card (\w+)-card" href="#([^"]+)">([\s\S]*?)<\/a>/g;                                                       // notes whose topic list is their own index cards
 while((m=c.exec(h))){const t=/<strong>([\s\S]*?)<\/strong>/.exec(m[3]);if(t&&h.includes('id="'+m[2]+'"'))out.push({id:m[2],title:txt(t[1]).replace(/^(Topic\s*)?\d+\s*[.:—-]\s*/i,''),priority:P[{red:'tr',yellow:'ty',black:'tb',mixed:'tm'}[m[1]]]||'black'})}
 return out}
const read=(s,f)=>fs.readFileSync(path.join(__dirname,'..','content',s,f),'utf8');
function build(){return subjects.map(s=>({slug:s.slug,name:s.name,code:s.code,emoji:s.emoji,
 units:s.units.map(([key,title,file],i)=>{const h=file&&fs.existsSync(path.join(__dirname,'..','content',s.slug,file))?read(s.slug,file):null;
  return {key,n:i+1,title,file,missing:!h,topics:h?topics(h):[],html:h}}),
 extras:(s.extras||[]).map(([key,title,file])=>({key,title,file,html:read(s.slug,file)}))}))}
module.exports={build};
if(require.main===module)(async()=>{
 const all=build(),meta=all.map(s=>({...s,units:s.units.map(({html,...u})=>u),extras:s.extras.map(({html,...e})=>e)}));
 fs.writeFileSync(path.join(__dirname,'data','meta.json'),JSON.stringify(meta,null,1));
 console.log('meta.json written:',meta.map(s=>`${s.name} ${s.units.filter(u=>!u.missing).length} units`).join(', '));
 if(process.env.MONGODB_URI){const mongoose=require('mongoose'),Note=require('./model');await mongoose.connect(process.env.MONGODB_URI);
  for(const s of all)for(const u of [...s.units.filter(u=>!u.missing),...s.extras])
   await Note.updateOne({slug:s.slug,key:u.key},{$set:{html:u.html}},{upsert:true});
  console.log('MongoDB: notes upserted');await mongoose.disconnect()}})();
