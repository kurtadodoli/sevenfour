// Simple test to verify the route exists in the router
const express = require('express');
const path = require('path');
const router = require('./server/routes/api/products');

console.log('Testing route registration...');

// Create a simple express app to test the router
const app = express();
app.use('/api/products', router);

// Get the registered routes
const routes = [];
app._router.stack.forEach(function(middleware) {
  if (middleware.route) {
    routes.push({
      method: Object.keys(middleware.route.methods)[0].toUpperCase(),
      path: middleware.route.path
    });
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach(function(handler) {
      if (handler.route) {
        routes.push({
          method: Object.keys(handler.route.methods)[0].toUpperCase(),
          path: '/api/products' + handler.route.path
        });
      }
    });
  }
});

console.log('Registered routes:');
routes.forEach(route => {
  console.log(`${route.method} ${route.path}`);
});

// Check if our inventory route exists
const inventoryRoute = routes.find(route => 
  route.path === '/api/products/admin/inventory' && route.method === 'GET'
);

if (inventoryRoute) {
  console.log('✅ Inventory route is properly registered!');
} else {
  console.log('❌ Inventory route is NOT registered');
}
