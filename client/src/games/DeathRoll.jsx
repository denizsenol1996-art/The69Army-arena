import { useState } from "react";
import { C, F, F2 } from "../constants";
import { Btn, GameHeader } from "../components/UI";

export default function DeathRoll({user,onExit}){
  const[max,setMax]=useState(1000);const[rolls,setRolls]=useState([]);const[myTurn,setMyTurn]=useState(true);
  const[gameOver,setGameOver]=useState(null);const opponent="StormBlade";

  const roll=()=>{
    const result=Math.ceil(Math.random()*max);const roller=myTurn?user.username:opponent;
    const newRolls=[...rolls,{who:roller,val:result,max}];setRolls(newRolls);
    if(result===1){setGameOver(roller+" rolled a 1! 💀");}
    else{setMax(result);if(myTurn){setMyTurn(false);
      setTimeout(()=>{const aiR=Math.ceil(Math.random()*result);setRolls(r=>[...r,{who:opponent,val:aiR,max:result}]);
        if(aiR===1)setGameOver(opponent+" rolled a 1! 💀");else{setMax(aiR);setMyTurn(true);}},1200);}}
  };

  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
    <GameHeader icon="💀" title="DEATH ROLL" color={C.red} subtitle={`${user.username} vs ${opponent}`} onExit={onExit}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,gap:14}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:F,fontSize:10,color:C.textMuted,letterSpacing:2}}>ROLLING 1 — {max}</div>
        <div style={{fontFamily:F2,fontSize:48,fontWeight:900,color:max<10?C.red:max<50?C.orange:C.green,transition:"color .3s"}}>{max}</div>
        <div style={{width:200,height:4,background:C.bg3,borderRadius:2,marginTop:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:(max/1000)*100+"%",background:`linear-gradient(90deg,${C.red},${C.green})`,transition:"width .5s"}}/></div>
      </div>
      <div style={{display:"flex",gap:20,alignItems:"center"}}>
        {[{n:user.username,c:C.green,t:myTurn},{n:opponent,c:C.red,t:!myTurn}].map(x=>(
          <div key={x.n} style={{textAlign:"center",padding:"10px 16px",borderRadius:5,border:"1.5px solid "+(x.t&&!gameOver?x.c:C.border)}}>
            <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:x.c}}>{x.n}</div>
            <div style={{fontFamily:F,fontSize:10,color:x.t?x.c:C.textMuted}}>{x.t&&!gameOver?"TURN":"..."}</div></div>))}
      </div>
      <div style={{maxHeight:160,overflowY:"auto",width:"100%",maxWidth:340}}>
        {rolls.map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 8px",borderBottom:"1px solid "+C.bg3,
          fontFamily:F,fontSize:11,animation:"slideR .3s ease-out",background:r.val===1?"rgba(255,51,68,.1)":"transparent"}}>
          <span style={{color:r.who===user.username?C.green:C.red,fontWeight:700}}>{r.who}</span>
          <span style={{color:C.textMuted}}>1-{r.max}</span>
          <span style={{color:r.val===1?C.red:C.text,fontWeight:700}}>{r.val}{r.val===1?" 💀":""}</span></div>))}
      </div>
      {gameOver?(<><div style={{fontFamily:F2,fontSize:18,color:gameOver.includes(user.username)?C.red:C.green,animation:"slam .5s ease-out"}}>
        {gameOver.includes(user.username)?"YOU DIED 💀":"YOU WIN! 🏆"}</div><Btn v="dark" sz="md" onClick={onExit}>Back to Hub</Btn></>
      ):myTurn&&<Btn v="gold" sz="lg" onClick={roll} style={{animation:"pulse 2s infinite"}}>🎲 ROLL (1-{max})</Btn>}
    </div>
  </div>);
}
