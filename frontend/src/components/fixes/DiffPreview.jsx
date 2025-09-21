import React from "react";

const DiffPreview = ({ diff = "" }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
      <div className="flex items-center mb-2">
        <span className="text-gray-400 text-xs font-mono">DIFF PREVIEW:</span>
      </div>
      <pre className="text-sm font-mono text-gray-100 whitespace-pre-wrap">
        {String(diff)
          .split("\n")
          .map((line, i) => (
            <div
              key={i}
              className={
                line.startsWith("+")
                  ? "text-green-300"
                  : line.startsWith("-")
                  ? "text-red-300"
                  : "text-gray-300"
              }
            >
              {line}
            </div>
          ))}
      </pre>
    </div>
  );
};

export default DiffPreview;
