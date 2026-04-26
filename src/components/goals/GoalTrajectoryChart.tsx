"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { month: string; expected: number };

export function GoalTrajectoryChart({
  points,
  targetInr,
  currentInr,
  currentMonthIdx,
}: {
  points: Point[];
  targetInr: number;
  currentInr: number;
  currentMonthIdx: number;
}) {
  const currentMonthLabel = points[currentMonthIdx]?.month ?? points[0].month;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={points} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
          <defs>
            <linearGradient id="goalArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F4D3F" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#0F4D3F" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E8DFCB" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#8A8A8A", fontSize: 10 }}
            axisLine={{ stroke: "#E8DFCB" }}
            tickLine={false}
            interval={Math.max(1, Math.floor(points.length / 8))}
          />
          <YAxis
            tickFormatter={(v) => formatShortInr(v)}
            tick={{ fill: "#8A8A8A", fontSize: 10 }}
            axisLine={{ stroke: "#E8DFCB" }}
            tickLine={false}
            width={56}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8DFCB",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "Manrope, sans-serif",
            }}
            formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Expected"]}
            labelStyle={{ color: "#4A4A4A" }}
          />
          <Area
            type="monotone"
            dataKey="expected"
            stroke="#0F4D3F"
            strokeWidth={2}
            fill="url(#goalArea)"
          />
          <ReferenceLine
            y={targetInr}
            stroke="#C8973F"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              position: "right",
              value: `Target ${formatShortInr(targetInr)}`,
              fill: "#C8973F",
              fontSize: 10,
              fontFamily: "Manrope, sans-serif",
            }}
          />
          <ReferenceDot
            x={currentMonthLabel}
            y={currentInr}
            r={5}
            fill="#0F4D3F"
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatShortInr(v: number): string {
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(1)}Cr`;
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L`;
  if (v >= 1_000) return `₹${Math.round(v / 1_000)}k`;
  return `₹${v}`;
}
