-- Work Submission Schema

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    max_points INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    file_url TEXT,
    text_content TEXT,
    grade INT,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT now(),
    status TEXT CHECK (status IN ('SUBMITTED', 'GRADED', 'LATE')) DEFAULT 'SUBMITTED'
);

CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);
