import { useState, useEffect } from 'react';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:,.<>?";

export function useScramble(targetText: string, speed: number = 30) {
  const [displayText, setDisplayText] = useState(targetText);

  useEffect(() => {
    let iterations = 0;
    
    const interval = setInterval(() => {
      setDisplayText((prev) => 
        targetText
          .split("")
          .map((char, index) => {
            if (index < iterations) {
              return targetText[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iterations >= targetText.length) {
        clearInterval(interval);
      }

      iterations += 1 / 3; // Controls how fast it resolves
    }, speed);

    return () => clearInterval(interval);
  }, [targetText, speed]);

  return displayText;
}