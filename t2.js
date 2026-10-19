const core = require('./wt-wiki-zh.user.js');
console.log('Spitfire Mk IX:', JSON.stringify(core.UNIT_NAME_TRANSLATIONS['Spitfire Mk IX']));
console.log('fixed spitfire:', JSON.stringify(core.translateFixedText('Spitfire Mk IX')));
console.log('fixed fletcher:', JSON.stringify(core.translateFixedText('Fletcher-class destroyer')));
