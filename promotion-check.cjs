const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const compiled = ts.transpileModule(fs.readFileSync('src/lib/servicePricing.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } }).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { getActivePromotion, getPromotionalPrice, formatServicePrice } = context.exports;
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
function equal(actual, expected) { assert.equal(actual, expected); checks++; }
const today = new Date(2026, 9, 4);
const fixed = { ...tier, price: 799, promotionType: 'fixed', promotionalPrice: 399 };
const percentage = { ...fixed, promotionType: 'percentage', discountPercent: 20 };
equal(getActivePromotion(fixed, today).price, 'RM 399');
equal(getActivePromotion(fixed, today).discountPercent, undefined);
equal(getActivePromotion({ ...fixed, promotionEnabled: false }, today), null);
equal(getActivePromotion(percentage, today).price, 'RM 639.20');
equal(getActivePromotion(percentage, today).discountPercent, 20);
equal(getActivePromotion({ ...percentage, price: 1299 }, today).price, 'RM 1,039.20');
equal(getActivePromotion({ ...percentage, price: 2499 }, today).price, 'RM 1,999.20');
equal(getActivePromotion({ ...percentage, price: 2499, discountPercent: 30 }, today).price, 'RM 1,749.30');
equal(getPromotionalPrice({ ...percentage, promotionalPrice: undefined }), 639.2);
equal(getPromotionalPrice({ ...percentage, promotionalPrice: 1 }), 639.2);
equal(getPromotionalPrice({ ...fixed, discountPercent: 120 }), 399);
for (const discountPercent of [undefined, 0, -20, 100, 120, NaN, Infinity, '20']) {
  equal(getActivePromotion({ ...percentage, discountPercent }, today), null);
}
for (const config of [
  { promotionType: 'other' }, { promotionalPrice: undefined },
  { promotionalPrice: 999 }, { price: 0 }, { price: -799 },
  { price: Infinity }, { price: NaN }, { promotionEndDate: '2026-10-03' },
]) equal(getActivePromotion({ ...fixed, ...config }, today), null);
equal(getActivePromotion(percentage, new Date(2026, 9, 31, 23, 59, 59, 999)).price, 'RM 639.20');
equal(getActivePromotion(percentage, new Date(2026, 10, 1)), null);
equal(getActivePromotion({ ...percentage, promotionEnabled: false }, today), null);
equal(getActivePromotion({ ...percentage, price: 'Custom quote' }, today), null);
equal(getPromotionalPrice({ ...percentage, discountPercent: 0.00001 }), null);
equal(formatServicePrice(399), 'RM 399');
equal(formatServicePrice(399.5), 'RM 399.50');
equal(formatServicePrice(1039.1999999997), 'RM 1,039.20');
equal(formatServicePrice('Custom quote'), 'Custom quote');
equal(formatServicePrice('RM 799'), 'RM 799');
equal(getPromotionalPrice({ ...fixed, promotionalPrice: 399.505 }), 399.51);
equal(fixed.price, 799);
equal(percentage.price, 799);
// Render the actual price component with a deterministic visitor date.
// Effects are omitted here; the production midnight/focus lifecycle is unchanged.
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
let visitorDate = today;
const componentContext = {
  exports: {},
  require(name) {
    if (name === 'react') return { ...React, useState: () => [visitorDate, () => {}], useEffect: () => {} };
    if (name === '@/lib/servicePricing') return context.exports;
    return require(name);
  },
};
const componentCode = ts.transpileModule(fs.readFileSync('src/components/features/ServicePrice.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
vm.runInNewContext(componentCode, componentContext);
const render = (config) => renderToStaticMarkup(React.createElement(componentContext.exports.ServicePrice, { tier: config }));
const fixedMarkup = render(fixed);
equal(fixedMarkup.includes('<s>RM 799</s>'), true);
equal(fixedMarkup.includes('RM 399'), true);
equal(fixedMarkup.includes('% OFF'), false);
equal(fixedMarkup.includes('dateTime="2026-10-31"'), true);
const percentageMarkup = render(percentage);
equal(percentageMarkup.includes('RM 639.20'), true);
equal(percentageMarkup.includes('20% OFF'), true);
equal(percentageMarkup.indexOf('<s>') < percentageMarkup.indexOf('RM 639.20'), true);
equal(percentageMarkup.indexOf('RM 639.20') < percentageMarkup.indexOf('Valid until'), true);
for (const config of [
  { ...fixed, promotionEnabled: false },
  { ...percentage, discountPercent: 120 },
  { ...fixed, promotionalPrice: 999 },
]) {
  const markup = render(config);
  equal(markup.includes('RM 799'), true);
  equal(/<s>|Valid until|% OFF/.test(markup), false);
}
visitorDate = new Date(2026, 10, 1);
equal(render(percentage).includes('Valid until'), false);
visitorDate = null;
equal(render(percentage).includes('<s>'), false);
console.log(`${checks + 3} promotion checks passed (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`);
