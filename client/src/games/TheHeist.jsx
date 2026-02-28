import { useState } from "react";
import { C, F, F2, NAMES } from "../constants";
import { Btn, GameHeader } from "../components/UI";

export default function TheHeist({user,onExit}){
  const[phase,setPhase]=useState("planning"); // planning, choosing, reveal, done
  const[vault]=useState(Math.floor(Math.random()*3000)+2000);
  const[crew]=useState(()=>[user.username,...NAMES.slice(0,3)]);
  const[myChoice,setMyChoice]=useState(null);
  const[results,setResults]=useState(null);
  const[round,setRound]=useState(1);
  const[totalScore,setTotalScore]=useState(0);
  const[gameOver,setGameOver]=useState(null);
  const TOTAL_ROUNDS=3;

  const choose=(choice)=>{
    setMyChoice(choice);
    // AI decisions
    const aiChoices=crew.slice(1).map(name=>{
      const r=Math.random();
      return {name,choice:r<.6?"cooperate":"betray"};
    });
    const allChoices=[{name:user.username,choice},...aiChoices];
    const cooperators=allChoices.filter(c=>c.choice==="cooperate");
    const betrayers=allChoices.filter(c=>c.choice==="betray");

    let payouts=[];
    if(betrayers.length===0){
      // Everyone cooperates — split evenly
      const share=Math.floor(vault/allChoices.length);
      payouts=allChoices.map(c=>({...c,payout:share,msg:"Fair split"}));
    } else if(cooperators.length===0){
      // Everyone betrays — vault is destroyed
      payouts=allChoices.map(c=>({...c,payout:0,msg:"Vault destroyed!"}));
    } else {
      // Betrayers steal from cooperators
      const betrayerShare=Math.floor(vault*0.7/betrayers.length);
      const cooperatorShare=Math.floor(vault*0.1/cooperators.length);
      payouts=allChoices.map(c=>{
        if(c.choice==="betray") return {...c,payout:betrayerShare,msg:"Backstabbed! 🗡️"};
        return {...c,payout:cooperatorShare,msg:"Got robbed! 😢"};
      });
    }

    setResults(payouts);
    const myPayout=payouts.find(p=>p.name===user.username)?.payout||0;
    setTotalScore(s=>s+myPayout);
    setPhase("reveal");

    if(round>=TOTAL_ROUNDS){
      setTimeout(()=>setGameOver(`Heist complete! Total loot: ${totalScore+myPayout}`),2500);
    }
  };

  const nextRound=()=>{
    setRound(r=>r+1);setPhase("planning");setMyChoice(null);setResults(null);
  };

  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
    <GameHeader icon="🏴‍☠️" title="THE HEIST" color="#ff4488" subtitle={`Round ${round}/${TOTAL_ROUNDS} • Score: ${totalScore}`} onExit={onExit}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,gap:16}}>
      {/* Vault */}
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:50,marginBottom:4}}>🏦</div>
        <div style={{fontFamily:F2,fontSize:22,color:C.gold}}>VAULT: {vault.toLocaleString()}</div>
        <div style={{fontFamily:F,fontSize:10,color:C.textMuted}}>Split the loot... or take it all?</div>
      </div>

      {/* Crew */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
        {crew.map((name,i)=>{
          const res=results?.find(r=>r.name===name);
          return(<div key={i} style={{background:C.panel,border:"1.5px solid "+(res?res.choice==="betray"?C.red:C.green:name===user.username?C.green:C.border),
            borderRadius:6,padding:"10px 14px",textAlign:"center",minWidth:90,
            animation:res?"fadeIn .3s ease-out":"none"}}>
            <div style={{fontSize:20}}>{res?res.choice==="betray"?"🗡️":"🤝":"🧑"}</div>
            <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:name===user.username?C.green:C.text}}>{name}</div>
            {res&&<><div style={{fontFamily:F,fontSize:9,color:res.choice==="betray"?C.red:C.green,fontWeight:700}}>
              {res.choice.toUpperCase()}</div>
              <div style={{fontFamily:F,fontSize:10,color:C.gold,fontWeight:700}}>+{res.payout}</div></>}
          </div>);
        })}
      </div>

      {/* Choice */}
      {phase==="planning"&&!gameOver&&(<div style={{display:"flex",gap:12}}>
        <Btn v="green" sz="lg" onClick={()=>choose("cooperate")}>🤝 Cooperate</Btn>
        <Btn v="red" sz="lg" onClick={()=>choose("betray")}>🗡️ Betray</Btn>
      </div>)}

      {results&&!gameOver&&round<TOTAL_ROUNDS&&(
        <Btn v="dark" sz="md" onClick={nextRound} style={{marginTop:8}}>Next Round →</Btn>
      )}

      {gameOver&&(<div style={{textAlign:"center",animation:"slam .5s ease-out"}}>
        <div style={{fontFamily:F2,fontSize:20,color:C.gold}}>{gameOver}</div>
        <Btn v="dark" sz="md" onClick={onExit} style={{marginTop:12}}>Back to Hub</Btn>
      </div>)}
    </div>
  </div>);
}
