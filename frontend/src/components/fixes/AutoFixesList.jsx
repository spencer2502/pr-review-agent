import React from "react";
import FixCard from "./FixCard";

const AutoFixesList = ({ autoFixes = [], onApplyFix, loading }) => {
  if (!autoFixes || autoFixes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">⚡</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Auto-Fixes Available
        </h3>
        <p className="text-gray-500">
          No fixable issues were detected in this pull request.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {autoFixes.map((fix) => (
        <FixCard
          key={fix.id}
          fix={fix}
          onApplyFix={onApplyFix}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default AutoFixesList;
