document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeSwitcher = document.getElementById('theme-switcher');
    const themeIcon = themeSwitcher.querySelector('i');

    const setGlobalThemeIcon = (theme) => {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    };

    // If no theme is saved in localStorage, default to 'dark'
    let currentGlobalTheme = localStorage.getItem('theme') || 'dark'; 
    body.setAttribute('data-theme', currentGlobalTheme);
    setGlobalThemeIcon(currentGlobalTheme);

    themeSwitcher.addEventListener('click', () => {
        currentGlobalTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', currentGlobalTheme);
        localStorage.setItem('theme', currentGlobalTheme);
        setGlobalThemeIcon(currentGlobalTheme);
    });

    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        body.classList.add('loading');
        setTimeout(() => {
            if (preloader) preloader.classList.add('hidden');
            body.classList.remove('loading');
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) heroSection.classList.add('visible');
            prepareLineAnimations();
        }, 2500);
    });

    const lenis = new Lenis({ 
        duration: 1.4, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        lerp: 0.08 
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    const header = document.querySelector('.main-header');
    
    if (header && typeof lenis !== 'undefined') {
        lenis.on('scroll', () => {
            if (lenis.scroll > 30) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    function prepareLineAnimations() {
        document.querySelectorAll('.animate-text-lines').forEach(element => {
            if (element.classList.contains('lines-prepared')) return;
            const lines = element.innerHTML.split(/<br\s*\/?>|\n/).map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length > 0) {
                element.innerHTML = '';
                lines.forEach((lineText, index) => {
                    const lineWrapper = document.createElement('span');
                    lineWrapper.classList.add('reveal-line-wrapper');
                    const lineContent = document.createElement('span');
                    lineContent.classList.add('reveal-line-content');
                    lineContent.innerHTML = lineText;
                    const baseDelay = parseFloat(element.dataset.delay) || 0;
                    lineContent.style.transitionDelay = `${baseDelay + index * 0.18}s`;
                    lineWrapper.appendChild(lineContent);
                    element.appendChild(lineWrapper);
                });
                element.classList.add('lines-prepared');
            }
        });
    }

    const animatedElements = document.querySelectorAll(
        '.fade-in, .slide-up, .zoom-in, .scale-fade-reveal, .animate-footer-item, .animate-footer-heading, .slide-up-card, .slide-up-rotate, .fade-in-up, .animate-text-lines'
    );
    const observerOptions = { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.01 };
    const staggerBaseDelay = 0.15;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let individualDelay = parseFloat(entry.target.dataset.delay) || 0;
                const staggerIndex = parseInt(entry.target.dataset.staggerDelay);
                if (!isNaN(staggerIndex)) individualDelay += staggerIndex * staggerBaseDelay;
                if (!entry.target.classList.contains('animate-text-lines')) {
                    entry.target.style.transitionDelay = `${individualDelay}s`;
                }
                entry.target.classList.add('visible');
                if (!entry.target.classList.contains('animate-text-lines') || entry.target.classList.contains('visible')) {
                    obs.unobserve(entry.target); 
                }
            }
        });
    }, observerOptions);
    animatedElements.forEach(el => observer.observe(el));

    const statsSection = document.querySelector('.stats-section');
    let statsAnimated = false;
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, obs) => {
            if (entries[0].isIntersecting && !statsAnimated) {
                statsAnimated = true;
                document.querySelectorAll('.stat-item').forEach(statItem => {
                    const el = statItem.querySelector('.stat-number');
                    if (!el) return;
                    const itemDelay = (parseFloat(statItem.dataset.staggerDelay) || 0) * staggerBaseDelay * 1000;
                    setTimeout(() => {
                        const target = +(el.dataset.target.replace(/[+,%]/g, ''));
                        const suffix = el.dataset.target.includes('+') ? '+' : (el.dataset.target.includes('%') ? '%' : '');
                        let current = 0; const duration = 2200; const frameDuration = 1000 / 60;
                        const totalFrames = Math.round(duration / frameDuration); const increment = target / totalFrames;
                        const updateCount = () => {
                            current += increment;
                            if (current >= target) el.innerText = Math.floor(target).toLocaleString() + suffix;
                            else { el.innerText = Math.floor(current).toLocaleString() + suffix; requestAnimationFrame(updateCount); }
                        };
                        updateCount();
                    }, itemDelay + 250);
                });
                obs.unobserve(statsSection);
            }
        }, { threshold: 0.3 });
        statsObserver.observe(statsSection);
    }

    const horizontalScrollSection = document.querySelector('.horizontal-scroll-section');
    const scrollContent = document.querySelector('.horizontal-scroll-section .scroll-content');
    
    if (horizontalScrollSection && scrollContent && window.innerWidth > 992) {
        let maxScrollLeft = 0;
        const calculateMaxScroll = () => {
            setTimeout(() => {
                if (scrollContent.parentElement && scrollContent.scrollWidth > scrollContent.parentElement.clientWidth) {
                    maxScrollLeft = scrollContent.scrollWidth - scrollContent.parentElement.clientWidth;
                } else maxScrollLeft = 0;
            }, 180);
        };
        calculateMaxScroll(); window.addEventListener('resize', calculateMaxScroll);
        lenis.on('scroll', (e) => {
            if (window.innerWidth <= 992 || maxScrollLeft <= 0) { scrollContent.style.transform = `translateX(0px)`; return; }
            const scrollValue = e.animatedScroll;
            const sectionOffsetTop = horizontalScrollSection.offsetTop;
            const scrollableHeight = horizontalScrollSection.offsetHeight - window.innerHeight;
            if (scrollValue >= sectionOffsetTop && scrollValue <= sectionOffsetTop + scrollableHeight) {
                const progress = Math.max(0, Math.min(1, (scrollValue - sectionOffsetTop) / scrollableHeight));
                scrollContent.style.transform = `translateX(${-progress * maxScrollLeft}px)`;
            } else if (scrollValue < sectionOffsetTop) scrollContent.style.transform = `translateX(0px)`;
            else scrollContent.style.transform = `translateX(-${maxScrollLeft}px)`;
        });
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    if (window.innerWidth > 992) {
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) mainNav.style.display = 'flex';
    }
});