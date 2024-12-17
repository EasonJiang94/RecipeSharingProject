// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  const refreshDailyBtn = document.getElementById('refresh-daily');
  if (refreshDailyBtn) {
    refreshDailyBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/daily-recipe');
        const data = await response.json();
        // Update daily recipe content
        // Implement the API route on the backend
        // Example implementation based on your needs
        location.reload();
      } catch (error) {
        console.error('Error fetching daily recipe:', error);
      }
    });
  }
});
