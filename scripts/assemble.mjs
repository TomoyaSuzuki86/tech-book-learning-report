import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const target = new URL('../public/car.glb',import.meta.url);
if (existsSync(target)) {
  const current=readFileSync(target);
  if(current.length===3792896&&current.subarray(0,4).toString()==='glTF'){
    console.info('Car GLB already present, preserving original build asset');
    process.exit(0);
  }
}
let b64='';
for(let i=0;i<7;i++){
  b64+=readFileSync(new URL(`../assets/part-${String(i).padStart(2,'0')}.b64`,import.meta.url),'utf8').trim();
}
const data=Buffer.from(b64,'base64');
if(data.length!==3792896 || data.subarray(0,4).toString()!=='glTF')throw new Error('Car GLB reassembly failed');
mkdirSync(new URL('../public/',import.meta.url),{recursive:true});
writeFileSync(target,data);
console.info('Car model assembled:',data.length,'bytes, sha256:',createHash('sha256').update(data).digest('hex'));