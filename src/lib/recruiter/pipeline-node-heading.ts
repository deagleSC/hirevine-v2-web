/** Display label for a pipeline node row (recruiter views). */
export function recruiterPipelineNodeHeading(
  nodeIndex: number,
  nodeType: string,
): string {
  const t = nodeType.toUpperCase();
  if (t === "RESUME_ANALYSIS" || t.includes("RESUME")) {
    return `Resume screening (step ${nodeIndex})`;
  }
  if (t === "QUIZ_RESULT" || t.includes("QUIZ")) {
    return `Job quiz (step ${nodeIndex})`;
  }
  if (t.includes("REPORT") || t.includes("SUMMARY")) {
    return `Hiring summary (step ${nodeIndex})`;
  }
  const readable = nodeType.replace(/_/g, " ").toLowerCase();
  return `Step ${nodeIndex}: ${readable}`;
}

export function recruiterScoreLabel(nodeType: string): string {
  const t = nodeType.toUpperCase();
  if (t.includes("RESUME")) return "Match score";
  if (t.includes("QUIZ")) return "Quiz score";
  return "Score";
}
