// Shared Tab Tracking Utility
// Tracks time spent on page and tab visibility changes for analytics
(function() {
    'use strict';
    
    let tabStartTime = Date.now();
    let totalTimeOnPage = 0;
    let timeInBackground = 0;
    let isPageVisible = true;
    
    function trackTabSwitch(isVisible) {
        const now = Date.now();
        
        if (isPageVisible && !isVisible) {
            // Tab switched away
            const timeBeforeSwitch = now - tabStartTime;
            totalTimeOnPage += timeBeforeSwitch;
            tabStartTime = now;
            isPageVisible = false;
            if (typeof fbq !== 'undefined') {
                const pageName = document.title || window.location.pathname;
                fbq('trackCustom', 'TabSwitchedAway', {
                    page_name: pageName,
                    time_on_page: Math.round(totalTimeOnPage / 1000)
                });
            }
        } else if (!isPageVisible && isVisible) {
            // Tab switched back
            const timeInBackgroundThisSession = now - tabStartTime;
            timeInBackground += timeInBackgroundThisSession;
            isPageVisible = true;
            tabStartTime = now;
            if (typeof fbq !== 'undefined') {
                const pageName = document.title || window.location.pathname;
                fbq('trackCustom', 'TabSwitchedBack', {
                    page_name: pageName,
                    time_in_background: Math.round(timeInBackgroundThisSession / 1000),
                    total_time_in_background: Math.round(timeInBackground / 1000)
                });
            }
        }
    }
    
    function initializeTabTracking() {
        // Use visibilitychange as primary method (more reliable than blur/focus)
        document.addEventListener('visibilitychange', () => {
            trackTabSwitch(!document.hidden);
        });
        
        // Track time on page when leaving
        window.addEventListener('beforeunload', () => {
            const now = Date.now();
            if (isPageVisible) {
                totalTimeOnPage += now - tabStartTime;
            }
            if (typeof fbq !== 'undefined') {
                const pageName = document.title || window.location.pathname;
                fbq('trackCustom', 'PageTimeSpent', {
                    page_name: pageName,
                    total_time_seconds: Math.round(totalTimeOnPage / 1000),
                    time_in_background_seconds: Math.round(timeInBackground / 1000)
                });
            }
        });
    }
    
    // Expose to global scope
    window.TabTracking = {
        getTotalTimeOnPage: () => totalTimeOnPage,
        getTimeInBackground: () => timeInBackground,
        isPageVisible: () => isPageVisible,
        initialize: initializeTabTracking
    };
    
    // Auto-initialize if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTabTracking);
    } else {
        initializeTabTracking();
    }
})();

