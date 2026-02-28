import { useState, useEffect, useRef } from "react";
import { C, F, F2 } from "../constants";
import { Btn, Panel, GameHeader } from "../components/UI";

export default function LiarsDice({user,onExit}){
  const[round,setRound]=useState(1);
  const[myDice,setMyDice]=useState(()=>Array.from({length:5},()=>Math.ceil(Math.random()*6)));
  const[currentBid,setCurrentBid]=useState({qty:2,face:3,by:"StormBlade"});
  const[bidQty,setBidQty]=useState(3);const[bidFace,setBidFace]=useState(3);
  const[log,setLog]=useState([{m:"Round 1 — Everyone has 5 dice",s:true},{m:"StormBlade bids: 2× ⚃",s:true}]);
  const[result,setResult]=useState(null);
  const[players,setPlayers]=useState([{n:user.username,dice:5},{n:"StormBlade",dice:5},{n:"IronVex",dice:5},{n:"NightHawk",dice:5}]);
  const logRef=useRef(null);
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[log]);
  const de=n=>["","⚀","⚁","⚂","⚃","⚄","⚅"][n]||"🎲";

  const raise=()=>{
    if(bidQty<currentBid.qty||(bidQty===currentBid.qty&&bidFace<=currentBid.face))return;
    setCurrentBid({qty:bidQty,face:bidFace,by:user.username});
    setLog(p=>[...p,{m:`You bid: ${bidQty}× ${de(bidFace)}`,s:false}]);
    setTimeout(()=>{
      const aiQty=bidQty+Math.floor(Math.random()*2);const aiFace=Math.ceil(Math.random()*6);
      const aiName=players.filter(p=>p.n!==user.username&&p.dice>0)[Math.floor(Math.random()*2)]?.n||"StormBlade";
      setCurrentBid({qty:aiQty,face:aiFace,by:aiName});
      setLog(p=>[...p,{m:`${aiName} raises: ${aiQty}× ${de(aiFace)}`,s:true}]);setBidQty(aiQty+1);
    },1200);
  };
  const callBluff=()=>{
    const totalMatch=Math.floor(Math.random()*currentBid.qty*2);const isBluff=totalMatch<currentBid.qty;
    if(isBluff){
      setLog(p=>[...p,{m:`LIAR! Only ${totalMatch}× ${de(currentBid.face)}! ${currentBid.by} loses a die!`,s:true}]);
      setPlayers(pp=>pp.map(p=>p.n===currentBid.by?{...p,dice:Math.max(0,p.dice-1)}:p));
      setResult({winner:user.username,msg:currentBid.by+" was bluffing!"});
    } else {
      setLog(p=>[...p,{m:`TRUTH! ${totalMatch}× ${de(currentBid.face)}! You lose a die!`,s:true}]);
      setPlayers(pp=>pp.map(p=>p.n===user.username?{...p,dice:Math.max(0,p.dice-1)}:p));
      setResult({winner:currentBid.by,msg:"The bid was legit!"});
    }
    setTimeout(()=>{setResult(null);setRound(r=>r+1);setMyDice(Array.from({length:5},()=>Math.ceil(Math.random()*6)));
      setCurrentBid({qty:2,face:Math.ceil(Math.random()*6),by:"StormBlade"});setBidQty(3);},2500);
  };

  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
    <GameHeader icon="🎲" title="LIAR'S DICE" color={C.orange} subtitle={`Round ${round}`} onExit={onExit}/>
    <div style={{flex:1,display:"flex"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16,gap:14}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          {players.map((p,i)=>(<div key={i} style={{background:p.n===user.username?C.bg4:C.panel,border:"1.5px solid "+(p.dice===0?C.red:p.n===currentBid.by?C.orange:C.border),
            borderRadius:5,padding:"8px 14px",textAlign:"center",minWidth:90,opacity:p.dice===0?.4:1}}>
            <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:p.n===user.username?C.green:C.text}}>{p.n}</div>
            <div style={{fontFamily:F,fontSize:10,color:p.dice===0?C.red:C.textMuted}}>{p.dice===0?"☠ OUT":Array(p.dice).fill("🎲").join(" ")}</div>
          </div>))}
        </div>
        <Panel accent={C.orange} title="CURRENT BID" style={{width:"100%",maxWidth:300}}>
          <div style={{padding:14,textAlign:"center"}}>
            <div style={{fontFamily:F2,fontSize:28,color:C.orange,animation:result?"shake .3s":"none"}}>{currentBid.qty}× {de(currentBid.face)}</div>
            <div style={{fontFamily:F,fontSize:11,color:C.textMuted}}>by {currentBid.by}</div></div></Panel>
        <div><div style={{fontFamily:F,fontSize:10,color:C.green,letterSpacing:1,textAlign:"center",marginBottom:6}}>YOUR DICE</div>
          <div style={{display:"flex",gap:6,justifyContent:"center"}}>
            {myDice.map((d,i)=>(<div key={i} style={{width:44,height:44,borderRadius:6,background:C.panel,border:"1.5px solid "+C.borderLight,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,animation:`flipIn .4s ease-out ${i*.08}s both`}}>{de(d)}</div>))}</div></div>
        {result&&(<div style={{padding:"10px 20px",borderRadius:6,animation:"winFlash 1s ease-in-out infinite",textAlign:"center"}}>
          <div style={{fontFamily:F2,fontSize:16,color:result.winner===user.username?C.green:C.red,fontWeight:700}}>{result.winner===user.username?"CAUGHT THE LIAR!":"BUSTED!"}</div>
          <div style={{fontFamily:F,fontSize:11,color:C.text}}>{result.msg}</div></div>)}
        {!result&&(<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontFamily:F,fontSize:10,color:C.textMuted}}>Qty</span>
            <select value={bidQty} onChange={e=>setBidQty(+e.target.value)} style={{background:C.bg,border:"1px solid "+C.border,color:C.text,fontFamily:F,fontSize:12,padding:"4px 8px",borderRadius:3}}>
              {Array.from({length:15},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}</option>)}</select>
            <span style={{fontFamily:F,fontSize:10,color:C.textMuted}}>Face</span>
            <select value={bidFace} onChange={e=>setBidFace(+e.target.value)} style={{background:C.bg,border:"1px solid "+C.border,color:C.text,fontFamily:F,fontSize:12,padding:"4px 8px",borderRadius:3}}>
              {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{de(n)} {n}</option>)}</select>
          </div>
          <Btn v="green" sz="md" onClick={raise}>Raise</Btn>
          <Btn v="red" sz="md" onClick={callBluff}>🔥 LIAR!</Btn>
        </div>)}
      </div>
      <div style={{width:210,borderLeft:"1px solid "+C.border,background:C.panel,display:"flex",flexDirection:"column"}}>
        <div style={{padding:7,borderBottom:"1px solid "+C.border,fontFamily:F2,color:C.orange,fontSize:10,letterSpacing:2,textAlign:"center"}}>GAME LOG</div>
        <div ref={logRef} style={{flex:1,overflowY:"auto",padding:6}}>
          {log.map((l,i)=>(<div key={i} style={{marginBottom:3,fontSize:10,fontFamily:F,color:l.s?C.textMuted:C.green}}>{l.m}</div>))}</div>
      </div>
    </div>
  </div>);
}
