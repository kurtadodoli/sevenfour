// Trigger a stock refresh in the frontend
localStorage.setItem('stock_updated', Date.now().toString());
console.log('Stock refresh triggered for frontend');
