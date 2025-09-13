import { useEffect, useRef, useState } from "react";
import { Player } from "../game/player";
import { Ramen } from "../game/ramen";
import { Obstacle } from "../game/obstacles";
import { images } from "../game/assets";
import { Background } from "../game/Background";
import GameOverModal from "./GameOverModal";
import Intro from "./Intro";
import gameBgImgSrc from "../assets/gamebackground.png";
import birthdaySoundSrc from "../assets/birthday.MP3";
import narutoActionSrc from "../assets/naruto-action.MP3";
import gameOverSoundSrc from "../assets/gameover.mp3";

export default function GameCanvas({ onScoreChange, onPowerChange }) {
  const canvasRef = useRef(null);

  const [score, setScore] = useState(0);
  const [power, setPower] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [background, setBackground] = useState(null);
  const [mute, setMute] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  const scoreRef = useRef(0);
  const powerRef = useRef(false);

  const birthdayAudioRef = useRef(new Audio(birthdaySoundSrc));
  const actionAudioRef = useRef(null);
  const gameOverAudioRef = useRef(null);

  const togglePause = () => setIsPaused((prev) => !prev);

  const toggleMute = () => {
    setMute((prev) => !prev);
    [birthdayAudioRef, actionAudioRef, gameOverAudioRef].forEach(ref => {
      if (ref.current) ref.current.muted = !ref.current.muted;
    });
  };

  // Load background
  useEffect(() => {
    const bgImg = new Image();
    bgImg.src = gameBgImgSrc;
    bgImg.onload = () => setBackground(new Background(bgImg, 1));
  }, []);

  // Start action audio after intro finishes
  useEffect(() => {
    if (introFinished) {
      if (birthdayAudioRef.current) birthdayAudioRef.current.pause();
      actionAudioRef.current = new Audio(narutoActionSrc);
      actionAudioRef.current.loop = true;
      actionAudioRef.current.muted = mute;
      actionAudioRef.current.play();
    }
  }, [introFinished, mute]);

  // Main game loop
  useEffect(() => {
    if (gameOver || !introFinished) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const player = new Player(280, 500, 50, 7);
    let ramenList = [];
    let obstacles = [];
    let keys = {};
    let frame = 0;
    let animationFrameId;
    let ramenSpeed = 3;
    let obstacleSpeed = 4;

    const spawnItem = () => {
      const random = Math.random();
      if (random < 0.4) ramenList.push(new Ramen(Math.random() * 560, 0, 40, ramenSpeed, images.ramen));
      else if (random < 0.5) ramenList.push(new Ramen(Math.random() * 560, 0, 40, ramenSpeed, images.fishcake, true));
      else if (random < 0.75) {
        const choices = [images.kunai, images.fireball, images.leonardo, images.star];
        obstacles.push(new Obstacle(Math.random() * 560, 0, 40, obstacleSpeed, choices[Math.floor(Math.random() * choices.length)]));
      } else {
        obstacles.push(new Obstacle(Math.random() * 560, 0, 40, obstacleSpeed + 0.5, images.sword, "zigzag"));
      }
    };

    const gameLoop = () => {
      if (isPaused) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "24px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      if (background) {
        background.update(canvas.width);
        background.draw(ctx, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#cce7ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Player
      player.move(keys, canvas.width);
      if (powerRef.current) { ctx.shadowColor = "yellow"; ctx.shadowBlur = 20; }
      player.draw(ctx);
      ctx.shadowBlur = 0;

      // Spawn items
      if (frame % 50 === 0) spawnItem();

      // Ramen
      ramenList.forEach((r, i) => {
        r.update(); r.draw(ctx);
        if (r.collides(player)) {
          r.collected = true; ramenList.splice(i, 1);
          const points = r.isFishcake ? 3 : 1;
          scoreRef.current += points;
          setScore(scoreRef.current);
          onScoreChange?.(scoreRef.current);

          // Only activate power boost after reaching a threshold
          const threshold = r.isFishcake ? 5 : 3; // example thresholds
          if (!powerRef.current && scoreRef.current >= threshold) {
            powerRef.current = true; setPower(true); onPowerChange?.(true);
            setTimeout(() => { powerRef.current = false; setPower(false); onPowerChange?.(false); }, r.isFishcake ? 10000 : 5000);
          }

          if (scoreRef.current % 10 === 0) { ramenSpeed += 0.5; obstacleSpeed += 0.5; }
        }
      });

      // Obstacles
      obstacles.forEach((o, i) => {
        o.update(); o.draw(ctx);
        if (o.collides(player)) {
          if (!powerRef.current) setGameOver(true);
          else obstacles.splice(i, 1);
        }
      });

      frame++;
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const keyDownHandler = (e) => {
      keys[e.key] = true;
      if (e.code === "Space") { e.preventDefault(); togglePause(); }
    };
    const keyUpHandler = (e) => (keys[e.key] = false);

    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
      if (actionAudioRef.current) actionAudioRef.current.pause();
    };
  }, [gameOver, isPaused, background, introFinished, mute]);

  // Game over music
  useEffect(() => {
    if (gameOver) {
      if (actionAudioRef.current) actionAudioRef.current.pause();
      gameOverAudioRef.current = new Audio(gameOverSoundSrc);
      gameOverAudioRef.current.muted = mute;
      gameOverAudioRef.current.play();
    }
  }, [gameOver, mute]);

  const restartGame = () => {
    // Stop all audios
    if (gameOverAudioRef.current) gameOverAudioRef.current.pause();
    if (actionAudioRef.current) actionAudioRef.current.pause();
    setScore(0); scoreRef.current = 0;
    setPower(false); powerRef.current = false;
    setGameOver(false); setIsPaused(false);
    setIntroFinished(false);
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={600} height={600} className="game-canvas" />

      {!introFinished && (
        <Intro
          mute={mute}
          birthdayAudioRef={birthdayAudioRef}
          onFinish={() => setIntroFinished(true)}
        />
      )}

      <button className="mute-btn" onClick={toggleMute}>{mute ? "Unmute" : "Mute"}</button>

      {!gameOver && introFinished && (
        <button className="pause-btn" onClick={togglePause}>
          {isPaused ? "Resume" : "Pause"}
        </button>
      )}

      {gameOver && <GameOverModal score={score} onRestart={restartGame} />}
    </div>
  );
}
