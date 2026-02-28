import { useState } from "react";
import { CSS } from "./constants";
import { Landing, Auth } from "./components/Screens";
import { GameHub, GameLobby } from "./components/GameHub";
import {
  PokerGame, LiarsDice, BattleRoyaleCF, BlindAuction,
  DeathRoll, ChainDuel, KingsCourt, TheHeist,
} from "./games";

const GAME_MAP = {
  poker: PokerGame,
  liars_dice: LiarsDice,
  coinflip_br: BattleRoyaleCF,
  blind_auction: BlindAuction,
  death_roll: DeathRoll,
  chain_duel: ChainDuel,
  kings_court: KingsCourt,
  heist: TheHeist,
};

export default function App(){
  const [scr, setScr] = useState("landing");
  const [user, setUser] = useState(null);
  const [wallet] = useState(5000);
  const [game, setGame] = useState(null);
  const [gamePhase, setGamePhase] = useState("lobby");

  const login = u => { setUser(u); setScr("hub"); };
  const playGame = id => { setGame(id); setGamePhase("lobby"); setScr("game"); };
  const startGame = () => setGamePhase("playing");
  const exitGame = () => { setGame(null); setGamePhase("lobby"); setScr("hub"); };
  const goNav = s => { if(s==="landing") setUser(null); if(s==="hub"&&!user) return; setScr(s); };

  const GameComponent = game ? GAME_MAP[game] : null;

  return(
    <div>
      <style>{CSS}</style>
      {scr==="landing" && <Landing go={goNav}/>}
      {scr==="login" && <Auth mode="login" go={goNav} onLogin={login}/>}
      {scr==="register" && <Auth mode="register" go={goNav} onLogin={login}/>}
      {scr==="hub" && <GameHub user={user} wallet={wallet} go={goNav} onPlay={playGame}/>}
      {scr==="game" && game && (<>
        {gamePhase==="lobby" && <GameLobby game={game} user={user} onStart={startGame} onExit={exitGame}/>}
        {gamePhase==="playing" && GameComponent && <GameComponent user={user} onExit={exitGame}/>}
      </>)}
    </div>
  );
}
