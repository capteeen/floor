"use client";

import { formatSol } from "@/lib/format";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CollectionChart({ data }: { data: { label: string; floor: number }[] }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="label" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              background: "#0E1018",
              border: "1px solid #1C2030",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value) => [formatSol(Number(value)), "Floor"]}
          />
          <Line type="monotone" dataKey="floor" stroke="#3DFF9A" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
