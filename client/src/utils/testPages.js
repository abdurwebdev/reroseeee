/**
 * Test Pages Utility
 * 
 * This script helps test if all the pages are accessible.
 * Run this in the browser console to test navigation to all pages.
 */

const pagesToTest = [
  { name: 'Playlists', path: '/playlists' },
  { name: 'Downloads', path: '/downloads' },
  { name: 'Your Clips', path: '/your-clips' },
  { name: 'Settings', path: '/settings' },
  { name: 'Report History', path: '/report-history' },
  { name: 'Help', path: '/help' },
  { name: 'Feedback', path: '/feedback' },
  { name: 'Payment Success', path: '/payment/success' },
  { name: 'Payment Error', path: '/payment/error' },
  { name: 'Payment History', path: '/payment/history' }
];

/**
 * Test navigation to all pages
 * @param {number} delay - Delay between navigations in milliseconds
 */
function testAllPages(delay = 2000) {
  console.log('Starting page navigation test...');
  
  let currentIndex = 0;
  
  function navigateToNextPage() {
    if (currentIndex >= pagesToTest.length) {
      console.log('All pages tested successfully!');
      return;
    }
    
    const page = pagesToTest[currentIndex];
    console.log(`Navigating to ${page.name} (${page.path})...`);
    
    // Navigate to the page
    window.location.href = page.path;
    
    // Increment index for next navigation
    currentIndex++;
    
    // Schedule next navigation
    setTimeout(navigateToNextPage, delay);
  }
  
  // Start navigation
  navigateToNextPage();
}

// Export for use in browser console
window.testAllPages = testAllPages;

// Instructions for use
console.log(`
To test all pages, run the following in your browser console:
  testAllPages();

To test with a custom delay (e.g., 5 seconds):
  testAllPages(5000);
`);
