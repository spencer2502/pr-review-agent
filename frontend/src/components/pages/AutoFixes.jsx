import React, { useState } from "react";
import AutoFixesList from "../fixes/AutoFixesList";

const AutoFixes = ({ analysis, setAnalysis }) => {
  const [loading, setLoading] = useState(false);

  const handleApplyFix = async (fixId) => {
    setLoading(true);
    try {
      const { analysisApi } = await import("../../services/analysisApi");
      const result = await analysisApi.applyFix(analysis.pr_id, fixId);

      // Update analysis with applied fix (optimistic)
      setAnalysis((prev) =>
        prev
          ? {
              ...prev,
              auto_fixes: prev.auto_fixes.map((fix) =>
                fix.id === fixId ? { ...fix, applied: true } : fix
              ),
              risk_score: result?.new_risk_score ?? prev.risk_score,
              risk_level: result?.new_risk_level ?? prev.risk_level,
            }
          : prev
      );
    } catch (error) {
      console.error("Apply fix failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const allFixesApplied = analysis.auto_fixes?.every((fix) => fix.applied);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-xl">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 mr-3">⚡</div>
          <h3 className="text-2xl font-bold">AI Auto-Fixes</h3>
        </div>
        <p className="text-green-100">
          I've generated {analysis.auto_fixes?.length || 0} high-confidence
          patches ready to apply
        </p>
      </div>

      <AutoFixesList
        autoFixes={analysis.auto_fixes || []}
        onApplyFix={handleApplyFix}
        loading={loading}
      />

      {allFixesApplied && analysis.auto_fixes?.length > 0 && (
        <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200">
          <div className="w-16 h-16 mx-auto mb-4 text-green-500">✔️</div>
          <h3 className="text-xl font-semibold text-green-900 mb-2">
            All Fixes Applied!
          </h3>
          <p className="text-green-700">
            Your PR risk score has been significantly improved.
          </p>
        </div>
      )}
    </div>
  );
};

export default AutoFixes;
