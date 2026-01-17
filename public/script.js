// Bay Pet Ventures - Homepage Script
document.addEventListener('DOMContentLoaded', function() {
    // Session Time Tracking (across all pages)
    const SESSION_KEY = 'bpv_session';
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min inactivity = new session
    
    function getSession() {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            const session = JSON.parse(stored);
            const now = Date.now();
            // If last activity was more than 30 min ago, start new session
            if (now - session.lastActivity > SESSION_TIMEOUT) {
                return { startTime: now, totalTime: 0, lastActivity: now, pagesVisited: [window.location.pathname] };
            }
            // Add current page if not already tracked
            if (!session.pagesVisited.includes(window.location.pathname)) {
                session.pagesVisited.push(window.location.pathname);
            }
            session.lastActivity = now;
            return session;
        }
        return { startTime: Date.now(), totalTime: 0, lastActivity: Date.now(), pagesVisited: [window.location.pathname] };
    }
    
    function saveSession(session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    
    // Initialize session
    saveSession(getSession());
    
    // Page Time Tracking for Meta Pixel (per-page only)
    let tabStartTime = Date.now();
    let totalTimeOnPage = 0; // Time on THIS page only
    let timeInBackground = 0; // Background time on THIS page only
    let isPageVisible = true;
    let finalEventSent = false; // Prevent duplicate final events
    
    // Get clean page identifier
    function getPageIdentifier() {
        const path = window.location.pathname.toLowerCase();
        if (path === '/' || path.includes('index.html')) return 'Homepage';
        if (path.includes('meet-the-owners')) return 'Meet the Owners';
        if (path.includes('services')) return 'Trip Info';
        if (path.includes('faq')) return 'FAQ';
        if (path.includes('register')) return 'Register';
        if (path.includes('contact')) return 'Contact Us';
        return document.title || path;
    }
    
    const pageName = getPageIdentifier();
    const TEST_EVENT_CODE = 'TEST73273';
    
    // Convert page name to event name (e.g., "Homepage" -> "HomePageTotalTimeSpent")
    function getPageTimeEventName() {
        const eventNameMap = {
            'Homepage': 'HomePageTotalTimeSpent',
            'Meet the Owners': 'MeetTheOwnersTotalTimeSpent',
            'Trip Info': 'TripInfoTotalTimeSpent',
            'FAQ': 'FAQTotalTimeSpent',
            'Register': 'RegisterTotalTimeSpent',
            'Contact Us': 'ContactUsTotalTimeSpent'
        };
        return eventNameMap[pageName] || `${pageName.replace(/\s+/g, '')}TotalTimeSpent`;
    }
    
    // Helper function to track Meta Pixel events
    // Automatically includes page_name and test_event_code in all events
    function trackEvent(eventName, data = {}) {
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', eventName, { 
                ...data, 
                page_name: pageName, 
                test_event_code: TEST_EVENT_CODE 
            });
        }
    }
    
    // Track page view with page name
    trackEvent('SpecificPageViewed');
    
    // Track tab visibility changes
    function trackTabSwitch(isVisible) {
        const now = Date.now();
        
        if (isPageVisible && !isVisible) {
            // Tab switched away
            const timeBeforeSwitch = now - tabStartTime;
            totalTimeOnPage += timeBeforeSwitch;
            tabStartTime = now;
            isPageVisible = false;
            
            // Update session with time spent before switching away
            const currentSession = getSession();
            currentSession.totalTime += timeBeforeSwitch;
            currentSession.lastActivity = now;
            saveSession(currentSession);
            
            trackEvent('TabSwitchedAway', {
                time_on_page: Math.round(totalTimeOnPage / 1000)
            });
        } else if (!isPageVisible && isVisible) {
            // Tab switched back
            const timeInBackgroundThisSession = now - tabStartTime;
            timeInBackground += timeInBackgroundThisSession;
            isPageVisible = true;
            tabStartTime = now;
            trackEvent('TabSwitchedBack', {
                time_in_background: Math.round(timeInBackgroundThisSession / 1000),
                total_time_in_background: Math.round(timeInBackground / 1000)
            });
        }
    }
    
    // Function to send page-specific time spent event (fires once on page exit)
    function sendPageTimeSpent() {
        // Prevent duplicate events
        if (finalEventSent) {
            return;
        }
        
        const now = Date.now();
        let timeIncrement = 0;
        
        if (isPageVisible) {
            timeIncrement = now - tabStartTime;
            totalTimeOnPage += timeIncrement;
        }
        
        finalEventSent = true;
        
        // Update session with time spent on this page
        const currentSession = getSession();
        // Add only the incremental time since last calculation (prevents double-counting)
        currentSession.totalTime += timeIncrement;
        currentSession.lastActivity = now;
        saveSession(currentSession);
        
        // Get page-specific event name (e.g., "HomePageTotalTimeSpent", "ContactUsTotalTimeSpent")
        const pageTimeEventName = getPageTimeEventName();
        
        trackEvent(pageTimeEventName, {
            total_time_seconds: Math.round(totalTimeOnPage / 1000),
            time_in_background_seconds: Math.round(timeInBackground / 1000),
            session_time_seconds: Math.round(currentSession.totalTime / 1000),
            pages_visited: currentSession.pagesVisited.length
        });
    }
    
    // Initialize tab tracking
    // Use visibilitychange as primary method (more reliable than blur/focus)
    document.addEventListener('visibilitychange', () => {
        trackTabSwitch(!document.hidden);
    });
    
    // Track when user sees the pricing section
    const pricingSection = document.querySelector('.package-offer-section');
    if (pricingSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                trackEvent('ViewedPricing');
                observer.disconnect();
            }
        });
        observer.observe(pricingSection);
    }
    
    // Track time on page when leaving (fires once per page visit)
    window.addEventListener('beforeunload', () => {
        sendPageTimeSpent();
    });
    
    // Also track on pagehide (more reliable than beforeunload in some browsers)
    window.addEventListener('pagehide', () => {
        sendPageTimeSpent();
    });
    
    // Discount Banner Functionality
    const discountBanner = document.getElementById('discountBanner');
    const discountBannerClose = document.getElementById('discountBannerClose');
    const currentMonthElement = document.getElementById('currentMonth');
    
    if (discountBanner && currentMonthElement) {
        // Get current month name
        const currentDate = new Date();
        const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
        currentMonthElement.textContent = currentMonthName;
        
        // Always show banner on page load
        discountBanner.classList.remove('hidden');
        
        // Close banner functionality (hides for current session only)
        if (discountBannerClose) {
            discountBannerClose.addEventListener('click', function() {
                discountBanner.classList.add('hidden');
            });
        }
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Ensure video autoplays on mobile
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Set video properties for mobile compatibility
        heroVideo.setAttribute('playsinline', '');
        heroVideo.setAttribute('webkit-playsinline', '');
        heroVideo.muted = true;
        
        // Function to attempt video playback
        const attemptPlay = () => {
            heroVideo.play().catch(() => {
                // Autoplay was prevented, try again after user interaction
                const playOnInteraction = () => {
                    heroVideo.play().catch(() => {});
                };
                document.addEventListener('touchstart', playOnInteraction, { once: true });
                document.addEventListener('click', playOnInteraction, { once: true });
            });
        };
        
        // Try to play immediately
        if (heroVideo.readyState >= 2) {
            attemptPlay();
        } else {
            heroVideo.addEventListener('loadeddata', attemptPlay, { once: true });
            heroVideo.addEventListener('canplay', attemptPlay, { once: true });
        }
        
        // Ensure video plays when it becomes visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && heroVideo.paused) {
                    attemptPlay();
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(heroVideo);
    }
    
    // Testimonials Auto-Scroll
    const testimonialsTrack = document.getElementById('testimonialsTrack');
    const testimonialsContainer = document.querySelector('.testimonials-container');
    
    if (testimonialsTrack && testimonialsContainer) {
        // Randomize testimonials order (excluding duplicates)
        const allItems = Array.from(testimonialsTrack.querySelectorAll('.testimonial-item'));
        
        // Find comment node to separate original items from duplicates
        const allNodes = Array.from(testimonialsTrack.childNodes);
        const commentIndex = allNodes.findIndex(node => 
            node.nodeType === 8 && node.textContent.includes('Duplicate'));
        
        if (commentIndex !== -1 && allItems.length > 2) {
            // Count items before comment (original items)
            let itemsBeforeComment = 0;
            for (let i = 0; i < commentIndex; i++) {
                if (allNodes[i].nodeType === 1 && allNodes[i].classList.contains('testimonial-item')) {
                    itemsBeforeComment++;
                }
            }
            
            const originalItemsArray = allItems.slice(0, itemsBeforeComment);
            const firstTwoItems = originalItemsArray.slice(0, 2);
            
            // Shuffle original items using Fisher-Yates algorithm
            for (let i = originalItemsArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [originalItemsArray[i], originalItemsArray[j]] = [originalItemsArray[j], originalItemsArray[i]];
            }
            
            // Rebuild the track with shuffled items
            testimonialsTrack.innerHTML = '';
            originalItemsArray.forEach(item => testimonialsTrack.appendChild(item));
            
            // Add comment
            const comment = document.createComment(' Duplicate items for seamless loop ');
            testimonialsTrack.appendChild(comment);
            
            // Add first 2 items as duplicates for seamless loop
            firstTwoItems.forEach(item => {
                const clone = item.cloneNode(true);
                testimonialsTrack.appendChild(clone);
            });
        }
        
        let scrollPosition = 0;
        let isPaused = false;
        const scrollSpeed = 1.5; // pixels per frame
        const itemWidth = 350; // width of each testimonial item including gap (320px + 30px gap)
        const originalItemsCount = 30; // Number of original testimonials (before duplicates)
        const resetPoint = originalItemsCount * itemWidth;
        
        // Pause on hover (desktop)
        testimonialsContainer.addEventListener('mouseenter', () => {
            isPaused = true;
        });
        
        testimonialsContainer.addEventListener('mouseleave', () => {
            isPaused = false;
        });
        
        // Pause on touch (mobile)
        let touchTimeout = null;
        const clearTouchTimeout = () => {
            if (touchTimeout) clearTimeout(touchTimeout);
        };
        
        testimonialsContainer.addEventListener('touchstart', () => {
            isPaused = true;
            clearTouchTimeout();
        });
        
        testimonialsContainer.addEventListener('touchmove', () => {
            isPaused = true;
            clearTouchTimeout();
        });
        
        testimonialsContainer.addEventListener('touchend', () => {
            clearTouchTimeout();
            touchTimeout = setTimeout(() => { isPaused = false; }, 500);
        });
        
        // Auto-scroll animation
        function animate() {
            if (!isPaused) {
                scrollPosition += scrollSpeed;
                
                // Reset position when we've scrolled past all original items (seamless loop)
                if (scrollPosition >= resetPoint) {
                    scrollPosition = 0;
                }
                
                testimonialsTrack.style.transform = `translateX(-${scrollPosition}px)`;
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
});
