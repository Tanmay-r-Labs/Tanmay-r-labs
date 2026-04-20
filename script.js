document.addEventListener("DOMContentLoaded", () => {
      const themeToggle = document.getElementById("theme-toggle");
      if (themeToggle) {
                themeToggle.addEventListener("click", () => {
                              document.body.classList.toggle("light-mode");
                });
      }
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
});
