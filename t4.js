const t = 'Pz.II C TD';
console.log('digit:', /\d/.test(t));
console.log('charset:', /^[A-Za-z0-9][A-Za-z0-9 .\-/']*$/.test(t));
// 逐字符检查
for (const c of t) {
  if (!/[A-Za-z0-9 .\-/']/.test(c)) console.log('bad char:', JSON.stringify(c));
}
