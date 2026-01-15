import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

function App() {
  const [currentBox, setCurrentBox] = useState(1);
  const [activeBox, setActiveBox] = useState(null);
  const [musicStarted, setMusicStarted] = useState(false);
  const [username, setUsername] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [confettiElements, setConfettiElements] = useState([]);
  const bgMusicRef = useRef(null);
  const currentVideoRef = useRef(null);

  // Pinch zoom state
  const [initialDistance, setInitialDistance] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [imgElement, setImgElement] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem("name") || "Sananda";
    setUsername(storedName);
  }, []);

  const startMusic = () => {
    if (!musicStarted && bgMusicRef.current) {
      bgMusicRef.current.play();
      setMusicStarted(true);
    }
  };

  const openBox = (num) => {
    if (num !== currentBox) return;

    startMusic();
    setActiveBox(num);
    setShowOverlay(true);
  };

  const closeBox = () => {
    setShowOverlay(false);
    createConfetti();

    if (currentVideoRef.current && !currentVideoRef.current.ended) {
      if (bgMusicRef.current) bgMusicRef.current.play();
      currentVideoRef.current = null;
    }

    setCurrentBox(currentBox + 1);
    setActiveBox(null);
  };

  const createConfetti = () => {
    const newConfetti = [];
    for (let i = 0; i < 35; i++) {
      newConfetti.push({
        id: i,
        left: Math.random() * 100 + "vw",
        background: `hsl(${Math.random() * 360},100%,50%)`,
        animationDuration: (Math.random() * 2 + 2) + "s"
      });
    }
    setConfettiElements(newConfetti);

    setTimeout(() => {
      setConfettiElements([]);
    }, 4000);
  };

  const toggleZoom = (event) => {
    event.stopPropagation();
    event.target.classList.toggle('zoomed');
  };

  // Touch event handlers for pinch zoom
  const handleTouchStart = useCallback((e) => {
    if (!e.target.classList.contains("pinch-img")) return;
    setImgElement(e.target);

    if (e.touches.length === 2) {
      setInitialDistance(getDistance(e.touches[0], e.touches[1]));
    }

    if (e.touches.length === 1 && currentScale > 1) {
      setStartX(e.touches[0].clientX - translateX);
      setStartY(e.touches[0].clientY - translateY);
    }
  }, [currentScale, translateX, translateY]);

  const handleTouchMove = useCallback((e) => {
    if (!imgElement) return;

    if (e.touches.length === 2) {
      e.preventDefault();
      let newDistance = getDistance(e.touches[0], e.touches[1]);
      let scaleChange = newDistance / initialDistance;
      let newScale = Math.min(Math.max(scaleChange, 1), 3);
      setCurrentScale(newScale);

      imgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${newScale})`;
    }

    if (e.touches.length === 1 && currentScale > 1) {
      e.preventDefault();
      let newTranslateX = e.touches[0].clientX - startX;
      let newTranslateY = e.touches[0].clientY - startY;
      setTranslateX(newTranslateX);
      setTranslateY(newTranslateY);

      imgElement.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px) scale(${currentScale})`;
    }
  }, [imgElement, initialDistance, translateX, translateY, currentScale, startX, startY]);

  const handleTouchEnd = useCallback(() => {
    if (currentScale <= 1) {
      setTranslateX(0);
      setTranslateY(0);
      setCurrentScale(1);
    }
    setImgElement(null);
  }, [currentScale]);

  const getDistance = (t1, t2) => {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const renderBoxContent = (num) => {
    if (num === 1 || num === 3 || num === 6) {
      let imagePath = '';
      if (num === 1) imagePath = '/box/1.jpg';
      if (num === 3) imagePath = '/box/3.png';
      if (num === 6) imagePath = '/box/6.jpg';

      return (
        <div>
          <div>Pupu Mota Kutu Lutu Happy Birthday 🎁</div>
          <img src={imagePath} className="pinch-img" onClick={toggleZoom} alt={`Box ${num}`} />
          <button className="next-btn" onClick={(e) => { e.stopPropagation(); closeBox(); }}>Continue</button>
        </div>
      );
    } else if (num === 4) {
      return (
        <div>
          <div>🎥 It's Your Video</div>
          <video
            ref={currentVideoRef}
            src="/box/4.mp4"
            controls
            autoPlay
            onPlay={() => bgMusicRef.current && bgMusicRef.current.pause()}
            onEnded={() => bgMusicRef.current && bgMusicRef.current.play()}
          />
          <button className="next-btn" onClick={(e) => { e.stopPropagation(); closeBox(); }}>Continue</button>
        </div>
      );
    } else {
      return (
        <div>
          <div>🎉 {num}</div>
          <div className="big-text">You mean a lot to me ❤️</div>
          <button className="next-btn" onClick={(e) => { e.stopPropagation(); closeBox(); }}>Continue</button>
        </div>
      );
    }
  };

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="App" onClick={startMusic}>
      <audio ref={bgMusicRef} loop>
        <source src="/music/birthday-music.mp3" type="audio/mpeg" />
      </audio>

      <h2 className="birthday-text">
        Happy Birthday <span id="username">{username}</span>
      </h2>

      <p className="instruction-text">
        Open surprise Box one by one
      </p>

      <div className="grid">
        {[1,2,3,4,5,6,7,8,9].map(num => (
          <div
            key={num}
            className={`box ${num === currentBox ? 'active' : ''} ${activeBox === num ? 'expand' : ''}`}
            onClick={() => openBox(num)}
          >
            {activeBox === num ? renderBoxContent(num) : num}
          </div>
        ))}
      </div>

      <div className={`overlay ${showOverlay ? '' : 'hidden'}`}></div>

      {confettiElements.map(confetti => (
        <div
          key={confetti.id}
          className="confetti"
          style={{
            left: confetti.left,
            background: confetti.background,
            animationDuration: confetti.animationDuration
          }}
        />
      ))}
    </div>
  );
}

export default App;
