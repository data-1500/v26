/**
 * Slide System - Presentation mode functionality
 * Creates slides from content, handles navigation, keyboard shortcuts
 */

let currentSlide = 0;
let slides = [];
let slideNav = null;
let slideDots = null;

// Initialize slides when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const modeBtns = document.querySelectorAll('.mode-btn');
    const main = document.querySelector('.main');
    
    // Create slides from content
    function createSlides() {
        const content = Array.from(main.children).filter(el => 
            !el.classList.contains('mode-toggle') && 
            !el.classList.contains('slide-nav') &&
            !el.classList.contains('slide-dots') &&
            !el.classList.contains('keyboard-hint')
        );
        
        slides = [];
        let currentSlideContent = [];
        let slideBreakPoints = [];
        
        // Find h1 for title slide
        const h1Index = content.findIndex(el => el.tagName === 'H1');
        if (h1Index !== -1) {
            slideBreakPoints.push(h1Index);
        }
        
        // Find all h2 and hr elements as slide breaks
        content.forEach((el, index) => {
            if (el.tagName === 'H2' || el.tagName === 'HR') {
                if (el.tagName === 'HR' && index + 1 < content.length) {
                    // HR followed by content starts a new slide
                    slideBreakPoints.push(index + 1);
                } else if (el.tagName === 'H2') {
                    slideBreakPoints.push(index);
                }
            }
        });
        
        // Create slides based on break points
        slideBreakPoints.push(content.length); // End marker
        
        for (let i = 0; i < slideBreakPoints.length - 1; i++) {
            const start = slideBreakPoints[i];
            const end = slideBreakPoints[i + 1];
            const slideContent = content.slice(start, end);
            
            // Skip empty slides or slides with only HR
            if (slideContent.length > 0 && 
                !(slideContent.length === 1 && slideContent[0].tagName === 'HR')) {
                
                // Create slide wrapper
                const slideDiv = document.createElement('div');
                slideDiv.className = 'slide';
                
                // Move content into slide
                slideContent.forEach(el => {
                    if (el.tagName !== 'HR') { // Don't include HR in slide
                        slideDiv.appendChild(el);
                    }
                });
                
                slides.push(slideDiv);
                main.appendChild(slideDiv);
            }
        }
        
        // Remove any remaining HR elements
        Array.from(main.querySelectorAll('hr')).forEach(hr => hr.remove());
    }
    
    // Create navigation UI
    function createNavigation() {
        // Create slide navigation controls
        slideNav = document.createElement('div');
        slideNav.className = 'slide-nav';
        slideNav.innerHTML = `
            <button class="slide-prev" aria-label="Previous slide">‹</button>
            <div class="slide-counter">1 of ${slides.length}</div>
            <button class="slide-next" aria-label="Next slide">›</button>
        `;
        main.appendChild(slideNav);
        
        // Create dots indicator
        slideDots = document.createElement('div');
        slideDots.className = 'slide-dots';
        for (let i = 0; i < Math.min(slides.length, 10); i++) {
            const dot = document.createElement('div');
            dot.className = 'slide-dot';
            dot.dataset.slide = i;
            dot.addEventListener('click', () => goToSlide(i));
            slideDots.appendChild(dot);
        }
        main.appendChild(slideDots);
        
        // Bind navigation buttons
        slideNav.querySelector('.slide-prev').addEventListener('click', prevSlide);
        slideNav.querySelector('.slide-next').addEventListener('click', nextSlide);
    }
    
    // Show specific slide
    function showSlide(index) {
        if (index < 0 || index >= slides.length) return;
        
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Show current slide
        slides[index].classList.add('active');
        currentSlide = index;
        
        // Update counter
        if (slideNav) {
            slideNav.querySelector('.slide-counter').textContent = 
                `${index + 1} of ${slides.length}`;
            
            // Update button states
            slideNav.querySelector('.slide-prev').disabled = index === 0;
            slideNav.querySelector('.slide-next').disabled = index === slides.length - 1;
        }
        
        // Update dots
        if (slideDots) {
            slideDots.querySelectorAll('.slide-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
        
        // Update URL hash
        window.location.hash = `slide-${index + 1}`;
    }
    
    // Navigation functions
    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            showSlide(currentSlide + 1);
        }
    }
    
    function prevSlide() {
        if (currentSlide > 0) {
            showSlide(currentSlide - 1);
        }
    }
    
    function goToSlide(index) {
        showSlide(index);
    }
    
    // Mode toggle functionality
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.dataset.mode;
            
            // Update button states
            modeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update body class and initialize slides if needed
            if (mode === 'slides') {
                body.classList.add('slides-mode');
                
                // Initialize slides if not already done
                if (slides.length === 0) {
                    createSlides();
                    createNavigation();
                }
                
                // Check for hash or show first slide
                const hash = window.location.hash;
                const slideMatch = hash.match(/slide-(\d+)/);
                if (slideMatch) {
                    showSlide(parseInt(slideMatch[1]) - 1);
                } else {
                    showSlide(0);
                }
            } else {
                body.classList.remove('slides-mode');
                window.location.hash = '';
            }
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!body.classList.contains('slides-mode')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'ArrowRight':
            case ' ': // Spacebar
                e.preventDefault();
                nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(slides.length - 1);
                break;
            case 'Escape':
                e.preventDefault();
                // Exit slides mode
                modeBtns.forEach(btn => {
                    if (btn.dataset.mode === 'docs') {
                        btn.click();
                    }
                });
                break;
            default:
                // Number keys 1-9 for quick navigation
                if (e.key >= '1' && e.key <= '9') {
                    const slideNum = parseInt(e.key) - 1;
                    if (slideNum < slides.length) {
                        goToSlide(slideNum);
                    }
                }
        }
    });
    
    // Handle browser back/forward
    window.addEventListener('hashchange', function() {
        if (body.classList.contains('slides-mode')) {
            const hash = window.location.hash;
            const slideMatch = hash.match(/slide-(\d+)/);
            if (slideMatch) {
                showSlide(parseInt(slideMatch[1]) - 1);
            }
        }
    });
});