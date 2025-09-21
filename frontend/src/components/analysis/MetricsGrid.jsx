import React from "react";
import { XCircle, Zap, CheckCircle } from "lucide-react";

const MetricsGrid = ({ analysis }) => {
  const criticalIssues =
    analysis.issues?.filter((i) => i.severity === "high")?.length || 0;
  const autoFixesCount = analysis.auto_fixes?.length || 0;
  const avgConfidence =
    autoFixesCount > 0
      ? Math.round(
          (analysis.auto_fixes.reduce((acc, fix) => acc + fix.confidence, 0) /
            autoFixesCount) *
            100
        )
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-red-900">Critical Issues</h3>
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-3xl font-bold text-red-600">{criticalIssues}</p>
        <p className="text-sm text-red-700 mt-1">Require immediate attention</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-green-900">Auto-Fixes Ready</h3>
          <Zap className="w-6 h-6 text-green-500" />
        </div>
        <p className="text-3xl font-bold text-green-600">{autoFixesCount}</p>
        <p className="text-sm text-green-700 mt-1">One-click solutions</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-purple-900">AI Confidence</h3>
          <CheckCircle className="w-6 h-6 text-purple-500" />
        </div>
        <p className="text-3xl font-bold text-purple-600">{avgConfidence}%</p>
        <p className="text-sm text-purple-700 mt-1">Average fix confidence</p>
      </div>
    </div>
  );
};

export default MetricsGrid;
