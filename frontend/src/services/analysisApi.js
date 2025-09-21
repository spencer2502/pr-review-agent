import { apiClient } from "./api";

export const analysisApi = {
  analyzeGitHubPR: async (repo, prNumber) => {
    // backend route expected to accept body or path; adapt if your backend differs
    return await apiClient.post("/api/github/analyze-pr", {
      pr_url: `https://github.com/${repo}/pull/${prNumber}`,
      repository: repo,
      pr_number: parseInt(prNumber),
    });
  },

  analyzeMockPR: async () => {
    // demo endpoint - use POST with body for consistency
    return await apiClient.post("/api/analysis/pr/demo-123", {
      title: "Add user authentication system",
    });
  },

  getAnalysis: async (prId) => {
    return await apiClient.get(`/api/analysis/pr/${prId}`);
  },

  applyFix: async (prId, fixId) => {
    return await apiClient.post(`/api/analysis/apply-fix/${prId}/${fixId}`);
  },
};
