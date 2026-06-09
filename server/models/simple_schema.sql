CREATE EXTENSION IF NOT EXISTS "pgcrypto";
(UUID generation, security best practice)

CREATE ROLE app_admin;
CREATE ROLE app_instructor;
CREATE ROLE app_learner;
CREATE ROLE app_backend;

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

INSERT INTO roles(id, name)
VALUES (1, 'ADMIN'), (2, 'INSTRUCTOR'), (3, 'LEARNER');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    website TEXT,
    visibility TEXT CHECK (visibility IN ('EVERYONE','SIGNED_IN')),
    access_rule TEXT CHECK (access_rule IN ('OPEN','INVITE','PAYMENT')),
    price NUMERIC(10,2),
    published BOOLEAN DEFAULT FALSE,
    course_admin UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE course_tags (
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    PRIMARY KEY (course_id, tag)
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('VIDEO','DOCUMENT','IMAGE','QUIZ')),
    content_url TEXT,
    duration INT,
    allow_download BOOLEAN DEFAULT FALSE,
    lesson_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE lesson_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('FILE','LINK')),
    url TEXT NOT NULL
);

CREATE TABLE enrollments (
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    enrolled_at TIMESTAMP DEFAULT now(),
    invited BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE lesson_progress (
    user_id UUID,
    lesson_id UUID,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE course_progress (
    user_id UUID,
    course_id UUID,
    completion_percentage NUMERIC(5,2) DEFAULT 0,
    status TEXT CHECK (status IN ('YET_TO_START','IN_PROGRESS','COMPLETED')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    title TEXT NOT NULL
);

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id),
    question TEXT NOT NULL
);

CREATE TABLE quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES quiz_questions(id),
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);

CREATE TABLE quiz_rewards (
    quiz_id UUID PRIMARY KEY REFERENCES quizzes(id),
    first_try INT,
    second_try INT,
    third_try INT,
    fourth_plus INT
);

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID,
    user_id UUID,
    attempt_no INT,
    score INT,
    attempted_at TIMESTAMP DEFAULT now()
);

CREATE TABLE points_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    source TEXT,
    points INT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name TEXT,
    min_points INT
);

INSERT INTO badges(name, min_points) VALUES
('Newbie',20),
('Explorer',40),
('Achiever',60),
('Specialist',80),
('Expert',100),
('Master',120);

CREATE TABLE reviews (
    user_id UUID,
    course_id UUID,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (user_id, course_id)
);

CREATE INDEX idx_courses_published ON courses(published);
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_course_progress_user ON course_progress(user_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);

CREATE OR REPLACE FUNCTION fn_get_user_badge(p_user UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE total INT;
BEGIN
    SELECT COALESCE(SUM(points),0)
    INTO total
    FROM points_log
    WHERE user_id = p_user;

    RETURN (
        SELECT name
        FROM badges
        WHERE min_points <= total
        ORDER BY min_points DESC
        LIMIT 1
    );
END;
$$;

CREATE OR REPLACE FUNCTION fn_can_access_course(p_user UUID, p_course UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE rule TEXT;
BEGIN
    SELECT access_rule INTO rule FROM courses WHERE id = p_course;

    IF rule = 'OPEN' THEN
        RETURN true;
    ELSIF rule IN ('INVITE','PAYMENT') THEN
        RETURN EXISTS (
            SELECT 1 FROM enrollments
            WHERE user_id = p_user AND course_id = p_course
        );
    END IF;

    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION trg_init_course_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO course_progress(user_id, course_id, status)
    VALUES (NEW.user_id, NEW.course_id, 'YET_TO_START');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER init_course_progress
AFTER INSERT ON enrollments
FOR EACH ROW
EXECUTE FUNCTION trg_init_course_progress();

CREATE OR REPLACE FUNCTION trg_update_course_progress()
RETURNS TRIGGER AS $$
DECLARE total INT;
DECLARE done INT;
BEGIN
    SELECT COUNT(*) INTO total
    FROM lessons
    WHERE course_id = (
        SELECT course_id FROM lessons WHERE id = NEW.lesson_id
    );

    SELECT COUNT(*) INTO done
    FROM lesson_progress lp
    JOIN lessons l ON l.id = lp.lesson_id
    WHERE lp.user_id = NEW.user_id
      AND lp.completed = true
      AND l.course_id = (
          SELECT course_id FROM lessons WHERE id = NEW.lesson_id
      );

    UPDATE course_progress
    SET completion_percentage = (done::NUMERIC / total) * 100,
        status = CASE
            WHEN done = total THEN 'COMPLETED'
            ELSE 'IN_PROGRESS'
        END,
        completed_at = CASE
            WHEN done = total THEN now()
            ELSE NULL
        END
    WHERE user_id = NEW.user_id
      AND course_id = (
          SELECT course_id FROM lessons WHERE id = NEW.lesson_id
      );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_progress
AFTER UPDATE OF completed ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION trg_update_course_progress();

CREATE PROCEDURE sp_submit_quiz_attempt(
    p_user UUID,
    p_quiz UUID,
    p_score INT
)
LANGUAGE plpgsql
AS $$
DECLARE attempt INT;
DECLARE reward INT;
BEGIN
    SELECT COUNT(*) + 1
    INTO attempt
    FROM quiz_attempts
    WHERE user_id = p_user AND quiz_id = p_quiz;

    SELECT CASE
        WHEN attempt = 1 THEN first_try
        WHEN attempt = 2 THEN second_try
        WHEN attempt = 3 THEN third_try
        ELSE fourth_plus
    END
    INTO reward
    FROM quiz_rewards
    WHERE quiz_id = p_quiz;

    INSERT INTO quiz_attempts(user_id, quiz_id, attempt_no, score)
    VALUES (p_user, p_quiz, attempt, p_score);

    INSERT INTO points_log(user_id, source, points)
    VALUES (p_user, 'QUIZ', reward);
END;
$$;

CREATE PROCEDURE sp_complete_course(p_user UUID, p_course UUID)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE course_progress
    SET status = 'COMPLETED', completed_at = now()
    WHERE user_id = p_user AND course_id = p_course;

    INSERT INTO points_log(user_id, source, points)
    VALUES (p_user, 'COURSE', 10);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_export_course_progress(p_course UUID)
LANGUAGE plpgsql
AS $$
DECLARE rec RECORD;
DECLARE cur CURSOR FOR
    SELECT u.full_name, cp.status, cp.completion_percentage
    FROM course_progress cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.course_id = p_course;
BEGIN
    OPEN cur;
    LOOP
        FETCH cur INTO rec;
        EXIT WHEN NOT FOUND;
        -- export logic here
    END LOOP;
    CLOSE cur;
END;
$$;

CREATE VIEW v_learner_courses AS
SELECT id, title, image_url, description, access_rule, price
FROM courses
WHERE published = true;

GRANT SELECT ON v_learner_courses TO app_backend;

GRANT EXECUTE ON FUNCTION fn_get_user_badge(UUID) TO app_backend;
GRANT EXECUTE ON FUNCTION fn_can_access_course(UUID, UUID) TO app_backend;

GRANT EXECUTE ON PROCEDURE sp_submit_quiz_attempt TO app_backend;
GRANT EXECUTE ON PROCEDURE sp_complete_course TO app_backend;