import React from "react";
import { Loader } from "lucide-react";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="text-center py-12">
    <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{message}</h3>
    <p className="text-gray-600">AI is processing your request...</p>
  </div>
);

export default LoadingSpinner;
