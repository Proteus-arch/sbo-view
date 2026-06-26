'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList, ReferenceLine
} from 'recharts';

const CustomXAxisTick = ({ x, y, payload }: any) => {
  const lines = String(payload.value).split('\n');
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line: string, i: number) => (
        <text key={i} x={0} y={i * 14} dy={12} textAnchor="middle" fill="#9ca3b8" fontSize={10}>
          {line}
        </text>
      ))}
    </g>
  );
};

const BarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value == null || width == null) return null;
  const isNegative = value < 0;
  const absVal = Math.abs(value);
  const fmt = absVal >= 1000 ? `$${(absVal / 1000).toFixed(1)}k` : `$${absVal.toFixed(0)}`;
  // For negative bars, place label below the bar tip; for positive, above
  const labelY = isNegative ? y + height + 14 : y - 6;
  return (
    <text
      x={x + width / 2}
      y={labelY}
      textAnchor="middle"
      fill={isNegative ? '#ef4444' : '#ffffff'}
      fontSize={11}
      fontWeight="bold"
    >
      {isNegative ? `-${fmt}` : fmt}
    </text>
  );
};

interface RatioBarChartProps {
  title: string;
  priorNum: number;
  currentNum: number;
  priorDen: number;
  currentDen: number;
  numLabel: string;
  denLabel: string;
  numColor?: string;
  denColor?: string;
}

const RatioBarChart = ({
  title,
  priorNum,
  currentNum,
  priorDen,
  currentDen,
  numLabel,
  denLabel,
  numColor = '#3b82f6',
  denColor = '#ef4444',
}: RatioBarChartProps) => {
  // Assets: respect sign (negative = distress / below break-even)
  // Liabilities: always positive magnitude (obligations point upward)
  const data = [
    {
      name: `${numLabel}\n(Prior Year)`,
      value: priorNum,
      type: 'num',
      fill: priorNum < 0 ? '#ef4444' : numColor,
    },
    {
      name: `${numLabel}\n(Current Year)`,
      value: currentNum,
      type: 'num',
      fill: currentNum < 0 ? '#ef4444' : numColor,
    },
    {
      name: `${denLabel}\n(Prior Year)`,
      value: Math.abs(priorDen),
      type: 'den',
      fill: denColor,
    },
    {
      name: `${denLabel}\n(Current Year)`,
      value: Math.abs(currentDen),
      type: 'den',
      fill: denColor,
    },
  ];

  const priorRatio = priorDen !== 0 ? priorNum / Math.abs(priorDen) : 0;
  const currentRatio = currentDen !== 0 ? currentNum / Math.abs(currentDen) : 0;

  const tooltipFmt = (value: number, _name: string, props: any) => {
    const isAsset = props?.payload?.type === 'num';
    const displayVal = isAsset ? value : Math.abs(value);
    const absVal = Math.abs(displayVal);
    const fmt = absVal >= 1000 ? `$${(absVal / 1000).toFixed(1)}k` : `$${absVal.toFixed(0)}`;
    return [fmt, isAsset ? numLabel : denLabel];
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800 p-5 rounded-2xl">
      <h4 className="text-center text-white font-bold text-sm mb-1 tracking-wide">{title}</h4>

      {/* Coverage ratio annotation — the "gap" in plain language */}
      <div className="flex justify-center gap-6 mb-3">
        <div className="text-[10px] font-mono">
          <span className="text-gray-500">Prior Coverage: </span>
          <span className={priorRatio < 1 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
            {priorRatio.toFixed(2)}x
          </span>
        </div>
        <div className="text-[10px] font-mono">
          <span className="text-gray-500">Current Coverage: </span>
          <span className={currentRatio < 1 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
            {currentRatio.toFixed(2)}x
          </span>
          {currentNum < 0 && (
            <span className="ml-2 text-[9px] text-red-500 font-black uppercase">⚠ Shortage</span>
          )}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 30, right: 20, left: 10, bottom: 45 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            
            {/* Prominent zero baseline */}
            <ReferenceLine
              y={0}
              stroke="#9ca3b8"
              strokeWidth={1.5}
              label={{ value: 'Break-even', position: 'right', fill: '#9ca3b8', fontSize: 10 }}
            />

            <XAxis
              dataKey="name"
              tick={<CustomXAxisTick />}
              interval={0}
              tickLine={false}
              axisLine={{ stroke: '#4b5563' }}
              height={55}
            />
            <YAxis
              tick={{ fill: '#9ca3b8', fontSize: 10 }}
              tickFormatter={(v) => {
                const absVal = Math.abs(v);
                if (absVal >= 1000) return `$${(absVal / 1000).toFixed(0)}k`;
                return `$${absVal.toFixed(0)}`;
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={tooltipFmt}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList dataKey="value" content={<BarLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: numColor }} />
          <span className="text-[10px] text-gray-400 uppercase font-bold">{numLabel}</span>
          {currentNum < 0 && (
            <span className="text-[9px] text-red-400 font-bold ml-1 animate-pulse">BELOW ZERO</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: denColor }} />
          <span className="text-[10px] text-gray-400 uppercase font-bold">{denLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default RatioBarChart;