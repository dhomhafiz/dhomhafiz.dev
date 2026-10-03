const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const compiled = ts.transpileModule(fs.readFileSync('src/lib/servicePricing.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } }).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { getActivePromotion } = context.exports;
const tier = { price: 'RM 2,499', promotionEnabled: true, promotionalPrice: 1999, promotionEndDate: '2026-10-31' };
let checks = 0;
function check(value, expected) { assert.equal(Boolean(value), expected); checks++; }
check(getActivePromotion(tier, new Date(2026, 9, 30)), true);
check(getActivePromotion(tier, new Date(2026, 9, 31, 23, 59, 59, 999)), true);
check(getActivePromotion(tier, new Date(2026, 10, 1)), false);
for (const config of [
  { promotionEnabled: false }, { promotionalPrice: undefined },
  { promotionalPrice: NaN }, { promotionalPrice: Infinity },
  { promotionalPrice: -1 }, { promotionalPrice: 2499 }, { promotionalPrice: 2500 },
  { promotionEndDate: undefined }, { promotionEndDate: '2026-02-30' },
  { promotionEndDate: '2026-13-01' }, { promotionEndDate: '2026-10-00' },
  { promotionEndDate: '10/31/2026' }, { price: 'Custom quote' },
]) check(getActivePromotion({ ...tier, ...config }, new Date(2026, 9, 3)), false);
check(getActivePromotion({ ...tier, promotionalPrice: 0 }, new Date(2026, 9, 3)), true);
check(getActivePromotion({ ...tier, promotionEndDate: '2028-02-29' }, new Date(2028, 1, 29, 23, 59)), true);
check(getActivePromotion({ ...tier, promotionEndDate: '2027-02-29' }, new Date(2027, 1, 1)), false);
assert.equal(getActivePromotion(tier, new Date(2026, 9, 3)).price, 'RM 1,999');
assert.equal(getActivePromotion(tier, new Date(2026, 9, 3)).endLabel, '31 October 2026');
assert.equal(tier.price, 'RM 2,499');
console.log(`${checks + 3} promotion checks passed (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`);
