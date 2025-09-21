import React from "react";

const ImpactMetrics = ({ timeMachine }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4">Bug Likelihood</h4>
        <div className="relative">
          <div className="flex items-center mb-2">
            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
              <div
                className="bg-gradient-to-r from-red-400 to-red-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${timeMachine.bug_likelihood * 100}%` }}
              ></div>
            </div>
            <span className="text-2xl font-bold text-red-600">
              {Math.round(timeMachine.bug_likelihood * 100)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Probability of introducing bugs in the next 30 days
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4">
          Maintainability Impact
        </h4>
        <div className="text-center">
          <span
            className={`text-4xl font-bold ${
              timeMachine.maintainability_impact < 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {timeMachine.maintainability_impact > 0 ? "+" : ""}
            {timeMachine.maintainability_impact}%
          </span>
          <p className="text-sm text-gray-600 mt-2">
            Expected change in code maintainability score
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4">Performance Risk</h4>
        <div className="relative">
          <div className="flex items-center mb-2">
            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-1000"
                style={{
                  width: `${timeMachine.performance_regression * 100}%`,
                }}
              ></div>
            </div>
            <span className="text-2xl font-bold text-yellow-600">
              {Math.round(timeMachine.performance_regression * 100)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Risk of performance degradation
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImpactMetrics;
