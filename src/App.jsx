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
      <p className="control"> Click on spacebar to pause or resume</p>
    </div>
    
  );
}
