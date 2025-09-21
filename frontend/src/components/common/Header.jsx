import React from "react";
import {
  Bot,
  Clock,
  Github,
  RefreshCw,
  Sparkles,
  Loader,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
} from "lucide-react";

const Header = ({
  analysis,
  githubRepo,
  setGithubRepo,
  prNumber,
  setPrNumber,
  isGitHubMode,
  setIsGitHubMode,
  analyzing,
  onAnalyze,
}) => {
  const getRiskIcon = (risk) => {
    // use risk_score or risk_level as provided by backend
    if (!risk) return <Shield className="w-5 h-5 text-gray-500" />;
    if (typeof risk === "number") {
      if (risk < 40) return <CheckCircle className="w-5 h-5 text-green-500" />;
      if (risk < 70)
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    // accept string levels too
    switch (String(risk).toLowerCase()) {
      case "green":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "yellow":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "red":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              PR Review Agent
            </h1>
            <p className="text-gray-600">CodeMate AI-Powered Code Review</p>
          </div>
        </div>

        {analysis && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              Analysis completed in {analysis.analysis_time?.toFixed(1) || 0}s
            </span>
          </div>
        )}
      </div>

      {/* GitHub PR Input */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Analyze Pull Request
          </h2>
          <button
            onClick={() => setIsGitHubMode(!isGitHubMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isGitHubMode
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <Github className="w-4 h-4 inline mr-2" />
            GitHub Mode
          </button>
        </div>

        {isGitHubMode ? (
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repository
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="owner/repository"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PR Number
              </label>
              <input
                type="text"
                value={prNumber}
                onChange={(e) => setPrNumber(e.target.value)}
                placeholder="123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="pt-7">
              <button
                onClick={onAnalyze}
                disabled={analyzing || !githubRepo || !prNumber}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {analyzing ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Analyze PR</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Demo Mode - Using sample authentication PR for demonstration
            </p>
            <button
              onClick={onAnalyze}
              disabled={analyzing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {analyzing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Load Demo</span>
            </button>
          </div>
        )}
      </div>

      {/* PR Summary */}
      {analysis && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              PR #{analysis.pr_id}: {analysis.title}
            </h2>
            {analysis.repository && (
              <a
                href={`https://github.com/${analysis.repository}/pull/${String(
                  analysis.pr_id
                )
                  .split("-")
                  .pop()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View on GitHub
              </a>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className={`flex items-center px-4 py-2 rounded-full border`}>
              {getRiskIcon(analysis.risk_score ?? analysis.risk_level)}
              <span className="ml-2 font-semibold">
                Risk Score: {analysis.risk_score ?? "--"}/100
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              <span className="font-medium">
                {analysis.auto_fixes?.length || 0} auto-fixes available
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Shield className="w-5 h-5 mr-2 text-blue-500" />
              <span>{analysis.issues?.length || 0} issues found</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
