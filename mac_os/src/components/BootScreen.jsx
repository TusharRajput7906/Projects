import React, { useEffect, useState } from "react";
import "./BootScreen.scss";

const words = [
  "Hello",
  "नमस्ते",
];

const BootScreen = ({ onFinish }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setIndex(prev => (prev + 1) % words.length);
    }, 2500);

    const finishTimeout = setTimeout(() => {
      onFinish();
    }, 5000);

    return () => {
      clearInterval(wordInterval);
      clearTimeout(finishTimeout);
    };
  }, [onFinish]);

  return (
    <div className="boot-screen">
      <h1 className="hello-text">{words[index]}</h1>
    </div>
  );
};

export default BootScreen;
