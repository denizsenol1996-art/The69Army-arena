export const C = {
  bg:"#080a08",bg2:"#0c100c",bg3:"#111611",bg4:"#182018",
  panel:"#0f140f",panelLight:"#152015",
  green:"#00ff6a",greenDark:"#00cc55",greenDim:"#00aa44",greenMuted:"#1a4a2a",
  border:"#1a3a1a",borderLight:"#2a5a2a",
  text:"#d0e8d0",textMuted:"#5a7a5a",
  gold:"#ffd700",goldDark:"#aa8800",
  red:"#ff3344",purple:"#aa44ff",blue:"#4488ff",cyan:"#00ddff",orange:"#ff8833",
  discord:"#5865F2",white:"#fff",
};

export const F = "'Rajdhani','Segoe UI',sans-serif";
export const F2 = "'Orbitron','Rajdhani',sans-serif";

export const NAMES = [
  "StormBlade","IronVex","NightHawk","PhantomAce","DarkKnight","Shadowmeld","CrimsonFang","FrostBurn",
  "Dexah","BlazeThorn","VoidWalker","LunarFox","SteelWraith","EmberKing","GhostViper","NeonRogue",
  "ThunderMaw","ArcticWolf","SilverBane","OnyxReaper","CyberPunk","PixelDemon","RiftRunner","HexBlade",
  "MoonStriker","SolarFlare","CrystalMage","IronClad","DeathBringer","WarHound","NightShade","ZeroGrav",
];

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0c100c}::-webkit-scrollbar-thumb{background:#1a3a1a;border-radius:3px}
@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes glow{0%,100%{filter:drop-shadow(0 0 6px rgba(0,255,106,.25))}50%{filter:drop-shadow(0 0 14px rgba(0,255,106,.5))}}
@keyframes pulse{0%,100%{box-shadow:0 0 10px rgba(0,255,106,.1)}50%{box-shadow:0 0 24px rgba(0,255,106,.3)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes flipIn{0%{transform:rotateY(90deg);opacity:0}100%{transform:rotateY(0);opacity:1}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@keyframes slam{0%{transform:scale(2);opacity:0}50%{transform:scale(.9)}100%{transform:scale(1);opacity:1}}
@keyframes slideR{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes blink{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes elimFlash{from{background:rgba(255,51,68,.15)}to{background:transparent}}
@keyframes winFlash{0%{background:rgba(0,255,106,.2)}50%{background:rgba(255,215,0,.2)}100%{background:rgba(0,255,106,.1)}}
@keyframes dealCard{from{opacity:0;transform:translateY(-30px) rotateY(90deg)}to{opacity:1;transform:translateY(0) rotateY(0)}}
`;

export const GAMES = [
  {id:"poker",name:"Poker Tournament",icon:"🃏",color:C.green,players:"2-8",desc:"Texas Hold'em tournament. Blind levels escalate. Last one standing wins.",tags:["Tournament","Strategy","Bluff"]},
  {id:"liars_dice",name:"Liar's Dice",icon:"🎲",color:C.orange,players:"2-8",desc:"Bluff your way to victory. Call or raise the bid — or call someone's bluff.",tags:["Bluff","Rounds","Elimination"]},
  {id:"coinflip_br",name:"Battle Royale Flip",icon:"⚡",color:C.red,players:"4-32",desc:"Mass coinflip elimination. Each round half the players die. Last survivor takes the pot.",tags:["Fast","Luck","Elimination"]},
  {id:"blind_auction",name:"Blind Auction",icon:"🔨",color:C.purple,players:"3-8",desc:"Bid blind on mystery prizes. Highest bidder wins but pays. Psychological warfare.",tags:["Strategy","Mind Games","Economy"]},
  {id:"death_roll",name:"Death Roll",icon:"💀",color:C.red,players:"2",desc:"Take turns rolling. Number shrinks each roll. First to roll a 1 loses everything.",tags:["1v1","Tension","Fast"]},
  {id:"chain_duel",name:"Chain Duel",icon:"⚔️",color:C.cyan,players:"4-16",desc:"Random 1v1 bracket. Winner absorbs loser's chips. Fight your way to the championship.",tags:["Bracket","1v1","Tournament"]},
  {id:"kings_court",name:"King's Court",icon:"👑",color:C.gold,players:"3-8",desc:"The King sets challenges. Players vote to exile. Last loyal subject wins the throne.",tags:["Social","Voting","Strategy"]},
  {id:"heist",name:"The Heist",icon:"🏴‍☠️",color:"#ff4488",players:"3-6",desc:"Cooperate or betray. Split the vault — but any player can backstab for a bigger cut.",tags:["Social","Betrayal","Strategy"]},
];
