/*
# College Administration Schema

Creates the complete database schema for a college administration system.
This is a single-tenant app with no auth — all data is shared/public.

## New Tables

1. **courses** — College courses (e.g., B.Tech Computer Science)
   - id (uuid, PK)
   - course_id (text, unique) — human-readable course code like "CS101"
   - name (text)
   - department (text)
   - duration_years (int)
   - num_semesters (int)
   - created_at (timestamp)

2. **subjects** — Subjects belonging to courses, assigned to specific semesters
   - id (uuid, PK)
   - subject_code (text, unique) — e.g., "CS201"
   - name (text)
   - course_id (uuid, FK → courses.id)
   - semester (int)
   - credits (int)
   - faculty (text)
   - created_at (timestamp)

3. **students** — Student personal + enrollment info
   - id (uuid, PK)
   - student_id (text, unique) — e.g., "STU001"
   - enrollment_no (text, unique) — e.g., "ENR2024001"
   - name (text)
   - email (text)
   - phone (text)
   - date_of_birth (date)
   - gender (text)
   - address (text)
   - photo_url (text)
   - course_id (uuid, FK → courses.id)
   - semester (int)
   - section (text)
   - created_at (timestamp)

4. **attendance** — Per-subject attendance records for students
   - id (uuid, PK)
   - student_id (uuid, FK → students.id)
   - subject_id (uuid, FK → subjects.id)
   - total_classes (int)
   - attended_classes (int)
   - created_at (timestamp)

5. **marks** — Internal, assignment, and exam marks per subject
   - id (uuid, PK)
   - student_id (uuid, FK → students.id)
   - subject_id (uuid, FK → subjects.id)
   - internal_marks (numeric) — out of the subject's internal max
   - assignment_marks (numeric)
   - exam_marks (numeric)
   - created_at (timestamp)

6. **assignments** — Assignment records for students per subject
   - id (uuid, PK)
   - student_id (uuid, FK → students.id)
   - subject_id (uuid, FK → subjects.id)
   - title (text)
   - status (text) — 'submitted', 'pending', 'graded'
   - score (numeric, nullable)
   - max_score (numeric)
   - due_date (date)
   - created_at (timestamp)

## Security
- RLS enabled on all tables.
- All tables allow anon + authenticated full CRUD (single-tenant, no auth, data is intentionally shared).
- USING (true) / WITH CHECK (true) is acceptable here because the app has no sign-in screen and all data is public/shared.

## Notes
1. Foreign keys use ON DELETE CASCADE so removing a course also removes its subjects, and removing a student removes their attendance/marks/assignments.
2. Unique constraints prevent duplicate course IDs, subject codes, student IDs, and enrollment numbers.
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text UNIQUE NOT NULL,
  name text NOT NULL,
  department text NOT NULL,
  duration_years int NOT NULL DEFAULT 4,
  num_semesters int NOT NULL DEFAULT 8,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_code text UNIQUE NOT NULL,
  name text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  semester int NOT NULL,
  credits int NOT NULL DEFAULT 3,
  faculty text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  enrollment_no text UNIQUE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  photo_url text,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  semester int NOT NULL DEFAULT 1,
  section text DEFAULT 'A',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  total_classes int NOT NULL DEFAULT 0,
  attended_classes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  internal_marks numeric NOT NULL DEFAULT 0,
  assignment_marks numeric NOT NULL DEFAULT 0,
  exam_marks numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  score numeric,
  max_score numeric NOT NULL DEFAULT 100,
  due_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- courses policies
DROP POLICY IF EXISTS "anon_select_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_courses" ON courses;
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE TO anon, authenticated USING (true);

-- subjects policies
DROP POLICY IF EXISTS "anon_select_subjects" ON subjects;
CREATE POLICY "anon_select_subjects" ON subjects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
CREATE POLICY "anon_insert_subjects" ON subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
CREATE POLICY "anon_update_subjects" ON subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;
CREATE POLICY "anon_delete_subjects" ON subjects FOR DELETE TO anon, authenticated USING (true);

-- students policies
DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE TO anon, authenticated USING (true);

-- attendance policies
DROP POLICY IF EXISTS "anon_select_attendance" ON attendance;
CREATE POLICY "anon_select_attendance" ON attendance FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance;
CREATE POLICY "anon_insert_attendance" ON attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_attendance" ON attendance;
CREATE POLICY "anon_update_attendance" ON attendance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance;
CREATE POLICY "anon_delete_attendance" ON attendance FOR DELETE TO anon, authenticated USING (true);

-- marks policies
DROP POLICY IF EXISTS "anon_select_marks" ON marks;
CREATE POLICY "anon_select_marks" ON marks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_marks" ON marks;
CREATE POLICY "anon_insert_marks" ON marks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_marks" ON marks;
CREATE POLICY "anon_update_marks" ON marks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_marks" ON marks;
CREATE POLICY "anon_delete_marks" ON marks FOR DELETE TO anon, authenticated USING (true);

-- assignments policies
DROP POLICY IF EXISTS "anon_select_assignments" ON assignments;
CREATE POLICY "anon_select_assignments" ON assignments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_assignments" ON assignments;
CREATE POLICY "anon_insert_assignments" ON assignments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_assignments" ON assignments;
CREATE POLICY "anon_update_assignments" ON assignments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_assignments" ON assignments;
CREATE POLICY "anon_delete_assignments" ON assignments FOR DELETE TO anon, authenticated USING (true);