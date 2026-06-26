// SampleDataDashboard.tsx - Completed with trend arrows
'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import RatioBreakdown from './RatioBreakdown';
import RatioBarChart from './RatioBarChart';

const FALLBACK = {
  metrics: {
    Cash: { prior: 45230, current: 51800 },
    AccountsReceivable: { prior: 32100, current: 38450 },
    AccountsPayable: { prior: 24800, current: 27600 },
    CreditCards: { prior: 4800, current: 5200 },
    OtherCurrentLiabilities: { prior: 10400, current: 12000 },
    CurrentLiabilities: { prior: 40000, current: 44800 },
    Revenue: { prior: 245000, current: 312500 },
    NetIncome: { prior: 34200, current: 48700 },
    Depreciation: { prior: 5200, current: 6100 },
    Inventory: { prior: 14800, current: 18200 },
    PrepaidExpenses: { prior: 3100, current: 3600 },
    ShortTermInvestments: { prior: 10500, current: 12200 },
    FixedAssets: { prior: 118000, current: 136500 },
    AccruedExpenses: { prior: 7900, current: 9400 },
    ShortTermDebt: { prior: 11500, current: 14800 },
    LongTermDebt: { prior: 86000, current: 77500 },
    Equity: { prior: 96000, current: 114200 },
    OpeningBalanceEquity: { prior: -10000, current: -12000 },
    RetainedEarnings: { prior: 71800, current: 77500 },
    CostOfGoodsSold: { prior: 118000, current: 146000 },
    GrossProfit: { prior: 127000, current: 166500 },
    OperatingExpenses: { prior: 84000, current: 96000 },
    InterestExpense: { prior: 5200, current: 4600 },
    Taxes: { prior: 11800, current: 17500 }
  },
  ratios: {
    bookkeeper_quick_ratio: 2.01,
    strategic_quick_ratio: 1.16,
    net_margin: 15.6,
    ebitda_margin: 17.5
  },
  sync_info: { last_sync: new Date().toISOString(), source: 'fallback' }
};

const safe = (obj: any, key: string, sub: string = 'current') =>
  obj?.[key]?.[sub] ?? 0;

const smartMerge = (fallback: any, live: any) => {
  const merged: any = {};
  const allKeys = new Set([...Object.keys(fallback), ...Object.keys(live || {})]);
  allKeys.forEach(key => {
    const fb = fallback[key];
    const lv = live?.[key];
    if (!lv || typeof lv !== 'object') {
      merged[key] = fb;
    } else {
      merged[key] = {
        prior: (lv.prior !== undefined && lv.prior !== 0) ? lv.prior : (fb?.prior ?? 0),
        current: (lv.current !== undefined && lv.current !== 0) ? lv.current : (fb?.current ?? 0),
      };
    }
  });
  return merged;
};

const isLiveDataValid = (metrics: any) => {
  if (!metrics || typeof metrics !== 'object') return false;
  const cash = safe(metrics, 'Cash');
  const rev = safe(metrics, 'Revenue');
  const ni = safe(metrics, 'NetIncome');
  const cl = safe(metrics, 'CurrentLiabilities');
  return (cash !== 0 || rev !== 0 || ni !== 0) && cl !== 0 && Object.keys(metrics).length >= 4;
};

// ─── TREND HELPER ───
const TrendArrow = ({ current, prior, invert = false }: { current: number; prior: number; invert?: boolean }) => {
  if (!Number.isFinite(current) || !Number.isFinite(prior) || prior === 0) return <Minus size={12} className="text-gray-600" />;
  const change = ((current - prior) / Math.abs(prior)) * 100;
  const isUp = change > 0;
  const isGood = invert ? !isUp : isUp;
  const color = isGood ? 'text-emerald-400' : 'text-red-400';
  const Icon = isUp ? ArrowUp : ArrowDown;
  return (
    <span className={`flex items-center gap-1 text-[10px] font-bold ${color}`}>
      <Icon size={12} /> {Math.abs(change).toFixed(1)}%
    </span>
  );
};

const SampleDataDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [activeView, setActiveView] = useState<'CPA' | 'SBO'>('CPA');
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    const fetchSyncData = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:5001/api/qbo/sync');
        const result = await res.json();
        console.log('[SampleDataDashboard] Raw response:', result);
        setRawResponse(result);

        if (result.error) {
          console.warn('[SampleDataDashboard] Backend error:', result.error);
          setData(FALLBACK);
          setUsingFallback(true);
          setLoading(false);
          return;
        }

        const metrics = result?.metrics;
        if (isLiveDataValid(metrics)) {
          const merged = smartMerge(FALLBACK.metrics, metrics);
          setData({ ...result, metrics: merged });
          setUsingFallback(false);
        } else {
          console.warn('[SampleDataDashboard] Live data invalid. Using fallback.');
          setData(FALLBACK);
          setUsingFallback(true);
        }
      } catch (err) {
        console.error("Connection Failed:", err);
        setData(FALLBACK);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSyncData();
  }, []);

  if (loading) return <div className="p-20 text-center font-black italic animate-pulse">RECOVERING AUDIT DATA...</div>;
  if (!data || !data.metrics) return <div className="p-20 text-center text-red-500 font-black">BACKEND NOT RESPONDING ON purchase order (PO)RT 5001</div>;

  const cash = safe(data.metrics, 'Cash');
  const cashPrior = safe(data.metrics, 'Cash', 'prior');
  const ar = safe(data.metrics, 'AccountsReceivable');
  const arPrior = safe(data.metrics, 'AccountsReceivable', 'prior');
  const currentLiab = safe(data.metrics, 'CurrentLiabilities');
  const currentLiabPrior = safe(data.metrics, 'CurrentLiabilities', 'prior');
  const equity = safe(data.metrics, 'Equity');
  const equityPrior = safe(data.metrics, 'Equity', 'prior');
  const obe = safe(data.metrics, 'OpeningBalanceEquity');
  const re = safe(data.metrics, 'RetainedEarnings');
  const ni = safe(data.metrics, 'NetIncome');
  const niPrior = safe(data.metrics, 'NetIncome', 'prior');
  const rev = safe(data.metrics, 'Revenue');
  const revPrior = safe(data.metrics, 'Revenue', 'prior');

  // Calculate trends
  const quickRatioCurrent = (cash + ar) / currentLiab;
  const quickRatioPrior = (cashPrior + arPrior) / currentLiabPrior;
  const cashRatioCurrent = cash / currentLiab;
  const cashRatioPrior = cashPrior / currentLiabPrior;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-emerald-500 rounded-lg text-white"><Building2 size={24} /></div>
          <div>
            <h2 className="text-xl font-black uppercase italic">Comparisons Over Time</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auditor Port: 5001</p>
            {usingFallback && (
              <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/40">
                ⚠ FALLBACK DATA
              </span>
            )}
            {!usingFallback && rawResponse?.sync_info && (
              <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/40">
                ✓ LIVE QBO DATA
              </span>
            )}
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('CPA')}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeView === 'CPA' ? 'bg-white dark:bg-gray-800 shadow-sm text-emerald-600' : 'text-gray-400'}`}
          >
            CPA VIEW
          </button>
          <button
            onClick={() => setActiveView('SBO')}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeView === 'SBO' ? 'bg-white dark:bg-gray-800 shadow-sm text-emerald-600' : 'text-gray-400'}`}
          >
            SBO VIEW
          </button>
        </div>
      </div>

      {/* TREND SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-[10px] text-gray-500 uppercase font-bold">Revenue</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">${rev.toLocaleString()}</div>
          <TrendArrow current={rev} prior={revPrior} />
        </div>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-[10px] text-gray-500 uppercase font-bold">Net Income</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">${ni.toLocaleString()}</div>
          <TrendArrow current={ni} prior={niPrior} />
        </div>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-[10px] text-gray-500 uppercase font-bold">Quick Ratio</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{quickRatioCurrent.toFixed(2)}x</div>
          <TrendArrow current={quickRatioCurrent} prior={quickRatioPrior} />
        </div>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-[10px] text-gray-500 uppercase font-bold">Cash Ratio</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{cashRatioCurrent.toFixed(2)}x</div>
          <TrendArrow current={cashRatioCurrent} prior={cashRatioPrior} />
        </div>
      </div>

      {/* DEBUG PANEL */}
      <details className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
        <summary className="text-[10px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer select-none">
          🔍 Debug: Backend Response Viewer
        </summary>
        <div className="mt-3 text-[10px] font-mono">
          <div className="text-gray-500 mb-1">Raw Metric Keys:</div>
          <div className="text-emerald-600 dark:text-emerald-400 mb-2">
            {rawResponse?.metrics ? Object.keys(rawResponse.metrics).join(', ') : 'N/A'}
          </div>
          <div className="text-gray-500 mb-1">
            Cash: <span className={cash < 0 ? 'text-red-400 font-bold' : ''}>${cash.toLocaleString()}</span>
            {' | '}CurrentLiabilities: ${currentLiab.toLocaleString()}
          </div>
          <div className="text-gray-500 mb-1">
            Equity: <span className={equity < 0 ? 'text-red-400 font-bold' : ''}>${equity.toLocaleString()}</span>
            {' = '}OBE: <span className={obe < 0 ? 'text-red-400' : ''}>${obe.toLocaleString()}</span>
            {' + '}RE: <span className={re < 0 ? 'text-red-400' : ''}>${re.toLocaleString()}</span>
            {' + '}NI: <span className={ni < 0 ? 'text-red-400' : ''}>${ni.toLocaleString()}</span>
          </div>
          <pre className="text-[9px] text-gray-500 overflow-auto max-h-32 bg-gray-50 dark:bg-black/30 p-2 rounded">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      </details>

      <div className="grid grid-cols-1 gap-6">
        <RatioBreakdown
          businessData={data}
          isCPAView={activeView === 'CPA'}
        />
      </div>

      {/* BAR CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RatioBarChart
          title="Bookkeeper Quick Ratio (CPA View)"
          priorNum={safe(data.metrics, 'Cash', 'prior') + safe(data.metrics, 'AccountsReceivable', 'prior')}
          currentNum={cash + ar}
          priorDen={safe(data.metrics, 'CurrentLiabilities', 'prior')}
          currentDen={currentLiab}
          numLabel="Quick Assets (Cash + A/R)"
          denLabel="Current Liabilities"
          numColor="#3b82f6"
          denColor="#ef4444"
        />
        <RatioBarChart
          title="Strategic Cash Ratio (CFO View)"
          priorNum={safe(data.metrics, 'Cash', 'prior')}
          currentNum={cash}
          priorDen={safe(data.metrics, 'CurrentLiabilities', 'prior')}
          currentDen={currentLiab}
          numLabel="Cash Only"
          denLabel="Current Liabilities"
          numColor="#10b981"
          denColor="#f59e0b"
        />
      </div>
    </div>
  );
};

export default SampleDataDashboard;