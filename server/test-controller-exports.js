const profileController = require('./controllers/profileController');

console.log('ProfileController exports:');
console.log(Object.keys(profileController));

console.log('\nuploadProfilePicture function:');
console.log(typeof profileController.uploadProfilePicture);
console.log(profileController.uploadProfilePicture.toString().substring(0, 200) + '...');
