import { images } from "../game/assets";

export default function HUD({ score, power }) {
  return (
    <div className="hud">
      <h1 className="hud-title">
        <img
          src={images.ramen.src}
          alt="ramen"
          className="hud-icon"
        />
        Eat Daiki Eeaat!
      </h1>
      <div className="hud-info">
        <p>
          Score: <span className="hud-score">{score}</span>
        </p>
        {power && <p className="hud-power">⚡ Power Mode Activated! ⚡</p>}
      </div>
    </div>
  );
}
