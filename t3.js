const re = /\d/.test('Pz.II C TD') && /^[A-Za-z0-9][A-Za-z0-9 .\-/']*$/.test('Pz.II C TD');
console.log('model:', re);
console.log('dot:', /^[A-Za-z0-9][A-Za-z0-9 .\-/']*$/.test('Renault YR'));
console.log('tornado:', /^[A-Za-z0-9][A-Za-z0-9 .\-/']*$/.test('Tornado IDS SLE'));
