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
    let checkFbqInterval = null;
    
    // Track logged events to prevent duplicates (event name + data hash)
    const loggedEvents = new Set();
    const MAX_LOGGED_EVENTS = 100; // Prevent memory leaks
    
    // Function to create a unique key for an event
    function getEventKey(eventName, eventData) {
        const name = eventName || 'unknown';
        try {
            return name + '|' + JSON.stringify(eventData || {});
        } catch (e) {
            // Fallback if JSON.stringify fails
            return name + '|' + String(eventData || '');
        }
    }
    
    // Function to send event to server
    function logToServer(eventName, eventData, skipDedupe) {
        // Create unique key for this event
        const eventKey = getEventKey(eventName, eventData);
        
        // Skip if we've already logged this exact event (unless skipDedupe is true)
        if (!skipDedupe && loggedEvents.has(eventKey)) {
            return;
        }
        
        // Add to logged events set
        loggedEvents.add(eventKey);
        
        // Clean up old entries if set gets too large
        if (loggedEvents.size > MAX_LOGGED_EVENTS) {
            const firstEntry = loggedEvents.values().next().value;
            loggedEvents.delete(firstEntry);
        }
        
        // Send immediately
        fetch('/api/meta-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event: eventName,
                eventName: eventName,
                eventData: eventData || {},
                pageUrl: window.location.href
            })
        }).catch(() => {
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
            
            // Extract event name and data for logging BEFORE calling original
            if (args.length > 0) {
                const command = args[0];
                const eventName = args[1];
                const eventData = args[2] || {};
                
                // Log track and trackCustom commands immediately
                // Use deduplication to prevent logging events that were already logged by the proxy
                if (command === 'track' || command === 'trackCustom') {
                    logToServer(eventName, eventData, false);
                }
                // Note: 'init' command is not logged
            }
            
            // Call original fbq
            if (originalFbq) {
                originalFbq.apply(this, args);
            }
        };
        
        // Copy all properties from original fbq
        Object.keys(originalFbq).forEach(key => {
            if (key !== 'queue' && key !== 'push') {
                wrappedFbq[key] = originalFbq[key];
            }
        });
        
        // Handle queue - merge queues if both exist, otherwise copy
        // This ensures events queued in our proxy are preserved
        if (originalFbq.queue && Array.isArray(originalFbq.queue)) {
            wrappedFbq.queue = originalFbq.queue;
        } else if (!wrappedFbq.queue) {
            wrappedFbq.queue = [];
        }
        
        // Handle push method - wrap it to ensure events go through our logger
        // Meta Pixel sets push to the same function as fbq, so we set it to our wrapped version
        wrappedFbq.push = wrappedFbq;
        
        // Replace fbq with wrapped version
        window.fbq = wrappedFbq;
    }
    
    // Create a proxy fbq before Meta Pixel loads to catch early events
    if (!window.fbq) {
        const queue = [];
        const proxyFbq = function() {
            const args = Array.from(arguments);
            queue.push(args);
            
            // Log immediately when called (before Meta Pixel processes it)
            if (args.length > 0) {
                const command = args[0];
                const eventName = args[1];
                const eventData = args[2] || {};
                
                if (command === 'track' || command === 'trackCustom') {
                    logToServer(eventName, eventData, false);
                }
                // Note: 'init' command is not logged
            }
        };
        
        proxyFbq.queue = queue;
        proxyFbq.loaded = false;
        proxyFbq.version = '2.0';
        proxyFbq.push = function() {
            const args = Array.from(arguments);
            queue.push(args);
            
            // Log immediately when push is called (before Meta Pixel processes it)
            if (args.length > 0) {
                const command = args[0];
                const eventName = args[1];
                const eventData = args[2] || {};
                
                if (command === 'track' || command === 'trackCustom') {
                    logToServer(eventName, eventData, false);
                }
                // Note: 'init' command is not logged
            }
        };
        
        window.fbq = proxyFbq;
    } else {
        wrapFbq();
    }
    
    // Watch for fbq being created/replaced by Meta Pixel
    checkFbqInterval = setInterval(() => {
        if (window.fbq && typeof window.fbq === 'function' && !isWrapped) {
            wrapFbq();
        }
    }, 50);
    
    // Stop checking after 10 seconds
    setTimeout(() => {
        if (checkFbqInterval) {
            clearInterval(checkFbqInterval);
            checkFbqInterval = null;
        }
    }, 10000);
    
    // Also wrap on DOMContentLoaded (if not already loaded)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wrapFbq);
    } else {
        // DOM already loaded, try wrapping immediately
        wrapFbq();
    }
})();
