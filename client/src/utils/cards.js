import { C } from "../constants";

export const SUITS = ["♠","♥","♦","♣"];
export const RANKS = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
export const RANK_VAL = {2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,T:10,J:11,Q:12,K:13,A:14};

const suitColor = s => s==="♥"||s==="♦" ? "#ff4444" : "#ffffff";

export function makeDeck(){
  const d = [];
  SUITS.forEach(s => RANKS.forEach(r => d.push({r,s})));
  return d;
}

export function shuffle(a){
  const b = [...a];
  for(let i=b.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [b[i],b[j]] = [b[j],b[i]];
  }
  return b;
}

export function evaluateHand(cards){
  if(cards.length<5) return {rank:0,name:"Incomplete",high:0};
  const combos = [];
  const n = cards.length;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)for(let k=j+1;k<n;k++)
    for(let l=k+1;l<n;l++)for(let m=l+1;m<n;m++)
      combos.push([cards[i],cards[j],cards[k],cards[l],cards[m]]);
  let best = {rank:0,name:"High Card",high:0,kickers:[]};
  combos.forEach(hand => {
    const e = evalFive(hand);
    if(e.rank>best.rank||(e.rank===best.rank&&e.high>best.high)) best = e;
  });
  return best;
}

function evalFive(hand){
  const vals = hand.map(c=>RANK_VAL[c.r]).sort((a,b)=>b-a);
  const suits = hand.map(c=>c.s);
  const isFlush = suits.every(s=>s===suits[0]);
  const unique = [...new Set(vals)].sort((a,b)=>b-a);
  const isStraight = unique.length===5 && unique[0]-unique[4]===4;
  const isWheel = unique.length===5 && unique[0]===14 && unique[1]===5;
  const counts = {};
  vals.forEach(v=>{counts[v]=(counts[v]||0)+1;});
  const groups = Object.entries(counts).map(([v,c])=>({v:+v,c})).sort((a,b)=>b.c-a.c||b.v-a.v);

  if(isFlush&&isStraight) return {rank:8,name:vals[0]===14?"Royal Flush":"Straight Flush",high:vals[0]};
  if(isFlush&&isWheel) return {rank:8,name:"Straight Flush",high:5};
  if(groups[0].c===4) return {rank:7,name:"Four of a Kind",high:groups[0].v};
  if(groups[0].c===3&&groups[1].c===2) return {rank:6,name:"Full House",high:groups[0].v};
  if(isFlush) return {rank:5,name:"Flush",high:vals[0]};
  if(isStraight) return {rank:4,name:"Straight",high:vals[0]};
  if(isWheel) return {rank:4,name:"Straight",high:5};
  if(groups[0].c===3) return {rank:3,name:"Three of a Kind",high:groups[0].v};
  if(groups[0].c===2&&groups[1].c===2) return {rank:2,name:"Two Pair",high:Math.max(groups[0].v,groups[1].v)};
  if(groups[0].c===2) return {rank:1,name:"Pair",high:groups[0].v};
  return {rank:0,name:"High Card",high:vals[0]};
}

export function CardView({card,hidden,small,delay=0}){
  const w = small?36:48, h = small?52:70;
  if(!card||hidden) return(
    <div style={{width:w,height:h,borderRadius:4,background:"linear-gradient(135deg,#1a3a1a,#0a1a0a)",
      border:"1.5px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:small?10:14,color:C.greenDim,animation:`dealCard .3s ease-out ${delay}s both`}}>🂠</div>
  );
  return(
    <div style={{width:w,height:h,borderRadius:4,background:"#f8f6f0",border:"1.5px solid #ccc",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      fontFamily:"serif",fontWeight:700,lineHeight:1,animation:`dealCard .3s ease-out ${delay}s both`,
      boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}>
      <span style={{fontSize:small?12:16,color:suitColor(card.s)}}>{card.r==="T"?"10":card.r}</span>
      <span style={{fontSize:small?10:14,color:suitColor(card.s)}}>{card.s}</span>
    </div>
  );
}
