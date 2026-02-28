import { useState } from "react";
import { C, F, F2, GAMES, NAMES } from "../constants";
import { Badge, Btn, Panel, Inp, Header } from "./UI";

export function GameHub({user,wallet,go,onPlay}){
  const[tab,setTab]=useState("games");
  const[depositAmt,setDepositAmt]=useState("1000");
  const[depositSent,setDepositSent]=useState(false);
  const[showDep,setShowDep]=useState(false);

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
      <Header user={user} wallet={wallet} go={go}/>
      <div style={{display:"flex",gap:1,padding:"0 14px",background:C.bg2,borderBottom:"1px solid "+C.border,flexWrap:"wrap"}}>
        {[{id:"games",l:"🎮 Games"},{id:"wallet",l:"💰 Wallet"},{id:"discord",l:"🤖 Discord"},{id:"lb",l:"📊 Rankings"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{fontFamily:F,fontSize:11,fontWeight:700,padding:"8px 16px",cursor:"pointer",
            background:tab===t.id?C.panel:C.bg2,border:"none",borderBottom:tab===t.id?"2px solid "+C.green:"2px solid transparent",
            color:tab===t.id?C.green:C.textMuted,letterSpacing:1,textTransform:"uppercase",transition:"all .15s"}}>{t.l}</button>
        ))}
      </div>
      <div style={{flex:1,padding:14,overflowY:"auto"}}>
        {tab==="games" && <GamesTab onPlay={onPlay}/>}
        {tab==="wallet" && <WalletTab wallet={wallet} depositAmt={depositAmt} setDepositAmt={setDepositAmt} depositSent={depositSent} setDepositSent={setDepositSent} showDep={showDep} setShowDep={setShowDep}/>}
        {tab==="discord" && <DiscordTab/>}
        {tab==="lb" && <LeaderboardTab/>}
      </div>
    </div>
  );
}

function GamesTab({onPlay}){
  return(
    <div style={{maxWidth:900,margin:"0 auto"}}>
      <div style={{fontFamily:F2,fontSize:16,color:C.green,marginBottom:14}}>CHOOSE YOUR BATTLE</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
        {GAMES.map((g,i)=>(
          <div key={g.id} onClick={()=>onPlay(g.id)} style={{background:C.panel,border:"1.5px solid "+C.border,borderRadius:6,padding:14,cursor:"pointer",
            transition:"all .2s",animation:`fadeIn .4s ease-out ${i*.06}s both`,position:"relative",overflow:"hidden"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=g.color;e.currentTarget.style.boxShadow="0 0 16px "+g.color+"22";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="none";}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:26}}>{g.icon}</span>
              <div><div style={{fontFamily:F2,fontSize:13,fontWeight:700,color:g.color}}>{g.name}</div>
                <div style={{fontFamily:F,fontSize:10,color:C.textMuted}}>{g.players} players</div></div>
            </div>
            <div style={{fontFamily:F,fontSize:11,color:C.text,lineHeight:1.5,marginBottom:8}}>{g.desc}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {g.tags.map(t=>(<span key={t} style={{fontFamily:F,fontSize:9,color:g.color,background:g.color+"12",border:"1px solid "+g.color+"33",
                borderRadius:3,padding:"1px 6px",fontWeight:600}}>{t}</span>))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletTab({wallet,depositAmt,setDepositAmt,depositSent,setDepositSent,showDep,setShowDep}){
  return(
    <div style={{maxWidth:480,margin:"0 auto",animation:"fadeIn .3s ease-out"}}>
      <Panel title="💰 WALLET"><div style={{padding:18}}>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{fontFamily:F2,fontSize:34,fontWeight:900,color:C.gold,textShadow:"0 0 10px rgba(255,215,0,.25)"}}>{wallet.toLocaleString()}</div>
          <div style={{fontFamily:F,fontSize:10,color:C.textMuted,letterSpacing:2}}>AVAILABLE COINS</div>
        </div>
        {!showDep ? (
          <div style={{display:"flex",gap:8}}>
            <Btn v="green" sz="md" onClick={()=>setShowDep(true)} style={{flex:1}}>💰 Deposit</Btn>
            <Btn v="dark" sz="md" style={{flex:1}}>📤 Withdraw</Btn>
          </div>
        ) : depositSent ? (
          <div style={{textAlign:"center",padding:14}}>
            <div style={{fontSize:30,marginBottom:6}}>✅</div>
            <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.green}}>Ticket Created!</div>
            <Btn v="dark" sz="sm" onClick={()=>{setShowDep(false);setDepositSent(false);}} style={{marginTop:10}}>Done</Btn>
          </div>
        ) : (
          <div style={{marginTop:8}}>
            <Inp label="Amount" type="number" value={depositAmt} onChange={setDepositAmt}/>
            <div style={{display:"flex",gap:4,marginBottom:10}}>
              {[500,1000,2500,5000].map(a=>(<button key={a} onClick={()=>setDepositAmt(String(a))} style={{flex:1,padding:"5px",
                background:depositAmt===String(a)?C.greenMuted:C.bg,border:"1px solid "+(depositAmt===String(a)?C.green:C.border),
                borderRadius:3,color:depositAmt===String(a)?C.green:C.textMuted,fontFamily:F,fontSize:10,fontWeight:700,cursor:"pointer"}}>{a.toLocaleString()}</button>))}
            </div>
            <div style={{display:"flex",gap:6}}>
              <Btn v="ghost" sz="md" onClick={()=>setShowDep(false)} style={{flex:1}}>Cancel</Btn>
              <Btn v="discord" sz="md" onClick={()=>setDepositSent(true)} style={{flex:2}}>🎫 Discord Ticket</Btn>
            </div>
          </div>
        )}
      </div></Panel>
    </div>
  );
}

function DiscordTab(){
  return(
    <div style={{maxWidth:480,margin:"0 auto",animation:"fadeIn .3s ease-out"}}>
      <Panel title="🤖 DISCORD BOT"><div style={{padding:18}}>
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{width:50,height:50,borderRadius:"50%",background:C.discord,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",fontSize:24}}>🤖</div>
          <div style={{fontFamily:F2,fontSize:14,color:C.discord}}>The69Army Bot</div>
        </div>
        {[{c:"!deposit [amt]",d:"Create deposit ticket",i:"💰"},{c:"!withdraw [amt]",d:"Request withdrawal",i:"📤"},
          {c:"!balance",d:"Check wallet",i:"💳"},{c:"!host [game]",d:"Create a game from Discord",i:"🏆"},
          {c:"!join [code]",d:"Join a game",i:"🃏"},{c:"!leaderboard",d:"View rankings",i:"📊"},
          {c:"!stats [player]",d:"Player stats",i:"📈"},{c:"!duel [player] [amount]",d:"Challenge someone",i:"⚔️"},
        ].map((c,i)=>(
          <div key={i} style={{display:"flex",gap:8,padding:"8px 10px",background:C.bg,border:"1px solid "+C.border,borderRadius:4,marginBottom:4}}>
            <span style={{fontSize:15}}>{c.i}</span>
            <div><div style={{fontFamily:"monospace",fontSize:11,color:C.green,fontWeight:700}}>{c.c}</div>
              <div style={{fontFamily:F,fontSize:10,color:C.textMuted}}>{c.d}</div></div>
          </div>))}
      </div></Panel>
    </div>
  );
}

function LeaderboardTab(){
  return(
    <div style={{maxWidth:480,margin:"0 auto",animation:"fadeIn .3s ease-out"}}>
      <Panel title="📊 ALL-TIME RANKINGS"><div style={{padding:14}}>
        {[{n:"Dexah",w:42,e:12800,s:"🥇"},{n:"DarkKnight",w:38,e:11200,s:"🥈"},{n:"PhantomAce",w:35,e:9800,s:"🥉"},
          {n:"StormBlade",w:29,e:8400,s:"#4"},{n:"IronVex",w:24,e:7200,s:"#5"},{n:"Shadowmeld",w:21,e:6100,s:"#6"},
          {n:"CrimsonFang",w:18,e:5400,s:"#7"},{n:"FrostBurn",w:15,e:4800,s:"#8"}].map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderBottom:"1px solid "+C.bg3,
            background:i===0?"rgba(0,255,106,.04)":"transparent",borderRadius:i<3?4:0,animation:`slideR .4s ease-out ${i*.05}s both`}}>
            <span style={{fontFamily:F2,fontSize:i<3?16:12,minWidth:28,textAlign:"center",color:i===0?C.gold:i===1?"#c0c0c0":i===2?"#cd7f32":C.textMuted}}>{p.s}</span>
            <div style={{flex:1}}><div style={{fontFamily:F,fontSize:12,fontWeight:700,color:i===0?C.green:C.text}}>{p.n}</div>
              <div style={{fontFamily:F,fontSize:10,color:C.textMuted}}>{p.w} wins</div></div>
            <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:C.gold}}>{p.e.toLocaleString()}</div>
          </div>))}
      </div></Panel>
    </div>
  );
}

export function GameLobby({game,user,onStart,onExit}){
  const g = GAMES.find(x=>x.id===game)||GAMES[0];
  const[players]=useState(()=>[user.username,...NAMES.slice(0,parseInt(g.players.split("-")[1]||6)-1).slice(0,Math.floor(Math.random()*4)+2)]);
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:C.bg}}>
      <Panel title={g.icon+" "+g.name} accent={g.color} style={{width:"100%",maxWidth:440,animation:"fadeIn .5s ease-out"}}>
        <div style={{padding:18}}>
          <div style={{textAlign:"center",marginBottom:12}}><Badge size={56}/></div>
          <div style={{fontFamily:F,fontSize:12,color:C.text,lineHeight:1.5,marginBottom:12}}>{g.desc}</div>
          <div style={{display:"flex",gap:4,marginBottom:14}}>
            {g.tags.map(t=>(<span key={t} style={{fontFamily:F,fontSize:9,color:g.color,background:g.color+"12",border:"1px solid "+g.color+"33",borderRadius:3,padding:"1px 6px",fontWeight:600}}>{t}</span>))}
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:F,fontSize:10,color:C.green,letterSpacing:1,marginBottom:6}}>PLAYERS ({players.length})</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {players.map((p,i)=>(<div key={i} style={{background:C.bg3,border:"1px solid "+(p===user.username?C.green:C.border),borderRadius:3,
                padding:"3px 8px",fontFamily:F,fontSize:10,fontWeight:600,color:p===user.username?C.green:C.text}}>{p}</div>))}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn v="dark" sz="md" onClick={onExit} style={{flex:1}}>← Back</Btn>
            <Btn v="green" sz="lg" onClick={onStart} style={{flex:2}}>⚔ START GAME</Btn>
          </div>
        </div>
      </Panel>
    </div>
  );
}
