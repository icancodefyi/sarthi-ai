"use client";

import { useState } from "react";
import type { Anomaly } from "@/types";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

interface Props {
  anomalies: Anomaly[];
}

export default function AnomalyTable({ anomalies }: Props) {
  const [page, setPage] = useState(1);

  if (anomalies.length === 0) {
    return (
      <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6 text-center text-[13px] text-[#9ca3af]">
        No anomalies detected. Your data looks clean. ✓
      </div>
    );
  }

  const totalPages = Math.ceil(anomalies.length / PAGE_SIZE);
  const slice = anomalies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0a0a0a]">Anomaly Breakdown</h3>
          <p className="text-[12px] text-[#9ca3af]">
            {anomalies.length} outlier{anomalies.length !== 1 ? "s" : ""} detected via Z-score &gt; 2.5
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#f0ede8]">
              {["Row", "Column", "Value", "Z-Score", "Severity"].map((h) => (
                <th key={h} className="pb-2.5 text-[11.5px] font-semibold text-[#9ca3af] uppercase tracking-wide pr-6">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((a, i) => {
              const severity = a.zScore > 4 ? "High" : a.zScore > 3 ? "Medium" : "Low";
              const sevColor =
                severity === "High"
                  ? "text-red-600 bg-red-50 border-red-100"
                  : severity === "Medium"
                  ? "text-amber-600 bg-amber-50 border-amber-100"
                  : "text-blue-600 bg-blue-50 border-blue-100";

              return (
                <tr
                  key={i}
                  className="border-b border-[#fafaf9] hover:bg-[#fafaf9] transition-colors"
                >
                  <td className="py-2.5 text-[13px] text-[#6b7280] pr-6">{a.rowIndex}</td>
                  <td className="py-2.5 text-[13px] font-medium text-[#0a0a0a] pr-6">{a.column}</td>
                  <td className="py-2.5 text-[13px] text-[#0a0a0a] font-mono pr-6">{a.value}</td>
                  <td className="py-2.5 text-[13px] text-[#6b7280] font-mono pr-6">{a.zScore}</td>
                  <td className="py-2.5 pr-6">
                    <span className={`inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${sevColor}`}>
                      {severity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={anomalies.length}
        pageSize={PAGE_SIZE}
        onPage={(p) => setPage(p)}
      />
    </div>
  );
}
