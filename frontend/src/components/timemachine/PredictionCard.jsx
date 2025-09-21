import React from "react";
import { AlertTriangle } from "lucide-react";

const PredictionCard = ({ predictions = [] }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-purple-500" />
        AI Predictions & Recommendations
      </h4>
      <div className="space-y-3">
        {predictions && predictions.length > 0 ? (
          predictions.map((issue, index) => (
            <div
              key={index}
              className="flex items-start p-3 bg-gray-50 rounded-lg"
            >
              <AlertTriangle className="w-5 h-5 mr-3 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{issue}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No predictions available.</p>
        )}
      </div>
    </div>
  );
};

export default PredictionCard;
