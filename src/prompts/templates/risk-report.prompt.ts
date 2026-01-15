export class RiskReportPrompt {
  static format(projectId: string, delayProbability: number, budgetHealth: string, recommendations: string[]): string {
    const sections: string[] = [];
    
    sections.push(`### ⚠️ Risk Analysis Report: Project ${projectId}`);
    
    const probColor = delayProbability > 0.7 ? "🔴" : delayProbability > 0.4 ? "🟡" : "🟢";
    sections.push(`${probColor} **Delay Probability:** ${Math.round(delayProbability * 100)}%`);
    
    const budgetMap = {
      'HEALTHY': "🟢 Healthy",
      'OVER_BUDGET': "🔴 Over Budget",
      'UNDER_BUDGET': "🔵 Under Budget"
    };
    sections.push(`💰 **Budget Health:** ${budgetMap[budgetHealth as keyof typeof budgetMap] || budgetHealth}`);
    
    sections.push(`\n**🔍 Senior Recommendations:**`);
    recommendations.forEach(rec => sections.push(`- ${rec}`));
    
    return sections.join("\n");
  }
}
