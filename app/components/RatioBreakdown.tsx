'use client';

import React from 'react';

const safe = (obj: any, key: string, sub: 'prior' | 'current' = 'current') =>
  obj?.[key]?.[sub] ?? 0;

const RatioBreakdown = ({ businessData, isCPAView }: { businessData: any, isCPAView: boolean }) => {
  const m = businessData?.metrics || {};
  const ratios = businessData?.ratios || {};

  const cash = safe(m, 'Cash');
  const ar = safe(m, 'AccountsReceivable');
  const ap = safe(m, 'AccountsPayable');

  // Use backend ratios if they exist and are non-zero, otherwise compute live
  const backendBookkeeper = ratios.bookkeeper_quick_ratio;
  const backendStrategic = ratios.strategic_quick_ratio;

  const bookkeeperRatio = (backendBookkeeper && backendBookkeeper !== 0)
    ? backendBookkeeper
    : (ap > 0 ? (cash + ar) / ap : 0);

  const strategicRatio = (backendStrategic && backendStrategic !== 0)
    ? backendStrategic
    : (ap > 0 ? cash / ap : 0);

  const ratioValue = isCPAView ? bookkeeperRatio : strategicRatio;
  const assets = isCPAView ? ratioValue * ap : cash;
  const liabilities = ap;

  const fmt = (n: number) =>
    (Number.isFinite(n) ? n : 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border-4 border-emerald-500 shadow-2xl">
      <div className="mb-8 text-center">
        <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic">
          {isCPAView ? 'CPA View (Optimistic)' : 'SBO View (Cynical)'}
        </h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
          Quick Ratio Breakdown
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
          <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Assets Factor</div>
          <div className="text-4xl font-black text-blue-800 dark:text-blue-100">
            ${fmt(assets)}
          </div>
          <div className="text-[10px] text-blue-400 mt-1 font-mono">
            {isCPAView ? `(Cash $${fmt(cash)} + A/R $${fmt(ar)})` : `(Cash only $${fmt(cash)})`}
          </div>
        </div>

        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl">
          <div className="text-[10px] text-red-600 font-black uppercase tracking-widest">Liabilities Factor</div>
          <div className="text-4xl font-black text-red-800 dark:text-red-100">
            ${fmt(liabilities)}
          </div>
          <div className="text-[10px] text-red-400 mt-1 font-mono">Accounts Payable</div>
        </div>

        <div className="mt-6 pt-6 border-t-8 border-emerald-500 text-center">
          <div className="text-[10px] font-black text-gray-400 uppercase mb-2">Final Ratio Result</div>
          <div className="text-8xl font-black text-emerald-500 tracking-tighter">
            {Number.isFinite(ratioValue) ? Number(ratioValue).toFixed(2) : '0.00'}
          </div>
          {ap === 0 && (
            <div className="text-[10px] text-red-500 font-bold mt-2">
              ⚠ Accounts Payable is $0 — ratio cannot be calculated
            </div>
          )}
          {!(backendBookkeeper && backendBookkeeper !== 0) && (
            <div className="text-[9px] text-amber-500 font-bold mt-1">
              ℹ Computed live from metrics
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatioBreakdown;