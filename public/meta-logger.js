// Meta Pixel Event Logger - Intercepts fbq calls and logs to server terminal
(function() {
    'use strict';
    
    // Only run in development/local environment
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isLocal) {
        return; // Don't intercept in production
    }
    
    // Store original fbq
    let originalFbq = null;
    let isWrapped = false;
    
    // Function to send event to server
    function logToServer(eventName, eventData) {
        fetch('/api/meta-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event: eventName,
                eventName: eventName,
                eventData: eventData || {},
                timestamp: new Date().toISOString(),
                pageUrl: window.location.href
            })
        }).catch(err => {
            // Silently fail - don't break the page if server logging fails
        });
    }
    
    // Wrap fbq function
    function wrapFbq() {
        if (isWrapped || !window.fbq || typeof window.fbq !== 'function') {
            return;
        }
        
        originalFbq = window.fbq;
        isWrapped = true;
        
        // Create wrapper function
        const wrappedFbq = function() {
            const args = Array.from(arguments);
            
            // Call original fbq first
            if (originalFbq) {
                originalFbq.apply(this, args);
            }
            
            // Extract event name and data for logging
            if (args.length > 0) {
                const command = args[0];
                const eventName = args[1];
                const eventData = args[2] || {};
                
                // Log track and trackCustom commands
                if (command === 'track' || command === 'trackCustom') {
                    logToServer(eventName, eventData);
                } else if (command === 'init') {
                    logToServer('PixelInit', { pixelId: eventName });
                }
            }
        };
        
        // Copy all properties from original fbq
        Object.keys(originalFbq).forEach(key => {
            wrappedFbq[key] = originalFbq[key];
        });
        
        // Copy queue if it exists
        if (originalFbq.queue) {
            wrappedFbq.queue = originalFbq.queue;
        }
        
        // Replace fbq with wrapped version
        window.fbq = wrappedFbq;
    }
    
    // Try to wrap immediately if fbq exists
    if (window.fbq) {
        wrapFbq();
    }
    
    // Watch for fbq being created/replaced by Meta Pixel
    // Use MutationObserver to detect script execution, or poll
    const checkFbq = setInterval(() => {
        if (window.fbq && typeof window.fbq === 'function' && !isWrapped) {
            wrapFbq();
        }
    }, 50);
    
    // Stop checking after 10 seconds
    setTimeout(() => {
        clearInterval(checkFbq);
    }, 10000);
    
    // Also wrap on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wrapFbq);
    }
})();
