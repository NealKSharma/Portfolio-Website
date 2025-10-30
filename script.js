// ===== DEVICE DETECTION =====
function isMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    return isMobileDevice && isSmallScreen;
}

function isTablet() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTabletDevice = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    const isMediumScreen = window.innerWidth > 768 && window.innerWidth <= 1024;
    return isTabletDevice || isMediumScreen;
}

function isDesktop() {
    return !isMobile() && !isTablet();
}

// ===== UNIVERSAL FONT SIZE SYSTEM (DESKTOP ONLY) =====
(function () {
    let fontSizeCalculated = false;

    // Exit early on mobile/tablet - let CSS handle it
    if (!isDesktop()) {
        return;
    }

    function hasVerticalOverflow() {
        const TOLERANCE = 0;
        const gridContents = document.querySelectorAll('.grid-content');
        for (let content of gridContents) {
            const contentDiff = content.scrollHeight - content.clientHeight;
            if (contentDiff > TOLERANCE) {
                return true;
            }
        }
        return false;
    }

    function calculateOptimalFontSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        let fontSize;

        if (width >= 3840) fontSize = 68;
        else if (width >= 2560) fontSize = 72;
        else if (width >= 1920) fontSize = 75;
        else if (width >= 1600) fontSize = 75;
        else if (width >= 1366) fontSize = 75;
        else if (width >= 1024) fontSize = 68;
        else fontSize = 65;

        if (height < 600) fontSize *= 0.85;
        else if (height < 768) fontSize *= 0.90;
        else if (height < 900) fontSize *= 0.95;
        else if (height >= 1400) fontSize *= 1.05;

        const aspectRatio = width / height;
        if (aspectRatio > 2.2) fontSize *= 0.92;
        else if (aspectRatio < 1.3) fontSize *= 1.08;

        return Math.max(35, Math.min(75, fontSize));
    }

    function adjustFontSizeForOverflow() {
        if (fontSizeCalculated) return;

        let fontSize = calculateOptimalFontSize();
        document.documentElement.style.fontSize = fontSize + '%';

        requestAnimationFrame(() => {
            if (!hasVerticalOverflow()) {
                fontSizeCalculated = true;
                return;
            }

            const maxIterations = 50;
            let iterations = 0;

            while (hasVerticalOverflow() && fontSize > 35 && iterations < maxIterations) {
                fontSize -= 1.5;
                document.documentElement.style.fontSize = fontSize + '%';
                iterations++;
            }

            fontSizeCalculated = true;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', adjustFontSizeForOverflow);
    } else {
        adjustFontSizeForOverflow();
    }

    window.recalculateFontSize = adjustFontSizeForOverflow;
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

// ===== CURSOR GLOW EFFECT (DESKTOP ONLY) =====
(function() {
    const cursorGlow = document.querySelector('.cursor-glow');
    if (!isDesktop() || !cursorGlow) return;
    
    const handleMouseMove = (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    window.addEventListener('beforeunload', () => {
        document.removeEventListener('mousemove', handleMouseMove);
    });
})();

// ===== HAMBURGER MENU WITH BACKDROP =====
(function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (!hamburger || !navMenu) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    const closeMenu = () => {
        navMenu.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.classList.remove('menu-open');
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        backdrop.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    };

    hamburger.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', closeMenu);
    });

    if (!isDesktop()) {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (Math.abs(currentScrollY - lastScrollY) > 50) {
                closeMenu();
            }
            lastScrollY = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll);
    }

    const handleClickOutside = (e) => {
        const floatingNav = document.querySelector('.floating-nav');
        if (floatingNav && !floatingNav.contains(e.target)) {
            closeMenu();
        }
    };

    document.addEventListener('click', handleClickOutside);
})();

// ===== TYPING ANIMATION =====
(function() {
    const words = ["Software Developer", "AI Researcher", "Full-Stack Engineer", "Tech Enthusiast"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimeout = null;
    let isPageVisible = true;
    let typingEnabled = true;

    function type() {
        const typingElement = document.querySelector('.typing-text');
        if (!typingElement || !typingEnabled || !isPageVisible) {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
                typingTimeout = null;
            }
            return;
        }

        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let delay;
        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            delay = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 500;
        } else {
            delay = isDeleting ? 50 : 100;
        }

        typingTimeout = setTimeout(type, delay);
    }

    const handleVisibilityChange = () => {
        isPageVisible = !document.hidden;
        if (!isPageVisible) {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
                typingTimeout = null;
            }
        } else if (typingEnabled) {
            type();
        }
    };

    const cleanup = () => {
        typingEnabled = false;
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', cleanup);

    // Start typing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', type);
    } else {
        type();
    }
})();

// ===== CAROUSEL TOUCH SWIPE HANDLER (MOBILE/TABLET) =====
class CarouselTouchSwipeHandler {
    constructor(trackElement, sectionIndex, manager) {
        this.track = trackElement;
        this.sectionIndex = sectionIndex;
        this.manager = manager;

        this.pointerDown = false;
        this.startX = 0;
        this.currentX = 0;
        this.minSwipeDistance = 50;
        this.locked = false;

        this.onPointerDown = this.handlePointerDown.bind(this);
        this.onPointerMove = this.handlePointerMove.bind(this);
        this.onPointerUp = this.handlePointerUp.bind(this);
        this.onPointerCancel = this.handlePointerCancel.bind(this);
        this.onTransitionEnd = this.handleTransitionEnd.bind(this);

        this.init();
    }

    init() {
        this.track.style.touchAction = 'pan-y';

        this.track.addEventListener('pointerdown', this.onPointerDown, { passive: false });
        window.addEventListener('pointermove', this.onPointerMove, { passive: false });
        window.addEventListener('pointerup', this.onPointerUp, { passive: false });
        this.track.addEventListener('pointercancel', this.onPointerCancel, { passive: false });
        this.track.addEventListener('transitionend', this.onTransitionEnd);
    }

    handlePointerDown(e) {
        if (e.isPrimary === false || this.locked) return;

        this.pointerDown = true;
        this.startX = e.clientX;
        this.currentX = this.startX;

        try { 
            this.track.setPointerCapture(e.pointerId); 
        } catch (err) {}
        e.preventDefault();
    }

    handlePointerMove(e) {
        if (!this.pointerDown || this.locked) return;
        this.currentX = e.clientX;
        e.preventDefault();
    }

    handlePointerUp(e) {
        if (!this.pointerDown || this.locked) {
            this.resetPointer(e);
            return;
        }
        this.pointerDown = false;

        try { 
            this.track.releasePointerCapture(e.pointerId); 
        } catch (err) {}

        const diff = this.startX - this.currentX;
        const abs = Math.abs(diff);

        if (abs >= this.minSwipeDistance && !this.locked) {
            const goNext = diff > 0;
            this.locked = true;
            if (goNext) {
                this.manager.nextSlide(this.sectionIndex);
            } else {
                this.manager.previousSlide(this.sectionIndex);
            }
        }

        e.preventDefault();
    }

    handlePointerCancel(e) {
        this.resetPointer(e);
    }

    resetPointer(e) {
        this.pointerDown = false;
        this.startX = 0;
        this.currentX = 0;
        try {
            if (e && e.pointerId != null) this.track.releasePointerCapture(e.pointerId);
        } catch (err) {}
    }

    handleTransitionEnd(e) {
        if (e.target !== this.track) return;
        if (e.propertyName && e.propertyName !== 'transform') return;

        this.locked = false;

        if (this.manager) {
            this.manager.isScrolling = false;
        }
    }

    destroy() {
        this.track.removeEventListener('pointerdown', this.onPointerDown);
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        this.track.removeEventListener('pointercancel', this.onPointerCancel);
        this.track.removeEventListener('transitionend', this.onTransitionEnd);
        
        this.track = null;
        this.manager = null;
        this.onPointerDown = null;
        this.onPointerMove = null;
        this.onPointerUp = null;
        this.onPointerCancel = null;
        this.onTransitionEnd = null;
    }
}

// ===== UNIFIED SECTION MANAGER =====
class UnifiedSectionManager {
    constructor() {
        this.sections = [];
        this.currentSectionIndex = 0;
        this.isScrolling = false;
        this.lastScrollTime = 0;
        this.SCROLL_COOLDOWN = 400;
        this.DELTA_THRESHOLD = 35;
        this.HORIZONTAL_DELTA_THRESHOLD = 30;
        this.headerOffset = 0;

        this.deviceType = this.detectDevice();
        
        this.wheelHandler = null;
        this.scrollHandler = null;
        this.scrollEndTimeout = null;
        this.rafId = null;
        this.swipeHandlers = [];
        this.navClickHandlers = [];

        this.initializeSections();

        if (this.deviceType === 'desktop') {
            this.initializeDesktopScrollListener();
        }

        if (this.deviceType === 'mobile' || this.deviceType === 'tablet') {
            this.initializeCarouselTouchSwipe();
        }

        this.initializeNavigation();
    }

    detectDevice() {
        if (isDesktop()) return 'desktop';
        if (isMobile()) return 'mobile';
        if (isTablet()) return 'tablet';
        return 'desktop';
    }

    initializeSections() {
        const sectionElements = document.querySelectorAll('section');

        sectionElements.forEach((sectionEl, index) => {
            const trackEl = sectionEl.querySelector('[id$="Track"]');
            const indicatorsEl = sectionEl.querySelector('[id$="Indicators"]');
            const slidesArray = trackEl ? Array.from(trackEl.querySelectorAll('.carousel-slide')) : [];

            const section = {
                element: sectionEl,
                id: sectionEl.id,
                index: index,
                isCarousel: sectionEl.classList.contains('carousel-section'),
                slides: slidesArray,
                currentSlide: 0,
                track: trackEl,
                indicatorsContainer: indicatorsEl,
                isAnimating: false,
                leftArrow: null,
                rightArrow: null,
                transitionHandler: null
            };

            if (section.isCarousel && section.track) {
                this.initializeIndicators(section);
                this.initializeCarouselTransitionHandler(section);
            }

            this.sections.push(section);
        });
    }

    initializeCarouselTransitionHandler(section) {
        if (!section.track) return;

        section.transitionHandler = (e) => {
            if (e.target === section.track && e.propertyName === 'transform') {
                section.isAnimating = false;
                this.isScrolling = false;
            }
        };

        section.track.addEventListener('transitionend', section.transitionHandler);
    }

    initializeCarouselTouchSwipe() {
        this.sections.forEach(section => {
            if (section.isCarousel && section.track) {
                const handler = new CarouselTouchSwipeHandler(
                    section.track,
                    section.index,
                    this
                );
                this.swipeHandlers.push(handler);
            }
        });
    }

    initializeIndicators(section) {
        if (!section.indicatorsContainer) return;

        section.indicatorsContainer.innerHTML = '';

        const navWrapper = document.createElement('div');
        navWrapper.className = 'carousel-nav';

        const leftArrow = document.createElement('button');
        leftArrow.className = 'carousel-arrow carousel-arrow-left';
        leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        const leftHandler = () => this.previousSlide(section.index);
        leftArrow.addEventListener('click', leftHandler);
        leftArrow._handler = leftHandler;

        const indicatorsWrapper = document.createElement('div');
        indicatorsWrapper.className = 'carousel-indicators';

        section.slides.forEach((slide, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if (index === 0) indicator.classList.add('active');
            
            const indicatorHandler = () => this.goToSlide(section.index, index);
            indicator.addEventListener('click', indicatorHandler);
            indicator._handler = indicatorHandler;
            
            indicatorsWrapper.appendChild(indicator);
        });

        const rightArrow = document.createElement('button');
        rightArrow.className = 'carousel-arrow carousel-arrow-right';
        rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        const rightHandler = () => this.nextSlide(section.index);
        rightArrow.addEventListener('click', rightHandler);
        rightArrow._handler = rightHandler;

        navWrapper.appendChild(leftArrow);
        navWrapper.appendChild(indicatorsWrapper);
        navWrapper.appendChild(rightArrow);
        section.indicatorsContainer.appendChild(navWrapper);

        section.leftArrow = leftArrow;
        section.rightArrow = rightArrow;

        this.updateArrowStates(section);
    }

    updateArrowStates(section) {
        if (!section.leftArrow || !section.rightArrow) return;

        if (section.currentSlide === 0) {
            section.leftArrow.classList.add('disabled');
        } else {
            section.leftArrow.classList.remove('disabled');
        }

        if (section.currentSlide === section.slides.length - 1) {
            section.rightArrow.classList.add('disabled');
        } else {
            section.rightArrow.classList.remove('disabled');
        }
    }

    previousSlide(sectionIndex) {
        const section = this.sections[sectionIndex];
        if (!section || !section.isCarousel || section.currentSlide === 0 || section.isAnimating) return;

        section.currentSlide--;
        this.updateCarouselSlide(section);
    }

    nextSlide(sectionIndex) {
        const section = this.sections[sectionIndex];
        if (!section || !section.isCarousel || section.currentSlide === section.slides.length - 1 || section.isAnimating) return;

        section.currentSlide++;
        this.updateCarouselSlide(section);
    }

    initializeDesktopScrollListener() {
        let canProcess = true;
        let processTimeout = null;

        this.wheelHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!canProcess) return;

            const now = Date.now();
            if (this.isScrolling || (now - this.lastScrollTime) < this.SCROLL_COOLDOWN) return;

            const currentSection = this.sections[this.currentSectionIndex];
            if (!currentSection) return;

            const absVertical = Math.abs(e.deltaY);
            const absHorizontal = Math.abs(e.deltaX);

            const isHorizontalScroll = absHorizontal > absVertical && absHorizontal > this.HORIZONTAL_DELTA_THRESHOLD;

            if (isHorizontalScroll && currentSection.isCarousel && !currentSection.isAnimating) {
                if (absHorizontal < this.DELTA_THRESHOLD) return;
                
                const direction = e.deltaX > 0 ? 'next' : 'prev';

                if (direction === 'next' && currentSection.currentSlide < currentSection.slides.length - 1) {
                    canProcess = false;
                    if (processTimeout) clearTimeout(processTimeout);
                    processTimeout = setTimeout(() => canProcess = true, 150);
                    this.lastScrollTime = now;
                    currentSection.currentSlide++;
                    this.updateCarouselSlide(currentSection);
                } else if (direction === 'prev' && currentSection.currentSlide > 0) {
                    canProcess = false;
                    if (processTimeout) clearTimeout(processTimeout);
                    processTimeout = setTimeout(() => canProcess = true, 150);
                    this.lastScrollTime = now;
                    currentSection.currentSlide--;
                    this.updateCarouselSlide(currentSection);
                }
                return;
            }

            if (absVertical < this.DELTA_THRESHOLD) return;

            const direction = e.deltaY > 0 ? 'forward' : 'backward';

            canProcess = false;
            if (processTimeout) clearTimeout(processTimeout);
            processTimeout = setTimeout(() => canProcess = true, 150);

            this.isScrolling = true;
            this.lastScrollTime = now;
            this.handleScroll(direction);
        };

        window.addEventListener('wheel', this.wheelHandler, { passive: false });

        this.scrollHandler = () => {
            if (this.isScrolling) return;

            if (this.scrollEndTimeout) clearTimeout(this.scrollEndTimeout);
            this.scrollEndTimeout = setTimeout(() => {
                if (!this.isScrolling) this.snapToNearestSection();
            }, 150);
        };

        window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    handleScroll(direction) {
        if (direction === 'forward') {
            this.moveToNextSection();
        } else {
            this.moveToPreviousSection();
        }
    }

    moveToNextSection() {
        if (this.currentSectionIndex < this.sections.length - 1) {
            this.currentSectionIndex++;
            this.scrollToCurrentSection();
        } else {
            this.isScrolling = false;
        }
    }

    moveToPreviousSection() {
        if (this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
            this.scrollToCurrentSection();
        } else {
            this.isScrolling = false;
        }
    }

    scrollToCurrentSection() {
        const section = this.sections[this.currentSectionIndex];
        if (!section) return;
        
        const targetPosition = section.element.offsetTop - this.headerOffset;

        this.isScrolling = true;
        this.smoothScrollTo(targetPosition);
    }

    updateCarouselSlide(section) {
        if (!section) return;

        section.isAnimating = true;

        section.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === section.currentSlide);
        });

        if (section.track) {
            section.track.style.transform = `translateX(-${section.currentSlide * 100}%)`;
        }

        if (section.indicatorsContainer) {
            const indicators = section.indicatorsContainer.querySelectorAll('.indicator');
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === section.currentSlide);
            });
        }

        this.updateArrowStates(section);
    }

    goToSlide(sectionIndex, slideIndex) {
        const section = this.sections[sectionIndex];
        if (!section || !section.isCarousel || section.isAnimating) return;

        section.currentSlide = slideIndex;
        this.updateCarouselSlide(section);
    }

    smoothScrollTo(targetPosition) {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

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
                this.rafId = requestAnimationFrame(animation);
            } else {
                window.scrollTo(0, targetPosition);
                this.rafId = null;
                this.isScrolling = false;
                this.updateActiveNav();
            }
        };

        this.rafId = requestAnimationFrame(animation);
    }

    smoothScrollToSelector(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        const sectionIndex = this.sections.findIndex(s => s.element === element);
        if (sectionIndex !== -1) {
            this.currentSectionIndex = sectionIndex;

            const section = this.sections[sectionIndex];
            if (section && section.isCarousel) {
                section.currentSlide = 0;
                this.updateCarouselSlide(section);
            }
        }

        if (this.deviceType !== 'desktop') {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            this.isScrolling = true;
            const targetPosition = element.offsetTop - this.headerOffset;
            this.smoothScrollTo(targetPosition);
        }
    }

    updateActiveNav() {
        const currentSection = this.sections[this.currentSectionIndex];
        if (!currentSection) return;

        const sectionId = currentSection.id;

        document.querySelectorAll('.nav-item').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    snapToNearestSection() {
        if (this.deviceType !== 'desktop') return;

        const scrollPos = window.pageYOffset + this.headerOffset;
        let closestIndex = 0;
        let closestDistance = Infinity;

        this.sections.forEach((section, index) => {
            if (!section) return;
            const sectionTop = section.element.offsetTop;
            const distance = Math.abs(scrollPos - sectionTop);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        if (closestDistance > 10) {
            this.currentSectionIndex = closestIndex;
            const section = this.sections[closestIndex];
            if (section) {
                const targetPosition = section.element.offsetTop - this.headerOffset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                this.updateActiveNav();
            }
        }
    }

    initializeNavigation() {
        document.querySelectorAll('.nav-item').forEach(anchor => {
            const handler = (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                this.smoothScrollToSelector(targetId);

                document.querySelectorAll('.nav-item').forEach(link => link.classList.remove('active'));
                anchor.classList.add('active');
            };

            anchor.addEventListener('click', handler);
            this.navClickHandlers.push({ element: anchor, handler: handler });
        });
    }

    destroy() {
        // Cancel animations
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // Clear timeouts
        if (this.scrollEndTimeout) {
            clearTimeout(this.scrollEndTimeout);
            this.scrollEndTimeout = null;
        }

        // Remove wheel and scroll listeners
        if (this.wheelHandler) {
            window.removeEventListener('wheel', this.wheelHandler);
            this.wheelHandler = null;
        }

        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
            this.scrollHandler = null;
        }

        // Remove navigation handlers
        this.navClickHandlers.forEach(({ element, handler }) => {
            element.removeEventListener('click', handler);
        });
        this.navClickHandlers = [];

        // Destroy swipe handlers
        this.swipeHandlers.forEach(handler => {
            if (handler && handler.destroy) handler.destroy();
        });
        this.swipeHandlers = [];

        // Clean up sections
        this.sections.forEach(section => {
            if (!section) return;

            // Remove transition handler
            if (section.track && section.transitionHandler) {
                section.track.removeEventListener('transitionend', section.transitionHandler);
                section.transitionHandler = null;
            }

            // Remove arrow handlers
            if (section.leftArrow && section.leftArrow._handler) {
                section.leftArrow.removeEventListener('click', section.leftArrow._handler);
                section.leftArrow._handler = null;
            }

            if (section.rightArrow && section.rightArrow._handler) {
                section.rightArrow.removeEventListener('click', section.rightArrow._handler);
                section.rightArrow._handler = null;
            }

            // Remove indicator handlers
            if (section.indicatorsContainer) {
                const indicators = section.indicatorsContainer.querySelectorAll('.indicator');
                indicators.forEach(indicator => {
                    if (indicator._handler) {
                        indicator.removeEventListener('click', indicator._handler);
                        indicator._handler = null;
                    }
                });
            }

            // Null out references
            section.element = null;
            section.track = null;
            section.indicatorsContainer = null;
            section.leftArrow = null;
            section.rightArrow = null;
            section.slides = [];
        });

        this.sections = [];
    }
}

// ===== INITIALIZATION =====
let sectionManager = null;

function initApp() {
    if (sectionManager) {
        sectionManager.destroy();
    }
    sectionManager = new UnifiedSectionManager();
    sectionManager.updateActiveNav();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (sectionManager) {
        sectionManager.destroy();
        sectionManager = null;
    }
});