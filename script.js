// Cursor glow effect
const cursorGlow = document.querySelector('.cursor-glow');

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('active');
});

// Close menu when nav item is clicked
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const floatingNav = document.querySelector('.floating-nav');
    if (!floatingNav.contains(e.target)) {
        navMenu.classList.remove('active');
    }
});

// Typing animation
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

// Unified Section Manager - treats everything as sections with optional slides
class UnifiedSectionManager {
    constructor() {
        this.sections = [];
        this.currentSectionIndex = 0;
        this.currentSlideIndex = 0;
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
                // Find carousel components
                section.track = sectionEl.querySelector('[id$="Track"]');
                section.indicatorsContainer = sectionEl.querySelector('[id$="Indicators"]');
                section.slides = Array.from(section.track.querySelectorAll('.carousel-slide'));
                
                // Initialize indicators
                this.initializeIndicators(section);
            }

            this.sections.push(section);
        });
    }

    initializeIndicators(section) {
        if (!section.indicatorsContainer) return;
        
        section.indicatorsContainer.innerHTML = '';
        
        section.slides.forEach((slide, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goToSlide(section.index, index));
            section.indicatorsContainer.appendChild(indicator);
        });
    }

    initializeScrollListener() {
        let canProcess = true;
        
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Immediate gate - only process if we're ready
            if (!canProcess) {
                return;
            }
            
            const now = Date.now();
            
            // Enforce cooldown
            if (this.isScrolling || (now - this.lastScrollTime) < this.SCROLL_COOLDOWN) {
                return;
            }

            // Ignore tiny movements
            if (Math.abs(e.deltaY) < this.DELTA_THRESHOLD) {
                return;
            }
            
            const direction = e.deltaY > 0 ? 'forward' : 'backward';
            
            // Check if we can actually move before locking
            if (!this.canMove(direction)) {
                return;
            }
            
            // Block all events immediately for 150ms
            canProcess = false;
            setTimeout(() => {
                canProcess = true;
            }, 150);
            
            // Lock BOTH flags immediately before any processing
            this.isScrolling = true;
            this.lastScrollTime = now;
            
            this.handleScroll(direction);
            
        }, { passive: false });

        // Snap to nearest section on manual scroll end
        let scrollEndTimeout;
        window.addEventListener('scroll', () => {
            if (this.isScrolling) return;
            
            clearTimeout(scrollEndTimeout);
            scrollEndTimeout = setTimeout(() => {
                if (!this.isScrolling) {
                    this.snapToNearestSection();
                }
            }, 150);
        });
    }

    canMove(direction) {
        const currentSection = this.sections[this.currentSectionIndex];
        
        if (direction === 'forward') {
            if (currentSection.isCarousel) {
                // Can move if not at last slide, or not at last section
                return currentSection.currentSlide < currentSection.slides.length - 1 || 
                       this.currentSectionIndex < this.sections.length - 1;
            } else {
                // Can move if not at last section
                return this.currentSectionIndex < this.sections.length - 1;
            }
        } else {
            if (currentSection.isCarousel) {
                // Can move if not at first slide, or not at first section
                return currentSection.currentSlide > 0 || this.currentSectionIndex > 0;
            } else {
                // Can move if not at first section
                return this.currentSectionIndex > 0;
            }
        }
    }

    handleScroll(direction) {
        const currentSection = this.sections[this.currentSectionIndex];
        
        if (currentSection.isCarousel) {
            // In a carousel section
            if (direction === 'forward') {
                // Try to advance slide
                if (currentSection.currentSlide < currentSection.slides.length - 1) {
                    currentSection.currentSlide++;
                    this.updateCarouselSlide(currentSection);
                    // Release lock for carousel transitions (no animation)
                    this.isScrolling = false;
                } else {
                    // At last slide, move to next section
                    this.moveToNextSection();
                }
            } else {
                // Try to go back slide
                if (currentSection.currentSlide > 0) {
                    currentSection.currentSlide--;
                    this.updateCarouselSlide(currentSection);
                    // Release lock for carousel transitions (no animation)
                    this.isScrolling = false;
                } else {
                    // At first slide, move to previous section
                    this.moveToPreviousSection();
                }
            }
        } else {
            // Regular section - just move to next/previous section
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
        // Update slide positions
        section.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === section.currentSlide);
        });

        section.track.style.transform = `translateX(-${section.currentSlide * 100}%)`;

        // Update indicators
        if (section.indicatorsContainer) {
            const indicators = section.indicatorsContainer.querySelectorAll('.indicator');
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === section.currentSlide);
            });
        }
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

        // Find which section this is
        const sectionIndex = this.sections.findIndex(s => s.element === element);
        if (sectionIndex !== -1) {
            this.currentSectionIndex = sectionIndex;
            
            // Reset carousel if clicking on one
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

// Initialize when DOM is ready
let sectionManager;

document.addEventListener('DOMContentLoaded', function () {
    type();
    sectionManager = new UnifiedSectionManager();
    sectionManager.updateActiveNav();
});