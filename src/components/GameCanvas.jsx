import { useEffect, useRef, useState } from "react";
import { Player } from "../game/player";
import { Ramen } from "../game/ramen";
import { Obstacle } from "../game/obstacles";
import { images } from "../game/assets";
import { Background } from "../game/Background";
import GameOverModal from "./GameOverModal";
import Intro from "./Intro";

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
  const keysRef = useRef({});
  const touchKeysRef = useRef({ left: false, right: false });
  const lastTapRef = useRef(0);

  const audioRefs = useRef({
    birthday: null,
    action: null,
    gameOver: null
  });

  useEffect(() => {
    audioRefs.current.birthday = new Audio("/assets/birthday.MP3");
    audioRefs.current.action = new Audio("/assets/naruto-action.MP3");
    audioRefs.current.gameOver = new Audio("/assets/gameover.mp3");
    Object.values(audioRefs.current).forEach(a => { if (a) a.muted = mute; });
    return () => Object.values(audioRefs.current).forEach(a => a.pause());
  }, []);

  const togglePause = () => setIsPaused(prev => !prev);
  const toggleMute = () => {
    setMute(prev => {
      const newMute = !prev;
      Object.values(audioRefs.current).forEach(a => { if (a) a.muted = newMute; });
      return newMute;
    });
  };
  const playAudio = (key, loop = false) => {
    const audio = audioRefs.current[key];
    if (!audio) return;
    audio.loop = loop;
    audio.play().catch(() => {});
  };
  const pauseAudio = (key) => {
    const audio = audioRefs.current[key];
    if (audio && !audio.paused) audio.pause();
  };

  useEffect(() => {
    const bgImg = new Image();
    bgImg.src = "/assets/gamebackground.png";
    bgImg.onload = () => setBackground(new Background(bgImg, 1));
  }, []);

  useEffect(() => {
    if (!introFinished) playAudio("birthday");
    else {
      pauseAudio("birthday");
      playAudio("action", true);
    }
  }, [introFinished]);

  useEffect(() => {
    if (gameOver || !introFinished) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const player = new Player(280, 500, 50, 7);
    let ramenList = [];
    let obstacles = [];
    let frame = 0;
    let animationFrameId;
    let ramenSpeed = 3;
    let obstacleSpeed = 4;

    const spawnItem = () => {
      const rand = Math.random();
      if (rand < 0.4) ramenList.push(new Ramen(Math.random() * 560, 0, 40, ramenSpeed, images.ramen));
      else if (rand < 0.5) ramenList.push(new Ramen(Math.random() * 560, 0, 40, ramenSpeed, images.fishcake, true));
      else if (rand < 0.75) {
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
      if (background) { background.update(canvas.width); background.draw(ctx, canvas.width, canvas.height); }
      else { ctx.fillStyle = "#cce7ff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }

      // Combine keyboard + touch
      const combinedKeys = {
        ...keysRef.current,
        ArrowLeft: keysRef.current.ArrowLeft || touchKeysRef.current.left,
        ArrowRight: keysRef.current.ArrowRight || touchKeysRef.current.right
      };

      player.move(combinedKeys, canvas.width);
      if (powerRef.current) { ctx.shadowColor = "yellow"; ctx.shadowBlur = 20; }
      player.draw(ctx);
      ctx.shadowBlur = 0;

      if (frame % 50 === 0) spawnItem();

      // Ramen collection
      ramenList.forEach((r, i) => {
        r.update(); r.draw(ctx);
        if (r.collides(player)) {
          r.collected = true; ramenList.splice(i, 1);
          const points = r.isFishcake ? 3 : 1;
          scoreRef.current += points;
          setScore(scoreRef.current);
          onScoreChange?.(scoreRef.current);

          const threshold = r.isFishcake ? 5 : 3;
          if (!powerRef.current && scoreRef.current >= threshold) {
            powerRef.current = true; setPower(true); onPowerChange?.(true);
            setTimeout(() => { powerRef.current = false; setPower(false); onPowerChange?.(false); }, r.isFishcake ? 10000 : 5000);
          }
          if (scoreRef.current % 10 === 0) { ramenSpeed += 0.5; obstacleSpeed += 0.5; }
        }
      });

      // Obstacles collision
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
      keysRef.current[e.key] = true;
      if (e.code === "Space") { e.preventDefault(); togglePause(); }
    };
    const keyUpHandler = (e) => { keysRef.current[e.key] = false; };

    const touchStartHandler = (e) => {
      const width = window.innerWidth;
      const now = new Date().getTime();

      if (now - lastTapRef.current < 300) { togglePause(); e.preventDefault(); }
      lastTapRef.current = now;

      // Detect all touches
      const left = Array.from(e.touches).some(t => t.clientX < width / 2);
      const right = Array.from(e.touches).some(t => t.clientX >= width / 2);
      touchKeysRef.current = { left, right };
    };

    const touchEndHandler = (e) => {
      const width = window.innerWidth;
      const left = Array.from(e.touches).some(t => t.clientX < width / 2);
      const right = Array.from(e.touches).some(t => t.clientX >= width / 2);
      touchKeysRef.current = { left, right };
    };

    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    canvas.addEventListener("touchstart", touchStartHandler);
    canvas.addEventListener("touchmove", touchStartHandler);
    canvas.addEventListener("touchend", touchEndHandler);

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
      canvas.removeEventListener("touchstart", touchStartHandler);
      canvas.removeEventListener("touchmove", touchStartHandler);
      canvas.removeEventListener("touchend", touchEndHandler);
    };
  }, [gameOver, isPaused, background, introFinished]);

  useEffect(() => { if (gameOver) { pauseAudio("action"); playAudio("gameOver"); } }, [gameOver]);

  const restartGame = () => {
    Object.values(audioRefs.current).forEach(a => a.pause());
    setScore(0); scoreRef.current = 0;
    setPower(false); powerRef.current = false;
    setGameOver(false); setIsPaused(false);
    setIntroFinished(false);
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={600} height={600} className="game-canvas" />

      {!introFinished && (
        <Intro mute={mute} birthdayAudioRef={audioRefs.current.birthday} onFinish={() => setIntroFinished(true)} />
      )}

      <button className="mute-btn" onClick={toggleMute}>{mute ? "Unmute" : "Mute"}</button>
      {!gameOver && introFinished && <button className="pause-btn" onClick={togglePause}>{isPaused ? "Resume" : "Pause"}</button>}
      {gameOver && <GameOverModal score={score} onRestart={restartGame} />}
    </div>
  );
}
