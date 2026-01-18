import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginDOB, setLoginDOB] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentBox, setCurrentBox] = useState(1);
  const [activeBox, setActiveBox] = useState(null);
  const [musicStarted, setMusicStarted] = useState(false);
  const [username, setUsername] = useState('Sananda');
  const [showOverlay, setShowOverlay] = useState(false);
  const [confettiElements, setConfettiElements] = useState([]);
  const [showIntro, setShowIntro] = useState(true);

  const bgMusicRef = useRef(null);
  const currentVideoRef = useRef(null);

  // Pinch zoom states
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
      bgMusicRef.current && bgMusicRef.current.play();
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
    setTimeout(() => setConfettiElements([]), 4000);
  };

  // ---------- PINCH ZOOM ----------
  const getDistance = (t1, t2) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

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
      const newDistance = getDistance(e.touches[0], e.touches[1]);
      const newScale = Math.min(Math.max(newDistance / initialDistance, 1), 3);
      setCurrentScale(newScale);
      imgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${newScale})`;
    }

    if (e.touches.length === 1 && currentScale > 1) {
      e.preventDefault();
      const x = e.touches[0].clientX - startX;
      const y = e.touches[0].clientY - startY;
      setTranslateX(x);
      setTranslateY(y);
      imgElement.style.transform = `translate(${x}px, ${y}px) scale(${currentScale})`;
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

  // ---------- CONTENT ----------
  const renderBoxContent = (num) => {
    const images = {
      1: "/box/1.jpg",
      3: "/box/3.png",
      5: "/box/5.jpg",
      6: "/box/6.jpg",
      8: "/box/8.png"
    };

    const videos = {
      2: "/box/2.mp4",
      4: "/box/4.mp4",
      7: "/box/7.mp4",
      9: "/box/9.mp4"
    };

    if (images[num]) {
      return (
        <div className="box-content">
          <h3>Pupu Mota Kutu Lutu Happy Birthday 🎁</h3>
          <img src={images[num]} className="pinch-img" alt={`Box ${num}`} />
          <button className="next-btn" onClick={closeBox}>Continue</button>
        </div>
      );
    }

    if (videos[num]) {
      return (
        <div className="box-content">
          <h3>🎥 Special Video</h3>
          <video
            ref={currentVideoRef}
            src={videos[num]}
            controls
            autoPlay
            onPlay={() => bgMusicRef.current?.pause()}
            onEnded={() => bgMusicRef.current?.play()}
          />
          <button className="next-btn" onClick={closeBox}>Continue</button>
        </div>
      );
    }
  };

  // ---------- LOGIN ----------
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <form className="login-box" onSubmit={(e) => {
          e.preventDefault();
          if (loginName.toLowerCase() === "sananda" && loginDOB === "20/01/1999") {
            setIsLoggedIn(true);
            setUsername(loginName);
            localStorage.setItem("name", loginName);
          } else {
            setLoginError("Invalid credentials");
          }
        }}>
          <h2>🎂 Birthday Surprise 🎂</h2>
          <input placeholder="Name" value={loginName} onChange={e => setLoginName(e.target.value)} />
          <input placeholder="DD/MM/YYYY" value={loginDOB} onChange={e => setLoginDOB(e.target.value)} />
          {loginError && <p className="error">{loginError}</p>}
          <button>Access Surprise</button>
        </form>
      </div>
    );
  }

  // ---------- INTRO SCREEN ----------
  if (showIntro) {
    return (
      <div className="App intro-screen" onClick={startMusic}>
        <audio ref={bgMusicRef} loop src="/music/birthday-music.mp3" />
        
        <div className="intro-container">
          <div className="intro-content">
            <div className="hearts-animation">
              <span className="heart">💝</span>
              <span className="heart">💕</span>
              <span className="heart">💖</span>
            </div>
            
            <h1 className="intro-title">Happy Birthday</h1>
            <h2 className="intro-name">{username}</h2>
            
            <p className="intro-text">
              I have something special prepared just for you...
            </p>
            
            <div className="intro-divider"></div>
            
            <p className="intro-subtitle">
              Open 9 surprise boxes to discover all the love and memories we share
            </p>
            
            <button 
              className="intro-btn"
              onClick={() => {
                startMusic();
                setShowIntro(false);
              }}
            >
              <span>Begin the Surprise</span>
              <span className="arrow">→</span>
            </button>
            
            <div className="floating-elements">
              <div className="float-item">✨</div>
              <div className="float-item">💫</div>
              <div className="float-item">🌟</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App" onClick={startMusic}>
      <audio ref={bgMusicRef} loop src="/music/birthday-music.mp3" />

      <h2>Happy Birthday {username} 🎉</h2>
      <p>Open surprise boxes one by one</p>

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

      <div className={`overlay ${showOverlay ? '' : 'hidden'}`} />

      {confettiElements.map(c => (
        <div key={c.id} className="confetti" style={c} />
      ))}
    </div>
  );
}

export default App;
