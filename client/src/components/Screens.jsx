import { useState } from "react";
import { C, F, F2, GAMES } from "../constants";
import { Badge, Btn, Panel, Inp } from "./UI";

export function Landing({go}){
  return(
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 50% 30%,rgba(0,255,106,.04),transparent 55%),${C.bg}`,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,opacity:.03,backgroundImage:"linear-gradient(rgba(0,255,106,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,106,.3) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
      <div style={{animation:"float 3s ease-in-out infinite",marginBottom:10,filter:"drop-shadow(0 0 20px rgba(0,255,106,.4))"}}><Badge size={140}/></div>
      <h1 style={{fontFamily:F2,fontSize:"clamp(26px,5vw,42px)",color:C.green,fontWeight:900,textShadow:"0 0 18px rgba(0,255,106,.35)",letterSpacing:4}}>THE69ARMY</h1>
      <div style={{fontFamily:F,fontSize:"clamp(11px,2vw,15px)",color:C.greenDim,letterSpacing:5,textTransform:"uppercase",marginTop:3,fontWeight:600}}>GAMING ARENA</div>
      <div style={{display:"flex",gap:8,margin:"22px 0",flexWrap:"wrap",justifyContent:"center"}}>
        {GAMES.slice(0,5).map((g,i)=>(<div key={i} style={{fontSize:24,animation:`fadeIn .5s ease-out ${i*.1}s both`}}>{g.icon}</div>))}
      </div>
      <div style={{width:180,height:1,background:`linear-gradient(90deg,transparent,${C.green},transparent)`,margin:"4px 0 20px",opacity:.4}}/>
      <div style={{display:"flex",flexDirection:"column",gap:9,width:"100%",maxWidth:280}}>
        <Btn v="green" sz="lg" onClick={()=>go("login")} style={{width:"100%",animation:"pulse 2s ease-in-out infinite"}}>Enter the Arena</Btn>
        <Btn v="dark" sz="md" onClick={()=>go("register")} style={{width:"100%"}}>Create Account</Btn>
      </div>
      <div style={{marginTop:28,fontFamily:F,fontSize:9,color:C.textMuted,letterSpacing:2}}>POKER • DICE • COINFLIP • AUCTIONS • DUELS</div>
    </div>
  );
}

export function Auth({mode,go,onLogin}){
  const[u,setU]=useState("");
  const[p,setP]=useState("");
  const[p2,setP2]=useState("");
  const[err,setErr]=useState("");
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:C.bg}}>
      <Panel title={mode==="login"?"LOGIN":"CREATE ACCOUNT"} accent={C.green} style={{width:"100%",maxWidth:340,animation:"fadeIn .5s ease-out"}}>
        <div style={{padding:18}}>
          <div style={{textAlign:"center",marginBottom:14}}><Badge size={56}/></div>
          <Inp label="Username" value={u} onChange={setU} placeholder="Name..."/>
          <Inp label="Password" type="password" value={p} onChange={setP} placeholder="Password..."/>
          {mode==="register" && <Inp label="Confirm" type="password" value={p2} onChange={setP2} placeholder="Confirm..."/>}
          {err && <div style={{color:C.red,fontSize:11,fontFamily:F,textAlign:"center",marginBottom:8,padding:4,background:"rgba(255,51,68,.08)",border:"1px solid rgba(255,51,68,.2)",borderRadius:3}}>{err}</div>}
          <Btn v="green" sz="lg" onClick={()=>{
            if(!u||!p){setErr("Fill all fields!");return;}
            if(mode==="register"&&p!==p2){setErr("No match!");return;}
            onLogin({username:u});
          }} style={{width:"100%",marginBottom:8}}>{mode==="login"?"Login":"Register"}</Btn>
          <div style={{textAlign:"center"}}><span onClick={()=>go(mode==="login"?"register":"login")} style={{color:C.greenDim,fontSize:11,fontFamily:F,cursor:"pointer",textDecoration:"underline"}}>{mode==="login"?"Need account?":"Already registered?"}</span></div>
          <div style={{textAlign:"center",marginTop:8}}><span onClick={()=>go("landing")} style={{color:C.textMuted,fontSize:10,fontFamily:F,cursor:"pointer"}}>← Back</span></div>
        </div>
      </Panel>
    </div>
  );
}
