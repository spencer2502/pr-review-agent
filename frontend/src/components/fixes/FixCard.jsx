import React from "react";
import DiffPreview from "./DiffPreview";

const FixCard = ({ fix, onApplyFix, loading }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="w-5 h-5 mr-2 text-purple-500">✨</span>
            {fix.description}
          </h4>
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Confidence:</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-3 mr-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      fix.confidence > 0.8
                        ? "bg-green-500"
                        : fix.confidence > 0.6
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${fix.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {Math.round(fix.confidence * 100)}%
                </span>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                fix.confidence > 0.8
                  ? "bg-green-100 text-green-800"
                  : fix.confidence > 0.6
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {fix.confidence > 0.8
                ? "HIGH CONFIDENCE"
                : fix.confidence > 0.6
                ? "MEDIUM CONFIDENCE"
                : "LOW CONFIDENCE"}
            </div>
          </div>
        </div>

        <button
          onClick={() => onApplyFix(fix.id)}
          disabled={fix.applied || loading}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
            fix.applied
              ? "bg-green-100 text-green-700 cursor-not-allowed border border-green-200"
              : loading
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
              <span>Applying...</span>
            </>
          ) : fix.applied ? (
            <>
              <span className="w-4 h-4">✔️</span>
              <span>Applied ✓</span>
            </>
          ) : (
            <>
              <span className="w-4 h-4">⚡</span>
              <span>Apply Fix</span>
            </>
          )}
        </button>
      </div>

      <DiffPreview diff={fix.diff} />
    </div>
  );
};

export default FixCard;
