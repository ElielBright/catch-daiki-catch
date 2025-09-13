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

  // Play birthday audio on mount
  useEffect(() => {
    if (birthdayAudioRef.current) {
      birthdayAudioRef.current.muted = mute;
      birthdayAudioRef.current.play();
    }
  }, []);

  const next = () => {
    if (step === 0) {
      // Move to story
      setStep(1);
      if (birthdayAudioRef.current) birthdayAudioRef.current.pause(); // stop birthday audio
    } else {
      // Go to game
      onFinish(); // triggers GameCanvas to start naruto-action
    }
  };

  // Auto-advance story texts
  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setStoryIndex((prev) => {
          if (prev + 1 >= storyTexts.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 4000); // 4s per story text
      return () => clearInterval(interval);
    }
  }, [step]);

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
          <p>{storyIndex + 1 === storyTexts.length ? "Click Next to start!" : ""}</p>
          {storyIndex + 1 === storyTexts.length && <button onClick={next}>Next</button>}
        </>
      )}
    </div>
  );
}
