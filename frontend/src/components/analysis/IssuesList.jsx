import React from "react";
import { Shield } from "lucide-react";

const IssuesList = ({ issues = [] }) => {
  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No issues detected in this pull request</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
        <h3 className="font-semibold text-gray-900">Code Issues Detected</h3>
      </div>
      <div className="divide-y">
        {issues.map((issue, index) => (
          <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      issue.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : issue.severity === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {issue.severity?.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {issue.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {issue.file}:{issue.line}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {issue.description}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {issue.fix_suggestion}
                </p>
                {issue.code && (
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono">
                    {issue.code}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssuesList;
