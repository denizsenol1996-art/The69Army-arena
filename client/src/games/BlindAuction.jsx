import { useState, useEffect } from "react";
import { C, F, F2, NAMES } from "../constants";
import { Btn, Panel, GameHeader } from "../components/UI";

export default function BlindAuction({user,onExit}){
  const[round,setRound]=useState(1);
  const[coins,setCoins]=useState(1000);
  const[prize,setPrize]=useState(null);
  const[bidAmt,setBidAmt]=useState(100);
  const[results,setResults]=useState(null);
  const[log,setLog]=useState([{m:"Welcome to Blind Auction! 3 rounds of mystery prizes.",s:true}]);
  const[totalRounds]=useState(3);
  const[gameOver,setGameOver]=useState(null);
  const[score,setScore]=useState(0);
  const aiNames=NAMES.slice(0,4);

  const PRIZES=[
    {name:"Golden Crown",icon:"👑",value:500,rarity:"Legendary"},{name:"Diamond Ring",icon:"💍",value:350,rarity:"Epic"},
    {name:"Magic Sword",icon:"⚔️",value:280,rarity:"Rare"},{name:"Ancient Scroll",icon:"📜",value:200,rarity:"Uncommon"},
    {name:"Rusty Spoon",icon:"🥄",value:20,rarity:"Common"},{name:"Mystery Box",icon:"📦",value:Math.floor(Math.random()*500)+50,rarity:"???"},
    {name:"Dragon Egg",icon:"🥚",value:450,rarity:"Legendary"},{name:"Healing Potion",icon:"🧪",value:150,rarity:"Uncommon"},
    {name:"Treasure Map",icon:"🗺️",value:300,rarity:"Epic"},{name:"Lucky Coin",icon:"🪙",value:100,rarity:"Common"},
  ];

  const startRound=()=>{
    const p=PRIZES[Math.floor(Math.random()*PRIZES.length)];
    setPrize({...p,revealed:false});
    setResults(null);
    setLog(l=>[...l,{m:`Round ${round}: A mystery ${p.rarity} item appears! Place your bid.`,s:true}]);
  };

  const placeBid=()=>{
    if(bidAmt>coins||bidAmt<=0) return;
    const aiBids=aiNames.map(n=>({name:n,bid:Math.floor(Math.random()*300)+20}));
    const allBids=[{name:user.username,bid:bidAmt},...aiBids].sort((a,b)=>b.bid-a.bid);
    const winner=allBids[0];
    const revPrize={...prize,revealed:true};
    setPrize(revPrize);
    setResults({bids:allBids,winner:winner.name,prize:revPrize});

    if(winner.name===user.username){
      const net=revPrize.value-bidAmt;
      setCoins(c=>c-bidAmt+revPrize.value);
      setScore(s=>s+revPrize.value);
      setLog(l=>[...l,{m:`You won ${revPrize.icon} ${revPrize.name} (value: ${revPrize.value}) for ${bidAmt}! ${net>=0?"Profit":"Loss"}: ${net}`,s:false}]);
    } else {
      setLog(l=>[...l,{m:`${winner.name} wins with bid ${winner.bid}. Prize was ${revPrize.icon} ${revPrize.name} (${revPrize.value})`,s:true}]);
    }

    if(round>=totalRounds){
      setTimeout(()=>setGameOver(`Auction complete! Score: ${score+((winner.name===user.username)?revPrize.value:0)}`),2000);
    }
  };

  const nextRound=()=>{setRound(r=>r+1);setPrize(null);setResults(null);};

  useEffect(()=>{if(!prize&&!gameOver&&round<=totalRounds) startRound();},[round]);// eslint-disable-line

  const rarityColor={Legendary:C.gold,Epic:C.purple,Rare:C.blue,Uncommon:C.green,Common:C.textMuted,"???":C.cyan};

  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
    <GameHeader icon="🔨" title="BLIND AUCTION" color={C.purple} subtitle={`Round ${round}/${totalRounds} • 💰${coins}`} onExit={onExit}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,gap:14}}>
      {/* Mystery prize */}
      {prize&&(<div style={{textAlign:"center",animation:"fadeIn .4s ease-out"}}>
        <div style={{width:100,height:100,borderRadius:12,background:C.panel,border:"2px solid "+(prize.revealed?rarityColor[prize.rarity]:C.border),
          display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",fontSize:prize.revealed?50:40,
          animation:prize.revealed?"slam .5s ease-out":"pulse 2s infinite",
          boxShadow:prize.revealed?"0 0 20px "+(rarityColor[prize.rarity]||C.green)+"44":"none"}}>
          {prize.revealed?prize.icon:"❓"}
        </div>
        {prize.revealed?(<>
          <div style={{fontFamily:F2,fontSize:16,color:rarityColor[prize.rarity]}}>{prize.name}</div>
          <div style={{fontFamily:F,fontSize:11,color:C.textMuted}}>{prize.rarity} — Value: <span style={{color:C.gold}}>{prize.value}</span></div>
        </>):(<>
          <div style={{fontFamily:F2,fontSize:14,color:C.purple}}>MYSTERY ITEM</div>
          <div style={{fontFamily:F,fontSize:11,color:rarityColor[prize.rarity]}}>{prize.rarity}</div>
        </>)}
      </div>)}

      {/* Bid controls */}
      {prize&&!results&&!gameOver&&(<div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
        <input type="range" min={10} max={Math.min(coins,500)} value={bidAmt} onChange={e=>setBidAmt(+e.target.value)}
          style={{width:120,accentColor:C.purple}}/>
        <span style={{fontFamily:F2,fontSize:16,color:C.gold,minWidth:50}}>{bidAmt}</span>
        <Btn v="purple" sz="lg" onClick={placeBid}>🔨 BID</Btn>
      </div>)}

      {/* Results */}
      {results&&(<div style={{animation:"fadeIn .4s ease-out",maxWidth:300,width:"100%"}}>
        <Panel title="RESULTS" accent={C.purple}><div style={{padding:10}}>
          {results.bids.map((b,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 8px",borderBottom:"1px solid "+C.bg3,
              background:b.name===results.winner?"rgba(170,68,255,.1)":"transparent",borderRadius:3}}>
              <span style={{fontFamily:F,fontSize:11,color:b.name===user.username?C.green:C.text,fontWeight:b.name===results.winner?700:400}}>
                {b.name===results.winner?"🏆 ":""}{b.name}</span>
              <span style={{fontFamily:F,fontSize:11,color:C.gold,fontWeight:700}}>{b.bid}</span>
            </div>
          ))}
        </div></Panel>
        {round<totalRounds&&!gameOver&&<Btn v="dark" sz="md" onClick={nextRound} style={{marginTop:10,width:"100%"}}>Next Round →</Btn>}
      </div>)}

      {gameOver&&(<div style={{textAlign:"center",animation:"slam .5s ease-out"}}>
        <div style={{fontFamily:F2,fontSize:20,color:C.gold}}>{gameOver}</div>
        <Btn v="dark" sz="md" onClick={onExit} style={{marginTop:12}}>Back to Hub</Btn>
      </div>)}
    </div>
  </div>);
}
