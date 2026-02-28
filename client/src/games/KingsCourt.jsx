import { useState, useEffect } from "react";
import { C, F, F2, NAMES } from "../constants";
import { Btn, Panel, GameHeader } from "../components/UI";

export default function KingsCourt({user,onExit}){
  const[round,setRound]=useState(1);
  const[courtiers,setCourtiers]=useState(()=>[user.username,...NAMES.slice(0,5)].map(n=>({name:n,alive:true,isKing:false,votes:0})));
  const[king,setKing]=useState(null);
  const[challenge,setChallenge]=useState(null);
  const[voting,setVoting]=useState(false);
  const[voted,setVoted]=useState(false);
  const[exiled,setExiled]=useState(null);
  const[gameOver,setGameOver]=useState(null);
  const[log,setLog]=useState([]);

  const CHALLENGES=["Name the most expensive card in poker","Who can tell the best lie?","Who deserves a gold coin the least?",
    "Who would survive longest in the wilderness?","Who is most likely to betray the King?","Who has the weakest poker face?"];

  useEffect(()=>{
    if(!king&&!gameOver){
      const alive=courtiers.filter(c=>c.alive);
      const k=alive[Math.floor(Math.random()*alive.length)];
      setKing(k.name);
      setChallenge(CHALLENGES[Math.floor(Math.random()*CHALLENGES.length)]);
      setLog(l=>[...l,`👑 ${k.name} is the King! Round ${round}`]);
    }
  },[round]);// eslint-disable-line

  const startVote=()=>setVoting(true);

  const castVote=(targetName)=>{
    if(voted||targetName===king) return;
    setVoted(true);

    // AI votes
    const alive=courtiers.filter(c=>c.alive&&c.name!==king);
    const voteCounts={};
    alive.forEach(c=>{
      if(c.name===user.username){
        voteCounts[targetName]=(voteCounts[targetName]||0)+1;
      } else {
        // AI votes randomly but slightly favors non-human
        const targets=alive.filter(a=>a.name!==c.name);
        const target=targets[Math.floor(Math.random()*targets.length)];
        voteCounts[target.name]=(voteCounts[target.name]||0)+1;
      }
    });

    const sorted=Object.entries(voteCounts).sort((a,b)=>b[1]-a[1]);
    const exiledName=sorted[0][0];
    setExiled(exiledName);
    setLog(l=>[...l,`Votes cast! ${exiledName} is EXILED with ${sorted[0][1]} votes!`]);

    const newCourtiers=courtiers.map(c=>c.name===exiledName?{...c,alive:false}:c);
    setCourtiers(newCourtiers);

    const remaining=newCourtiers.filter(c=>c.alive);
    if(remaining.length<=2){
      const winner=remaining.find(c=>c.name===king)||remaining[0];
      setGameOver(`${winner.name} wins the throne! 👑`);
    }

    setTimeout(()=>{
      if(remaining.length>2){
        setRound(r=>r+1);setKing(null);setVoting(false);setVoted(false);setExiled(null);
      }
    },2500);
  };

  const alive=courtiers.filter(c=>c.alive);

  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
    <GameHeader icon="👑" title="KING'S COURT" color={C.gold} subtitle={`Round ${round} • ${alive.length} courtiers`} onExit={onExit}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,gap:14}}>
      {/* Courtiers */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
        {courtiers.map((c,i)=>(
          <div key={i} style={{background:c.name===king?C.goldDark+"22":C.panel,border:"1.5px solid "+(c.name===king?C.gold:!c.alive?C.red+"44":C.border),
            borderRadius:5,padding:"8px 12px",textAlign:"center",opacity:c.alive?1:.3,minWidth:80}}>
            <div style={{fontSize:c.name===king?20:16}}>{c.name===king?"👑":c.alive?"🧑":"💀"}</div>
            <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:c.name===user.username?C.green:C.text}}>{c.name}</div>
            {c.name===king&&<div style={{fontFamily:F,fontSize:8,color:C.gold,letterSpacing:1}}>KING</div>}
            {exiled===c.name&&<div style={{fontFamily:F,fontSize:8,color:C.red,animation:"shake .3s"}}>EXILED!</div>}
          </div>
        ))}
      </div>

      {/* Challenge */}
      {challenge&&!gameOver&&(<Panel accent={C.gold} title="THE KING'S CHALLENGE" style={{maxWidth:400,width:"100%"}}>
        <div style={{padding:14,textAlign:"center"}}>
          <div style={{fontFamily:F,fontSize:13,color:C.text,fontStyle:"italic",marginBottom:8}}>"{challenge}"</div>
          <div style={{fontFamily:F,fontSize:10,color:C.textMuted}}>The court must discuss... then VOTE to exile someone!</div>
        </div>
      </Panel>)}

      {/* Vote controls */}
      {!voting&&!exiled&&!gameOver&&king&&(<Btn v="gold" sz="lg" onClick={startVote}>🗳️ Begin Vote</Btn>)}
      {voting&&!voted&&!gameOver&&(<div>
        <div style={{fontFamily:F,fontSize:11,color:C.text,textAlign:"center",marginBottom:8}}>Vote to exile:</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
          {alive.filter(c=>c.name!==king).map(c=>(
            <Btn key={c.name} v={c.name===user.username?"ghost":"dark"} sz="sm"
              onClick={()=>castVote(c.name)} disabled={c.name===user.username}>{c.name}</Btn>
          ))}
        </div>
      </div>)}

      {gameOver&&(<div style={{textAlign:"center",animation:"slam .5s ease-out"}}>
        <div style={{fontFamily:F2,fontSize:22,color:gameOver.includes(user.username)?C.gold:C.red}}>{gameOver}</div>
        <Btn v="dark" sz="md" onClick={onExit} style={{marginTop:12}}>Back to Hub</Btn>
      </div>)}

      {/* Log */}
      <div style={{maxWidth:400,width:"100%",maxHeight:100,overflowY:"auto"}}>
        {log.map((l,i)=><div key={i} style={{fontFamily:F,fontSize:9,color:l.includes("👑")?C.gold:l.includes("EXILED")?C.red:C.textMuted}}>{l}</div>)}
      </div>
    </div>
  </div>);
}
