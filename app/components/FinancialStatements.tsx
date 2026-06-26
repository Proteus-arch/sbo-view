'use client';

import React from 'react';

interface MetricValues {
  prior: number;
  current: number;
}

interface FinancialStatementsProps {
  businessData: {
    metrics: Record<string, MetricValues>;
  };
  activeStatement: 'balance' | 'income' | 'cashflow';
}

const FinancialStatements = ({ businessData, activeStatement }: FinancialStatementsProps) => {
  const m = businessData?.metrics || {};

  const get = (key: string, sub: 'prior' | 'current' = 'current') =>
    m?.[key]?.[sub] ?? 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const Row = ({ label, prior, current, indent = false, isHeader = false }: { label: string, prior?: number, current?: number, indent?: boolean, isHeader?: boolean }) => (
    <div className={`flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 ${isHeader ? 'bg-gray-50 dark:bg-gray-900/50 font-bold' : ''} ${indent ? 'pl-6' : ''}`}>
      <span className={`text-sm ${isHeader ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{label}</span>
      <div className="flex gap-12 text-right">
        <span className="w-24 text-sm font-medium text-gray-400">{prior !== undefined ? formatCurrency(prior) : ''}</span>
        <span className={`w-24 text-sm font-bold ${isHeader ? 'text-emerald-600' : 'text-gray-800 dark:text-gray-200'}`}>{current !== undefined ? formatCurrency(current) : ''}</span>
      </div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-emerald-50 dark:bg-emerald-900/10 px-4 py-1 mt-4 mb-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{title}</span>
    </div>
  );

  const renderBalanceSheet = () => {
    const curAssetsPrior = get('Cash', 'prior') + get('AccountsReceivable', 'prior') + get('Inventory', 'prior') + get('PrepaidExpenses', 'prior') + get('ShortTermInvestments', 'prior');
    const curAssetsCurr = get('Cash') + get('AccountsReceivable') + get('Inventory') + get('PrepaidExpenses') + get('ShortTermInvestments');

    const totAssetsPrior = curAssetsPrior + get('FixedAssets', 'prior');
    const totAssetsCurr = curAssetsCurr + get('FixedAssets');

    const curLiabPrior = get('AccountsPayable', 'prior') + get('AccruedExpenses', 'prior') + get('ShortTermDebt', 'prior');
    const curLiabCurr = get('AccountsPayable') + get('AccruedExpenses') + get('ShortTermDebt');

    const totLiabPrior = curLiabPrior + get('LongTermDebt', 'prior');
    const totLiabCurr = curLiabCurr + get('LongTermDebt');

    return (
      <div className="animate-in fade-in duration-500">
        <SectionHeader title="Assets" />
        <Row label="Cash & Equivalents" prior={get('Cash', 'prior')} current={get('Cash')} indent />
        <Row label="Accounts Receivable" prior={get('AccountsReceivable', 'prior')} current={get('AccountsReceivable')} indent />
        <Row label="Inventory" prior={get('Inventory', 'prior')} current={get('Inventory')} indent />
        <Row label="Prepaid Expenses" prior={get('PrepaidExpenses', 'prior')} current={get('PrepaidExpenses')} indent />
        <Row label="Short-term Investments" prior={get('ShortTermInvestments', 'prior')} current={get('ShortTermInvestments')} indent />
        <Row label="Total Current Assets" prior={curAssetsPrior} current={curAssetsCurr} isHeader />

        <Row label="Property, Plant & Equipment" prior={get('FixedAssets', 'prior')} current={get('FixedAssets')} indent />
        <Row label="Total Assets" prior={totAssetsPrior} current={totAssetsCurr} isHeader />

        <SectionHeader title="Liabilities" />
        <Row label="Accounts Payable" prior={get('AccountsPayable', 'prior')} current={get('AccountsPayable')} indent />
        <Row label="Accrued Expenses" prior={get('AccruedExpenses', 'prior')} current={get('AccruedExpenses')} indent />
        <Row label="Short-term Debt" prior={get('ShortTermDebt', 'prior')} current={get('ShortTermDebt')} indent />
        <Row label="Total Current Liabilities" prior={curLiabPrior} current={curLiabCurr} isHeader />

        <Row label="Long-term Debt" prior={get('LongTermDebt', 'prior')} current={get('LongTermDebt')} indent />
        <Row label="Total Liabilities" prior={totLiabPrior} current={totLiabCurr} isHeader />

        <SectionHeader title="Equity" />
        <Row label="Owner's Equity" prior={get('Equity', 'prior')} current={get('Equity')} indent />
        <Row label="Total Liabilities & Equity" prior={totLiabPrior + get('Equity', 'prior')} current={totLiabCurr + get('Equity')} isHeader />
      </div>
    );
  };

  const renderIncomeStatement = () => (
    <div className="animate-in fade-in duration-500">
      <SectionHeader title="Revenue" />
      <Row label="Total Sales / Revenue" prior={get('Revenue', 'prior')} current={get('Revenue')} indent />
      <Row label="Cost of Goods Sold (cost of sales)" prior={get('CostOfGoodsSold', 'prior')} current={get('CostOfGoodsSold')} indent />
      <Row label="Gross Profit" prior={get('GrossProfit', 'prior')} current={get('GrossProfit')} isHeader />

      <SectionHeader title="Operating Expenses" />
      <Row label="Selling, General & Admin" prior={get('OperatingExpenses', 'prior')} current={get('OperatingExpenses')} indent />
      <Row label="Operating Income" prior={get('GrossProfit', 'prior') - get('OperatingExpenses', 'prior')} current={get('GrossProfit') - get('OperatingExpenses')} isHeader />

      <SectionHeader title="Other" />
      <Row label="Interest Expense" prior={get('InterestExpense', 'prior')} current={get('InterestExpense')} indent />
      <Row label="Taxes" prior={get('Taxes', 'prior')} current={get('Taxes')} indent />
      <Row label="Net Income" prior={get('NetIncome', 'prior')} current={get('NetIncome')} isHeader />
    </div>
  );

  const renderCashFlow = () => {
    const opCashPrior = get('NetIncome', 'prior') + 2000;
    const opCashCurr = get('NetIncome') + 2000;

    const invCashPrior = -(get('FixedAssets', 'prior') * 0.1);
    const invCashCurr = -(get('FixedAssets') * 0.15);

    const finCashPrior = -1000;
    const finCashCurr = -2000;

    return (
      <div className="animate-in fade-in duration-500">
        <SectionHeader title="Operating Activities" />
        <Row label="Net Income" prior={get('NetIncome', 'prior')} current={get('NetIncome')} indent />
        <Row label="Adjustments to Cash" prior={2000} current={2500} indent />
        <Row label="Net Cash from Operations" prior={opCashPrior} current={opCashCurr} isHeader />

        <SectionHeader title="Investing Activities" />
        <Row label="Capital Expenditures" prior={invCashPrior} current={invCashCurr} indent />
        <Row label="Net Cash from Investing" prior={invCashPrior} current={invCashCurr} isHeader />

        <SectionHeader title="Financing Activities" />
        <Row label="Debt Repayment" prior={finCashPrior} current={finCashCurr} indent />
        <Row label="Net Cash from Financing" prior={finCashPrior} current={finCashCurr} isHeader />

        <SectionHeader title="Summary" />
        <Row label="Net Change in Cash" prior={opCashPrior + invCashPrior + finCashPrior} current={opCashCurr + invCashCurr + finCashCurr} indent />
        <Row label="Ending Cash Balance" prior={get('Cash', 'prior')} current={get('Cash')} isHeader />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-gray-700 dark:text-gray-200 capitalize">
          {activeStatement === 'balance' ? 'Balance Sheet' : activeStatement === 'income' ? 'Income Statement' : 'Statement of Cash Flows'}
        </h3>
        <div className="flex gap-12 text-right pr-2">
          <span className="w-24 text-[10px] font-black uppercase text-gray-400 tracking-tighter">Prior Year</span>
          <span className="w-24 text-[10px] font-black uppercase text-emerald-600 tracking-tighter">Current Year</span>
        </div>
      </div>
      <div className="p-4">
        {activeStatement === 'balance' && renderBalanceSheet()}
        {activeStatement === 'income' && renderIncomeStatement()}
        {activeStatement === 'cashflow' && renderCashFlow()}
      </div>
    </div>
  );
};

export default FinancialStatements;