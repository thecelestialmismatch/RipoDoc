"use client";

import { useState } from "react";
import { X, Table, TrendingUp, CheckCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
import type { EvidenceCell } from "@/lib/evidence/types.ts";

/**
 * Rows shown in the in-page drawer. Cells are the same union the evidence
 * manifest uses, so the hosted twin and the PDF evidence pages cannot drift
 * apart in what they are able to display.
 */
type ReportData = Record<string, EvidenceCell>[];

interface ReportSection {
  id: string;
  type: "kpi" | "chart" | "paragraph";
  title: string;
  value: string;
  sourceData: ReportData;
}

interface Report {
  id: string;
  title: string;
  client: string;
  sections: ReportSection[];
}

export function ReportViewer({ report }: { report: Report }) {
  const [activeSection, setActiveSection] = useState<ReportSection | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case "kpi": return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "chart": return <TrendingUp className="w-5 h-5 text-green-500" />;
      default: return <Table className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{report.title}</h1>
            <p className="text-sm text-gray-500">Prepared for {report.client}</p>
          </div>
          <button className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition">
            Download PDF
          </button>
        </div>
      </header>

      {/* Main Report Content (The "PDF" View) */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 space-y-8">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-serif font-bold">Executive Summary</h2>
            <p className="text-gray-600 mt-2">
              Below is the performance data for Q3. <span className="text-blue-600 underline cursor-pointer hover:text-blue-800" onClick={() => setActiveSection(report.sections[0])}>Click any metric</span> to view the underlying raw data and verify our reporting.
            </p>
          </div>

          {/* Interactive Elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.sections.map((section) => (
              <div
                key={section.id}
                onClick={() => setActiveSection(section)}
                className={twMerge(
                  "p-6 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-blue-300 group",
                  activeSection?.id === section.id ? "border-blue-500 bg-blue-50/50 shadow-md" : "border-gray-200"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(section.type)}
                  <h3 className="font-semibold text-gray-700 group-hover:text-blue-700">{section.title}</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{section.value}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Table className="w-3 h-3" /> Click to view source data
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* The In-Page Data Drawer (The Core Feature) */}
      {activeSection && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setActiveSection(null)} 
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{activeSection.title}</h3>
                <p className="text-sm text-gray-500">Underlying Source Data</p>
              </div>
              <button 
                onClick={() => setActiveSection(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-900">{activeSection.sourceData.length}</span> records.
                </p>
                <button className="text-sm px-3 py-1 border rounded hover:bg-gray-50">
                  Export CSV
                </button>
              </div>

              {/* Data Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(activeSection.sourceData[0] || {}).map((key) => (
                        <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key.replace('_', ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeSection.sourceData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
