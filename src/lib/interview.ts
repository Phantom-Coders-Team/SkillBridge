export interface InterviewDetails {
  date: string;
  mode: string;
  link?: string;
  notes?: string;
  scheduledAt?: string;
}

export interface InternshipFeedback {
  rating: number;
  mentorFeedback: string;
  completionDate: string;
  grade?: string;
  certificateRef?: string;
}

export interface ParsedApplicationMessage {
  coverLetter?: string;
  interview?: InterviewDetails;
  feedback?: InternshipFeedback;
}

/**
 * Parses the application message field, which can be either a plain text cover letter
 * or a JSON string containing coverLetter, interview schedule, and mentor feedback.
 */
export function parseApplicationMessage(raw: string | null | undefined): ParsedApplicationMessage {
  if (!raw) return {};
  try {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const parsed = JSON.parse(trimmed);
      return {
        coverLetter: parsed.coverLetter || undefined,
        interview: parsed.interview || undefined,
        feedback: parsed.feedback || undefined,
      };
    }
  } catch {
    // ignore parse error and treat as plain text
  }
  return { coverLetter: raw || undefined };
}

/**
 * Encodes coverLetter, interview details, and feedback into a single serialized message string
 */
export function encodeApplicationMessage(
  coverLetter?: string | null,
  interview?: InterviewDetails | null,
  feedback?: InternshipFeedback | null
): string {
  return JSON.stringify({
    coverLetter: coverLetter || null,
    interview: interview || null,
    feedback: feedback || null,
  });
}

/**
 * Human-readable date & time formatter for interview schedules
 */
export function formatInterviewDateTime(dateStr?: string): string {
  if (!dateStr) return "TBD";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return dateStr;
  }
}
