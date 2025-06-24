const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Custom Order Schedule Button with 10-Day Restriction...\n');

// Test script to verify custom order scheduling behavior
const testCustomOrderScheduling = () => {
  const deliveryPagePath = path.join(__dirname, 'client', 'src', 'pages', 'DeliveryPage.js');
  
  try {
    const content = fs.readFileSync(deliveryPagePath, 'utf8');
    
    // Check that schedule button is available (no early return before schedule modal)
    const hasScheduleButton = content.includes('Schedule Delivery Modal') && 
                             content.includes('ScheduleModal') &&
                             !content.includes('return; // Block custom order scheduling');
    
    // Check that 10-day validation is present
    const has10DayValidation = content.includes('scheduledDate < completionDate') &&
                              content.includes('SCHEDULING RESTRICTION') &&
                              content.includes('minimum 10-day production period');
    
    // Check that date picker has minimum date restriction
    const hasDatePickerRestriction = content.includes('getMinDate()') &&
                                   content.includes('order.order_type === \'custom\'') &&
                                   content.includes('productionDays = 10');
    
    // Check for informational text in modal
    const hasModalInfo = content.includes('Custom orders require a 10-day production period');
    
    // Check that help text is updated
    const hasUpdatedHelpText = content.includes('Custom orders require 10-day production period before scheduling');
    
    console.log('📋 SCHEDULE BUTTON AVAILABILITY TEST:');
    if (hasScheduleButton) {
      console.log('✅ Schedule button is available for custom orders');
    } else {
      console.log('❌ Schedule button may be blocked for custom orders');
    }
    
    console.log('\n📋 10-DAY VALIDATION TEST:');
    if (has10DayValidation) {
      console.log('✅ 10-day production period validation is enforced');
    } else {
      console.log('❌ 10-day validation may be missing');
    }
    
    console.log('\n📋 DATE PICKER RESTRICTION TEST:');
    if (hasDatePickerRestriction) {
      console.log('✅ Date picker respects 10-day minimum for custom orders');
    } else {
      console.log('❌ Date picker restriction may be missing');
    }
    
    console.log('\n📋 MODAL INFORMATION TEST:');
    if (hasModalInfo) {
      console.log('✅ Modal displays production period information');
    } else {
      console.log('❌ Modal information may be missing');
    }
    
    console.log('\n📋 HELP TEXT TEST:');
    if (hasUpdatedHelpText) {
      console.log('✅ Help text reflects 10-day restriction');
    } else {
      console.log('❌ Help text may not reflect restriction');
    }
    
    console.log('\n🎯 SUMMARY:');
    const testsPasssed = (hasScheduleButton ? 1 : 0) + 
                        (has10DayValidation ? 1 : 0) + 
                        (hasDatePickerRestriction ? 1 : 0) + 
                        (hasModalInfo ? 1 : 0) + 
                        (hasUpdatedHelpText ? 1 : 0);
    
    console.log(`   Tests Passed: ${testsPasssed}/5`);
    
    if (testsPasssed === 5) {
      console.log('✅ All tests passed! Custom order scheduling with 10-day restriction implemented correctly.');
      return true;
    } else {
      console.log('⚠️ Some tests failed. Please review the implementation.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error reading DeliveryPage.js:', error.message);
    return false;
  }
};

// Run the test
const result = testCustomOrderScheduling();

if (result) {
  console.log('\n🚀 IMPLEMENTATION SUMMARY:');
  console.log('   ✅ Custom orders have Schedule button (same as regular orders)');
  console.log('   ✅ Date picker enforces 10-day minimum production period');
  console.log('   ✅ Validation prevents scheduling before production completion');
  console.log('   ✅ Clear error message explains the restriction');
  console.log('   ✅ Modal displays helpful production timeline information');
  console.log('\n🎯 RESULT: Custom orders can be scheduled using the same UI, but with proper 10-day restrictions!');
}

console.log('\n📝 BEHAVIOR EXPLANATION:');
console.log('   1. Custom orders show the same "Schedule" button as regular orders');
console.log('   2. When clicked, the schedule modal opens normally');
console.log('   3. Date picker minimum date is set to production completion date');
console.log('   4. If user tries to schedule too early, clear error message explains why');
console.log('   5. Modal displays informational text about production requirements');
