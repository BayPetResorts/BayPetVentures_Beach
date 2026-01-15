// Vercel Analytics for non-React projects
// This script initializes Vercel Analytics and provides tracking functions

// Import Vercel Analytics
import { inject, track } from '@vercel/analytics';

// Initialize Vercel Analytics
inject();

// Make track function available globally for easy access
window.trackVercelEvent = function(eventName, eventData) {
    try {
        track(eventName, eventData || {});
        console.log('Vercel Analytics: Tracked event', eventName, eventData);
    } catch (error) {
        console.warn('Vercel Analytics tracking error:', error);
    }
};

console.log('Vercel Analytics: Ready');

