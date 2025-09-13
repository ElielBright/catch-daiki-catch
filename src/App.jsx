import { useState } from "react";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";
import './App.css';

export default function App() {
  const [score, setScore] = useState(0);
  const [power, setPower] = useState(false);

  return (
    <div className="app">
      <HUD score={score} power={power} />
      <GameCanvas
        onScoreChange={setScore}
        onPowerChange={setPower}
      />
            <p className="control"> On Mobile touch left or right to control movement</p>
      <p className="control"> On keyboard use left or right arrow keys to control movement</p>
    </div>
    
  );
}
