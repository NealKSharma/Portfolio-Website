// ===== UNIVERSAL FONT SIZE SYSTEM =====

(function() {
    function calculateOptimalFontSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        
        let fontSize;
        
        // Base size by DPR (Windows/OS Scaling)
        if (dpr >= 2.0) {
            fontSize = 55;
        } else if (dpr >= 1.75) {
            fontSize = 58;
        } else if (dpr >= 1.5) {
            fontSize = 62.5;
        } else if (dpr >= 1.25) {
            fontSize = 68;
        } else {
            fontSize = 74;
        }
        
        // Adjust for viewport width
        if (width >= 3840) {
            fontSize *= 0.85;
        } else if (width >= 2560) {
            fontSize *= 0.90;
        } else if (width >= 1920) {
            fontSize *= 0.95;
        } else if (width >= 1600) {
            fontSize *= 1.0;
        } else if (width >= 1366) {
            fontSize *= 1.02;
        } else if (width >= 1024) {
            fontSize *= 0.85;
        } else if (width >= 768) {
            fontSize *= 0.80;
        } else if (width >= 600) {
            fontSize *= 0.75;
        } else if (width >= 480) {
            fontSize *= 0.72;
        } else {
            fontSize *= 0.70;
        }
        
        // Adjust for viewport height
        if (height < 600) {
            fontSize *= 0.85;
        } else if (height < 768) {
            fontSize *= 0.90;
        } else if (height < 900) {
            fontSize *= 0.95;
        } else if (height >= 1400) {
            fontSize *= 1.05;
        }
        
        // Aspect ratio fine-tuning
        const aspectRatio = width / height;
        if (aspectRatio > 2.2) {
            fontSize *= 0.92;
        } else if (aspectRatio < 1.3) {
            fontSize *= 1.08;
        }
        
        // Clamp between 35% and 75%
        fontSize = Math.max(35, Math.min(75, fontSize));
        
        document.documentElement.style.fontSize = fontSize + '%';
    }
    
    calculateOptimalFontSize();
    
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(calculateOptimalFontSize, 300);
    });
    
    window.addEventListener('load', () => {
        setTimeout(calculateOptimalFontSize, 200);
    });
    
    // Observe carousel changes
    const observer = new MutationObserver(() => {
        calculateOptimalFontSize();
    });
    
    document.addEventListener('DOMContentLoaded', () => {
        const carouselTracks = document.querySelectorAll('.carousel-track');
        carouselTracks.forEach(track => {
            observer.observe(track, {
                attributes: true,
                attributeFilter: ['style']
            });
        });
    });
    
    window.recalculateFontSize = calculateOptimalFontSize;
})();

// Overflow prevention CSS
const style = document.createElement('style');
style.textContent = `
    html, body {
        overflow-x: hidden !important;
        max-width: 100vw !important;
    }
    section, .carousel-slide, .grid-card, .grid-content {
        overflow-x: hidden !important;
        max-width: 100% !important;
    }
    .tech-stack, .hero-skills, .category-tags {
        flex-wrap: wrap !important;
    }
`;
document.head.appendChild(style);

// ===== CURSOR GLOW EFFECT =====
const cursorGlow = document.querySelector('.cursor-glow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (!document.querySelector('.floating-nav').contains(e.target)) {
        navMenu.classList.remove('active');
    }
});

// ===== LOGO CLICK =====
const logoContainer = document.getElementById('logoContainer');
if (logoContainer) {
    logoContainer.addEventListener('click', (e) => {
        e.preventDefault();
        if (sectionManager) {
            sectionManager.smoothScrollToSelector('#about');
        } else {
            document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ===== TYPING ANIMATION =====
const words = ["Software Developer", "AI Researcher", "Full-Stack Engineer", "Tech Enthusiast"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;

    const currentWord = words[wordIndex];

    if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(type, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 500);
    } else {
        setTimeout(type, isDeleting ? 50 : 100);
    }
}

// ===== UNIFIED SECTION MANAGER =====
class UnifiedSectionManager {
    constructor() {
        this.sections = [];
        this.currentSectionIndex = 0;
        this.isScrolling = false;
        this.lastScrollTime = 0;
        this.SCROLL_COOLDOWN = 600;
        this.DELTA_THRESHOLD = 35;
        this.headerOffset = 0;

        this.initializeSections();
        this.initializeScrollListener();
        this.initializeNavigation();
    }

    initializeSections() {
        const sectionElements = document.querySelectorAll('section');
        
        sectionElements.forEach((sectionEl, index) => {
            const section = {
                element: sectionEl,
                id: sectionEl.id,
                index: index,
                isCarousel: sectionEl.classList.contains('carousel-section'),
                slides: [],
                currentSlide: 0,
                track: null,
                indicatorsContainer: null
            };

            if (section.isCarousel) {
                section.track = sectionEl.querySelector('[id$="Track"]');
                section.indicatorsContainer = sectionEl.querySelector('[id$="Indicators"]');
                section.slides = Array.from(section.track.querySelectorAll('.carousel-slide'));
                this.initializeIndicators(section);
            }

            this.sections.push(section);
        });
    }

    initializeIndicators(section) {
        if (!section.indicatorsContainer) return;
        
        section.indicatorsContainer.innerHTML = '';
        
        // Create wrapper for arrows and indicators
        const navWrapper = document.createElement('div');
        navWrapper.className = 'carousel-nav';
        
        // Create left arrow
        const leftArrow = document.createElement('button');
        leftArrow.className = 'carousel-arrow carousel-arrow-left';
        leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
        leftArrow.addEventListener('click', () => this.previousSlide(section.index));
        
        // Create indicators container
        const indicatorsWrapper = document.createElement('div');
        indicatorsWrapper.className = 'carousel-indicators';
        
        section.slides.forEach((slide, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goToSlide(section.index, index));
            indicatorsWrapper.appendChild(indicator);
        });
        
        // Create right arrow
        const rightArrow = document.createElement('button');
        rightArrow.className = 'carousel-arrow carousel-arrow-right';
        rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
        rightArrow.addEventListener('click', () => this.nextSlide(section.index));
        
        // Append all elements
        navWrapper.appendChild(leftArrow);
        navWrapper.appendChild(indicatorsWrapper);
        navWrapper.appendChild(rightArrow);
        section.indicatorsContainer.appendChild(navWrapper);
        
        // Store arrow references
        section.leftArrow = leftArrow;
        section.rightArrow = rightArrow;
        
        // Update arrow states
        this.updateArrowStates(section);
    }

    updateArrowStates(section) {
        if (!section.leftArrow || !section.rightArrow) return;
        
        // Update left arrow
        if (section.currentSlide === 0) {
            section.leftArrow.classList.add('disabled');
        } else {
            section.leftArrow.classList.remove('disabled');
        }
        
        // Update right arrow
        if (section.currentSlide === section.slides.length - 1) {
            section.rightArrow.classList.add('disabled');
        } else {
            section.rightArrow.classList.remove('disabled');
        }
    }

    previousSlide(sectionIndex) {
        const section = this.sections[sectionIndex];
        if (!section.isCarousel || section.currentSlide === 0) return;
        
        section.currentSlide--;
        this.updateCarouselSlide(section);
    }

    nextSlide(sectionIndex) {
        const section = this.sections[sectionIndex];
        if (!section.isCarousel || section.currentSlide === section.slides.length - 1) return;
        
        section.currentSlide++;
        this.updateCarouselSlide(section);
    }

    initializeScrollListener() {
        let canProcess = true;
        
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!canProcess) return;
            
            const now = Date.now();
            if (this.isScrolling || (now - this.lastScrollTime) < this.SCROLL_COOLDOWN) return;
            if (Math.abs(e.deltaY) < this.DELTA_THRESHOLD) return;
            
            const direction = e.deltaY > 0 ? 'forward' : 'backward';
            if (!this.canMove(direction)) return;
            
            canProcess = false;
            setTimeout(() => canProcess = true, 150);
            
            this.isScrolling = true;
            this.lastScrollTime = now;
            this.handleScroll(direction);
            
        }, { passive: false });

        let scrollEndTimeout;
        window.addEventListener('scroll', () => {
            if (this.isScrolling) return;
            
            clearTimeout(scrollEndTimeout);
            scrollEndTimeout = setTimeout(() => {
                if (!this.isScrolling) this.snapToNearestSection();
            }, 150);
        });
    }

    canMove(direction) {
        const currentSection = this.sections[this.currentSectionIndex];
        
        if (direction === 'forward') {
            if (currentSection.isCarousel) {
                return currentSection.currentSlide < currentSection.slides.length - 1 || 
                       this.currentSectionIndex < this.sections.length - 1;
            } else {
                return this.currentSectionIndex < this.sections.length - 1;
            }
        } else {
            if (currentSection.isCarousel) {
                return currentSection.currentSlide > 0 || this.currentSectionIndex > 0;
            } else {
                return this.currentSectionIndex > 0;
            }
        }
    }

    handleScroll(direction) {
        const currentSection = this.sections[this.currentSectionIndex];
        
        if (currentSection.isCarousel) {
            if (direction === 'forward') {
                if (currentSection.currentSlide < currentSection.slides.length - 1) {
                    currentSection.currentSlide++;
                    this.updateCarouselSlide(currentSection);
                    this.isScrolling = false;
                } else {
                    this.moveToNextSection();
                }
            } else {
                if (currentSection.currentSlide > 0) {
                    currentSection.currentSlide--;
                    this.updateCarouselSlide(currentSection);
                    this.isScrolling = false;
                } else {
                    this.moveToPreviousSection();
                }
            }
        } else {
            if (direction === 'forward') {
                this.moveToNextSection();
            } else {
                this.moveToPreviousSection();
            }
        }
    }

    moveToNextSection() {
        if (this.currentSectionIndex < this.sections.length - 1) {
            this.currentSectionIndex++;
            this.scrollToCurrentSection();
        }
    }

    moveToPreviousSection() {
        if (this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
            this.scrollToCurrentSection();
        }
    }

    scrollToCurrentSection() {
        const section = this.sections[this.currentSectionIndex];
        const targetPosition = section.element.offsetTop - this.headerOffset;
        
        this.isScrolling = true;
        this.smoothScrollTo(targetPosition);
    }

    updateCarouselSlide(section) {
        section.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === section.currentSlide);
        });

        section.track.style.transform = `translateX(-${section.currentSlide * 100}%)`;

        if (section.indicatorsContainer) {
            const indicators = section.indicatorsContainer.querySelectorAll('.indicator');
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === section.currentSlide);
            });
        }
        
        // Update arrow states
        this.updateArrowStates(section);
    }

    goToSlide(sectionIndex, slideIndex) {
        const section = this.sections[sectionIndex];
        if (!section.isCarousel) return;
        
        section.currentSlide = slideIndex;
        this.updateCarouselSlide(section);
    }

    smoothScrollTo(targetPosition) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 500;
        let startTime = null;

        const animation = (currentTime) => {
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
                window.scrollTo(0, targetPosition);
                this.isScrolling = false;
                this.updateActiveNav();
            }
        };

        requestAnimationFrame(animation);
    }

    smoothScrollToSelector(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        const sectionIndex = this.sections.findIndex(s => s.element === element);
        if (sectionIndex !== -1) {
            this.currentSectionIndex = sectionIndex;
            
            const section = this.sections[sectionIndex];
            if (section.isCarousel) {
                section.currentSlide = 0;
                this.updateCarouselSlide(section);
            }
        }

        this.isScrolling = true;
        const targetPosition = element.offsetTop - this.headerOffset;
        this.smoothScrollTo(targetPosition);
    }

    updateActiveNav() {
        const currentSection = this.sections[this.currentSectionIndex];
        const sectionId = currentSection.id;
        
        document.querySelectorAll('.nav-item').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    snapToNearestSection() {
        const scrollPos = window.pageYOffset + this.headerOffset;
        let closestIndex = 0;
        let closestDistance = Infinity;

        this.sections.forEach((section, index) => {
            const sectionTop = section.element.offsetTop;
            const distance = Math.abs(scrollPos - sectionTop);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        if (closestDistance > 10) {
            this.currentSectionIndex = closestIndex;
            const targetPosition = this.sections[closestIndex].element.offsetTop - this.headerOffset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            this.updateActiveNav();
        }
    }

    initializeNavigation() {
        document.querySelectorAll('.nav-item').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                this.smoothScrollToSelector(targetId);

                document.querySelectorAll('.nav-item').forEach(link => link.classList.remove('active'));
                anchor.classList.add('active');
            });
        });
    }
}

// ===== INITIALIZATION =====
let sectionManager;

document.addEventListener('DOMContentLoaded', function () {
    type();
    sectionManager = new UnifiedSectionManager();
    sectionManager.updateActiveNav();
});