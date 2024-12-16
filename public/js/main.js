// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  const refreshDailyBtn = document.getElementById('refresh-daily');
  if (refreshDailyBtn) {
    refreshDailyBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/daily-recipe');
        const data = await response.json();
        // 更新每日推荐食谱内容
        // 需要在后端实现相应的 API 路由
        // 这里仅为示例，具体实现根据需求调整
        location.reload();
      } catch (error) {
        console.error('Error fetching daily recipe:', error);
      }
    });
  }
});
