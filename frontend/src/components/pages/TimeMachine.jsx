import React from "react";
import PredictionCard from "../timemachine/PredictionCard";
import ImpactMetrics from "../timemachine/ImpactMetrics";

const TimeMachine = ({ analysis }) => {
  if (!analysis.time_machine) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">⏳</div>
        <p className="text-gray-500">No time machine data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 mr-3">⏱</div>
          <h3 className="text-2xl font-bold">PR Time Machine</h3>
        </div>
        <p className="text-purple-100 text-lg">
          AI-powered predictions about your code's future impact
        </p>
      </div>

      <ImpactMetrics timeMachine={analysis.time_machine} />
      <PredictionCard predictions={analysis.time_machine.predicted_issues} />
    </div>
  );
};

export default TimeMachine;
