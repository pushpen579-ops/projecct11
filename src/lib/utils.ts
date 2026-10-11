export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

export function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-success-600 bg-success-50';
  if (grade.startsWith('B')) return 'text-brand-600 bg-brand-50';
  if (grade.startsWith('C')) return 'text-warning-600 bg-warning-50';
  if (grade.startsWith('D')) return 'text-orange-600 bg-orange-50';
  return 'text-danger-600 bg-danger-50';
}

export function attendanceColor(percentage: number): string {
  if (percentage >= 75) return 'text-success-600';
  if (percentage >= 60) return 'text-warning-600';
  return 'text-danger-600';
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}
