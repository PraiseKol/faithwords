import {BANK} from '../js/bank.js';
import {generatePuzzle,W,H} from '../js/generator.js';
console.log('bank',BANK.length);
let t=Date.now(),tot=0,min=99,max=0;
for(let i=1;i<=30;i++){const p=generatePuzzle(BANK,{seed:'main-'+i});tot+=p.letterCount;min=Math.min(min,p.letterCount);max=Math.max(max,p.letterCount);}
console.log('avg letters',tot/30,min,max,'ms/puzzle',(Date.now()-t)/30);
const p=generatePuzzle(BANK,{seed:'main-1'});
for(let r=0;r<H;r++){let s='';for(let c=0;c<W;c++){const x=p.cells[r*W+c];s+=x.t==='l'?(x.given?x.ch.toLowerCase():x.ch):x.t==='c'?'#':'.';s+=' '}console.log(s)}
console.log(p.words.map(w=>w.ans+':'+w.dir).join(' '));
for(const tag of ['xmas','east','pent','hero','psalm']){const q=generatePuzzle(BANK,{seed:'ev-'+tag+'-1',focusTag:tag});const inTag=q.words.filter(w=>BANK[w.entry].tags.includes(tag)).length;console.log(tag,q.letterCount,'words',q.words.length,'tagged',inTag)}
