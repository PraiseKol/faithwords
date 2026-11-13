import {BANK} from '../js/bank.js';
import {generatePuzzle} from '../js/generator.js';
import {newGame,place,endTurn,botStep,targets,emptyCount} from '../js/engine.js';
let games=0,bad=0;
for(let i=1;i<=25;i++){
  const st=newGame(generatePuzzle(BANK,{seed:'t'+i}),{botLevel:3});
  let guard=0;
  while(!st.over&&guard++<400){
    if(st.turn==='you'){ // act like a decent player: place everything possible
      let n=0;
      for(const l of [...st.racks.you]){const t=targets(st,l);if(t.length&&place(st,'you',l,t[0]).ok)n++;if(st.over)break;}
      if(!st.over)endTurn(st);
    } else {
      st.quota=st.quota||1;
      let s;while((s=botStep(st))){place(st,'opp',s.letter,s.cell);if(st.over)break;}
      if(!st.over)endTurn(st);
    }
  }
  games++; if(!st.over||emptyCount(st)) bad++;
  if(i<4)console.log('game',i,st.scores,'guard',guard);
}
console.log({games,bad});
// scoring rule check
const st=newGame(generatePuzzle(BANK,{seed:'rule'}),{botLevel:1});
const w=st.puzzle.words.find(w=>w.len>=3);
console.log('word',w.ans,w.len);
