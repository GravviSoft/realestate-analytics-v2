export const VERDICT_COLORS = {
  Incomplete: { bg: '#f1f5f9', color: '#6b7280', border: '#cbd5e1' },
  Pass:       { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  Borderline: { bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  Fail:       { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
};

export function computeBRRRR(form) {
  const purchase     = parseFloat(form.purchase_price)          || 0;
  const rehab        = parseFloat(form.rehab_cost)              || 0;
  const arv          = parseFloat(form.arv)                     || 0;
  const ltvPct       = parseFloat(form.refi_ltv_pct)            || 0;
  const rate         = parseFloat(form.refi_interest_rate)      || 0;
  const termMonths   = parseInt(form.refi_loan_term_months, 10) || 360;
  const rent         = parseFloat(form.monthly_rent)            || 0;
  const taxes        = parseFloat(form.monthly_taxes)           || 0;
  const insurance    = parseFloat(form.monthly_insurance)       || 0;
  const mgmtPct      = parseFloat(form.mgmt_fee_pct)            || 0;
  const maintenance  = parseFloat(form.monthly_maintenance)     || 0;
  const rehabMonths  = parseFloat(form.rehab_months)            || 0;
  const carryCost    = parseFloat(form.monthly_carry_cost)      || 0;
  const vacancyPct   = parseFloat(form.vacancy_pct)             || 5;
  const capexPct     = parseFloat(form.capex_pct)               || 5;
  const hoaFees      = parseFloat(form.hoa_fees)                || 0;
  const neighborhoodGrade = form.neighborhood_grade             || 'B';
  const floodZone    = form.flood_zone                          || false;

  const holdingCosts   = rehabMonths * carryCost;
  const totalInvested  = purchase + rehab + holdingCosts;
  const refiLoan       = arv * (ltvPct / 100);
  const cashOutAtRefi  = refiLoan - totalInvested;
  const cashLeftInDeal = totalInvested - refiLoan;

  const r = rate / 12 / 100;
  const n = termMonths;
  const monthlyMortgage =
    n === 0 || r === 0
      ? refiLoan / Math.max(n, 1)
      : (refiLoan * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

  const mgmtFee           = rent * (mgmtPct / 100);
  const vacancyReserve    = rent * (vacancyPct / 100);
  const capexReserve      = rent * (capexPct / 100);
  const totalMonthlyExpenses = taxes + insurance + mgmtFee + maintenance + vacancyReserve + capexReserve + hoaFees;
  const monthlyCashFlow   = rent - totalMonthlyExpenses - monthlyMortgage;
  const annualCashFlow    = monthlyCashFlow * 12;
  // cashLeftInDeal <= 0 means you pulled out all your money (infinite return) — treat as very high CoC
  const cashOnCash        = cashLeftInDeal <= 0
    ? (annualCashFlow > 0 ? Infinity : null)
    : (annualCashFlow / cashLeftInDeal) * 100;
  const equityCaptured    = arv - refiLoan;
  const ltv               = arv > 0 ? (refiLoan / arv) * 100 : 0;
  const grossYield        = arv > 0 ? ((rent * 12) / arv) * 100 : 0;

  // Hard fails
  const hardFails = [];
  if (neighborhoodGrade === 'D')  hardFails.push('Neighborhood grade D');
  if (floodZone)                  hardFails.push('Flood zone');
  if (monthlyCashFlow < 0)        hardFails.push('Negative cash flow');
  if (ltv > 80)                   hardFails.push('LTV > 80%');

  // Don't score until meaningful numbers are entered
  const hasData = purchase > 0 && arv > 0 && rent > 0 && rate > 0;

  const cocForThreshold = cashOnCash === Infinity ? 999 : (cashOnCash || 0);

  let verdict;
  if (!hasData) {
    verdict = 'Incomplete';
  } else if (hardFails.length > 0) {
    verdict = 'Fail';
  } else if (cashLeftInDeal <= totalInvested * 0.10 && cocForThreshold >= 8 && monthlyCashFlow > 0) {
    verdict = 'Pass';
  } else if (cashLeftInDeal <= totalInvested * 0.20 && cocForThreshold >= 5 && monthlyCashFlow > 0) {
    verdict = 'Borderline';
  } else {
    verdict = 'Fail';
  }

  return {
    holdingCosts,
    totalInvested,
    refiLoan,
    cashOutAtRefi,
    cashLeftInDeal,
    monthlyMortgage,
    mgmtFee,
    totalMonthlyExpenses,
    monthlyCashFlow,
    annualCashFlow,
    cashOnCash,
    equityCaptured,
    ltv,
    grossYield,
    hardFails,
    verdict,
  };
}
