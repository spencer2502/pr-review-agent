// frontend/src/App.js
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Bot,
  Sparkles,
  Send,
  Github,
} from "lucide-react";
import "./App.css";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// API Service Class
class ApiService {
  async analyzePR(prId, title = "Add user authentication system", repo = null) {
    const url = repo
      ? `${API_BASE_URL}/api/analysis/pr/${prId}?title=${encodeURIComponent(
          title
        )}&repo=${encodeURIComponent(repo)}`
      : `${API_BASE_URL}/api/analysis/pr/${prId}?title=${encodeURIComponent(
          title
        )}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Analysis failed");
    return response.json();
  }

  async getAnalysis(prId) {
    const response = await fetch(`${API_BASE_URL}/api/analysis/pr/${prId}`);
    if (!response.ok) throw new Error("Failed to get analysis");
    return response.json();
  }

  async chat(prId, message, mentorMode = "balanced") {
    const encodedPrId = encodeURIComponent(prId); // ✅ important
    const response = await fetch(`${API_BASE_URL}/api/chat/${encodedPrId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: message,
        mentor_mode: mentorMode,
      }),
    });

    if (!response.ok) throw new Error("Chat failed");
    return response.json();
  }

  async applyFix(prId, fixId) {
    const response = await fetch(
      `${API_BASE_URL}/api/analysis/apply-fix/${prId}/${fixId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error("Failed to apply fix");
    return response.json();
  }

  async getDemoData(prId) {
    const response = await fetch(`${API_BASE_URL}/api/analysis/demo/${prId}`);
    if (!response.ok) throw new Error("Failed to get demo data");
    return response.json();
  }

  async analyzeGitHubPR(prUrl, repository, prNumber, githubToken = null) {
    const headers = { "Content-Type": "application/json" };
    if (githubToken) {
      headers["Authorization"] = `Bearer ${githubToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/github/analyze-pr`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        pr_url: prUrl,
        repository: repository,
        pr_number: prNumber,
        github_token: githubToken,
      }),
    });

    if (!response.ok) throw new Error("GitHub PR analysis failed");
    return response.json();
  }
}

const apiService = new ApiService();

// Mentor Personas
const mentorPersonas = [
  {
    persona_id: "sarah_lead",
    name: "Sarah (Team Lead)",
    style_traits: {
      focuses_on: ["architecture", "maintainability", "team standards"],
      communication_style: "thorough_explanations",
      personality:
        "patient mentor who explains the 'why' behind recommendations",
    },
  },
  {
    persona_id: "alex_security",
    name: "Alex (Security Expert)",
    style_traits: {
      focuses_on: ["security", "vulnerabilities", "compliance"],
      communication_style: "security_first",
      personality: "direct and focused on identifying security risks",
    },
  },
  {
    persona_id: "jordan_perf",
    name: "Jordan (Performance Guru)",
    style_traits: {
      focuses_on: ["performance", "scalability", "optimization"],
      communication_style: "metrics_driven",
      personality: "data-driven optimizer who loves performance metrics",
    },
  },
];

const PRReviewAgent = () => {
  const [analysis, setAnalysis] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentPR, setCurrentPR] = useState("123");
  const [githubUrl, setGithubUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (analysis && chatMessages.length === 0) {
      setTimeout(() => {
        setChatMessages([
          {
            role: "assistant",
            content: `Hi! I've analyzed PR #${analysis.pr_id} "${
              analysis.title
            }" and found ${
              analysis.issues.length
            } issues with a risk score of ${Math.round(
              analysis.risk_score
            )}/100. What would you like to know?`,
            timestamp: new Date().toISOString(),
            persona: "AI Reviewer",
          },
        ]);
      }, 1000);
    }
  }, [analysis]);

  const loadInitialData = async () => {
    try {
      setAnalyzing(true);
      const data = await apiService.getDemoData(currentPR);
      setAnalysis(data);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const triggerAnalysis = async () => {
    try {
      setAnalyzing(true);
      setChatMessages([]);
      const data = await apiService.analyzePR(currentPR);
      setAnalysis(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeGitHubPR = async () => {
    if (!githubUrl.trim()) return;

    try {
      setAnalyzing(true);
      setChatMessages([]);

      // Parse GitHub URL
      const urlParts = githubUrl.match(
        /github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/
      );
      if (!urlParts) {
        alert(
          "Invalid GitHub PR URL. Please use format: https://github.com/owner/repo/pull/123"
        );
        return;
      }

      const [, repository, prNumber] = urlParts;
      const data = await apiService.analyzeGitHubPR(
        githubUrl,
        repository,
        parseInt(prNumber),
        githubToken || null
      );
      setAnalysis(data);
      setCurrentPR(`${repository}-${prNumber}`);
    } catch (error) {
      console.error("GitHub analysis failed:", error);
      alert("Failed to analyze GitHub PR. Using demo data instead.");
      await loadInitialData();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isTyping || !analysis) return;

    const userMessage = {
      role: "user",
      content: currentMessage,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    try {
      const response = await apiService.chat(
        analysis.pr_id,
        currentMessage,
        selectedMentor?.persona_id
      );

      setTimeout(() => {
        const aiResponse = {
          role: "assistant",
          content: response.response,
          timestamp: new Date().toISOString(),
          persona:
            response.mentor_name || selectedMentor?.name || "AI Reviewer",
        };
        setChatMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);

      const fallbackResponse = {
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Based on your analysis, I can see security concerns and code quality issues that need attention.",
        timestamp: new Date().toISOString(),
        persona: selectedMentor?.name || "AI Reviewer",
      };
      setChatMessages((prev) => [...prev, fallbackResponse]);
    }
  };

  const applyFix = async (fixId) => {
    if (!analysis) return;

    setLoading(true);

    try {
      const result = await apiService.applyFix(analysis.pr_id, fixId);

      setAnalysis((prev) => ({
        ...prev,
        auto_fixes: prev.auto_fixes.map((fix) =>
          fix.id === fixId ? { ...fix, applied: true } : fix
        ),
        risk_score: result.new_risk_score,
        risk_level: result.new_risk_level,
      }));

      const successMessage = {
        role: "system",
        content: `✅ ${result.message} Risk score is now ${result.new_risk_score}/100`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, successMessage]);
    } catch (error) {
      console.error("Failed to apply fix:", error);
      alert("Failed to apply fix. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "green":
        return "text-green-600 bg-green-100 border-green-200";
      case "yellow":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "red":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case "green":
        return <CheckCircle className="w-5 h-5" />;
      case "yellow":
        return <AlertTriangle className="w-5 h-5" />;
      case "red":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🤖 AI Analyzing PR...
          </h2>
          <p className="text-gray-600 mb-2">Performing deep code analysis</p>
          <p className="text-sm text-gray-500">
            This usually takes 15-30 seconds
          </p>
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Analyzing security patterns...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                PR Review Agent
              </h1>
              <p className="text-gray-600">CodeMate AI-Powered Code Review</p>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Live Demo
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {analysis && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  Analysis: {analysis.analysis_time?.toFixed(1) || "2.4"}s
                </span>
              </div>
            )}
            <button
              onClick={triggerAnalysis}
              disabled={analyzing}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {analyzing ? "Analyzing..." : "Re-analyze"}
            </button>
          </div>
        </div>

        {/* GitHub URL Input */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <Github className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123 (or use demo data)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={analyzeGitHubPR}
              disabled={analyzing}
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Analyze GitHub PR
            </button>
          </div>

          {/* GitHub Token Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800 mb-2 font-medium">
              🔑 GitHub Token (Optional - For Private Repos)
            </div>
            <div className="text-xs text-blue-700 mb-2">
              Add your personal GitHub token for private repositories.{" "}
              <strong>
                Ensure your token has 'read:user' and 'repo' access permissions.
              </strong>{" "}
              For testing, use the provided demo tokens with sample PRs.
            </div>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Leave empty for public repos)"
              className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 text-xs text-gray-600">
              <strong>Test with these sample PRs:</strong>
              <br />•{" "}
              <span className="font-mono text-blue-600">
                https://github.com/facebook/react/pull/24652
              </span>
              <br />•{" "}
              <span className="font-mono text-blue-600">
                https://github.com/nodejs/node/pull/50428
              </span>
              <br />•{" "}
              <span className="font-mono text-blue-600">
                https://github.com/ethereum-lists/chains/pull/7722
              </span>
              <br />•{" "}
              <span className="font-mono text-blue-600">
                https://github.com/ethereum-lists/chains/pull/7685
              </span>
              <br />•{" "}
              <span className="font-mono text-blue-600">
                https://github.com/chaiNNer-org/chaiNNer/pull/3030
              </span>
            </div>
          </div>
        </div>

        {/* PR Summary Card */}
        {analysis && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-800 text-lg">
                  PR #{analysis.pr_id}: {analysis.title}
                </h2>
                {analysis.repository && (
                  <p className="text-gray-600 text-sm">{analysis.repository}</p>
                )}
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {new Date(analysis.created_at).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-4">
              <div
                className={`flex items-center px-4 py-2 rounded-full border-2 ${getRiskColor(
                  analysis.risk_level
                )}`}
              >
                {getRiskIcon(analysis.risk_level)}
                <span className="ml-2 font-bold">
                  Risk: {Math.round(analysis.risk_score)}/100
                </span>
              </div>
              <div className="flex items-center text-gray-600 bg-purple-50 px-3 py-2 rounded-full">
                <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                <span className="font-medium">
                  {analysis.auto_fixes?.length || 0} auto-fixes
                </span>
              </div>
              <div className="flex items-center text-gray-600 bg-red-50 px-3 py-2 rounded-full">
                <Shield className="w-4 h-4 mr-2 text-red-500" />
                <span>{analysis.issues?.length || 0} issues found</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!analysis && (
        <div className="text-center py-16">
          <Bot className="w-24 h-24 mx-auto mb-6 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Analyze Your PR
          </h2>
          <p className="text-gray-600 mb-6">
            Enter a GitHub PR URL above or click "Re-analyze" for demo data
          </p>
          <button
            onClick={loadInitialData}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Load Demo Analysis
          </button>
        </div>
      )}

      {analysis && (
        <>
          {/* Navigation */}
          <div className="flex space-x-1 mb-8 bg-white rounded-xl p-2 shadow-sm">
            {[
              { id: "dashboard", label: "Risk Dashboard", icon: Shield },
              { id: "timemachine", label: "PR Time Machine", icon: Clock },
              { id: "chat", label: "AI Mentor Chat", icon: MessageSquare },
              { id: "fixes", label: "Auto-Fixes", icon: Zap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-red-900">
                      Critical Issues
                    </h3>
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    {analysis.issues?.filter((i) => i.severity === "high")
                      .length || 0}
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Require immediate attention
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-900">
                      Auto-Fixes Ready
                    </h3>
                    <Zap className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {analysis.auto_fixes?.length || 0}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    One-click solutions
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-purple-900">
                      AI Confidence
                    </h3>
                    <CheckCircle className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    {analysis.auto_fixes?.length > 0
                      ? Math.round(
                          (analysis.auto_fixes.reduce(
                            (acc, fix) => acc + fix.confidence,
                            0
                          ) /
                            analysis.auto_fixes.length) *
                            100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Average fix confidence
                  </p>
                </div>
              </div>

              {/* Issues List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
                  <h3 className="font-semibold text-gray-900">
                    Code Issues Detected
                  </h3>
                </div>
                <div className="divide-y">
                  {analysis.issues?.map((issue, index) => (
                    <div
                      key={index}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
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
                              {issue.severity.toUpperCase()}
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
            </div>
          )}

          {/* Time Machine Tab */}
          {activeTab === "timemachine" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl">
                <div className="flex items-center mb-4">
                  <Clock className="w-8 h-8 mr-3" />
                  <h3 className="text-2xl font-bold">PR Time Machine</h3>
                </div>
                <p className="text-purple-100 text-lg">
                  AI-powered predictions about your code's future impact
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    Bug Likelihood
                  </h4>
                  <div className="relative">
                    <div className="flex items-center mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                        <div
                          className="bg-gradient-to-r from-red-400 to-red-600 h-4 rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              (analysis.time_machine?.bug_likelihood || 0.3) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-2xl font-bold text-red-600">
                        {Math.round(
                          (analysis.time_machine?.bug_likelihood || 0.3) * 100
                        )}
                        %
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Probability of introducing bugs in the next 30 days
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-500" />
                    Maintainability Impact
                  </h4>
                  <div className="text-center">
                    <span
                      className={`text-4xl font-bold ${
                        (analysis.time_machine?.maintainability_impact || -15) <
                        0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {(analysis.time_machine?.maintainability_impact || -15) >
                      0
                        ? "+"
                        : ""}
                      {analysis.time_machine?.maintainability_impact || -15}%
                    </span>
                    <p className="text-sm text-gray-600 mt-2">
                      Expected change in code maintainability score
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Performance Risk
                  </h4>
                  <div className="relative">
                    <div className="flex items-center mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              (analysis.time_machine?.performance_regression ||
                                0.08) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-2xl font-bold text-yellow-600">
                        {Math.round(
                          (analysis.time_machine?.performance_regression ||
                            0.08) * 100
                        )}
                        %
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Risk of performance degradation
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-purple-500" />
                  AI Predictions & Recommendations
                </h4>
                <div className="space-y-3">
                  {(
                    analysis.time_machine?.predicted_issues || [
                      "Authentication system may expose user sessions without proper validation",
                      "Database queries in user management could create performance bottlenecks",
                      "Error handling patterns may leak sensitive information in production",
                    ]
                  ).map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <AlertTriangle className="w-5 h-5 mr-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Choose Your AI Mentor
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedMentor(null)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      !selectedMentor
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Bot className="w-6 h-6 mr-3 text-gray-600" />
                      <div className="font-medium text-gray-900">
                        AI Reviewer
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      General code review assistant
                    </div>
                  </button>

                  {mentorPersonas.map((mentor) => (
                    <button
                      key={mentor.persona_id}
                      onClick={() => setSelectedMentor(mentor)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedMentor?.persona_id === mentor.persona_id
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <User className="w-6 h-6 mr-3 text-gray-600" />
                        <div className="font-medium text-gray-900">
                          {mentor.name}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {mentor.style_traits.focuses_on.slice(0, 2).join(" • ")}
                      </div>
                      <div className="text-xs text-purple-600 font-medium">
                        {mentor.style_traits.personality}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
                    <div className="flex items-center">
                      <MessageSquare className="w-6 h-6 mr-3 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Chatting with {selectedMentor?.name || "AI Reviewer"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Ask about security, performance, or code quality
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-gray-500 py-12">
                        <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">
                          Ready to help with your PR!
                        </p>
                        <div className="mt-4 space-y-2">
                          <p className="text-sm">Try asking:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <button
                              onClick={() =>
                                setCurrentMessage(
                                  "What security issues did you find?"
                                )
                              }
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                            >
                              "What security issues did you find?"
                            </button>
                            <button
                              onClick={() =>
                                setCurrentMessage(
                                  "How can I fix these problems?"
                                )
                              }
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
                            >
                              "How can I fix these problems?"
                            </button>
                            <button
                              onClick={() =>
                                setCurrentMessage(
                                  "Explain the Time Machine predictions"
                                )
                              }
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200"
                            >
                              "Explain the predictions"
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : message.role === "system"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <div className="text-xs text-gray-600 mb-1 font-medium">
                              {message.persona}
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl shadow-sm">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder="Ask me about the PR analysis..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isTyping}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim() || isTyping}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-Fixes Tab */}
          {activeTab === "fixes" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center mb-2">
                  <Zap className="w-8 h-8 mr-3" />
                  <h3 className="text-2xl font-bold">AI Auto-Fixes</h3>
                </div>
                <p className="text-green-100">
                  I've generated {analysis.auto_fixes?.length || 0}{" "}
                  high-confidence patches ready to apply
                </p>
              </div>

              <div className="space-y-4">
                {analysis.auto_fixes?.map((fix, index) => (
                  <div
                    key={fix.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                          {fix.description}
                        </h4>
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">
                              Confidence:
                            </span>
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
                        onClick={() => applyFix(fix.id)}
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
                            <CheckCircle className="w-4 h-4" />
                            <span>Applied ✓</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Apply Fix</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 text-xs font-mono">
                          DIFF PREVIEW:
                        </span>
                      </div>
                      <pre className="text-sm font-mono text-gray-100 whitespace-pre-wrap">
                        {fix.diff.split("\n").map((line, i) => (
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
                  </div>
                ))}
              </div>

              {analysis.auto_fixes?.every((fix) => fix.applied) && (
                <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    All Fixes Applied!
                  </h3>
                  <p className="text-green-700">
                    Your PR risk score has been significantly improved.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PRReviewAgent;
