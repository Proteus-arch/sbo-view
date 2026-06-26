'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

interface MetricValues {
  prior: number;
  current: number;
}

interface TrendAnalysisProps {
  businessData: {
    metrics: Record<string, MetricValues>;
  };
}

const TrendAnalysis = ({ businessData }: TrendAnalysisProps) => {
  const metricsToDisplay = [
    'Revenue', 'Gross Profit', 'Net Income', 
    'Cash', 'Accounts Receivable', 'Inventory', 
    'Accounts Payable', 'Short-term Debt', 'Long-term Debt',
    'Fixed Assets', 'Equity'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {metricsToDisplay.map((name) => {
        const values = businessData.metrics[name];
        if (!values) return null;

        const chartData = [
          { year: 'Prior', amount: values.prior },
          { year: 'Current', amount: values.current }
        ];
        const delta = ((values.current - values.prior) / (values.prior || 1) * 100).toFixed(1);
        const isPositive = values.current >= values.prior;

        return (
          <div key={name} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center">
            <div className="w-full flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{name}</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isPositive ? '↑' : '↓'} {delta}%
              </span>
            </div>
            
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="year" 
                    fontSize={10} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    fontSize={9} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#cbd5e1' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full mt-4 flex justify-between items-center text-[10px] font-bold">
              <div className="flex flex-col">
                 <span className="text-gray-400 uppercase tracking-tighter">Prior</span>
                 <span className="text-gray-500">${values.prior.toLocaleString()}</span>
              </div>
              <div className="flex flex-col text-right">
                 <span className="text-emerald-400 uppercase tracking-tighter">Current</span>
                 <span className="text-emerald-600 font-black">${values.current.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrendAnalysis;
