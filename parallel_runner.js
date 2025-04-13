// parallel_runner.js
// const { exec } = require('child_process');
import {exec} from 'child_process'

console.log('Starting parallel test execution...');

// Function to run a specific tag
function runTest(tag) {
  return new Promise((resolve, reject) => {
    const command = `npx cucumber-js --tags @${tag}`;
    console.log(`Running: ${command}`);

    const process = exec(command);

    process.stdout.on('data', (data) => {
      console.log(`[${tag}] ${data}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[${tag}] ${data}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`[${tag}] Test completed successfully`);
        resolve();
      } else {
        console.error(`[${tag}] Test failed with code ${code}`);
        reject(new Error(`Test for ${tag} failed with code ${code}`));
      }
    });
  });
}

// Run both tests in parallel
Promise.all([
  runTest('iphone'),
  runTest('galaxy')
])
  .then(() => {
    console.log('All tests completed successfully');
  })
  .catch((error) => {
    console.error('One or more tests failed:', error.message);
    process.exit(1);
  });



