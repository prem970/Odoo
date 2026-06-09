-- Live Classes Support

CREATE TABLE live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status TEXT CHECK (status IN ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED')) DEFAULT 'SCHEDULED',
    meeting_url TEXT, -- Jitsi room name or external URL
    recordings_url TEXT,
    max_participants INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE session_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT now(),
    left_at TIMESTAMP,
    duration_minutes INT DEFAULT 0,
    status TEXT CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')) DEFAULT 'PRESENT'
);

CREATE INDEX idx_live_sessions_course ON live_sessions(course_id);
CREATE INDEX idx_live_sessions_instructor ON live_sessions(instructor_id);
CREATE INDEX idx_session_attendance_user ON session_attendance(user_id);
