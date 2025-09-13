import { useEffect, useState } from "react";
import "./Intro.css";

export default function Intro({ onFinish, mute, birthdayAudioRef }) {
  const [step, setStep] = useState(0); // 0 = birthday, 1 = story
  const [storyIndex, setStoryIndex] = useState(0);

  const storyTexts = [
    "The world is in danger...",
    "Daiki must eat Ramen and Fishcake to gain strength!",
    "Only then can he save everyone..."
  ];

  const next = () => {
    if (step === 0) {
      // User clicked, safe to play birthday song if not muted
      if (birthdayAudioRef.current) {
        birthdayAudioRef.current.muted = mute;
        birthdayAudioRef.current.play().catch(() => {});
      }
      setStep(1);
      if (birthdayAudioRef.current) birthdayAudioRef.current.pause();
    } else if (step === 1 && storyIndex + 1 < storyTexts.length) {
      // Advance story manually
      setStoryIndex(storyIndex + 1);
    } else {
      // End intro, start game
      onFinish();
    }
  };

  // Auto-advance story
  useEffect(() => {
    if (step === 1 && storyIndex < storyTexts.length - 1) {
      const interval = setInterval(() => setStoryIndex((prev) => prev + 1), 4000);
      return () => clearInterval(interval);
    }
  }, [step, storyIndex, storyTexts.length]);

  return (
    <div className="story-overlay">
      {step === 0 ? (
        <>
          <h1>Happy Birthday, Daniel! 🎉</h1>
          <p>Wishing you lots of joy, success, and fun adventures! 🥳</p>
          <button onClick={next}>Next</button>
        </>
      ) : (
        <>
          <h1>{storyTexts[storyIndex]}</h1>
          {storyIndex + 1 === storyTexts.length && <button onClick={next}>Next</button>}
        </>
      )}
    </div>
  );
}
