// Pre-builds everything the site needs as plain static files (for Netlify / GitHub Pages / any static host).
const fs=require('fs'),path=require('path'),{build}=require('../server/seed');
const pub=path.join(__dirname,'..','client','public'),strip=h=>h.replace(/<style[\s\S]*?<\/style>|<[^>]+>/g,' ').replace(/\s+/g,' ').toLowerCase();
const all=build(),texts={};fs.rmSync(path.join(pub,'notes'),{recursive:true,force:true});fs.mkdirSync(path.join(pub,'data'),{recursive:true});
for(const s of all)for(const u of [...s.units,...s.extras])if(u.html){fs.mkdirSync(path.join(pub,'notes',s.slug),{recursive:true});fs.writeFileSync(path.join(pub,'notes',s.slug,u.key+'.html'),u.html);texts[s.slug+'/'+u.key]=strip(u.html)}
const meta=all.map(s=>({...s,units:s.units.map(({html,...u})=>u),extras:s.extras.map(({html,...e})=>e)}));
fs.writeFileSync(path.join(pub,'data','subjects.json'),JSON.stringify(meta));fs.writeFileSync(path.join(pub,'data','search.json'),JSON.stringify({meta,texts}));
console.log('Static export done:',Object.keys(texts).length,'note files');
