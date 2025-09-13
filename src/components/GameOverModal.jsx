import { FaRedo, FaSkull } from "react-icons/fa";

export default function GameOverModal({ score, onRestart }) {
  return (
    <div className="gameover-overlay">
      <div className="gameover-box">
        <h2 className="gameover-title">
          <FaSkull className="gameover-icon" /> Game Over!
        </h2>
        <p className="gameover-score">
          Final Score: <span>{score}</span>
        </p>
        <button className="gameover-btn" onClick={onRestart}>
          <FaRedo /> Restart
        </button>
      </div>
    </div>
  );
}
