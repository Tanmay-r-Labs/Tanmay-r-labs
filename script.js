// ============================================================
// YOUTUBE MUSIC PLAYER — Man Mera
// ============================================================
let ytPlayer = null;
let ytReady = false;
let ytMuted = false;
const MAN_MERA_ID = "xAiyYmI8RW8"; // Man Mera — Table No. 21

// Called automatically by YouTube IFrame API once loaded
window.onYouTubeIframeAPIReady = function () {
    ytReady = true;
};

function initMusicPlayer() {
    if (!ytReady) { setTimeout(initMusicPlayer, 200); return; }
    ytPlayer = new YT.Player("yt-player", {
        videoId: MAN_MERA_ID,
        playerVars: { autoplay: 1, loop: 1, playlist: MAN_MERA_ID, controls: 0, modestbranding: 1 },
        events: {
            onReady: (e) => {
                e.target.setVolume(70);
                e.target.playVideo();
                const btn = document.getElementById("music-toggle");
                if (btn) btn.style.display = "flex";
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {


    // ============================================================
    // FEATURE 1: ANIMATED STAR CANVAS
    // ============================================================
    const canvas = document.getElementById("star-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let stars = [];

        function resizeCanvas() {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createStars(count) {
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 1.2 + 0.2,
                    speed: Math.random() * 0.3 + 0.05,
                    opacity: Math.random() * 0.7 + 0.2,
                    twinkleSpeed: Math.random() * 0.02 + 0.005,
                    twinkleDir: Math.random() > 0.5 ? 1 : -1,
                });
            }
        }

        function drawStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(s => {
                s.opacity += s.twinkleSpeed * s.twinkleDir;
                if (s.opacity > 0.9 || s.opacity < 0.1) s.twinkleDir *= -1;
                s.y -= s.speed;
                if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
                ctx.fill();
            });
            requestAnimationFrame(drawStars);
        }

        resizeCanvas();
        createStars(180);
        drawStars();
        window.addEventListener("resize", () => { resizeCanvas(); createStars(180); });
    }

    // ============================================================
    // FEATURE 2: CURSOR TRAIL
    // ============================================================
    const trailContainer = document.getElementById("cursor-trail-container");
    const colors = ["#a78bfa","#c4b5fd","#818cf8","#ffffff","#7c3aed"];

    if (trailContainer && window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener("mousemove", (e) => {
            const dot = document.createElement("div");
            dot.className = "cursor-dot";
            const size = Math.random() * 6 + 3;
            dot.style.cssText = `
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                box-shadow: 0 0 ${size * 2}px ${colors[0]};
            `;
            trailContainer.appendChild(dot);
            setTimeout(() => dot.remove(), 800);
        });
    }

    // ============================================================
    // FEATURE 5: AMBIENT SOUND (Web Audio API — no file needed)
    // ============================================================
    const soundBtn = document.getElementById("sound-toggle");
    const iconOn  = document.getElementById("sound-icon-on");
    const iconOff = document.getElementById("sound-icon-off");
    let audioCtx = null, soundNodes = [], soundActive = false;

    function createAmbientSound() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 3);
        masterGain.connect(audioCtx.destination);

        // Deep drone layers
        [55, 82.5, 110, 165].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = i % 2 === 0 ? "sine" : "triangle";
            osc.frequency.value = freq;
            gain.gain.value = i === 0 ? 0.4 : 0.15;

            // Slow wobble
            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.frequency.value = 0.08 + i * 0.03;
            lfoGain.gain.value = freq * 0.005;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            soundNodes.push(osc, lfo);
        });

        soundNodes.push(masterGain);
        return masterGain;
    }

    if (soundBtn) {
        soundBtn.addEventListener("click", () => {
            if (!soundActive) {
                createAmbientSound();
                soundActive = true;
                soundBtn.classList.add("active");
                iconOn.style.display  = "none";
                iconOff.style.display = "block";
            } else {
                soundNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch(e){} });
                soundNodes = [];
                audioCtx.close();
                audioCtx = null;
                soundActive = false;
                soundBtn.classList.remove("active");
                iconOn.style.display  = "block";
                iconOff.style.display = "none";
            }
        });
    }

    // ============================================================
    // FEATURE 6: LIVE WPM COUNTER
    // ============================================================
    const wpmWidget = document.getElementById("wpm-widget");
    const wpmValue  = document.getElementById("wpm-value");
    let keyTimestamps = [];
    let wpmTimeout;

    document.addEventListener("keydown", () => {
        const now = Date.now();
        keyTimestamps.push(now);
        keyTimestamps = keyTimestamps.filter(t => now - t < 10000); // 10s window

        if (keyTimestamps.length > 1) {
            const elapsed = (now - keyTimestamps[0]) / 1000 / 60; // minutes
            const wpm = Math.round((keyTimestamps.length / 5) / elapsed); // chars/5 = words
            if (wpmValue) wpmValue.textContent = Math.min(wpm, 999);
            if (wpmWidget) wpmWidget.classList.add("typing");
        }

        clearTimeout(wpmTimeout);
        wpmTimeout = setTimeout(() => {
            if (wpmWidget) wpmWidget.classList.remove("typing");
            keyTimestamps = [];
            if (wpmValue) wpmValue.textContent = "120";
        }, 3000);
    });

    // ============================================================
    // FEATURE 8: SCROLL-TRIGGERED TYPEWRITER QUOTE
    // ============================================================
    const typewriterEls = document.querySelectorAll(".typewriter-quote");

    function typewriterEffect(el) {
        if (el.dataset.typed === "true") return;
        el.dataset.typed = "true";
        const originalHTML = el.innerHTML;
        const text = el.dataset.text;
        el.textContent = "";
        el.style.opacity = "1";

        let i = 0;
        const speed = 28;
        function type() {
            if (i < text.length) {
                el.textContent += text[i++];
                setTimeout(type, speed);
            } else {
                // restore proper HTML (line break) after typing
                el.innerHTML = originalHTML;
            }
        }
        type();
    }

    const typeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typewriterEffect(entry.target);
                typeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    typewriterEls.forEach(el => typeObserver.observe(el));

    // ============================================================
    // EXISTING: LOADING SCREEN
    // ============================================================
    const loaderOverlay = document.getElementById("loader-overlay");
    const loaderStart   = document.getElementById("loader-start");
    const enterBtn      = document.getElementById("enter-lab");
    const loadingStage  = document.getElementById("loading-stage");

    if (enterBtn && loaderOverlay) {
        enterBtn.addEventListener("click", () => {
            loaderStart.classList.add("hidden");
            loadingStage.classList.remove("hidden");
            // 🎵 Start Man Mera
            initMusicPlayer();
            setTimeout(() => {
                loaderOverlay.classList.add("fade-out");
                setTimeout(() => loaderOverlay.remove(), 1500);
            }, 3000);
        });
    }

    // ============================================================
    // MUSIC TOGGLE BUTTON
    // ============================================================
    const musicToggle = document.getElementById("music-toggle");
    if (musicToggle) {
        musicToggle.addEventListener("click", () => {
            if (!ytPlayer) return;
            if (ytMuted) {
                ytPlayer.playVideo();
                ytMuted = false;
                musicToggle.classList.remove("muted");
                musicToggle.title = "Now Playing: Man Mera";
            } else {
                ytPlayer.pauseVideo();
                ytMuted = true;
                musicToggle.classList.add("muted");
                musicToggle.title = "Music paused — click to resume";
            }
        });
    }

    // ============================================================
    // EXISTING: THEME SWITCHER
    // ============================================================
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
        });
    }

    // ============================================================
    // EXISTING: SCROLL REVEAL
    // ============================================================
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal-item, .fact-box, .feedback-card").forEach(item => {
        item.classList.add("reveal-item");
        sectionObserver.observe(item);
    });

    // ============================================================
    // EXISTING: FEEDBACK MODAL
    // ============================================================
    const feedbackBtn   = document.querySelector(".action-add");
    const feedbackModal = document.getElementById("feedback-dropdown");
    const feedbackWall  = document.getElementById("feedback-wall");
    const emptyState    = feedbackWall ? feedbackWall.querySelector(".empty-state") : null;

    if (feedbackBtn && feedbackModal) {
        const closeBtn  = feedbackModal.querySelector(".close-modal");
        const submitBtn = document.getElementById("modal-submit");
        const textarea  = document.getElementById("feedback-text");

        const placeholders = [
            "What's on your mind?",
            "Have a suggestion to make this better?",
            "Spotted a bug? Let us know!",
            "What would you like to see next?",
            "Drop a line, we're listening.",
            "How's the 'majestic' vibe treating you?",
            "Share your thoughts...",
        ];

        feedbackBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!feedbackModal.classList.contains("visible")) {
                textarea.setAttribute("placeholder", placeholders[Math.floor(Math.random() * placeholders.length)]);
            }
            feedbackModal.classList.toggle("visible");
        });

        closeBtn.addEventListener("click", () => feedbackModal.classList.remove("visible"));

        submitBtn.addEventListener("click", () => {
            if (textarea.value.trim() !== "") {
                if (emptyState) emptyState.style.display = "none";
                const card = document.createElement("div");
                card.className = "feedback-card glass reveal-item visible";
                card.innerHTML = `
                    <div class="f-header"><span class="f-author">Visitor</span><span class="f-tag">Latest</span></div>
                    <p class="f-message">${textarea.value}</p>
                    <div class="f-footer">
                        <button class="engagement-btn like-btn" onclick="handleLike(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="engagement-icon"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                            <span class="count">0</span>
                        </button>
                        <button class="engagement-btn dislike-btn" onclick="handleDislike(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="engagement-icon"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>
                            <span class="count">0</span>
                        </button>
                    </div>
                `;
                feedbackWall.prepend(card);
                submitBtn.textContent = "Sent!";
                setTimeout(() => {
                    feedbackModal.classList.remove("visible");
                    textarea.value = "";
                    submitBtn.textContent = "Send Feedback";
                }, 1500);
            }
        });

        document.addEventListener("click", (e) => {
            if (!feedbackModal.contains(e.target) && e.target !== feedbackBtn) {
                feedbackModal.classList.remove("visible");
            }
        });

        const roomFeedbackBtn = document.getElementById("room-feedback-btn");
        if (roomFeedbackBtn) {
            roomFeedbackBtn.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setTimeout(() => {
                    if (!feedbackModal.classList.contains("visible")) feedbackBtn.click();
                }, 800);
            });
        }
    }
});

window.handleLike = (btn) => {
    const s = btn.querySelector(".count");
    s.textContent = parseInt(s.textContent) + 1;
    s.style.opacity = "1";
    btn.style.color = "var(--accent)";
    btn.disabled = true;
};

window.handleDislike = (btn) => {
    const s = btn.querySelector(".count");
    s.textContent = parseInt(s.textContent) + 1;
    s.style.opacity = "1";
    btn.style.color = "#ff4757";
    btn.disabled = true;
};
