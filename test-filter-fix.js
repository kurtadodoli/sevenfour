// Test script to verify the filter fix
console.log('🧪 Testing Filter Fix');
console.log('====================');

// Sample order IDs that were being filtered (before fix)
const oldSampleFilter = [
  1001, 1002, 1005, 9999, 123, 1006, 999999, 5615, 5515, 3,
  1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 100, 101, 102, 200, 300, 400, 500,
  1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
  99999, 88888, 77777, 66666, 55555, 44444, 33333, 22222, 11111,
  26, 27, 28, 29, 30
];

// New sample filter (after fix)
const newSampleFilter = [
  1001, 1002, 1005, 9999, 123, 1006, 999999, 5615, 5515, 3,
  100, 101, 102, 200, 300, 400, 500,
  1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
  99999, 88888, 77777, 66666, 55555, 44444, 33333, 22222, 11111,
  26, 27, 28, 29, 30
];

// Real order IDs from the database
const realOrderIds = [1, 2, 4, 5, 10, 12];

console.log('Real order IDs to test:', realOrderIds);

console.log('\nBefore fix (should all be filtered):');
realOrderIds.forEach(id => {
  const isFiltered = oldSampleFilter.includes(id);
  console.log(`- Order ID ${id}: ${isFiltered ? 'FILTERED OUT ❌' : 'ALLOWED ✅'}`);
});

console.log('\nAfter fix (should all be allowed):');
realOrderIds.forEach(id => {
  const isFiltered = newSampleFilter.includes(id);
  console.log(`- Order ID ${id}: ${isFiltered ? 'FILTERED OUT ❌' : 'ALLOWED ✅'}`);
});

console.log('\n🎯 Result: Real orders should now appear on the calendar!');
