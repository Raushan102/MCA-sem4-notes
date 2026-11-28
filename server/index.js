const express=require('express'),fs=require('fs'),path=require('path'),subjects=require('./config');
const meta=()=>JSON.parse(fs.readFileSync(path.join(__dirname,'data','meta.json'),'utf8'));
const TXT={};for(const s of require('./seed').build())for(const u of [...s.units,...s.extras])if(u.html)TXT[s.slug+'/'+u.key]=u.html.replace(/<style[\s\S]*?<\/style>|<[^>]+>/g,' ').replace(/\s+/g,' ').toLowerCase();
const app=express(),M=meta(),useDb=!!process.env.MONGODB_URI;let Note;
if(useDb){Note=require('./model');require('mongoose').connect(process.env.MONGODB_URI).then(()=>console.log('MongoDB connected'))}
app.use(require('express').json());
app.get('/api/subjects',(q,r)=>r.json(M));
app.get('/api/search',(q,r)=>{const v=String(q.query.q||'').toLowerCase().trim();if(v.length<2)return r.json([]);const out=[];
 for(const s of M)for(const u of s.units){const lab=`Unit ${u.n}: ${u.title}`;
  if(lab.toLowerCase().includes(v))out.push({subject:s.name,unit:lab,title:lab,to:`${s.slug}/${u.key}`,missing:u.missing});
  for(const t of u.topics)if(t.title.toLowerCase().includes(v))out.push({subject:s.name,unit:lab,title:t.title,priority:t.priority,to:`${s.slug}/${u.key}/${t.id}`})}
 const seen=new Set(out.map(o=>o.to.split('/').slice(0,2).join('/')));
 for(const s of M)for(const u of [...s.units,...(s.extras||[])]){const k=s.slug+'/'+u.key;if(!seen.has(k)&&TXT[k]&&TXT[k].includes(v))out.push({subject:s.name,unit:'Mentioned in',title:u.n?`Unit ${u.n}: ${u.title}`:u.title,to:k})}
 r.json(out.slice(0,30))});
app.get('/notes/:slug/:key',async(q,r)=>{const{slug,key}=q.params;let html;
 if(useDb){const d=await Note.findOne({slug,key}).lean();html=d&&d.html}
 else{const s=subjects.find(x=>x.slug===slug),f=s&&[...s.units,...(s.extras||[])].find(x=>x[0]===key);
  const p=f&&f[2]&&path.join(__dirname,'..','content',slug,f[2]);html=p&&fs.existsSync(p)?fs.readFileSync(p,'utf8'):null}
 html?r.type('html').send(html):r.status(404).send('Notes not found')});
const dist=path.join(__dirname,'..','client','dist');app.use(express.static(dist));
app.get('*',(q,r)=>fs.existsSync(dist)?r.sendFile(path.join(dist,'index.html')):r.status(503).send('Run: npm run build'));
app.listen(process.env.PORT||3000,()=>console.log('Notes site on http://localhost:'+(process.env.PORT||3000)+(useDb?' (MongoDB)':' (file mode)')));
