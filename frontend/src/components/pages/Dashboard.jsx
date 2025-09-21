import React from "react";
import MetricsGrid from "../analysis/MetricsGrid";
import IssuesList from "../analysis/IssuesList";

const Dashboard = ({ analysis, setAnalysis }) => {
  return (
    <div className="space-y-6">
      <MetricsGrid analysis={analysis} />
      <IssuesList issues={analysis.issues} />
    </div>
  );
};

export default Dashboard;
