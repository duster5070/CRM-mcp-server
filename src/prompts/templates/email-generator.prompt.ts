export class EmailGeneratorPrompt {
  static format(
    projectName: string | undefined, 
    progress: number, 
    recipientName: string, 
    emailType: string, 
    tone: 'FORMAL' | 'FRIENDLY'
  ): { subject: string; body: string } {
    const isFormal = tone === 'FORMAL';
    const salutation = isFormal ? `Dear Mr./Ms. ${recipientName},` : `Hi ${recipientName}!`;
    const closing = isFormal ? "Sincerely,\nThe CRM Project Team" : "Best regards,\nThe Team";

    const contentMap: Record<string, string> = {
      'REMINDER': isFormal 
        ? `I am writing to provide a formal update regarding the progress of "${projectName || 'our current project'}". We have reached ${progress}% completion and are proceeding in accordance with the established schedule.` 
        : `Just a quick note to let you know that ${projectName || 'the project'} is moving along great! We're already ${progress}% done.`,
      
      'UPDATE': isFormal
        ? `Please find enclosed the latest status report for your review. We are currently focusing on the next set of deliverables with high efficiency.`
        : `Hey! Things are looking awesome. We've made some solid progress this week and wanted to keep you in the loop on how everything is shaping up.`,
      
      'PAYMENT_REQUEST': isFormal
        ? `We have issued a new invoice for services rendered on "${projectName || 'the project'}". Your prompt attention to this matter would be greatly appreciated to ensure continued momentum.`
        : `We just sent over a new invoice for the latest work on ${projectName || 'the project'}. Let us know if you have any questions—otherwise, we're ready to dive into the next phase!`
    };

    const subjectPrefix = isFormal ? "[Update] " : "✨ ";
    const subject = `${subjectPrefix}${projectName || "Project Progress"} - ${emailType.replace('_', ' ')}`;

    return {
      subject,
      body: `${salutation}\n\n${contentMap[emailType]}\n\n${closing}`
    };
  }
}
