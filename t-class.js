const core = require('./wt-wiki-zh.user.js');
const re = /^(.+) -class (destroyer|battlecruiser|cruiser|battleship|frigate|subchaser|gun boat|motor boat)$/i;
console.log('regex:', re.test('Fletcher-class destroyer'));
console.log('fixed:', core.translateFixedText('Fletcher-class destroyer'));
console.log('spitfire:', core.translateFixedText('Spitfire Mk IX'));
