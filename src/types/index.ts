export interface Course {
  id: string;
  course_id: string;
  name: string;
  department: string;
  duration_years: number;
  num_semesters: number;
  created_at?: string;
}

export interface Subject {
  id: string;
  subject_code: string;
  name: string;
  course_id: string;
  semester: number;
  credits: number;
  faculty: string;
  created_at?: string;
}

export interface Student {
  id: string;
  student_id: string;
  enrollment_no: string;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  photo_url: string | null;
  course_id: string | null;
  semester: number;
  section: string | null;
  created_at?: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  subject_id: string;
  total_classes: number;
  attended_classes: number;
  created_at?: string;
}

export interface Marks {
  id: string;
  student_id: string;
  subject_id: string;
  internal_marks: number;
  assignment_marks: number;
  exam_marks: number;
  created_at?: string;
}

export interface Assignment {
  id: string;
  student_id: string;
  subject_id: string;
  title: string;
  status: 'submitted' | 'pending' | 'graded';
  score: number | null;
  max_score: number;
  due_date: string | null;
  created_at?: string;
}

export interface StudentWithCourse extends Student {
  course?: Course | null;
}

export interface SubjectWithCourse extends Subject {
  course?: Course | null;
}

export interface AttendanceWithSubject extends Attendance {
  subject?: Subject | null;
}

export interface MarksWithSubject extends Marks {
  subject?: Subject | null;
}

export interface AssignmentWithSubject extends Assignment {
  subject?: Subject | null;
}
