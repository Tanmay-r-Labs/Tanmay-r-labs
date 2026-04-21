document.addEventListener("DOMContentLoaded", () => {
    
    // --- SIMPLIFIED LOADING SCREEN LOGIC ---
    const loaderOverlay = document.getElementById("loader-overlay");
    const loaderStart = document.getElementById("loader-start");
    const enterBtn = document.getElementById("enter-lab");
    const loadingStage = document.getElementById("loading-stage");

    if (enterBtn && loaderOverlay) {
        enterBtn.addEventListener("click", () => {
            // Stage 1: Reveal Glitch Intro
            loaderStart.classList.add("hidden");
            loadingStage.classList.remove("hidden");

            // Final Stage: Fade out directly to reveal website
            setTimeout(() => {
                loaderOverlay.classList.add("fade-out");
                
                // Cleanup loader from DOM after fade
                setTimeout(() => {
                    loaderOverlay.remove();
                }, 1500);
            }, 3000); // 3 seconds of glitch vibe
        });
    }

    // --- THEME SWITCHER ---
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
        });
    }

    // --- SCROLL REVEAL (SUBTLE) ---
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const revealItems = document.querySelectorAll(".reveal-item, .fact-box, .feedback-card");
    revealItems.forEach(item => {
        item.classList.add("reveal-item");
        sectionObserver.observe(item);
    });

    // --- FEEDBACK MODAL & SUBMISSION ---
    const feedbackBtn = document.querySelector(".action-add");
    const feedbackModal = document.getElementById("feedback-dropdown");
    const feedbackWall = document.getElementById("feedback-wall");
    const emptyState = feedbackWall ? feedbackWall.querySelector(".empty-state") : null;
    
    if (feedbackBtn && feedbackModal) {
        const closeBtn = feedbackModal.querySelector(".close-modal");
        const submitBtn = document.getElementById("modal-submit");
        const textarea = document.getElementById("feedback-text");

        const placeholders = [
            "What's on your mind?",
            "Have a suggestion to make this better?",
            "Spotted a bug? Let us know!",
            "What would you like to see next?",
            "Drop a line, we're listening.",
            "How's the 'majestic' vibe treating you?",
            "Share your thoughts with the community...",
            "Share your thoughts..."
        ];

        feedbackBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpening = !feedbackModal.classList.contains("visible");
            if (isOpening) {
                const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
                textarea.setAttribute("placeholder", randomPlaceholder);
            }
            feedbackModal.classList.toggle("visible");
        });
        
        closeBtn.addEventListener("click", () => {
            feedbackModal.classList.remove("visible");
        });

        submitBtn.addEventListener("click", () => {
            if (textarea.value.trim() !== "") {
                if (emptyState) emptyState.style.display = "none";

                const name = "Visitor"; 
                const message = textarea.value;
                
                const card = document.createElement("div");
                card.className = "feedback-card glass reveal-item visible";
                card.innerHTML = `
                    <div class="f-header">
                        <span class="f-author">${name}</span>
                        <span class="f-tag">Latest</span>
                    </div>
                    <p class="f-message">${message}</p>
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
                submitBtn.style.background = "var(--accent)";
                submitBtn.style.color = "var(--bg)";
                
                setTimeout(() => {
                    feedbackModal.classList.remove("visible");
                    textarea.value = "";
                    submitBtn.textContent = "Send Feedback";
                    submitBtn.style.background = "";
                    submitBtn.style.color = "";
                }, 1500);
            }
        });

        document.addEventListener("click", (e) => {
            if (!feedbackModal.contains(e.target) && e.target !== feedbackBtn) {
                feedbackModal.classList.remove("visible");
            }
        });

        // Room Feedback Button Logic
        const roomFeedbackBtn = document.getElementById("room-feedback-btn");
        if (roomFeedbackBtn) {
            roomFeedbackBtn.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setTimeout(() => {
                    if (!feedbackModal.classList.contains("visible")) {
                        feedbackBtn.click();
                    }
                }, 800); // Wait for scroll animation
            });
        }
    }
});

window.handleLike = (btn) => {
    const countSpan = btn.querySelector(".count");
    let count = parseInt(countSpan.textContent);
    count++;
    countSpan.textContent = count;
    countSpan.style.opacity = "1";
    btn.style.color = "var(--accent)";
    btn.disabled = true;
};

window.handleDislike = (btn) => {
    const countSpan = btn.querySelector(".count");
    let count = parseInt(countSpan.textContent);
    count++;
    countSpan.textContent = count;
    countSpan.style.opacity = "1";
    btn.style.color = "#ff4757";
    btn.disabled = true;
};
