export const INITIAL_FACULTY = [
  {
    id: 'f1',
    name: 'Dr. Rajesh Sharma',
    designation: 'HOD & Professor',
    department: 'Computer Science',
    email: 'rajesh.sharma@college.edu',
    phone: '+91 98765 43210'
  },
  {
    id: 'f2',
    name: 'Prof. Priya Verma',
    designation: 'Associate Professor',
    department: 'Computer Science',
    email: 'priya.verma@college.edu',
    phone: '+91 98765 43211'
  },
  {
    id: 'f3',
    name: 'Dr. Amit Patel',
    designation: 'Assistant Professor',
    department: 'Computer Science',
    email: 'amit.patel@college.edu',
    phone: '+91 98765 43212'
  },
  {
    id: 'f4',
    name: 'Prof. Neha Gupta',
    designation: 'Assistant Professor',
    department: 'Computer Science',
    email: 'neha.gupta@college.edu',
    phone: '+91 98765 43213'
  },
  {
    id: 'f5',
    name: 'Dr. Vikram Singh',
    designation: 'Assistant Professor',
    department: 'Computer Science',
    email: 'vikram.singh@college.edu',
    phone: '+91 98765 43214'
  },
  {
    id: 'f6',
    name: 'Prof. Ananya Iyer',
    designation: 'Assistant Professor',
    department: 'Computer Science',
    email: 'ananya.iyer@college.edu',
    phone: '+91 98765 43215'
  },
  {
    id: 'f7',
    name: 'Prof. Rohit Nair',
    designation: 'Lecturer',
    department: 'Computer Science',
    email: 'rohit.nair@college.edu',
    phone: '+91 98765 43216'
  }
];

// Helper to construct structured schedules
// null = Free period
export const INITIAL_TIMETABLES = {
  f1: { // Dr. Rajesh Sharma (HOD)
    Monday: {
      1: { subject: 'Compiler Design', classGroup: 'CS-4A', room: 'Room 301' },
      2: { subject: 'Compiler Design', classGroup: 'CS-4B', room: 'Room 302' },
      3: null, // Free
      4: null, // Free
      5: { subject: 'Research Guidance', classGroup: 'MTech-1', room: 'Seminar Hall' },
      6: null, // Free
      7: null, // Free
      8: null  // Free
    },
    Tuesday: {
      1: null,
      2: { subject: 'Compiler Design', classGroup: 'CS-4A', room: 'Room 301' },
      3: { subject: 'Advanced OS', classGroup: 'CS-4B', room: 'Room 302' },
      4: null,
      5: null,
      6: { subject: 'Faculty Meeting', classGroup: 'All Staff', room: 'Board Room' },
      7: null,
      8: null
    },
    Wednesday: {
      1: { subject: 'Compiler Design', classGroup: 'CS-4A', room: 'Room 301' },
      2: null,
      3: null,
      4: { subject: 'Admin Office Hours', classGroup: 'Office', room: 'HOD Cabin' },
      5: null,
      6: null,
      7: null,
      8: null
    },
    Thursday: {
      1: null,
      2: { subject: 'Compiler Design', classGroup: 'CS-4B', room: 'Room 302' },
      3: null,
      4: null,
      5: { subject: 'Project Review', classGroup: 'CS-4A', room: 'Room 301' },
      6: null,
      7: null,
      8: null
    },
    Friday: {
      1: { subject: 'Compiler Design', classGroup: 'CS-4A', room: 'Room 301' },
      2: { subject: 'Compiler Design', classGroup: 'CS-4B', room: 'Room 302' },
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    },
    Saturday: {
      1: null,
      2: null,
      3: { subject: 'Guest Lecture', classGroup: 'CS All', room: 'Auditorium' },
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    }
  },
  f2: { // Prof. Priya Verma
    Monday: {
      1: null,
      2: null,
      3: { subject: 'Machine Learning', classGroup: 'CS-3A', room: 'Lab 201' },
      4: { subject: 'Machine Learning', classGroup: 'CS-3B', room: 'Lab 201' },
      5: null,
      6: { subject: 'Python Lab', classGroup: 'CS-2A', room: 'Lab 103' },
      7: { subject: 'Python Lab', classGroup: 'CS-2A', room: 'Lab 103' },
      8: null
    },
    Tuesday: {
      1: { subject: 'Machine Learning', classGroup: 'CS-3A', room: 'Room 205' },
      2: null,
      3: null,
      4: { subject: 'Deep Learning', classGroup: 'CS-4A', room: 'Room 305' },
      5: { subject: 'Data Mining', classGroup: 'CS-3B', room: 'Room 206' },
      6: null,
      7: null,
      8: null
    },
    Wednesday: {
      1: null,
      2: { subject: 'Machine Learning', classGroup: 'CS-3B', room: 'Room 205' },
      3: { subject: 'AI Ethics', classGroup: 'CS-3A', room: 'Room 204' },
      4: null,
      5: { subject: 'Python Lab', classGroup: 'CS-2B', room: 'Lab 103' },
      6: { subject: 'Python Lab', classGroup: 'CS-2B', room: 'Lab 103' },
      7: null,
      8: null
    },
    Thursday: {
      1: { subject: 'Machine Learning', classGroup: 'CS-3A', room: 'Room 205' },
      2: null,
      3: null,
      4: null,
      5: null,
      6: { subject: 'Data Science Tut', classGroup: 'CS-3A', room: 'Room 201' },
      7: null,
      8: null
    },
    Friday: {
      1: null,
      2: { subject: 'Machine Learning', classGroup: 'CS-3B', room: 'Room 205' },
      3: { subject: 'Deep Learning', classGroup: 'CS-4A', room: 'Room 305' },
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    },
    Saturday: {
      1: { subject: 'AI Project Mentoring', classGroup: 'CS-4A', room: 'Lab 201' },
      2: { subject: 'AI Project Mentoring', classGroup: 'CS-4B', room: 'Lab 201' },
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    }
  },
  f3: { // Dr. Amit Patel
    Monday: {
      1: { subject: 'Database Management', classGroup: 'CS-2A', room: 'Room 101' },
      2: null,
      3: null,
      4: { subject: 'SQL Workshop', classGroup: 'CS-2A', room: 'Lab 101' },
      5: { subject: 'Database Management', classGroup: 'CS-2B', room: 'Room 102' },
      6: null,
      7: null,
      8: null
    },
    Tuesday: {
      1: null,
      2: { subject: 'Database Management', classGroup: 'CS-2A', room: 'Room 101' },
      3: null,
      4: null,
      5: null,
      6: { subject: 'Cloud Databases', classGroup: 'CS-3B', room: 'Room 207' },
      7: null,
      8: null
    },
    Wednesday: {
      1: { subject: 'Database Management', classGroup: 'CS-2B', room: 'Room 102' },
      2: null,
      3: { subject: 'SQL Lab', classGroup: 'CS-2B', room: 'Lab 101' },
      4: { subject: 'SQL Lab', classGroup: 'CS-2B', room: 'Lab 101' },
      5: null,
      6: null,
      7: null,
      8: null
    },
    Thursday: {
      1: null,
      2: null,
      3: { subject: 'Database Management', classGroup: 'CS-2A', room: 'Room 101' },
      4: { subject: 'Database Management', classGroup: 'CS-2B', room: 'Room 102' },
      5: null,
      6: null,
      7: { subject: 'DB Tutorial', classGroup: 'CS-2A', room: 'Room 105' },
      8: null
    },
    Friday: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: { subject: 'Database Management', classGroup: 'CS-2A', room: 'Room 101' },
      6: { subject: 'Database Management', classGroup: 'CS-2B', room: 'Room 102' },
      7: null,
      8: null
    },
    Saturday: {
      1: null,
      2: { subject: 'NoSQL Masterclass', classGroup: 'CS-3A', room: 'Seminar Hall' },
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    }
  },
  f4: { // Prof. Neha Gupta
    Monday: {
      1: null,
      2: { subject: 'Computer Networks', classGroup: 'CS-3A', room: 'Room 202' },
      3: { subject: 'Computer Networks', classGroup: 'CS-3B', room: 'Room 203' },
      4: null,
      5: null,
      6: null,
      7: { subject: 'Network Security', classGroup: 'CS-4B', room: 'Room 304' },
      8: null
    },
    Tuesday: {
      1: { subject: 'Computer Networks', classGroup: 'CS-3B', room: 'Room 203' },
      2: null,
      3: null,
      4: { subject: 'Computer Networks', classGroup: 'CS-3A', room: 'Room 202' },
      5: null,
      6: null,
      7: null,
      8: null
    },
    Wednesday: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: { subject: 'Networks Lab', classGroup: 'CS-3A', room: 'Lab 104' },
      6: { subject: 'Networks Lab', classGroup: 'CS-3A', room: 'Lab 104' },
      7: null,
      8: null
    },
    Thursday: {
      1: { subject: 'Computer Networks', classGroup: 'CS-3A', room: 'Room 202' },
      2: { subject: 'Computer Networks', classGroup: 'CS-3B', room: 'Room 203' },
      3: null,
      4: null,
      5: { subject: 'Cyber Law', classGroup: 'CS-4A', room: 'Room 303' },
      6: null,
      7: null,
      8: null
    },
    Friday: {
      1: null,
      2: null,
      3: { subject: 'Networks Lab', classGroup: 'CS-3B', room: 'Lab 104' },
      4: { subject: 'Networks Lab', classGroup: 'CS-3B', room: 'Lab 104' },
      5: null,
      6: null,
      7: null,
      8: null
    },
    Saturday: {
      1: null,
      2: null,
      3: null,
      4: { subject: 'Ethical Hacking Seminar', classGroup: 'CS-4A', room: 'Auditorium' },
      5: null,
      6: null,
      7: null,
      8: null
    }
  },
  f5: { // Dr. Vikram Singh
    Monday: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: { subject: 'Operating Systems', classGroup: 'CS-2A', room: 'Room 104' },
      7: { subject: 'Operating Systems', classGroup: 'CS-2B', room: 'Room 105' },
      8: { subject: 'OS Lab', classGroup: 'CS-2A', room: 'Lab 102' }
    },
    Tuesday: {
      1: null,
      2: null,
      3: { subject: 'Operating Systems', classGroup: 'CS-2A', room: 'Room 104' },
      4: null,
      5: { subject: 'Operating Systems', classGroup: 'CS-2B', room: 'Room 105' },
      6: null,
      7: null,
      8: null
    },
    Wednesday: {
      1: null,
      2: null,
      3: null,
      4: { subject: 'Linux Administration', classGroup: 'CS-3A', room: 'Room 202' },
      5: null,
      6: null,
      7: { subject: 'OS Lab', classGroup: 'CS-2B', room: 'Lab 102' },
      8: { subject: 'OS Lab', classGroup: 'CS-2B', room: 'Lab 102' }
    },
    Thursday: {
      1: { subject: 'Operating Systems', classGroup: 'CS-2A', room: 'Room 104' },
      2: null,
      3: null,
      4: null,
      5: null,
      6: { subject: 'Operating Systems', classGroup: 'CS-2B', room: 'Room 105' },
      7: null,
      8: null
    },
    Friday: {
      1: { subject: 'Operating Systems', classGroup: 'CS-2B', room: 'Room 105' },
      2: { subject: 'Operating Systems', classGroup: 'CS-2A', room: 'Room 104' },
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    },
    Saturday: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    }
  },
  f6: { // Prof. Ananya Iyer
    Monday: {
      1: { subject: 'Design & Analysis of Algorithms', classGroup: 'CS-2B', room: 'Room 106' },
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    },
    Tuesday: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: { subject: 'Design & Analysis of Algorithms', classGroup: 'CS-2A', room: 'Room 106' },
      6: { subject: 'Design & Analysis of Algorithms', classGroup: 'CS-2B', room: 'Room 106' },
      7: null,
      8: null
    },
    Wednesday: {
      1: { subject: 'Discrete Mathematics', classGroup: 'CS-1A', room: 'Room 101' },
      2: { subject: 'Discrete Mathematics', classGroup: 'CS-1B', room: 'Room 102' },
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    },
    Thursday: {
      1: null,
      2: null,
      3: { subject: 'Design & Analysis of Algorithms', classGroup: 'CS-2A', room: 'Room 106' },
      4: { subject: 'Discrete Mathematics', classGroup: 'CS-1A', room: 'Room 101' },
      5: null,
      6: null,
      7: null,
      8: null
    },
    Friday: {
      1: null,
      2: null,
      3: null,
      4: { subject: 'Design & Analysis of Algorithms', classGroup: 'CS-2B', room: 'Room 106' },
      5: null,
      6: null,
      7: { subject: 'Competitive Coding', classGroup: 'Club', room: 'Lab 201' },
      8: { subject: 'Competitive Coding', classGroup: 'Club', room: 'Lab 201' }
    },
    Saturday: {
      1: { subject: 'Discrete Mathematics', classGroup: 'CS-1B', room: 'Room 102' },
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    }
  },
  f7: { // Prof. Rohit Nair
    Monday: {
      1: null,
      2: null,
      3: { subject: 'Web Technologies', classGroup: 'CS-2A', room: 'Room 107' },
      4: null,
      5: { subject: 'Web Development Lab', classGroup: 'CS-2A', room: 'Lab 105' },
      6: { subject: 'Web Development Lab', classGroup: 'CS-2A', room: 'Lab 105' },
      7: null,
      8: null
    },
    Tuesday: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: { subject: 'Web Technologies', classGroup: 'CS-2B', room: 'Room 107' },
      8: null
    },
    Wednesday: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    },
    Thursday: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: { subject: 'Fullstack Bootcamp', classGroup: 'CS-3A', room: 'Lab 105' },
      8: { subject: 'Fullstack Bootcamp', classGroup: 'CS-3A', room: 'Lab 105' }
    },
    Friday: {
      1: { subject: 'Web Technologies', classGroup: 'CS-2A', room: 'Room 107' },
      2: null,
      3: null,
      4: null,
      5: { subject: 'Web Development Lab', classGroup: 'CS-2B', room: 'Lab 105' },
      6: { subject: 'Web Development Lab', classGroup: 'CS-2B', room: 'Lab 105' },
      7: null,
      8: null
    },
    Saturday: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null
    }
  }
};

// Initial Demo Absence & Adjustment
export const INITIAL_ABSENCES = [
  {
    id: 'abs-demo-1',
    facultyId: 'f2', // Prof. Priya Verma
    facultyName: 'Prof. Priya Verma',
    date: '2026-11-02',
    dayOfWeek: 'Monday',
    reason: 'Attending IEEE AI Conference',
    leaveType: 'Academic Duty',
    status: 'Pending', // 'Pending', 'Approved', 'Rejected'
    reportedAt: '2026-10-30T09:30:00Z',
    // Periods where she has classes on Monday:
    // Period 3 (CS-3A), Period 4 (CS-3B), Period 6 (CS-2A Lab), Period 7 (CS-2A Lab)
    periodsToAdjust: [3, 4, 6, 7]
  }
];


