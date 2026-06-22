import { createHash } from "crypto";

const passwords = {
  admin: "Admin@2026",
  teacher: "Teacher@2026",
  student: "Student@2026",
};

function hash(pw) {
  return createHash("sha256").update(pw).digest("hex");
}

const sql = `
-- ============================================================
-- KWD Platform — Insert 3 users (admin / teacher / student)
-- Passwords use SHA-256 (no salt) — matches app hashPassword()
-- Run in Neon SQL Editor
-- ============================================================

INSERT INTO users (username, email, password_hash, role, display_name, is_active, login_attempts)
VALUES
  ('admin_kwd',   'admin@kwd.tech',   '${hash(passwords.admin)}',   'admin',   'KWD Admin',   true, 0),
  ('teacher_kwd', 'teacher@kwd.tech', '${hash(passwords.teacher)}', 'teacher', 'KWD Teacher', true, 0),
  ('student_kwd', 'student@kwd.tech', '${hash(passwords.student)}', 'student', 'KWD Student', true, 0)
ON CONFLICT (username) DO NOTHING;

-- Passwords:
--   admin_kwd   → ${passwords.admin}
--   teacher_kwd → ${passwords.teacher}
--   student_kwd → ${passwords.student}
`;

console.log(sql);
