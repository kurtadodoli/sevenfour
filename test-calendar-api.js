const fetch = require('node-fetch');

async function testCalendarAPI() {
    try {
        const response = await fetch('http://localhost:5000/api/delivery-enhanced/calendar?year=2025&month=7');
        const data = await response.json();
        
        console.log('📅 Calendar API Response:');
        console.log(`Total calendar entries: ${data.data.calendar.length}`);
        console.log(`Total deliveries: ${data.data.summary.totalDeliveries}`);
        
        console.log('\n📊 Calendar entries by date:');
        data.data.calendar.forEach(entry => {
            const date = new Date(entry.calendar_date);
            const dateStr = date.toISOString().split('T')[0];
            const deliveryCount = entry.deliveries ? entry.deliveries.length : 0;
            const status = entry.deliveries && entry.deliveries[0] ? entry.deliveries[0].delivery_status : 'no deliveries';
            
            console.log(`- ${dateStr}: ${deliveryCount} delivery(ies), Status: ${status}`);
        });
        
        // Check specifically for July 7, 2025
        const july7Entry = data.data.calendar.find(entry => {
            const date = new Date(entry.calendar_date);
            return date.toISOString().split('T')[0] === '2025-07-07';
        });
        
        console.log('\n🔍 July 7, 2025 specific check:');
        if (july7Entry) {
            console.log('✅ July 7 found in calendar API');
            console.log(`   Deliveries: ${july7Entry.deliveries.length}`);
            if (july7Entry.deliveries.length > 0) {
                console.log(`   First delivery: ${july7Entry.deliveries[0].order_number} (${july7Entry.deliveries[0].delivery_status})`);
            }
        } else {
            console.log('❌ July 7 NOT found in calendar API - this is the problem!');
        }
        
    } catch (error) {
        console.error('Error testing calendar API:', error.message);
    }
}

testCalendarAPI();
