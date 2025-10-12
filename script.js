document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('section');
    let currentSectionIndex = 0;
    let isScrolling = false;
    const headerOffset = 80;

    function smoothScrollTo(targetPosition) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800;
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

    window.smoothScrollToSection = function(selector) {
        const element = document.querySelector(selector);
        if (element) {
            isScrolling = true;
            const targetPosition = element.offsetTop - headerOffset;
            smoothScrollTo(targetPosition);

            setTimeout(() => {
                updateCurrentSection();
            }, 900);
        }
    };

    document.querySelectorAll('.nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            window.smoothScrollToSection(targetId);
        });
    });

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