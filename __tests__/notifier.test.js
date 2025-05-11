import { notify } from '../src/notifier.js';

async function testNotifier() {
  console.log('====================================');
  console.log('🧪 TESTING NOTIFIER FUNCTIONALITY');
  console.log('====================================');

  const testDate = new Date().toISOString().split('T')[0];

  // Test 1: Below threshold notification
  console.log('\n📉 Test Case: BELOW threshold');
  try {
    await notify('below', 75000, testDate);
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n====================================');
  console.log('🏁 ALL TESTS COMPLETED');
  console.log('====================================');
}

// Run the tests
testNotifier()
  .then(() => console.log('Tests execution finished'))
  .catch(err => console.error('Error running tests:', err));
