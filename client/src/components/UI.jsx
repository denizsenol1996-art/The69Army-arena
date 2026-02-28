import { C, F, F2 } from "../constants";

export function Badge({size=50}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:`radial-gradient(circle,${C.green}22,${C.bg})`,
      border:`2px solid ${C.green}44`,display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:size*.45,fontFamily:F2,color:C.green,fontWeight:900,textShadow:`0 0 8px ${C.green}66`}}>69</div>
  );
}

export function Btn({children,onClick,v="green",sz="md",disabled,style}){
  const V = {
    green:{background:`linear-gradient(180deg,#00dd5a,#00aa44)`,borderColor:"#00ff6a",color:"#080a08"},
    dark:{background:`linear-gradient(180deg,#152015,#0f140f)`,borderColor:"#1a3a1a",color:"#00ff6a"},
    red:{background:`linear-gradient(180deg,#cc2233,#881122)`,borderColor:"#ff3344",color:"#fff"},
    discord:{background:`linear-gradient(180deg,#5865F2,#4752C4)`,borderColor:"#7289DA",color:"#fff"},
    gold:{background:`linear-gradient(180deg,#ffd700,#aa8800)`,borderColor:"#ffe033",color:"#1a1200"},
    ghost:{background:"transparent",borderColor:"#1a3a1a",color:"#5a7a5a"},
    purple:{background:`linear-gradient(180deg,#aa44ff,#7722cc)`,borderColor:"#bb66ff",color:"#fff"},
    cyan:{background:`linear-gradient(180deg,#00ccdd,#0088aa)`,borderColor:"#00eeff",color:"#001a1d"},
    orange:{background:`linear-gradient(180deg,#ff8833,#cc5500)`,borderColor:"#ffaa55",color:"#1a0a00"},
  };
  const S = {sm:{padding:"4px 10px",fontSize:10},md:{padding:"8px 16px",fontSize:12},lg:{padding:"11px 26px",fontSize:14}};
  const vr = V[v]||V.green, si = S[sz]||S.md;
  return(
    <button disabled={disabled} onClick={disabled?undefined:onClick}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.filter="brightness(1.2)";}}
      onMouseLeave={e=>{e.currentTarget.style.filter="brightness(1)";}}
      style={{fontFamily:F,fontWeight:700,cursor:disabled?"not-allowed":"pointer",border:"1.5px solid "+vr.borderColor,
        ...vr,...si,letterSpacing:1.2,textTransform:"uppercase",transition:"all .15s",opacity:disabled?.4:1,borderRadius:4,...style}}>
      {children}
    </button>
  );
}

export function Panel({children,title,accent,style}){
  return(
    <div style={{background:C.panel,border:"1px solid "+C.border,borderRadius:6,
      boxShadow:"0 4px 16px rgba(0,0,0,.35)",position:"relative",overflow:"hidden",...style}}>
      {title && <div style={{padding:"8px 14px",borderBottom:"1px solid "+C.border,fontFamily:F2,color:accent||C.green,fontSize:12,fontWeight:600,
        letterSpacing:2,textTransform:"uppercase",textShadow:"0 0 6px "+(accent||C.green)+"44",
        background:"linear-gradient(90deg,"+(accent||C.green)+"08,transparent)"}}>{title}</div>}
      {children}
    </div>
  );
}

export function Inp({label,type="text",value,onChange,placeholder,style}){
  return(
    <div style={{marginBottom:11,...style}}>
      {label && <label style={{display:"block",fontFamily:F,color:C.green,fontSize:10,marginBottom:3,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"7px 11px",background:C.bg,border:"1px solid "+C.border,color:C.text,fontFamily:F,fontSize:13,fontWeight:500,outline:"none",borderRadius:3}}/>
    </div>
  );
}

export function Header({user,wallet,go}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 14px",borderBottom:"1px solid "+C.border,background:C.panel}}>
      <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>go("hub")}>
        <Badge size={24}/><span style={{fontFamily:F2,color:C.green,fontSize:13,fontWeight:700}}>THE69ARMY</span>
      </div>
      {user && <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{fontFamily:F,fontSize:11,color:C.gold,background:C.bg,padding:"2px 8px",borderRadius:3,border:"1px solid "+C.goldDark,fontWeight:700}}>💰 {(wallet||0).toLocaleString()}</div>
        <span style={{fontFamily:F,color:C.text,fontSize:11,fontWeight:600}}>{user.username}</span>
        <Btn v="ghost" sz="sm" onClick={()=>go("landing")}>Out</Btn>
      </div>}
    </div>
  );
}

export function GameHeader({icon,title,color,subtitle,onExit}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 14px",borderBottom:"1px solid "+C.border,background:C.panel}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <Badge size={22}/><span style={{fontSize:20}}>{icon}</span>
        <span style={{fontFamily:F2,color:color||C.green,fontSize:14}}>{title}</span>
        {subtitle && <span style={{fontFamily:F,fontSize:10,color:C.textMuted}}>{subtitle}</span>}
      </div>
      <Btn v="red" sz="sm" onClick={onExit}>Exit</Btn>
    </div>
  );
}
