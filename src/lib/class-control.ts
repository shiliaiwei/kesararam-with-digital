export function normalizeClassValue(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function classFieldsMatch(
  classRow: {
    schoolName: string | null;
    province: string | null;
  },
  studentRow: {
    schoolName: string | null;
    province: string | null;
  }
) {
  const schoolMatches =
    normalizeClassValue(classRow.schoolName) ===
    normalizeClassValue(studentRow.schoolName);
  const provinceMatches =
    normalizeClassValue(classRow.province) ===
    normalizeClassValue(studentRow.province);

  return schoolMatches && provinceMatches;
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
