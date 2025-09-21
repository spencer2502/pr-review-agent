import React, { useState, useEffect } from "react";
import Header from "./components/common/Header";
import TabNavigation from "./components/common/TabNavigation";
import Dashboard from "./components/pages/Dashboard";
import TimeMachine from "./components/pages/TimeMachine";
import Chat from "./components/pages/Chat";
import AutoFixes from "./components/pages/AutoFixes";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { useAnalysis } from "./hooks/useAnalysis";
import { analysisApi } from "./services/analysisApi";

const PRReviewAgent = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [githubRepo, setGithubRepo] = useState("facebook/react");
  const [prNumber, setPrNumber] = useState("28647");
  const [isGitHubMode, setIsGitHubMode] = useState(false);

  const {
    analysis,
    setAnalysis,
    analyzing,
    setAnalyzing,
    selectedMentor,
    setSelectedMentor,
  } = useAnalysis();

  const handleAnalyzeClick = async () => {
    setAnalyzing(true);
    try {
      let result;
      if (isGitHubMode && githubRepo && prNumber) {
        result = await analysisApi.analyzeGitHubPR(githubRepo, prNumber);
      } else {
        result = await analysisApi.analyzeMockPR();
      }
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    // Load demo data on initial mount
    handleAnalyzeClick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (analyzing && !analysis) {
    return <LoadingSpinner message="Analyzing Pull Request" />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <Header
        analysis={analysis}
        githubRepo={githubRepo}
        setGithubRepo={setGithubRepo}
        prNumber={prNumber}
        setPrNumber={setPrNumber}
        isGitHubMode={isGitHubMode}
        setIsGitHubMode={setIsGitHubMode}
        analyzing={analyzing}
        onAnalyze={handleAnalyzeClick}
      />

      {analysis && (
        <>
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === "dashboard" && (
            <Dashboard analysis={analysis} setAnalysis={setAnalysis} />
          )}
          {activeTab === "timemachine" && <TimeMachine analysis={analysis} />}
          {activeTab === "chat" && (
            <Chat
              analysis={analysis}
              selectedMentor={selectedMentor}
              setSelectedMentor={setSelectedMentor}
            />
          )}
          {activeTab === "fixes" && (
            <AutoFixes analysis={analysis} setAnalysis={setAnalysis} />
          )}
        </>
      )}
    </div>
  );
};

export default PRReviewAgent;
