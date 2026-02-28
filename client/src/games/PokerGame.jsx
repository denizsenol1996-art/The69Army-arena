import { useState, useEffect, useRef } from "react";
import { C, F, F2, NAMES } from "../constants";
import { Btn, GameHeader } from "../components/UI";
import { RANK_VAL, makeDeck, shuffle, evaluateHand, CardView } from "../utils/cards";

export default function PokerGame({user,onExit}){
  // All mutable game state in a single ref to avoid stale closures
  const G=useRef({
    players:[],deck:[],community:[],pot:0,phase:"preflop",
    dealer:0,current:-1,highBet:0,handNum:0,blindLvl:0,
    actedThisRound:new Set(),firstActorThisRound:-1,
    showdownResults:null,gameOver:null,waitHuman:false,
  });
  const[,forceRender]=useState(0);
  const tick=()=>forceRender(n=>n+1);
  const timerRef=useRef(null);
  const logRef=useRef(null);
  const[log,setLog]=useState([]);
  const[raiseAmt,setRaiseAmt]=useState(100);
  const mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;clearTimeout(timerRef.current);};},[]);
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[log]);

  const addLog=(m)=>setLog(p=>[...p,m]);
  const NUM_AI=5;const START=1500;
  const BLINDS=[[10,20],[15,30],[25,50],[50,100],[75,150],[100,200],[150,300],[200,400],[300,600],[500,1000]];
  const bl=()=>BLINDS[Math.min(G.current.blindLvl,BLINDS.length-1)];

  // Helper: indices of active (not eliminated) players
  const activeIdxs=(pls)=>pls.map((p,i)=>p.eliminated?-1:i).filter(i=>i>=0);
  // Helper: indices of players still in this hand (not eliminated, not folded, not all-in)
  const canActIdxs=(pls)=>pls.map((p,i)=>(!p.eliminated&&!p.folded&&!p.allIn)?i:-1).filter(i=>i>=0);
  // Helper: in-hand (not eliminated, not folded)
  const inHandIdxs=(pls)=>pls.map((p,i)=>(!p.eliminated&&!p.folded)?i:-1).filter(i=>i>=0);

  // ── NEXT ACTIVE SEAT after idx ──
  const nextSeat=(pls,fromIdx,filterFn)=>{
    const seats=filterFn(pls);
    if(seats.length===0) return -1;
    for(let k=1;k<=pls.length;k++){
      const idx=(fromIdx+k)%pls.length;
      if(seats.includes(idx)) return idx;
    }
    return seats[0];
  };

  // ── AI DECISION ──
  const aiDecide=(g)=>{
    const p=g.players[g.current];
    if(!p||p.eliminated||p.folded||p.allIn) return {action:"check"};
    const toCall=g.highBet-p.bet;
    const [sb,bb]=bl();
    const handStr=p.hand.length===2?RANK_VAL[p.hand[0].r]+RANK_VAL[p.hand[1].r]:10;
    const paired=p.hand.length===2&&p.hand[0].r===p.hand[1].r;
    const suited=p.hand.length===2&&p.hand[0].s===p.hand[1].s;
    const str=handStr+(paired?15:0)+(suited?3:0);
    let ev=null;
    if(g.community.length>=3) ev=evaluateHand([...p.hand,...g.community]);
    const r=Math.random();

    // Preflop
    if(g.community.length===0){
      if(str>=26||paired){if(r<.4)return{action:"raise",amount:Math.min(bb*3,p.chips+p.bet)};return{action:"call"};}
      if(str>=18){if(toCall<=bb*2)return{action:"call"};if(r<.3)return{action:"call"};return{action:"fold"};}
      if(toCall<=0)return{action:"check"};if(toCall<=bb&&r<.3)return{action:"call"};return{action:"fold"};
    }
    // Postflop
    if(ev){
      if(ev.rank>=4){if(r<.55)return{action:"raise",amount:Math.min(Math.floor(g.pot*.7)+p.bet,p.chips+p.bet)};return{action:"call"};}
      if(ev.rank>=2){
        if(toCall<=0){if(r<.4)return{action:"raise",amount:Math.min(Math.floor(g.pot*.5)+p.bet,p.chips+p.bet)};return{action:"check"};}
        if(toCall<=g.pot*.4)return{action:"call"};if(r<.25)return{action:"call"};return{action:"fold"};
      }
      if(ev.rank>=1){
        if(toCall<=0)return r<.3?{action:"raise",amount:Math.min(Math.floor(g.pot*.35)+p.bet,p.chips+p.bet)}:{action:"check"};
        if(toCall<=bb*3)return{action:"call"};return r<.2?{action:"call"}:{action:"fold"};
      }
      // Nothing
      if(toCall<=0)return r<.12?{action:"raise",amount:Math.min(Math.floor(g.pot*.5)+p.bet,p.chips+p.bet)}:{action:"check"};
      if(toCall<=bb&&r<.15)return{action:"call"};return{action:"fold"};
    }
    if(toCall<=0)return{action:"check"};
    return r<.25?{action:"call"}:{action:"fold"};
  };

  // ── APPLY ACTION ──
  const applyAction=(action,amount=0)=>{
    const g=G.current;
    const p=g.players[g.current];
    if(!p) return;
    const [sb,bb]=bl();

    if(action==="fold"){
      p.folded=true;
      addLog(`${p.name} folds`);
    } else if(action==="check"){
      addLog(`${p.name} checks`);
    } else if(action==="call"){
      const toCall=Math.min(g.highBet-p.bet,p.chips);
      p.chips-=toCall;p.bet+=toCall;g.pot+=toCall;
      if(p.chips<=0){p.allIn=true;p.chips=0;}
      addLog(`${p.name} calls ${toCall}`);
    } else if(action==="raise"){
      const raiseTotal=Math.min(amount,p.chips+p.bet);
      const toAdd=raiseTotal-p.bet;
      p.chips-=toAdd;p.bet=raiseTotal;g.pot+=toAdd;
      g.highBet=Math.max(g.highBet,raiseTotal);
      if(p.chips<=0){p.allIn=true;p.chips=0;}
      addLog(`${p.name} raises to ${raiseTotal}`);
      // On a raise, reset acted set — only raiser has acted
      g.actedThisRound=new Set([g.current]);
      tick();
      advanceAfterAction();
      return;
    } else if(action==="allin"){
      const allAmt=p.chips;
      p.bet+=allAmt;g.pot+=allAmt;p.chips=0;p.allIn=true;
      g.highBet=Math.max(g.highBet,p.bet);
      addLog(`${p.name} ALL-IN ${p.bet}`);
      if(p.bet>g.highBet-allAmt){
        // Effective raise — reset acted
        g.actedThisRound=new Set([g.current]);
        tick();advanceAfterAction();return;
      }
    }

    g.actedThisRound.add(g.current);
    tick();
    advanceAfterAction();
  };

  // ── AFTER EACH ACTION: check round over or next player ──
  const advanceAfterAction=()=>{
    const g=G.current;
    if(!mounted.current) return;

    // 1) Only one player left in hand?
    const inHand=inHandIdxs(g.players);
    if(inHand.length===1){
      const winner=g.players[inHand[0]];
      addLog(`${winner.name} wins ${g.pot}! 💰`);
      winner.chips+=g.pot;g.pot=0;
      g.showdownResults=null;
      tick();
      timerRef.current=setTimeout(()=>{if(mounted.current)finishHand();},1200);
      return;
    }

    // 2) Is the betting round complete?
    const canAct=canActIdxs(g.players);
    if(canAct.length===0){
      // Everyone all-in or folded — run to showdown
      runBoard();return;
    }
    const allActed=canAct.every(i=>g.actedThisRound.has(i));
    const allMatched=canAct.every(i=>g.players[i].bet>=g.highBet);
    if(allActed&&allMatched){
      nextStreet();return;
    }

    // 3) Find next player to act
    const nextP=nextSeat(g.players,g.current,canActIdxs);
    if(nextP===-1||nextP===g.current){
      // No one else — advance
      if(allMatched)nextStreet();
      else runBoard();
      return;
    }
    g.current=nextP;
    g.waitHuman=g.players[nextP].isHuman;
    tick();

    if(!g.waitHuman){
      timerRef.current=setTimeout(()=>{
        if(!mounted.current) return;
        const act=aiDecide(G.current);
        applyAction(act.action,act.amount);
      },500+Math.random()*700);
    }
  };

  // ── DEAL COMMUNITY CARDS TO COMPLETION ──
  const runBoard=()=>{
    const g=G.current;
    while(g.community.length<5) g.community.push(g.deck.shift());
    g.phase="showdown";
    addLog(`── Board: ${g.community.map(c=>c.r+c.s).join(" ")} ──`);
    tick();
    timerRef.current=setTimeout(()=>{if(mounted.current)doShowdown();},600);
  };

  // ── NEXT STREET ──
  const nextStreet=()=>{
    const g=G.current;
    // Reset bets
    g.players.forEach(p=>{p.bet=0;});
    g.highBet=0;
    g.actedThisRound=new Set();

    if(g.phase==="preflop"){
      g.community=[g.deck.shift(),g.deck.shift(),g.deck.shift()];
      g.phase="flop";
      addLog(`── FLOP: ${g.community.map(c=>c.r+c.s).join(" ")} ──`);
    } else if(g.phase==="flop"){
      g.community.push(g.deck.shift());
      g.phase="turn";
      addLog(`── TURN: ${g.community[3].r+g.community[3].s} ──`);
    } else if(g.phase==="turn"){
      g.community.push(g.deck.shift());
      g.phase="river";
      addLog(`── RIVER: ${g.community[4].r+g.community[4].s} ──`);
    } else if(g.phase==="river"){
      g.phase="showdown";
      tick();
      timerRef.current=setTimeout(()=>{if(mounted.current)doShowdown();},400);
      return;
    }
    tick();

    // Who acts first postflop? First active seat after dealer
    const canAct=canActIdxs(g.players);
    if(canAct.length===0){runBoard();return;}
    const first=nextSeat(g.players,g.dealer,canActIdxs);
    g.current=first;
    g.waitHuman=g.players[first].isHuman;
    tick();

    if(!g.waitHuman){
      timerRef.current=setTimeout(()=>{
        if(!mounted.current)return;
        const act=aiDecide(G.current);
        applyAction(act.action,act.amount);
      },600+Math.random()*600);
    }
  };

  // ── SHOWDOWN ──
  const doShowdown=()=>{
    const g=G.current;
    const contenders=g.players.filter(p=>!p.eliminated&&!p.folded);
    const results=contenders.map(p=>({...p,eval:evaluateHand([...p.hand,...g.community])}));
    results.sort((a,b)=>b.eval.rank-a.eval.rank||(b.eval.high-a.eval.high));
    const winner=results[0];
    addLog(`🏆 ${winner.name} wins ${g.pot} with ${winner.eval.name}!`);
    const wp=g.players.find(p=>p.name===winner.name);
    if(wp) wp.chips+=g.pot;
    g.pot=0;
    g.showdownResults=results;
    g.phase="showdown";
    tick();
    timerRef.current=setTimeout(()=>{if(mounted.current)finishHand();},2800);
  };

  // ── FINISH HAND → eliminate busted, advance dealer, start next ──
  const finishHand=()=>{
    const g=G.current;
    g.players.forEach(p=>{if(!p.eliminated&&p.chips<=0)p.eliminated=true;});
    const alive=g.players.filter(p=>!p.eliminated);
    if(alive.length<=1){
      g.gameOver=(alive[0]?.name||"Nobody")+" wins the tournament! 🏆";
      tick();return;
    }
    g.handNum++;
    g.blindLvl=Math.floor(g.handNum/3);
    // Move dealer
    const actives=activeIdxs(g.players);
    const dPos=actives.indexOf(g.dealer);
    g.dealer=actives[(dPos+1)%actives.length];
    g.showdownResults=null;
    tick();
    timerRef.current=setTimeout(()=>{if(mounted.current)dealNewHand();},1200);
  };

  // ── DEAL A NEW HAND ──
  const dealNewHand=()=>{
    const g=G.current;
    const [sb,bb]=bl();
    g.deck=shuffle(makeDeck());
    g.community=[];
    g.phase="preflop";
    g.pot=0;g.highBet=0;
    g.showdownResults=null;
    g.actedThisRound=new Set();

    g.players.forEach(p=>{p.folded=p.eliminated;p.allIn=false;p.bet=0;p.hand=[];});
    const actives=activeIdxs(g.players);
    // Deal 2 cards each
    actives.forEach(i=>{g.players[i].hand=[g.deck.shift(),g.deck.shift()];});
    // Blinds
    const sbSeat=nextSeat(g.players,g.dealer,activeIdxs);
    const bbSeat=nextSeat(g.players,sbSeat,activeIdxs);
    const sbAmt=Math.min(sb,g.players[sbSeat].chips);
    const bbAmt=Math.min(bb,g.players[bbSeat].chips);
    g.players[sbSeat].chips-=sbAmt;g.players[sbSeat].bet=sbAmt;
    g.players[bbSeat].chips-=bbAmt;g.players[bbSeat].bet=bbAmt;
    if(g.players[sbSeat].chips<=0){g.players[sbSeat].allIn=true;g.players[sbSeat].chips=0;}
    if(g.players[bbSeat].chips<=0){g.players[bbSeat].allIn=true;g.players[bbSeat].chips=0;}
    g.pot=sbAmt+bbAmt;
    g.highBet=bbAmt;

    addLog(`── Hand #${g.handNum+1} ── Blinds ${sb}/${bb}`);
    addLog(`${g.players[sbSeat].name} SB ${sbAmt}`);
    addLog(`${g.players[bbSeat].name} BB ${bbAmt}`);

    // First to act = seat after BB
    const firstAct=nextSeat(g.players,bbSeat,canActIdxs);
    if(firstAct===-1){runBoard();return;}
    g.current=firstAct;
    g.waitHuman=g.players[firstAct].isHuman;
    setRaiseAmt(bb*2);
    tick();

    if(!g.waitHuman){
      timerRef.current=setTimeout(()=>{
        if(!mounted.current)return;
        const act=aiDecide(G.current);
        applyAction(act.action,act.amount);
      },600+Math.random()*600);
    }
  };

  // ── INITIALIZE ──
  useEffect(()=>{
    const g=G.current;
    g.players=[{name:user.username,chips:START,folded:false,allIn:false,bet:0,hand:[],isHuman:true,eliminated:false}];
    for(let i=0;i<NUM_AI;i++) g.players.push({name:NAMES[i],chips:START,folded:false,allIn:false,bet:0,hand:[],isHuman:false,eliminated:false});
    g.handNum=0;g.dealer=0;g.blindLvl=0;g.gameOver=null;
    tick();
    timerRef.current=setTimeout(()=>{if(mounted.current)dealNewHand();},600);
  },[]);// eslint-disable-line

  // ── HUMAN ACTIONS ──
  const g=G.current;
  const humanAct=(action,amt)=>{
    if(!g.waitHuman)return;
    g.waitHuman=false;
    applyAction(action,amt);
  };

  const me=g.players.find(p=>p.isHuman);
  const toCall=me?(g.highBet-me.bet):0;
  const canCheck=toCall<=0;
  const [sb,bb]=bl();
  const aliveCnt=g.players.filter(p=>!p.eliminated).length;

  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
    <GameHeader icon="🃏" title="POKER TOURNAMENT" color={C.green}
      subtitle={`Hand #${g.handNum+1} • Blinds ${sb}/${bb} • ${aliveCnt} players`} onExit={onExit}/>

    <div style={{flex:1,display:"flex"}}>
      {/* Main area */}
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:12,gap:10}}>
        {/* Players */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
          {g.players.map((p,i)=>{
            const isCur=i===g.current&&!g.gameOver&&g.phase!=="showdown";
            return(<div key={i} style={{background:isCur?C.bg4:C.panel,
              border:`1.5px solid ${p.eliminated?C.red+"44":isCur?C.green:p.folded?C.textMuted+"44":C.border}`,
              borderRadius:5,padding:"6px 10px",minWidth:105,opacity:p.eliminated?.3:p.folded?.5:1,
              transition:"all .3s",boxShadow:isCur?"0 0 10px "+C.green+"33":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:4}}>
                <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:p.isHuman?C.green:C.text}}>{p.name}</span>
                {i===g.dealer&&<span style={{fontSize:8,background:C.gold,color:"#000",borderRadius:8,padding:"0 4px",fontWeight:900,fontFamily:F}}>D</span>}
                {p.allIn&&<span style={{fontFamily:F,fontSize:8,color:C.red,fontWeight:700,background:C.red+"22",padding:"1px 4px",borderRadius:2}}>ALL-IN</span>}
              </div>
              <div style={{fontFamily:F,fontSize:10,color:p.eliminated?C.red:C.gold,fontWeight:700}}>
                {p.eliminated?"☠ OUT":"💰 "+p.chips.toLocaleString()}</div>
              {p.bet>0&&!p.eliminated&&<div style={{fontFamily:F,fontSize:9,color:C.orange}}>Bet: {p.bet}</div>}
              <div style={{display:"flex",gap:2,marginTop:3}}>
                {p.hand.map((c,j)=>(
                  <CardView key={j} card={c} hidden={!p.isHuman&&g.phase!=="showdown"} small={true} delay={j*.1}/>
                ))}
              </div>
              {g.phase==="showdown"&&!p.eliminated&&!p.folded&&p.hand.length===2&&g.community.length>=5&&(
                <div style={{fontFamily:F,fontSize:9,color:C.cyan,marginTop:2}}>{evaluateHand([...p.hand,...g.community]).name}</div>
              )}
            </div>);
          })}
        </div>

        {/* Community + pot */}
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:F,fontSize:10,color:C.textMuted,letterSpacing:2,marginBottom:4}}>
            {g.phase==="preflop"?"PRE-FLOP":g.phase.toUpperCase()} — POT: <span style={{color:C.gold,fontWeight:700}}>{g.pot.toLocaleString()}</span>
          </div>
          <div style={{display:"flex",gap:4,justifyContent:"center",minHeight:70}}>
            {[0,1,2,3,4].map(i=>(
              <CardView key={i} card={g.community[i]} hidden={!g.community[i]} delay={i*.12}/>
            ))}
          </div>
        </div>

        {/* Human controls */}
        {g.waitHuman&&me&&!me.eliminated&&!g.gameOver&&(
          <div style={{display:"flex",gap:6,justifyContent:"center",alignItems:"center",flexWrap:"wrap",padding:8,
            background:C.bg3,borderRadius:6,border:"1px solid "+C.green+"33",animation:"fadeIn .3s ease-out"}}>
            <Btn v="red" sz="md" onClick={()=>humanAct("fold")}>Fold</Btn>
            {canCheck?<Btn v="dark" sz="md" onClick={()=>humanAct("check")}>Check</Btn>
              :<Btn v="green" sz="md" onClick={()=>humanAct("call")}>Call {toCall}</Btn>}
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <input type="range" min={Math.max(g.highBet+bb,bb*2)} max={Math.max(me.chips+me.bet,g.highBet+bb)} value={raiseAmt}
                onChange={e=>setRaiseAmt(+e.target.value)}
                style={{width:90,accentColor:C.green}}/>
              <span style={{fontFamily:F,fontSize:11,color:C.gold,minWidth:40}}>{raiseAmt}</span>
              <Btn v="gold" sz="md" onClick={()=>humanAct("raise",raiseAmt)} disabled={raiseAmt<=g.highBet}>Raise</Btn>
            </div>
            <Btn v="red" sz="sm" onClick={()=>humanAct("allin")}>ALL IN</Btn>
          </div>
        )}

        {g.gameOver&&(<div style={{textAlign:"center",padding:20,animation:"slam .5s ease-out"}}>
          <div style={{fontFamily:F2,fontSize:24,color:g.gameOver.includes(user.username)?C.gold:C.red,
            textShadow:"0 0 14px rgba(255,215,0,.4)"}}>{g.gameOver}</div>
          <Btn v="dark" sz="md" onClick={onExit} style={{marginTop:14}}>Back to Hub</Btn>
        </div>)}
      </div>

      {/* Log sidebar */}
      <div style={{width:200,borderLeft:"1px solid "+C.border,background:C.panel,display:"flex",flexDirection:"column"}}>
        <div style={{padding:7,borderBottom:"1px solid "+C.border,fontFamily:F2,color:C.green,fontSize:10,letterSpacing:2,textAlign:"center"}}>GAME LOG</div>
        <div ref={logRef} style={{flex:1,overflowY:"auto",padding:6}}>
          {log.map((l,i)=>(<div key={i} style={{marginBottom:2,fontSize:9,fontFamily:F,
            color:l.startsWith("🏆")?C.gold:l.startsWith("──")?C.cyan:C.textMuted}}>{l}</div>))}
        </div>
      </div>
    </div>
  </div>);
}
