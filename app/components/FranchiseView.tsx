'use client';

import { Users, Package, Megaphone, X } from 'lucide-react'; // added X for combobox clear
import React, { useState, useEffect, useMemo, useRef } from 'react'; // added useRef
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, ReferenceLine, ScatterChart, Scatter
} from 'recharts';
import { TrendingUp, TrendingDown, MapPin, AlertTriangle, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, Building2, DollarSign, Percent, Activity, Filter, ChevronUp, ChevronDown, Crown, AlertOctagon, Lightbulb, Target, Zap } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// =============================================================================
// MOCK DATA - Multi-Location Franchise System
// =============================================================================
interface UnitData {
  id: string;
  name: string;
  city: string;
  state: string;
  coordinates: [number, number];
  revenue: number;
  revenuePrior: number;
  profitMargin: number;
  profitMarginPrior: number;
  cogs: number;
  opex: number;
  laborCost: number;
  inventoryCost: number;
  marketingSpend: number;
  cashReserve: number;
  requiredCashReserve: number;
  status: 'green' | 'yellow' | 'red';
  bestPracticeFlags: string[];
  alerts: Alert[];
  royaltyFee: number;
  marketingFundContribution: number;
  contractRenewalDate: string;
  daysSinceLastReport: number;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  category: 'compliance' | 'financial' | 'operational';
}

const franchiseUnits: UnitData[] = [
  {
    id: 'NY-01',
    name: 'Manhattan Midtown',
    city: 'New York',
    state: 'NY',
    coordinates: [-73.9857, 40.7484],
    revenue: 1850000,
    revenuePrior: 1620000,
    profitMargin: 18.5,
    profitMarginPrior: 15.2,
    cogs: 647500,
    opex: 852000,
    laborCost: 425000,
    inventoryCost: 222500,
    marketingSpend: 85000,
    cashReserve: 185000,
    requiredCashReserve: 150000,
    status: 'green',
    bestPracticeFlags: ['Labor Efficiency', 'Inventory Turnover'],
    alerts: [],
    royaltyFee: 46250,
    marketingFundContribution: 18500,
    contractRenewalDate: '2028-03-15',
    daysSinceLastReport: 2,
  },
  {
    id: 'NY-02',
    name: 'Brooklyn Heights',
    city: 'New York',
    state: 'NY',
    coordinates: [-73.9442, 40.6892],
    revenue: 980000,
    revenuePrior: 920000,
    profitMargin: 12.3,
    profitMarginPrior: 11.8,
    cogs: 362600,
    opex: 497000,
    laborCost: 245000,
    inventoryCost: 117600,
    marketingSpend: 52000,
    cashReserve: 88000,
    requiredCashReserve: 80000,
    status: 'yellow',
    bestPracticeFlags: [],
    alerts: [
      { id: 'a1', type: 'warning', message: 'Marketing spend 12% above system average', category: 'operational' }
    ],
    royaltyFee: 24500,
    marketingFundContribution: 9800,
    contractRenewalDate: '2027-08-01',
    daysSinceLastReport: 5,
  },
  {
    id: 'IL-01',
    name: 'Chicago Loop',
    city: 'Chicago',
    state: 'IL',
    coordinates: [-87.6298, 41.8781],
    revenue: 1420000,
    revenuePrior: 1380000,
    profitMargin: 16.8,
    profitMarginPrior: 17.5,
    cogs: 497000,
    opex: 687000,
    laborCost: 340000,
    inventoryCost: 157000,
    marketingSpend: 71000,
    cashReserve: 142000,
    requiredCashReserve: 120000,
    status: 'green',
    bestPracticeFlags: ['Cash Management'],
    alerts: [],
    royaltyFee: 35500,
    marketingFundContribution: 14200,
    contractRenewalDate: '2029-01-10',
    daysSinceLastReport: 1,
  },
  {
    id: 'IL-02',
    name: 'Schaumburg',
    city: 'Schaumburg',
    state: 'IL',
    coordinates: [-88.0834, 42.0334],
    revenue: 720000,
    revenuePrior: 780000,
    profitMargin: 6.2,
    profitMarginPrior: 9.1,
    cogs: 280800,
    opex: 395000,
    laborCost: 198000,
    inventoryCost: 82800,
    marketingSpend: 48000,
    cashReserve: 45000,
    requiredCashReserve: 60000,
    status: 'red',
    bestPracticeFlags: [],
    alerts: [
      { id: 'a2', type: 'critical', message: 'Cash reserve below required threshold ($15K shortfall)', category: 'financial' },
      { id: 'a3', type: 'critical', message: 'Profit margin declined 2.9pp vs. prior period', category: 'financial' },
      { id: 'a4', type: 'warning', message: 'Revenue down 7.7% YoY - investigate market conditions', category: 'operational' }
    ],
    royaltyFee: 18000,
    marketingFundContribution: 7200,
    contractRenewalDate: '2027-05-20',
    daysSinceLastReport: 12,
  },
  {
    id: 'CA-01',
    name: 'Santa Monica',
    city: 'Santa Monica',
    state: 'CA',
    coordinates: [-118.4912, 34.0195],
    revenue: 2100000,
    revenuePrior: 1950000,
    profitMargin: 21.4,
    profitMarginPrior: 19.8,
    cogs: 714000,
    opex: 936000,
    laborCost: 462000,
    inventoryCost: 252000,
    marketingSpend: 105000,
    cashReserve: 315000,
    requiredCashReserve: 180000,
    status: 'green',
    bestPracticeFlags: ['Profit Margin', 'Revenue Growth', 'Labor Efficiency', 'Inventory Turnover'],
    alerts: [],
    royaltyFee: 52500,
    marketingFundContribution: 21000,
    contractRenewalDate: '2030-11-30',
    daysSinceLastReport: 1,
  },
  {
    id: 'CA-02',
    name: 'San Diego Gaslamp',
    city: 'San Diego',
    state: 'CA',
    coordinates: [-117.1611, 32.7157],
    revenue: 1150000,
    revenuePrior: 1080000,
    profitMargin: 14.1,
    profitMarginPrior: 13.5,
    cogs: 414000,
    opex: 576000,
    laborCost: 288000,
    inventoryCost: 126000,
    marketingSpend: 63000,
    cashReserve: 115000,
    requiredCashReserve: 95000,
    status: 'green',
    bestPracticeFlags: ['Revenue Growth'],
    alerts: [],
    royaltyFee: 28750,
    marketingFundContribution: 11500,
    contractRenewalDate: '2028-07-14',
    daysSinceLastReport: 3,
  },
  {
    id: 'TX-01',
    name: 'Austin Downtown',
    city: 'Austin',
    state: 'TX',
    coordinates: [-97.7431, 30.2672],
    revenue: 1280000,
    revenuePrior: 1100000,
    profitMargin: 15.6,
    profitMarginPrior: 14.2,
    cogs: 460800,
    opex: 624000,
    laborCost: 312000,
    inventoryCost: 148800,
    marketingSpend: 68000,
    cashReserve: 128000,
    requiredCashReserve: 100000,
    status: 'green',
    bestPracticeFlags: ['Revenue Growth'],
    alerts: [],
    royaltyFee: 32000,
    marketingFundContribution: 12800,
    contractRenewalDate: '2029-04-22',
    daysSinceLastReport: 4,
  },
  {
    id: 'TX-02',
    name: 'Houston Galleria',
    city: 'Houston',
    state: 'TX',
    coordinates: [-95.3633, 29.7604],
    revenue: 890000,
    revenuePrior: 950000,
    profitMargin: 8.4,
    profitMarginPrior: 10.2,
    cogs: 347100,
    opex: 467000,
    laborCost: 234000,
    inventoryCost: 113100,
    marketingSpend: 55000,
    cashReserve: 62000,
    requiredCashReserve: 75000,
    status: 'red',
    bestPracticeFlags: [],
    alerts: [
      { id: 'a5', type: 'critical', message: 'Unapproved supplier spending detected ($23K)', category: 'operational' },
      { id: 'a6', type: 'warning', message: 'Revenue down 6.3% YoY', category: 'financial' },
      { id: 'a7', type: 'warning', message: 'Contract renewal in 180 days', category: 'compliance' }
    ],
    royaltyFee: 22250,
    marketingFundContribution: 8900,
    contractRenewalDate: '2026-12-15',
    daysSinceLastReport: 8,
  },
  {
    id: 'FL-01',
    name: 'Miami Beach',
    city: 'Miami Beach',
    state: 'FL',
    coordinates: [-80.1300, 25.7907],
    revenue: 1350000,
    revenuePrior: 1280000,
    profitMargin: 13.9,
    profitMarginPrior: 13.2,
    cogs: 486000,
    opex: 673000,
    laborCost: 336000,
    inventoryCost: 150000,
    marketingSpend: 72000,
    cashReserve: 108000,
    requiredCashReserve: 110000,
    status: 'yellow',
    bestPracticeFlags: [],
    alerts: [
      { id: 'a8', type: 'warning', message: 'Cash reserve slightly below target ($2K)', category: 'financial' }
    ],
    royaltyFee: 33750,
    marketingFundContribution: 13500,
    contractRenewalDate: '2028-09-05',
    daysSinceLastReport: 6,
  },
  {
    id: 'CO-01',
    name: 'Denver Cherry Creek',
    city: 'Denver',
    state: 'CO',
    coordinates: [-104.9903, 39.7392],
    revenue: 1050000,
    revenuePrior: 1020000,
    profitMargin: 11.8,
    profitMarginPrior: 11.5,
    cogs: 388500,
    opex: 538000,
    laborCost: 269000,
    inventoryCost: 119500,
    marketingSpend: 58000,
    cashReserve: 95000,
    requiredCashReserve: 85000,
    status: 'yellow',
    bestPracticeFlags: [],
    alerts: [
      { id: 'a9', type: 'info', message: 'Labor cost 8% above system average', category: 'operational' }
    ],
    royaltyFee: 26250,
    marketingFundContribution: 10500,
    contractRenewalDate: '2029-02-28',
    daysSinceLastReport: 7,
  },
];

// =============================================================================
// DERIVED METRICS
// =============================================================================
const computeDerivedMetrics = (units: UnitData[]) => {
  const totalRevenue = units.reduce((sum, u) => sum + u.revenue, 0);
  const avgProfitMargin = units.reduce((sum, u) => sum + u.profitMargin, 0) / units.length;
  const avgRevenueGrowth = units.reduce((sum, u) => {
    const growth = ((u.revenue - u.revenuePrior) / u.revenuePrior) * 100;
    return sum + growth;
  }, 0) / units.length;

  const bestUnit = units.reduce((best, u) => u.profitMargin > best.profitMargin ? u : best, units[0]);

  const sortedByProfitMargin = [...units].sort((a, b) => b.profitMargin - a.profitMargin);
  const sortedByRevenueGrowth = [...units].sort((a, b) => {
    const growthA = ((a.revenue - a.revenuePrior) / a.revenuePrior) * 100;
    const growthB = ((b.revenue - b.revenuePrior) / b.revenuePrior) * 100;
    return growthB - growthA;
  });

  // Opportunity Score: What if all units matched best unit's profit margin?
  const currentTotalProfit = units.reduce((sum, u) => sum + (u.revenue * (u.profitMargin / 100)), 0);
  const potentialTotalProfit = units.reduce((sum, u) => sum + (u.revenue * (bestUnit.profitMargin / 100)), 0);
  const opportunityScore = potentialTotalProfit - currentTotalProfit;

  return {
    totalRevenue,
    avgProfitMargin,
    avgRevenueGrowth,
    bestUnit,
    top3ByMargin: sortedByProfitMargin.slice(0, 3),
    bottom3ByMargin: sortedByProfitMargin.slice(-3).reverse(),
    top3ByGrowth: sortedByRevenueGrowth.slice(0, 3),
    bottom3ByGrowth: sortedByRevenueGrowth.slice(-3).reverse(),
    opportunityScore,
  };
};

// =============================================================================
// STATUS BADGE COMPONENT
// =============================================================================
const StatusBadge = ({ status }: { status: 'green' | 'yellow' | 'red' }) => {
  const config = {
    green: { icon: CheckCircle, text: 'Healthy', bg: 'bg-emerald-100', textColor: 'text-emerald-700', border: 'border-emerald-200' },
    yellow: { icon: AlertTriangle, text: 'Watch', bg: 'bg-amber-100', textColor: 'text-amber-700', border: 'border-amber-200' },
    red: { icon: AlertOctagon, text: 'At Risk', bg: 'bg-rose-100', textColor: 'text-rose-700', border: 'border-rose-200' },
  };
  const { icon: Icon, text, bg, textColor, border } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${textColor} border ${border}`}>
      <Icon size={14} />
      {text}
    </span>
  );
};

// =============================================================================
// UNIT CARD COMPONENT
// =============================================================================
const UnitCard = ({ unit, isBest }: { unit: UnitData; isBest?: boolean }) => {
  const revenueGrowth = ((unit.revenue - unit.revenuePrior) / unit.revenuePrior) * 100;
  const marginChange = unit.profitMargin - unit.profitMarginPrior;

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl border ${isBest ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200 dark:border-gray-700'} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      {isBest && (
        <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Crown size={12} />
          Best Performer
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg">{unit.name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin size={13} />
            {unit.city}, {unit.state} · {unit.id}
          </p>
        </div>
        <StatusBadge status={unit.status} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue</p>
          <p className="font-bold text-gray-900 dark:text-white">${(unit.revenue / 1000).toLocaleString(undefined, {maximumFractionDigits:0})}K</p>
          <div className={`flex items-center gap-0.5 text-xs mt-0.5 ${revenueGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {revenueGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(revenueGrowth).toFixed(1)}%
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profit Margin</p>
          <p className="font-bold text-gray-900 dark:text-white">{unit.profitMargin.toFixed(1)}%</p>
          <div className={`flex items-center gap-0.5 text-xs mt-0.5 ${marginChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {marginChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {marginChange >= 0 ? '+' : ''}{marginChange.toFixed(1)}pp
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cash Reserve</p>
          <p className="font-bold text-gray-900 dark:text-white">${(unit.cashReserve / 1000).toLocaleString(undefined, {maximumFractionDigits:0})}K</p>
          <div className={`text-xs mt-0.5 ${unit.cashReserve >= unit.requiredCashReserve ? 'text-emerald-600' : 'text-rose-600'}`}>
            {unit.cashReserve >= unit.requiredCashReserve ? 'Above target' : `${((unit.cashReserve - unit.requiredCashReserve) / 1000).toLocaleString(undefined, {maximumFractionDigits:0})}K short`}
          </div>
        </div>
      </div>

      {unit.bestPracticeFlags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {unit.bestPracticeFlags.map((flag) => (
            <span key={flag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100">
              <Crown size={11} />
              {flag}
            </span>
          ))}
        </div>
      )}

      {unit.alerts.length > 0 && (
        <div className="space-y-1.5">
          {unit.alerts.slice(0, 2).map((alert) => (
            <div key={alert.id} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
              alert.type === 'critical' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
              alert.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
              'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              {alert.type === 'critical' ? <AlertOctagon size={13} className="mt-0.5 shrink-0" /> :
               alert.type === 'warning' ? <AlertTriangle size={13} className="mt-0.5 shrink-0" /> :
               <Activity size={13} className="mt-0.5 shrink-0" />}
              <span>{alert.message}</span>
            </div>
          ))}
          {unit.alerts.length > 2 && (
            <p className="text-xs text-gray-500 pl-2">+{unit.alerts.length - 2} more alerts</p>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// LEADERBOARD TABLE COMPONENT
// =============================================================================
type SortMetric = 'profitMargin' | 'revenueGrowth';
type ViewMode = 'top3' | 'bottom3';

const LeaderboardTable = ({ 
  units, 
  metric, 
  mode 
}: { 
  units: UnitData[]; 
  metric: SortMetric; 
  mode: ViewMode;
}) => {
  const sorted = useMemo(() => {
    const sortedUnits = [...units].sort((a, b) => {
      if (metric === 'profitMargin') {
        return b.profitMargin - a.profitMargin;
      }
      const growthA = ((a.revenue - a.revenuePrior) / a.revenuePrior) * 100;
      const growthB = ((b.revenue - b.revenuePrior) / b.revenuePrior) * 100;
      return growthB - growthA;
    });
    return mode === 'top3' ? sortedUnits.slice(0, 3) : sortedUnits.slice(-3).reverse();
  }, [units, metric, mode]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Rank</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Location</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Revenue</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Profit Margin</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">YoY Growth</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((unit, idx) => {
              const revenueGrowth = ((unit.revenue - unit.revenuePrior) / unit.revenuePrior) * 100;
              const rank = mode === 'top3' ? idx + 1 : sorted.length - idx;
              return (
                <tr key={unit.id} className="border-b border-gray-100 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      rank === 1 ? 'bg-amber-100 text-amber-700' :
                      rank === 2 ? 'bg-gray-100 text-gray-600' :
                      rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{unit.name}</div>
                    <div className="text-xs text-gray-500">{unit.id}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                    ${(unit.revenue / 1000).toLocaleString(undefined, {maximumFractionDigits:0})}K
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${unit.profitMargin >= 15 ? 'text-emerald-600' : unit.profitMargin >= 10 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {unit.profitMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`flex items-center justify-end gap-1 ${revenueGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(revenueGrowth).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={unit.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =============================================================================
// ===== NEW: NAICS DATA & BENCHMARKS (copied from SBOView) ====================
// =============================================================================
const FOUR_DIGIT_NAICS: Record<string, string> = {
  '1111': 'Oilseed and Grain Farming',
  '1121': 'Cattle Ranching and Farming',
  '2111': 'Oil and Gas Extraction',
  '2121': 'Coal Mining',
  '2211': 'Electric Power Generation, Transmission and Distribution',
  '2212': 'Natural Gas Distribution',
  '2361': 'Residential Building Construction',
  '2362': 'Nonresidential Building Construction',
  '2381': 'Foundation, Structure, and Building Exterior Contractors',
  '2382': 'Building Equipment Contractors',
  '2383': 'Building Finishing Contractors',
  '3111': 'Animal Food Manufacturing',
  '3112': 'Grain and Oilseed Milling',
  '3118': 'Bakeries and Tortilla Manufacturing',
  '3151': 'Apparel Knitting Mills',
  '3152': 'Cut and Sew Apparel Manufacturing',
  '3211': 'Sawmills and Wood Preservation',
  '3231': 'Printing and Related Support Activities',
  '3241': 'Petroleum and Coal Products Manufacturing',
  '3251': 'Basic Chemical Manufacturing',
  '3261': 'Plastics Product Manufacturing',
  '3311': 'Iron and Steel Mills and Ferroalloy Manufacturing',
  '3321': 'Forging and Stamping',
  '3331': 'Agriculture, Construction, and Mining Machinery Manufacturing',
  '3341': 'Computer and Peripheral Equipment Manufacturing',
  '3351': 'Electric Lighting Equipment Manufacturing',
  '3361': 'Motor Vehicle Manufacturing',
  '4231': 'Motor Vehicle and Motor Vehicle Parts Merchant Wholesalers',
  '4232': 'Furniture and Home Furnishing Merchant Wholesalers',
  '4244': 'Grocery and Related Product Merchant Wholesalers',
  '4411': 'Automobile Dealers',
  '4412': 'Other Motor Vehicle Dealers',
  '4431': 'Electronics and Appliance Stores',
  '4441': 'Building Material and Supplies Dealers',
  '4451': 'Grocery and Convenience Retailers',
  '4471': 'Gasoline Stations',
  '4481': 'Clothing Stores',
  '4523': 'General Merchandise Stores',
  '4532': 'Office Supplies, Stationery, and Gift Stores',
  '4811': 'Scheduled Air Transportation',
  '4841': 'General Freight Trucking',
  '4853': 'Taxi and Limousine Service',
  '4921': 'Couriers and Express Delivery Services',
  '5111': 'Newspaper, Periodical, Book, and Directory Publishers',
  '5121': 'Motion Picture and Video Industries',
  '5171': 'Wired Telecommunications Carriers',
  '5182': 'Data Processing, Hosting, and Related Services',
  '5211': 'Monetary Authorities-Central Bank',
  '5221': 'Depository Credit Intermediation',
  '5231': 'Securities and Commodity Contracts Intermediation and Brokerage',
  '5241': 'Insurance Carriers',
  '5311': 'Lessors of Real Estate',
  '5321': 'Automotive Equipment Rental and Leasing',
  '5411': 'Legal Services',
  '5412': 'Accounting, Tax Preparation, Bookkeeping, and Payroll Services',
  '5413': 'Architectural, Engineering, and Related Services',
  '5415': 'Computer Systems Design and Related Services',
  '5416': 'Management, Scientific, and Technical Consulting Services',
  '5511': 'Management of Companies and Enterprises',
  '5611': 'Office Administrative Services',
  '5613': 'Employment Services',
  '5617': 'Services to Buildings and Dwellings',
  '6111': 'Elementary and Secondary Schools',
  '6112': 'Junior Colleges',
  '6113': 'Colleges, Universities, and Professional Schools',
  '6211': 'Offices of Physicians',
  '6212': 'Offices of Dentists',
  '6213': 'Offices of Other Health Practitioners',
  '6214': 'Outpatient Care Centers',
  '6221': 'General Medical and Surgical Hospitals',
  '6231': 'Nursing Care Facilities (Skilled Nursing Facilities)',
  '6241': 'Individual and Family Services',
  '7111': 'Performing Arts Companies',
  '7113': 'Promoters of Performing Arts, Sports, and Similar Events',
  '7131': 'Amusement Parks and Arcades',
  '7211': 'Traveler Accommodation',
  '7223': 'Special Food Services',
  '7224': 'Drinking Places (Alcoholic Beverages)',
  '7225': 'Restaurants and Other Eating Places',
  '8111': 'Automotive Repair and Maintenance',
  '8121': 'Personal Care Services',
  '8131': 'Religious Organizations',
  '8139': 'Business, Professional, Labor, Political, and Similar Organizations',
  '9211': 'Executive, Legislative, and Other General Government Support',
};

// Industry net profit margin benchmarks (expand as needed)
const INDUSTRY_BENCHMARKS: Record<string, { netMargin: number }> = {
  '7225': { netMargin: 8.5 },   // Restaurants
  '5411': { netMargin: 12.0 },  // Legal Services
  '5412': { netMargin: 14.0 },  // Accounting
  '5415': { netMargin: 10.5 },  // IT Services
  '2361': { netMargin: 6.0 },   // Residential Construction
  '4411': { netMargin: 3.5 },   // Auto Dealers
  '4451': { netMargin: 2.5 },   // Grocery Stores
  '6111': { netMargin: 4.0 },   // Schools
  '6211': { netMargin: 9.0 },   // Physicians
  '6221': { netMargin: 7.5 },   // Hospitals
  '5241': { netMargin: 11.0 },  // Insurance
  '5311': { netMargin: 15.0 },  // Real Estate
  '5413': { netMargin: 13.0 },  // Engineering
  '5613': { netMargin: 8.0 },   // Employment Services
  '7223': { netMargin: 7.0 },   // Food Service Contractors
  // Add more – fallback default is 8.0%
};

const NAICS_KEYWORDS: Record<string, string[]> = {
  '7225': ['restaurant', 'food', 'eating', 'dining', 'cafe', 'fast food', 'full service', 'limited service'],
  '5411': ['legal', 'lawyer', 'attorney', 'law firm'],
  '5412': ['accounting', 'cpa', 'tax', 'bookkeeping', 'payroll'],
  '5415': ['computer', 'it', 'software', 'programming', 'design', 'technology'],
  '2361': ['construction', 'residential', 'housing', 'builder'],
  '4411': ['auto', 'car', 'dealer', 'dealership', 'vehicle'],
  '4451': ['grocery', 'supermarket', 'food', 'store'],
  '6111': ['school', 'education', 'elementary', 'secondary'],
  '6211': ['physician', 'doctor', 'medical', 'clinic'],
  '6221': ['hospital', 'medical', 'surgical', 'healthcare'],
  '5241': ['insurance', 'carrier', 'policy'],
  '5311': ['real estate', 'property', 'rental', 'leasing'],
  '5413': ['engineering', 'architect', 'survey'],
  '5613': ['employment', 'staffing', 'temp', 'recruiting'],
  '7223': ['food service', 'catering', 'contractor'],
};

function getKeywordsForNaics(code: string): string[] {
  return NAICS_KEYWORDS[code] || [];
}

const fourDigitOptions = Object.entries(FOUR_DIGIT_NAICS)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([code, title]) => ({ code, title }));

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const FranchiseView = () => {
  const [isClient, setIsClient] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
  const [leaderboardMetric, setLeaderboardMetric] = useState<SortMetric>('profitMargin');
  const [leaderboardMode, setLeaderboardMode] = useState<ViewMode>('top3');
  const [mapTooltip, setMapTooltip] = useState<{ unit: UnitData; x: number; y: number } | null>(null);

  // ===== NEW: NAICS SELECTOR STATE =====
  const [selectedFourDigit, setSelectedFourDigit] = useState('7225');
  const [fourDigitSearch, setFourDigitSearch] = useState('Restaurants and Other Eating Places (7225)');
  const [isFourDigitOpen, setIsFourDigitOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Filtered options for combobox
  const filteredFourDigitOptions = useMemo(() => {
    if (!fourDigitSearch) return fourDigitOptions;
    const lowerSearch = fourDigitSearch.toLowerCase().trim();
    return fourDigitOptions.filter(opt => {
      if (opt.title.toLowerCase().includes(lowerSearch)) return true;
      if (opt.code.includes(lowerSearch)) return true;
      const keywords = getKeywordsForNaics(opt.code);
      return keywords.some(kw => kw.toLowerCase().includes(lowerSearch));
    });
  }, [fourDigitSearch]);

  const handleSelectFourDigit = (code: string) => {
    setSelectedFourDigit(code);
    const selected = fourDigitOptions.find(o => o.code === code);
    setFourDigitSearch(selected ? `${selected.title} (${selected.code})` : '');
    setIsFourDigitOpen(false);
    setHighlightedIndex(-1);
  };

  const handleFourDigitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFourDigitSearch(e.target.value);
    setIsFourDigitOpen(true);
    setHighlightedIndex(-1);
  };

  const handleFourDigitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredFourDigitOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredFourDigitOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredFourDigitOptions.length) {
        handleSelectFourDigit(filteredFourDigitOptions[highlightedIndex].code);
      }
    } else if (e.key === 'Escape') {
      setIsFourDigitOpen(false);
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsFourDigitOpen(false);
        const selected = fourDigitOptions.find(o => o.code === selectedFourDigit);
        setFourDigitSearch(selected ? `${selected.title} (${selected.code})` : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedFourDigit]);

  // Industry benchmark from NAICS
  const industryNetMargin = useMemo(() => {
    return INDUSTRY_BENCHMARKS[selectedFourDigit]?.netMargin ?? 8.0;
  }, [selectedFourDigit]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const metrics = useMemo(() => computeDerivedMetrics(franchiseUnits), []);

  // --- Data for scatter plot benchmarking ---
  const benchmarkScatterData = useMemo(() => {
    return franchiseUnits.map(u => ({
      id: u.id,
      name: u.name,
      revenue: u.revenue / 1000,      // in thousands
      profitMargin: u.profitMargin,
      status: u.status,
    }));
  }, []);

  const avgRevenue = metrics.totalRevenue / franchiseUnits.length / 1000; // in $K
  const avgProfitMargin = metrics.avgProfitMargin;

  // Aggregate spend breakdown
  const spendBreakdown = useMemo(() => {
    const total = franchiseUnits.reduce((sum, u) => sum + u.laborCost + u.inventoryCost + u.marketingSpend + (u.opex - u.laborCost - u.inventoryCost - u.marketingSpend), 0);
    const labor = franchiseUnits.reduce((sum, u) => sum + u.laborCost, 0);
    const inventory = franchiseUnits.reduce((sum, u) => sum + u.inventoryCost, 0);
    const marketing = franchiseUnits.reduce((sum, u) => sum + u.marketingSpend, 0);
    const other = total - labor - inventory - marketing;
    return [
      { name: 'Labor', value: labor, pct: (labor / total) * 100 },
      { name: 'Inventory', value: inventory, pct: (inventory / total) * 100 },
      { name: 'Marketing', value: marketing, pct: (marketing / total) * 100 },
      { name: 'Other OpEx', value: other, pct: (other / total) * 100 },
    ];
  }, []);

  const statusColors = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#f43f5e',
  };

  // ===========================================================================
  // RESOURCE ALLOCATION RECOMMENDATIONS (unchanged)
  // ===========================================================================
  const recommendations = useMemo(() => {
    const best = metrics.bestUnit;
    const worst = franchiseUnits.reduce((a, b) => a.profitMargin < b.profitMargin ? a : b);
    const systemAvgMargin = metrics.avgProfitMargin;
    const avgLaborRatio = franchiseUnits.reduce((sum, u) => sum + (u.laborCost / u.revenue), 0) / franchiseUnits.length;
    const avgMarketingRatio = franchiseUnits.reduce((sum, u) => sum + (u.marketingSpend / u.revenue), 0) / franchiseUnits.length;
    const avgInventoryTurnover = franchiseUnits.reduce((sum, u) => sum + (u.revenue / u.inventoryCost), 0) / franchiseUnits.length;

    const recs = [];

    // 1. Margin gap analysis
    const laggards = franchiseUnits.filter(u => u.profitMargin < systemAvgMargin * 0.8);
    if (laggards.length > 0) {
      const totalRevenueLaggards = laggards.reduce((s, u) => s + u.revenue, 0);
      const potentialUplift = laggards.reduce((s, u) => s + (u.revenue * (best.profitMargin - u.profitMargin) / 100), 0);
      recs.push({
        icon: <Target size={16} className="text-amber-500" />,
        title: `Improve margins of ${laggards.length} lagging locations`,
        description: `Bring ${laggards.map(u => u.name).join(', ')} up to system average (${systemAvgMargin.toFixed(1)}%) could add $${(totalRevenueLaggards * ((systemAvgMargin - laggards.reduce((s,u)=>s+u.profitMargin,0)/laggards.length)/100)).toLocaleString(undefined, {maximumFractionDigits:0})} in profit.`,
        action: `Focus on cost controls; benchmark best practices from ${best.name} (${best.profitMargin}% margin).`
      });
    }

    // 2. Labor efficiency
    const highLabor = franchiseUnits.filter(u => (u.laborCost / u.revenue) > avgLaborRatio * 1.2);
    if (highLabor.length > 0) {
      recs.push({
        icon: <Users size={16} className="text-blue-500" />,
        title: `Labor cost optimization for ${highLabor.length} units`,
        description: `${highLabor.map(u => u.name).join(', ')} have labor costs >20% above average (${(avgLaborRatio*100).toFixed(1)}% of revenue).`,
        action: `Implement scheduling software and cross‑training, as seen in ${best.name} where labor is ${((best.laborCost/best.revenue)*100).toFixed(1)}% of revenue.`
      });
    }

    // 3. Inventory turnover
    const lowTurnover = franchiseUnits.filter(u => (u.revenue / u.inventoryCost) < avgInventoryTurnover * 0.8);
    if (lowTurnover.length > 0) {
      recs.push({
        icon: <Package size={16} className="text-indigo-500" />,
        title: `Inventory efficiency improvement`,
        description: `${lowTurnover.map(u => u.name).join(', ')} have turnover below 80% of average (${avgInventoryTurnover.toFixed(1)}x).`,
        action: `Review ordering patterns; adopt just‑in‑time inventory like ${best.name} (${(best.revenue/best.inventoryCost).toFixed(1)}x turnover).`
      });
    }

    // 4. Marketing spend effectiveness
    const highMarketing = franchiseUnits.filter(u => (u.marketingSpend / u.revenue) > avgMarketingRatio * 1.3);
    if (highMarketing.length > 0) {
      recs.push({
        icon: <Megaphone size={16} className="text-purple-500" />,
        title: `Re‑allocate marketing budget`,
        description: `${highMarketing.map(u => u.name).join(', ')} spend >30% above average on marketing (${(avgMarketingRatio*100).toFixed(1)}% of revenue).`,
        action: `Shift funds to digital channels; test campaigns in high‑growth units like ${best.name} to find ROI.`
      });
    }

    // 5. Cash reserve warning
    const cashRisk = franchiseUnits.filter(u => u.cashReserve < u.requiredCashReserve);
    if (cashRisk.length > 0) {
      recs.push({
        icon: <AlertTriangle size={16} className="text-red-500" />,
        title: `Cash reserve shortfall in ${cashRisk.length} units`,
        description: `${cashRisk.map(u => u.name).join(', ')} need immediate capital injection (total shortfall $${(cashRisk.reduce((s,u) => s + (u.requiredCashReserve - u.cashReserve), 0)).toLocaleString()}).`,
        action: `Prioritize cash flow management; consider temporary royalty relief or working capital loans.`
      });
    }

    // 6. Overall strategic recommendation
    recs.push({
      icon: <Zap size={16} className="text-emerald-500" />,
      title: `Invest in top performers`,
      description: `${best.name} generates ${best.profitMargin}% margin – that's ${(best.profitMargin - systemAvgMargin).toFixed(1)}pp above system average.`,
      action: `Allocate additional marketing funds to this location to drive further growth; replicate its success playbook across all units.`
    });

    return recs;
  }, [metrics]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Franchise Performance Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Multi-location overview · {franchiseUnits.length} active units · Trailing 3-month analysis</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-600" />
              <div>
                <p className="text-xs text-gray-500">System Revenue</p>
                <p className="font-bold text-gray-900 dark:text-white">${(metrics.totalRevenue / 1000000).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}M</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
              <Percent size={16} className="text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Avg Margin</p>
                <p className="font-bold text-gray-900 dark:text-white">{metrics.avgProfitMargin.toFixed(1)}%</p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-600" />
              <div>
                <p className="text-xs text-amber-700 dark:text-amber-400">Opportunity</p>
                <p className="font-bold text-amber-800 dark:text-amber-300">+${(metrics.opportunityScore / 1000).toLocaleString(undefined, {maximumFractionDigits:0})}K</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== NEW: NAICS SELECTOR ===== */}
        <div className="mt-4 flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 relative min-w-[400px]" ref={comboboxRef}>
          <Building2 size={18} className="text-gray-400" />
          <div className="flex flex-col w-full">
            <label className="text-[9px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1">Industry Benchmark (NAICS 4‑digit)</label>
            <div className="relative">
              <input
                type="text"
                value={fourDigitSearch}
                onChange={handleFourDigitInputChange}
                onFocus={() => setIsFourDigitOpen(true)}
                onKeyDown={handleFourDigitKeyDown}
                placeholder="Search industry (e.g., Dentists, 5613)..."
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white w-full focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {fourDigitSearch && (
                <button
                  onClick={() => { setFourDigitSearch(''); setIsFourDigitOpen(true); setSelectedFourDigit(''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {isFourDigitOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                {filteredFourDigitOptions.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">No matches found</div>
                ) : (
                  filteredFourDigitOptions.map((opt, idx) => (
                    <div
                      key={opt.code}
                      onClick={() => handleSelectFourDigit(opt.code)}
                      className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center ${
                        idx === highlightedIndex ? 'bg-cyan-600 text-white' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${opt.code === selectedFourDigit ? 'bg-gray-100 dark:bg-gray-700/50' : ''}`}
                    >
                      <span>{opt.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono ml-2">({opt.code})</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Industry Margin: <span className="font-bold text-cyan-600 dark:text-cyan-400">{industryNetMargin}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* ROW 1: Map + Benchmarking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin size={20} className="text-indigo-600" />
                Multi-Location Performance Map
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>Healthy</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span>Watch</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span>At Risk</span>
              </div>
            </div>
            <div className="relative h-[400px] bg-blue-50/50 dark:bg-gray-800 rounded-lg overflow-hidden">
              {isClient && (
                <ComposableMap projection="geoAlbersUsa" className="w-full h-full">
                  <ZoomableGroup zoom={1}>
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography 
                            key={geo.rsmKey} 
                            geography={geo} 
                            fill="#e5e7eb" 
                            stroke="#d1d5db"
                            style={{
                              default: { outline: 'none' },
                              hover: { outline: 'none', fill: '#d1d5db' },
                              pressed: { outline: 'none' },
                            }}
                          />
                        ))
                      }
                    </Geographies>
                    {franchiseUnits.map((unit) => (
                      <Marker 
                        key={unit.id} 
                        coordinates={unit.coordinates}
                        onMouseEnter={(e) => {
                          const rect = (e.target as SVGElement).getBoundingClientRect();
                          setMapTooltip({ unit, x: rect.left + rect.width / 2, y: rect.top });
                        }}
                        onMouseLeave={() => setMapTooltip(null)}
                        onClick={() => setSelectedUnit(unit)}
                      >
                        <circle 
                          r={unit.status === 'red' ? 8 : 6} 
                          fill={statusColors[unit.status]} 
                          stroke="white" 
                          strokeWidth={2}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                        <text 
                          textAnchor="middle" 
                          y={-14} 
                          style={{ 
                            fontFamily: 'system-ui', 
                            fill: '#374151', 
                            fontSize: '10px',
                            fontWeight: 600,
                            pointerEvents: 'none'
                          }}
                        >
                          {unit.id}
                        </text>
                      </Marker>
                    ))}
                  </ZoomableGroup>
                </ComposableMap>
              )}

              {/* Map Tooltip */}
              {mapTooltip && (
                <div 
                  className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 pointer-events-none"
                  style={{ 
                    left: Math.min(mapTooltip.x - 100, 400), 
                    top: mapTooltip.y - 120,
                    width: 200
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{mapTooltip.unit.name}</span>
                    <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: statusColors[mapTooltip.unit.status] }}></span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Revenue:</span><span className="font-medium">${(mapTooltip.unit.revenue/1000).toLocaleString(undefined, {maximumFractionDigits:0})}K</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Margin:</span><span className="font-medium">{mapTooltip.unit.profitMargin}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cash:</span><span className={`font-medium ${mapTooltip.unit.cashReserve >= mapTooltip.unit.requiredCashReserve ? 'text-emerald-600' : 'text-rose-600'}`}>${(mapTooltip.unit.cashReserve/1000).toLocaleString(undefined, {maximumFractionDigits:0})}K</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats Below Map */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{franchiseUnits.filter(u => u.status === 'green').length}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Healthy Units</p>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{franchiseUnits.filter(u => u.status === 'yellow').length}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Watch List</p>
              </div>
              <div className="text-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{franchiseUnits.filter(u => u.status === 'red').length}</p>
                <p className="text-xs text-rose-600 dark:text-rose-400">At Risk</p>
              </div>
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{franchiseUnits.reduce((sum, u) => sum + u.alerts.length, 0)}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">Open Alerts</p>
              </div>
            </div>
          </div>

          {/* Best Practices + Opportunity Score */}
          <div className="space-y-6">
            {/* Best Performer Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="text-amber-500" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Best Practices Flag</h3>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Top Performer</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{metrics.bestUnit.name}</p>
                <p className="text-sm text-gray-500">{metrics.bestUnit.id} · {metrics.bestUnit.city}, {metrics.bestUnit.state}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Profit Margin</p>
                  <p className="text-lg font-bold text-emerald-600">{metrics.bestUnit.profitMargin}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">${(metrics.bestUnit.revenue/1000).toLocaleString(undefined, {maximumFractionDigits:0})}K</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Key Metrics</p>
                {metrics.bestUnit.bestPracticeFlags.map((flag) => (
                  <div key={flag} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle size={14} className="text-emerald-500" />
                    {flag}
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunity Score */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Opportunity Score</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Potential annual gain if all units matched <span className="font-semibold text-indigo-700 dark:text-indigo-400">{metrics.bestUnit.name}'s</span> profit margin
              </p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">+${(metrics.opportunityScore / 1000).toLocaleString(undefined, {maximumFractionDigits:0})}K</span>
                <span className="text-sm text-gray-500">per year</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min((metrics.opportunityScore / metrics.totalRevenue) * 100 * 3, 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{((metrics.opportunityScore / metrics.totalRevenue) * 100).toFixed(1)}% of current system revenue</p>
            </div>
          </div>
        </div>

        {/* ROW 2: Leaderboard + Benchmarking Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 size={20} className="text-indigo-600" />
                Location Leaderboard
              </h3>
              <div className="flex items-center gap-2">
                <select 
                  value={leaderboardMetric}
                  onChange={(e) => setLeaderboardMetric(e.target.value as SortMetric)}
                  className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="profitMargin">By Profit Margin</option>
                  <option value="revenueGrowth">By Revenue Growth</option>
                </select>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                  <button 
                    onClick={() => setLeaderboardMode('top3')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${leaderboardMode === 'top3' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Top 3
                  </button>
                  <button 
                    onClick={() => setLeaderboardMode('bottom3')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${leaderboardMode === 'bottom3' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Bottom 3
                  </button>
                </div>
              </div>
            </div>
            <LeaderboardTable 
              units={franchiseUnits} 
              metric={leaderboardMetric} 
              mode={leaderboardMode} 
            />
          </div>

          {/* Benchmarking Chart - Scatter Plot */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              Internal Benchmarking – Scatter Comparison
            </h3>
            <div className="h-64">
              {isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="revenue"
                      name="Revenue"
                      unit="K"
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="profitMargin"
                      name="Profit Margin"
                      unit="%"
                      domain={[0, 'auto']}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value, name, props) => {
                        if (name === 'Revenue') return `$${value}K`;
                        if (name === 'Profit Margin') return `${value}%`;
                        return value;
                      }}
                      labelFormatter={(label) => {
                        const item = benchmarkScatterData.find(d => d.id === label);
                        return item ? `${item.name} (${item.id})` : label;
                      }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    {/* System Average Revenue (vertical) */}
                    <ReferenceLine
                      x={avgRevenue}
                      stroke="#6366f1"
                      strokeDasharray="3 3"
                      label={{ value: 'Avg Revenue', fill: '#6366f1', fontSize: 12, position: 'top' }}
                    />
                    {/* System Average Margin (horizontal) */}
                    <ReferenceLine
                      y={avgProfitMargin}
                      stroke="#6366f1"
                      strokeDasharray="3 3"
                      label={{ value: 'Sys Avg Margin', fill: '#6366f1', fontSize: 12, position: 'right' }}
                    />
                    {/* ===== NEW: Industry Average Margin (horizontal) ===== */}
                    <ReferenceLine
                      y={industryNetMargin}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: `Ind Avg Margin (${selectedFourDigit})`, fill: '#f59e0b', fontSize: 11, position: 'right' }}
                    />
                    <Scatter name="Locations" data={benchmarkScatterData}>
                      {benchmarkScatterData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.status as keyof typeof statusColors]}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Each dot represents a location, colored by health status. Dashed lines show system averages (blue) and industry average (orange) for NAICS {selectedFourDigit}.
            </p>
          </div>
        </div>

        {/* ROW 3: Unit Cards Grid */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-indigo-600" />
            Unit Detail Cards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {franchiseUnits.map((unit) => (
              <UnitCard 
                key={unit.id} 
                unit={unit} 
                isBest={unit.id === metrics.bestUnit.id}
              />
            ))}
          </div>
        </div>

        {/* ROW 3.5: Risk Alert Feed - Dedicated compliance & contract risk feed */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertOctagon size={20} className="text-rose-500" />
            Compliance & Contract Risk Feed
            <span className="ml-auto text-sm font-normal text-gray-500">
              {franchiseUnits.filter(u => {
                const days = u.daysSinceLastReport;
                const cashOk = u.cashReserve >= u.requiredCashReserve;
                const marginOk = u.profitMargin >= metrics.avgProfitMargin * 0.8;
                const laborOk = (u.laborCost / u.revenue) <= 0.30;
                const daysToRenewal = Math.ceil((new Date(u.contractRenewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const renewalRisk = daysToRenewal <= 90;
                // Also include any critical/warning alerts
                const hasAlertRisk = u.alerts.some(a => a.type === 'critical' || a.type === 'warning');
                return !(days <= 7 && cashOk && marginOk && laborOk && !renewalRisk && !hasAlertRisk);
              }).length} risks
            </span>
          </h3>
          <div className="space-y-2">
            {franchiseUnits
              .filter(u => {
                const days = u.daysSinceLastReport;
                const cashOk = u.cashReserve >= u.requiredCashReserve;
                const marginOk = u.profitMargin >= metrics.avgProfitMargin * 0.8;
                const laborOk = (u.laborCost / u.revenue) <= 0.30;
                const daysToRenewal = Math.ceil((new Date(u.contractRenewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const renewalRisk = daysToRenewal <= 90;
                const hasAlertRisk = u.alerts.some(a => a.type === 'critical' || a.type === 'warning');
                return !(days <= 7 && cashOk && marginOk && laborOk && !renewalRisk && !hasAlertRisk);
              })
              .map(u => {
                const risks = [];
                if (u.daysSinceLastReport > 14) risks.push({ label: 'Report overdue >14 days', severity: 'critical' });
                else if (u.daysSinceLastReport > 7) risks.push({ label: 'Report approaching due', severity: 'warning' });
                if (u.cashReserve < u.requiredCashReserve) risks.push({ label: 'Cash reserve shortfall', severity: 'critical' });
                if (u.profitMargin < metrics.avgProfitMargin * 0.8) risks.push({ label: 'Margin below 80% of system average', severity: 'warning' });
                if ((u.laborCost / u.revenue) > 0.30) risks.push({ label: 'Labor cost >30% of revenue', severity: 'warning' });
                const daysToRenewal = Math.ceil((new Date(u.contractRenewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                if (daysToRenewal <= 90) risks.push({ label: `Contract renews in ${daysToRenewal} days`, severity: 'critical' });
                else if (daysToRenewal <= 180) risks.push({ label: `Contract renews in ${daysToRenewal} days`, severity: 'warning' });
                // Add alerts from the unit's alerts array (critical/warning)
                u.alerts.forEach(alert => {
                  if (alert.type === 'critical' || alert.type === 'warning') {
                    risks.push({ label: alert.message, severity: alert.type === 'critical' ? 'critical' : 'warning' });
                  }
                });
                return { unit: u, risks };
              })
              .map(({ unit, risks }) => (
                <div key={unit.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{unit.name} ({unit.id})</div>
                      <div className="text-xs text-gray-500">{unit.city}, {unit.state}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {risks.map((risk, idx) => (
                        <span key={idx} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${risk.severity === 'critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                          {risk.severity === 'critical' ? <AlertOctagon size={12} /> : <AlertTriangle size={12} />}
                          {risk.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            {franchiseUnits.filter(u => {
              const days = u.daysSinceLastReport;
              const cashOk = u.cashReserve >= u.requiredCashReserve;
              const marginOk = u.profitMargin >= metrics.avgProfitMargin * 0.8;
              const laborOk = (u.laborCost / u.revenue) <= 0.30;
              const daysToRenewal = Math.ceil((new Date(u.contractRenewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const renewalRisk = daysToRenewal <= 90;
              const hasAlertRisk = u.alerts.some(a => a.type === 'critical' || a.type === 'warning');
              return !(days <= 7 && cashOk && marginOk && laborOk && !renewalRisk && !hasAlertRisk);
            }).length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-6">
                <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
                All locations are compliant. No risks detected.
              </div>
            )}
          </div>
        </div>

        {/* ROW 3.6: Strategic Resource Allocation Recommendations */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-500" />
            Strategic Resource Allocation Recommendations
            <span className="ml-auto text-sm font-normal text-gray-500">Based on benchmarking analysis</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{rec.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{rec.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">{rec.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 4: Aggregate Spend + Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spend Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Aggregate Spend Breakdown</h3>
            <div className="h-64">
              {isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendBreakdown} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toLocaleString(undefined, {maximumFractionDigits:0})}K`} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [`$${(value/1000).toLocaleString(undefined, {maximumFractionDigits:0})}K (${((value/spendBreakdown.reduce((s,i)=>s+i.value,0))*100).toFixed(1)}%)`, 'Amount']} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Compliance & Royalty Tracker */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertOctagon size={20} className="text-rose-500" />
              Compliance & Royalty Tracker
              <span className="ml-auto text-sm font-normal text-gray-500">
                {franchiseUnits.filter(u => {
                  const days = u.daysSinceLastReport;
                  const cashOk = u.cashReserve >= u.requiredCashReserve;
                  const marginOk = u.profitMargin >= metrics.avgProfitMargin * 0.8;
                  const laborOk = (u.laborCost / u.revenue) <= 0.30;
                  return !(days <= 7 && cashOk && marginOk && laborOk);
                }).length} issues
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 font-semibold">Location</th>
                    <th className="pb-2 font-semibold text-right">Royalty Fee</th>
                    <th className="pb-2 font-semibold text-right">Marketing Fund</th>
                    <th className="pb-2 font-semibold text-center">Compliance Status</th>
                    <th className="pb-2 font-semibold text-right">Last Report</th>
                    <th className="pb-2 font-semibold text-right">Renewal</th>
                  </tr>
                </thead>
                <tbody>
                  {franchiseUnits.map((unit) => {
                    const days = unit.daysSinceLastReport;
                    const cashOk = unit.cashReserve >= unit.requiredCashReserve;
                    const marginOk = unit.profitMargin >= metrics.avgProfitMargin * 0.8;
                    const laborOk = (unit.laborCost / unit.revenue) <= 0.30;

                    // Determine overall compliance status
                    let status: 'green' | 'yellow' | 'red' = 'green';
                    const issues = [];
                    if (days > 14) { status = 'red'; issues.push('Report overdue (>14d)'); }
                    else if (days > 7) { status = 'yellow'; issues.push('Report approaching due'); }
                    if (!cashOk) { status = 'red'; issues.push('Cash reserve shortfall'); }
                    if (!marginOk) { status = 'yellow'; issues.push('Margin below 80% of avg'); }
                    if (!laborOk) { status = 'yellow'; issues.push('Labor cost >30% of revenue'); }

                    const daysToRenewal = Math.ceil((new Date(unit.contractRenewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const renewalWarning = daysToRenewal <= 180;

                    return (
                      <tr key={unit.id} className="border-b border-gray-100 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                        <td className="py-3">
                          <div className="font-medium text-gray-900 dark:text-white">{unit.name}</div>
                          <div className="text-xs text-gray-500">{unit.id}</div>
                        </td>
                        <td className="py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                          ${unit.royaltyFee.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-mono text-blue-600 dark:text-blue-400">
                          ${unit.marketingFundContribution.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <StatusBadge status={status} />
                            {issues.length > 0 && (
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[120px] truncate" title={issues.join(', ')}>
                                {issues.join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`text-sm font-mono ${days <= 7 ? 'text-emerald-600' : days <= 14 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {days}d ago
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {renewalWarning ? (
                            <span className={`text-xs font-medium ${daysToRenewal <= 90 ? 'text-rose-600' : 'text-amber-600'}`}>
                              {daysToRenewal}d
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">{daysToRenewal}d</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                    <td className="py-3 font-bold text-gray-900 dark:text-white">Totals</td>
                    <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ${franchiseUnits.reduce((sum, u) => sum + u.royaltyFee, 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                      ${franchiseUnits.reduce((sum, u) => sum + u.marketingFundContribution, 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-center text-sm text-gray-500" colSpan={3}>
                      {franchiseUnits.filter(u => {
                        const days = u.daysSinceLastReport;
                        const cashOk = u.cashReserve >= u.requiredCashReserve;
                        const marginOk = u.profitMargin >= metrics.avgProfitMargin * 0.8;
                        const laborOk = (u.laborCost / u.revenue) <= 0.30;
                        return !(days <= 7 && cashOk && marginOk && laborOk);
                      }).length} locations with compliance issues
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FranchiseView;