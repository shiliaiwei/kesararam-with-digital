export function normalizeClassValue(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function classFieldsMatch(
  classRow: {
    schoolName: string | null;
    province: string | null;
    gradeLevel: string | null;
    section: string | null;
  },
  studentRow: {
    schoolName: string | null;
    province: string | null;
    gradeLevel: string | null;
    section: string | null;
  }
) {
  const schoolMatches =
    normalizeClassValue(classRow.schoolName) ===
    normalizeClassValue(studentRow.schoolName);
  const provinceMatches =
    normalizeClassValue(classRow.province) ===
    normalizeClassValue(studentRow.province);
  const gradeMatches =
    normalizeClassValue(classRow.gradeLevel) ===
    normalizeClassValue(studentRow.gradeLevel);

  const sectionMatches =
    !normalizeClassValue(classRow.section) ||
    !normalizeClassValue(studentRow.section) ||
    normalizeClassValue(classRow.section) ===
      normalizeClassValue(studentRow.section);

  return schoolMatches && provinceMatches && gradeMatches && sectionMatches;
}

export function canManageTeacherOwnedClass(
  session: { id: number; role: string },
  teacherId: number
) {
  return (
    session.role === "admin" ||
    session.role === "staff" ||
    (session.role === "teacher" && session.id === teacherId)
  );
}
