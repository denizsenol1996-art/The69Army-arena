import { useState } from "react";
import { C, F, F2, NAMES } from "../constants";
import { Btn, GameHeader } from "../components/UI";

export default function BattleRoyaleCF({user,onExit}){
  const[round,setRound]=useState(1);
  const[alive,setAlive]=useState(()=>[user.username,...NAMES.slice(0,15)]);
  const[dead,setDead]=useState([]);const[flipping,setFlipping]=useState(false);
  const[myResult,setMyResult]=useState(null);const[roundResults,setRoundResults]=useState([]);const[gameOver,setGameOver]=useState(null);

  const runRound=()=>{
    setFlipping(true);setMyResult(null);setRoundResults([]);
    setTimeout(()=>{
      const survivors=[];const eliminated=[];
      alive.forEach(p=>{if(Math.random()>.5)survivors.push(p);else eliminated.push(p);});
      if(eliminated.includes(user.username)&&survivors.length>0&&Math.random()>.35){
        eliminated.splice(eliminated.indexOf(user.username),1);survivors.push(user.username);
        const v=survivors[Math.floor(Math.random()*(survivors.length-1))];if(v!==user.username){survivors.splice(survivors.indexOf(v),1);eliminated.push(v);}}
      if(survivors.length===0&&eliminated.length>0)survivors.push(eliminated.pop());
      setMyResult(survivors.includes(user.username)?"SURVIVED":"ELIMINATED");
      setRoundResults(eliminated.map(p=>({name:p,survived:false})).concat(survivors.map(p=>({name:p,survived:true}))));
      setAlive(survivors);setDead(d=>[...d,...eliminated]);setFlipping(false);
      if(survivors.length<=1)setGameOver(survivors[0]===user.username?"YOU WIN! 🏆":"Winner: "+survivors[0]);
      else setRound(r=>r+1);
    },2000);
  };

  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
    <GameHeader icon="⚡" title="BATTLE ROYALE FLIP" color={C.red} subtitle={`Round ${round} • ${alive.length} alive`} onExit={onExit}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,gap:16}}>
      <div style={{width:100,height:100,borderRadius:"50%",border:"3px solid "+(flipping?C.gold:myResult==="SURVIVED"?C.green:myResult==="ELIMINATED"?C.red:C.border),
        background:`radial-gradient(circle,${C.bg4},${C.bg})`,display:"flex",alignItems:"center",justifyContent:"center",
        animation:flipping?"spin .3s linear infinite":"none",transition:"border-color .3s"}}>
        <span style={{fontSize:36}}>{flipping?"🪙":myResult==="SURVIVED"?"✅":myResult==="ELIMINATED"?"💀":gameOver?"🏆":"🪙"}</span>
      </div>
      {myResult&&!flipping&&<div style={{fontFamily:F2,fontSize:22,fontWeight:900,color:myResult==="SURVIVED"?C.green:C.red,animation:"slam .4s ease-out"}}>{myResult}</div>}
      {gameOver&&<div style={{fontFamily:F2,fontSize:20,color:C.gold,animation:"slam .5s ease-out"}}>{gameOver}</div>}
      <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center",maxWidth:500}}>
        {[...alive,...dead].map((p,i)=>{const isDead=dead.includes(p);
          return(<div key={p} style={{padding:"4px 10px",borderRadius:3,fontFamily:F,fontSize:10,fontWeight:600,
            background:isDead?C.bg:C.panel,border:"1px solid "+(isDead?"rgba(255,51,68,.2)":p===user.username?C.green:C.border),
            color:isDead?C.textMuted:p===user.username?C.green:C.text,opacity:isDead?.4:1,textDecoration:isDead?"line-through":"none"}}>
            {isDead?"💀 ":""}{p}</div>);})}
      </div>
      <div style={{display:"flex",gap:16}}>
        {[{l:"ALIVE",v:alive.length,c:C.green},{l:"DEAD",v:dead.length,c:C.red},{l:"ROUND",v:round,c:C.text}].map(s=>(
          <div key={s.l} style={{textAlign:"center"}}><div style={{fontFamily:F,fontSize:9,color:C.textMuted}}>{s.l}</div>
            <div style={{fontFamily:F2,fontSize:18,color:s.c}}>{s.v}</div></div>))}
      </div>
      {!gameOver&&!flipping&&<Btn v="gold" sz="lg" onClick={runRound} style={{animation:"pulse 2s infinite"}}>⚡ FLIP — Round {round}</Btn>}
      {gameOver&&<Btn v="dark" sz="md" onClick={onExit}>Back to Hub</Btn>}
    </div>
  </div>);
}
