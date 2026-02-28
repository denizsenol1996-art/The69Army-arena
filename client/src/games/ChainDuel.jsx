import { useState } from "react";
import { C, F, F2, NAMES } from "../constants";
import { Btn, GameHeader } from "../components/UI";

export default function ChainDuel({user,onExit}){
  const[bracket,setBracket]=useState(()=>{
    const p=[user.username,...NAMES.slice(0,7)];
    const shuffled=p.sort(()=>Math.random()-.5);
    const matches=[];
    for(let i=0;i<shuffled.length;i+=2) matches.push({a:shuffled[i],b:shuffled[i+1],winner:null,round:1});
    return matches;
  });
  const[currentMatch,setCurrentMatch]=useState(0);
  const[fighting,setFighting]=useState(false);
  const[roundNum,setRoundNum]=useState(1);
  const[gameOver,setGameOver]=useState(null);
  const[hp,setHp]=useState({a:100,b:100});
  const[fightLog,setFightLog]=useState([]);

  const fight=()=>{
    setFighting(true);
    setHp({a:100,b:100});
    setFightLog([]);
    const m=bracket[currentMatch];
    let hpA=100,hpB=100;
    const logs=[];
    const isHumanA=m.a===user.username;
    const isHumanB=m.b===user.username;
    const hasHuman=isHumanA||isHumanB;

    const doHit=()=>{
      const dmgA=Math.floor(Math.random()*25)+5;
      const dmgB=Math.floor(Math.random()*25)+5;
      hpB=Math.max(0,hpB-dmgA);
      logs.push(`${m.a} hits for ${dmgA}! (${m.b}: ${hpB}hp)`);
      if(hpB<=0){return m.a;}
      hpA=Math.max(0,hpA-dmgB);
      logs.push(`${m.b} hits for ${dmgB}! (${m.a}: ${hpA}hp)`);
      if(hpA<=0){return m.b;}
      return null;
    };

    // Simulate fight with animation
    let step=0;
    const interval=setInterval(()=>{
      const winner=doHit();
      setHp({a:hpA,b:hpB});
      setFightLog([...logs]);
      step++;
      if(winner||step>20){
        clearInterval(interval);
        const w=winner||(hpA>=hpB?m.a:m.b);
        // Nudge for human (60% win rate)
        const finalWinner=hasHuman&&Math.random()<.6?(isHumanA?m.a:m.b):w;
        const newBracket=[...bracket];
        newBracket[currentMatch].winner=finalWinner;
        setBracket(newBracket);
        setFightLog(l=>[...l,`🏆 ${finalWinner} WINS!`]);
        setFighting(false);

        setTimeout(()=>{
          // Check if round complete
          const roundMatches=newBracket.filter(m=>m.round===roundNum);
          const allDone=roundMatches.every(m=>m.winner);
          if(allDone){
            const winners=roundMatches.map(m=>m.winner);
            if(winners.length<=1){
              setGameOver(winners[0]+" is the CHAMPION! 🏆");
            } else {
              // Create next round
              const nextMatches=[];
              for(let i=0;i<winners.length;i+=2){
                if(i+1<winners.length) nextMatches.push({a:winners[i],b:winners[i+1],winner:null,round:roundNum+1});
                else nextMatches.push({a:winners[i],b:"BYE",winner:winners[i],round:roundNum+1});
              }
              setBracket(b=>[...b,...nextMatches]);
              setRoundNum(r=>r+1);
              setCurrentMatch(newBracket.length);
            }
          } else {
            setCurrentMatch(c=>c+1);
          }
        },1500);
      }
    },400);
  };

  const m=bracket[currentMatch];
  const roundMatches=bracket.filter(b=>b.round===roundNum);

  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
    <GameHeader icon="⚔️" title="CHAIN DUEL" color={C.cyan} subtitle={`Round ${roundNum}`} onExit={onExit}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,gap:14}}>
      {/* Bracket */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
        {roundMatches.map((m,i)=>(
          <div key={i} style={{background:C.panel,border:"1px solid "+C.border,borderRadius:4,padding:"6px 10px",minWidth:120,textAlign:"center"}}>
            <div style={{fontFamily:F,fontSize:10,color:m.a===user.username?C.green:C.text,fontWeight:m.winner===m.a?700:400,
              textDecoration:m.winner&&m.winner!==m.a?"line-through":"none"}}>{m.a}</div>
            <div style={{fontFamily:F,fontSize:9,color:C.textMuted}}>vs</div>
            <div style={{fontFamily:F,fontSize:10,color:m.b===user.username?C.green:C.text,fontWeight:m.winner===m.b?700:400,
              textDecoration:m.winner&&m.winner!==m.b?"line-through":"none"}}>{m.b}</div>
            {m.winner&&<div style={{fontFamily:F,fontSize:8,color:C.gold,marginTop:2}}>🏆 {m.winner}</div>}
          </div>
        ))}
      </div>

      {/* Current fight */}
      {m&&!m.winner&&!gameOver&&(<div style={{textAlign:"center"}}>
        <div style={{display:"flex",gap:20,alignItems:"center",justifyContent:"center",marginBottom:10}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:m.a===user.username?C.green:C.text}}>{m.a}</div>
            <div style={{width:80,height:6,background:C.bg3,borderRadius:3,overflow:"hidden",marginTop:4}}>
              <div style={{height:"100%",width:hp.a+"%",background:hp.a>50?C.green:hp.a>25?C.orange:C.red,transition:"width .3s"}}/>
            </div>
            <div style={{fontFamily:F,fontSize:10,color:C.text}}>{hp.a}hp</div>
          </div>
          <span style={{fontFamily:F2,fontSize:20,color:C.red,animation:fighting?"shake .3s infinite":"none"}}>⚔️</span>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:m.b===user.username?C.green:C.text}}>{m.b}</div>
            <div style={{width:80,height:6,background:C.bg3,borderRadius:3,overflow:"hidden",marginTop:4}}>
              <div style={{height:"100%",width:hp.b+"%",background:hp.b>50?C.green:hp.b>25?C.orange:C.red,transition:"width .3s"}}/>
            </div>
            <div style={{fontFamily:F,fontSize:10,color:C.text}}>{hp.b}hp</div>
          </div>
        </div>
        {!fighting&&<Btn v="cyan" sz="lg" onClick={fight} style={{animation:"pulse 2s infinite"}}>⚔️ FIGHT!</Btn>}
        <div style={{maxHeight:100,overflowY:"auto",marginTop:8}}>
          {fightLog.map((l,i)=><div key={i} style={{fontFamily:F,fontSize:9,color:l.includes("🏆")?C.gold:C.textMuted}}>{l}</div>)}
        </div>
      </div>)}

      {gameOver&&(<div style={{textAlign:"center",animation:"slam .5s ease-out"}}>
        <div style={{fontFamily:F2,fontSize:22,color:gameOver.includes(user.username)?C.gold:C.red}}>{gameOver}</div>
        <Btn v="dark" sz="md" onClick={onExit} style={{marginTop:12}}>Back to Hub</Btn>
      </div>)}
    </div>
  </div>);
}
