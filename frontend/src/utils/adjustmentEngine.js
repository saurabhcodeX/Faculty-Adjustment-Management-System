/**
 * Adjustment Engine for Faculty Timetable & Substitution Management
 */

/**
 * Get full day schedule for a given faculty
 */
export function getTeacherScheduleForDay(facultyId, day, timetables) {
  if (!timetables || !timetables[facultyId] || !timetables[facultyId][day]) {
    return {};
  }
  return timetables[facultyId][day];
}

/**
 * Get all periods where a faculty actually has a class scheduled
 */
export function getBusyPeriodsForDay(facultyId, day, timetables) {
  const schedule = getTeacherScheduleForDay(facultyId, day, timetables);
  const busyPeriods = [];
  for (let p = 1; p <= 8; p++) {
    if (schedule[p]) {
      busyPeriods.push({
        periodId: p,
        details: schedule[p]
      });
    }
  }
  return busyPeriods;
}

/**
 * Checks if a faculty is free in a specific period on a specific date/day
 */
export function isFacultyFree(
  facultyId,
  day,
  date,
  periodId,
  timetables,
  absences = [],
  approvedAdjustments = []
) {
  // 1. Check if this faculty is marked absent on this date (or pending/approved absence)
  const isAbsent = absences.some(
    abs =>
      abs.facultyId === facultyId &&
      abs.date === date &&
      abs.status !== 'Rejected' &&
      (abs.periodsToAdjust?.length ? abs.periodsToAdjust.includes(Number(periodId)) : true)
  );
  if (isAbsent) return false;

  // 2. Check if faculty has a scheduled regular class in timetable
  const schedule = getTeacherScheduleForDay(facultyId, day, timetables);
  if (schedule[periodId] !== null && schedule[periodId] !== undefined) {
    return false; // Busy with their own class
  }

  // 3. Check if faculty is already assigned as substitute for another class in this period on this date
  const isAlreadyAssigned = approvedAdjustments.some(
    adj =>
      adj.date === date &&
      Number(adj.periodId) === Number(periodId) &&
      adj.substituteFacultyId === facultyId
  );
  if (isAlreadyAssigned) return false;

  return true;
}

/**
 * Get total substitution count assigned to a faculty on a given date
 */
export function getFacultyDailyAdjustmentLoad(facultyId, date, approvedAdjustments = []) {
  return approvedAdjustments.filter(
    adj => adj.date === date && adj.substituteFacultyId === facultyId
  ).length;
}

/**
 * Find all free teachers for a given period on a given day/date
 */
export function getFreeTeachersForPeriod(
  periodId,
  day,
  date,
  timetables,
  facultyList = [],
  absences = [],
  approvedAdjustments = [],
  excludeFacultyId = null
) {
  const freeTeachers = [];

  facultyList.forEach(faculty => {
    if (excludeFacultyId && faculty.id === excludeFacultyId) return;

    if (
      isFacultyFree(
        faculty.id,
        day,
        date,
        periodId,
        timetables,
        absences,
        approvedAdjustments
      )
    ) {
      const load = getFacultyDailyAdjustmentLoad(faculty.id, date, approvedAdjustments);
      freeTeachers.push({
        faculty,
        todayLoad: load
      });
    }
  });

  // Sort by workload ascending (teachers with fewer adjustments first for fairness)
  return freeTeachers.sort((a, b) => a.todayLoad - b.todayLoad);
}

/**
 * Auto-suggest the optimal adjustment plan for an absence request
 */
export function generateAutoSuggestions(
  absenceRequest,
  timetables,
  facultyList = [],
  absences = [],
  approvedAdjustments = []
) {
  const { facultyId, dayOfWeek, date, periodsToAdjust } = absenceRequest;
  const originalSchedule = getTeacherScheduleForDay(facultyId, dayOfWeek, timetables);

  const suggestions = {};
  // Track temporary load during suggestion loop so we distribute among different free teachers
  const tempLoads = {};
  facultyList.forEach(f => {
    tempLoads[f.id] = getFacultyDailyAdjustmentLoad(f.id, date, approvedAdjustments);
  });

  // For each period the absent teacher has a class
  (periodsToAdjust || []).forEach(periodId => {
    const classDetails = originalSchedule[periodId];
    if (!classDetails) return; // No class to adjust

    // Get free teachers for this period
    const candidates = getFreeTeachersForPeriod(
      periodId,
      dayOfWeek,
      date,
      timetables,
      facultyList,
      absences,
      approvedAdjustments,
      facultyId
    );

    // Filter out teachers who were tentatively picked in earlier periods of this loop
    // or rank them by current tempLoad
    candidates.sort((a, b) => {
      const loadA = tempLoads[a.faculty.id] ?? 0;
      const loadB = tempLoads[b.faculty.id] ?? 0;
      return loadA - loadB;
    });

    if (candidates.length > 0) {
      const best = candidates[0].faculty;
      suggestions[periodId] = {
        substituteFacultyId: best.id,
        substituteFacultyName: best.name,
        classDetails,
        availableOptions: candidates.map(c => ({
          id: c.faculty.id,
          name: c.faculty.name,
          designation: c.faculty.designation,
          load: tempLoads[c.faculty.id] ?? 0
        }))
      };
      // Increment temp load
      tempLoads[best.id] = (tempLoads[best.id] ?? 0) + 1;
    } else {
      // No free teacher found for this slot
      suggestions[periodId] = {
        substituteFacultyId: '',
        substituteFacultyName: 'No Free Teacher Available',
        classDetails,
        availableOptions: []
      };
    }
  });

  return suggestions;
}

