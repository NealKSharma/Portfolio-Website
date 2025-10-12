document.addEventListener('DOMContentLoaded', function () {
    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Section snapping logic
    const sections = document.querySelectorAll('section');
    let currentSectionIndex = 0;
    let isScrolling = false;
    const headerOffset = 20;

    function smoothScrollTo(targetPosition) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 500;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            const ease = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startPosition + (distance * ease));

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                isScrolling = false;
            }
        }

        requestAnimationFrame(animation);
    }

    function scrollToSection(index) {
        if (index < 0 || index >= sections.length || isScrolling) return;

        currentSectionIndex = index;
        const targetPosition = sections[currentSectionIndex].offsetTop - headerOffset;

        isScrolling = true;
        smoothScrollTo(targetPosition);
    }

    // Smooth scrolling for navbar links
    document.querySelectorAll('.nav-links a, .logo a, .cta-button').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                isScrolling = true;
                const targetPosition = targetSection.offsetTop - headerOffset;
                smoothScrollTo(targetPosition);

                // Update current section index
                setTimeout(() => {
                    updateCurrentSection();
                }, 600);
            }
        });
    });

    // Wheel event for section snapping
    window.addEventListener('wheel', function (e) {
        e.preventDefault();

        if (isScrolling) return;

        if (e.deltaY > 0) {
            scrollToSection(currentSectionIndex + 1);
        } else {
            scrollToSection(currentSectionIndex - 1);
        }
    }, { passive: false });

    function updateCurrentSection() {
        const scrollPosition = window.pageYOffset + (window.innerHeight / 3);

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionIndex = i;
                break;
            }
        }
    }

    updateCurrentSection();
});