export interface DocumentIssue {
  path: string;
  message: string;
}

const formatIssue = ({ path, message }: DocumentIssue): string =>
  path ? `${path}: ${message}` : message;

export const formatIssues = (issues: DocumentIssue[]): string =>
  issues.map(formatIssue).join("; ");
