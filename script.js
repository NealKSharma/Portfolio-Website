// Typing animation
const words = ["Software Developer", "AI Researcher", "Full-Stack Engineer", "Problem Solver", "Tech Enthusiast"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const typingElement = document.querySelector('.typing-text span');
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

// Carousel class for Experience and Projects
class Carousel {
    constructor(trackId, indicatorsId, sectionId) {
        this.track = document.getElementById(trackId);
        this.slides = this.track.querySelectorAll('.carousel-slide');
        this.indicatorsContainer = document.getElementById(indicatorsId);
        this.section = document.getElementById(sectionId);
        this.currentIndex = 0;
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        this.initializeIndicators();
        this.initializeScrollListener();
    }
    
    initializeIndicators() {
        this.indicatorsContainer.innerHTML = '';
        
        this.slides.forEach((slide, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goTo(index));
            this.indicatorsContainer.appendChild(indicator);
        });
    }
    
    update() {
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentIndex);
        });
        
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        
        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    next() {
        if (this.currentIndex < this.slides.length - 1) {
            this.currentIndex++;
            this.update();
            return true;
        }
        return false;
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.update();
            return true;
        }
        return false;
    }
    
    goTo(index) {
        this.currentIndex = index;
        this.update();
    }
    
    isAtStart() {
        return this.currentIndex === 0;
    }
    
    isAtEnd() {
        return this.currentIndex === this.slides.length - 1;
    }
    
    initializeScrollListener() {
        this.section.addEventListener('wheel', (e) => {
            if (!this.isInViewport()) return;
            
            e.preventDefault();
            
            if (this.isScrolling) return;
            
            this.isScrolling = true;
            clearTimeout(this.scrollTimeout);
            
            const direction = e.deltaY > 0 ? 'down' : 'up';
            
            if (direction === 'down') {
                const canAdvance = this.next();
                if (!canAdvance) {
                    this.scrollTimeout = setTimeout(() => {
                        this.isScrolling = false;
                        sectionScrollManager.scrollToNextSection();
                    }, 300);
                    return;
                }
            } else {
                const canGoBack = this.prev();
                if (!canGoBack) {
                    this.scrollTimeout = setTimeout(() => {
                        this.isScrolling = false;
                        sectionScrollManager.scrollToPrevSection();
                    }, 300);
                    return;
                }
            }
            
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 600);
        }, { passive: false });
    }
    
    isInViewport() {
        const rect = this.section.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
    }
}

// Section scroll manager for non-carousel sections
class SectionScrollManager {
    constructor() {
        this.sections = Array.from(document.querySelectorAll('section'));
        this.currentSectionIndex = 0;
        this.isScrolling = false;
        this.headerOffset = 80;
        
        this.initializeScrollListener();
        this.initializeNavigation();
    }
    
    initializeScrollListener() {
        window.addEventListener('wheel', (e) => {
            const currentSection = this.sections[this.currentSectionIndex];
            
            if (currentSection && currentSection.classList.contains('carousel-section')) {
                return;
            }
            
            if (this.isScrolling) return;
            
            e.preventDefault();
            
            if (e.deltaY > 0) {
                this.scrollToNextSection();
            } else {
                this.scrollToPrevSection();
            }
        }, { passive: false });
    }
    
    scrollToNextSection() {
        if (this.currentSectionIndex < this.sections.length - 1 && !this.isScrolling) {
            this.currentSectionIndex++;
            this.scrollToSection(this.currentSectionIndex);
        }
    }
    
    scrollToPrevSection() {
        if (this.currentSectionIndex > 0 && !this.isScrolling) {
            this.currentSectionIndex--;
            this.scrollToSection(this.currentSectionIndex);
        }
    }
    
    scrollToSection(index) {
        if (index < 0 || index >= this.sections.length || this.isScrolling) return;
        
        this.currentSectionIndex = index;
        const targetPosition = this.sections[index].offsetTop - this.headerOffset;
        
        this.isScrolling = true;
        this.smoothScrollTo(targetPosition);
    }
    
    smoothScrollTo(targetPosition) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800;
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
                this.isScrolling = false;
                this.updateCurrentSection();
            }
        };
        
        requestAnimationFrame(animation);
    }
    
    smoothScrollToSelector(selector) {
        const element = document.querySelector(selector);
        if (element) {
            this.isScrolling = true;
            const targetPosition = element.offsetTop - this.headerOffset;
            this.smoothScrollTo(targetPosition);
            
            setTimeout(() => {
                this.updateCurrentSection();
            }, 900);
        }
    }
    
    updateCurrentSection() {
        const scrollPosition = window.pageYOffset + (window.innerHeight / 3);
        
        for (let i = 0; i < this.sections.length; i++) {
            const section = this.sections[i];
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                this.currentSectionIndex = i;
                
                const sectionId = section.getAttribute('id');
                document.querySelectorAll('.nav a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
                break;
            }
        }
    }
    
    initializeNavigation() {
        document.querySelectorAll('.nav a').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                this.smoothScrollToSelector(targetId);
                
                document.querySelectorAll('.nav a').forEach(link => link.classList.remove('active'));
                anchor.classList.add('active');
            });
        });
    }
}

// Initialize everything when DOM is ready
let experienceCarousel;
let projectCarousel;
let sectionScrollManager;

document.addEventListener('DOMContentLoaded', function() {
    type();
    
    experienceCarousel = new Carousel('experienceTrack', 'experienceIndicators', 'experience');
    projectCarousel = new Carousel('projectTrack', 'projectIndicators', 'projects');
    
    sectionScrollManager = new SectionScrollManager();
    
    sectionScrollManager.updateCurrentSection();
});