// Mock data store for RetiVue frontend
// This is in-memory data only - resets on refresh

export const mockData = {
  users: [
    { id: 1, name: 'Dr. Budi Santoso', email: 'budi@clinic.com', role: 'dokter', status: 'active' },
    { id: 2, name: 'Dr. Siti Rahayu', email: 'siti@clinic.com', role: 'dokter', status: 'active' },
    { id: 3, name: 'Dr. Ahmad Wijaya', email: 'ahmad@clinic.com', role: 'dokter', status: 'active' },
    { id: 4, name: 'Rina Kusuma', email: 'rina@clinic.com', role: 'medical_record', status: 'active' },
    { id: 5, name: 'Dewi Lestari', email: 'dewi@clinic.com', role: 'medical_record', status: 'active' },
    { id: 6, name: 'Admin Sarah', email: 'admin@retivue.com', role: 'admin', status: 'active' },
  ],
  
  patients: [
    { id: 1, name: 'John Doe', email: 'john@email.com', phone: '081234567890', age: 45, gender: 'Male' },
    { id: 2, name: 'Jane Smith', email: 'jane@email.com', phone: '081234567891', age: 52, gender: 'Female' },
    { id: 3, name: 'Ahmad Fauzi', email: 'ahmad@email.com', phone: '081234567892', age: 38, gender: 'Male' },
    { id: 4, name: 'Siti Aminah', email: 'siti@email.com', phone: '081234567893', age: 41, gender: 'Female' },
    { id: 5, name: 'Robert Johnson', email: 'robert@email.com', phone: '081234567894', age: 55, gender: 'Male' },
  ],
  
  doctorSchedules: [
    { id: 1, doctorId: 1, doctorName: 'Dr. Budi Santoso', date: '2026-06-10', startTime: '09:00', endTime: '12:00', quota: 10 },
    { id: 2, doctorId: 1, doctorName: 'Dr. Budi Santoso', date: '2026-06-10', startTime: '14:00', endTime: '17:00', quota: 10 },
    { id: 3, doctorId: 2, doctorName: 'Dr. Siti Rahayu', date: '2026-06-11', startTime: '09:00', endTime: '12:00', quota: 10 },
    { id: 4, doctorId: 2, doctorName: 'Dr. Siti Rahayu', date: '2026-06-11', startTime: '14:00', endTime: '17:00', quota: 10 },
    { id: 5, doctorId: 3, doctorName: 'Dr. Ahmad Wijaya', date: '2026-06-12', startTime: '09:00', endTime: '12:00', quota: 10 },
  ],
  
  cases: [
    {
      id: 1042,
      patientId: 1,
      patientName: 'John Doe',
      doctorId: 1,
      doctorName: 'Dr. Budi Santoso',
      submittedBy: 'Rina Kusuma',
      submittedAt: '2026-06-09T10:30:00',
      status: 'approved',
      patientData: {
        age: 45,
        gender: 'Male',
        weight: 75,
        height: 170,
        bloodPressure: '130/85',
        hasDiabetes: true,
        diabetesDuration: 5,
      },
      aiResult: {
        predictedClass: 'DR Level 2',
        confidence: 0.87,
        probabilities: {
          'No DR': 0.05,
          'DR Level 1': 0.08,
          'DR Level 2': 0.87,
          'DR Level 3': 0.00,
          'DR Level 4': 0.00,
        },
        recommendation: 'Moderate diabetic retinopathy detected. Recommend immediate ophthalmologist consultation.',
      },
      doctorResult: {
        finalDiagnosis: 'Moderate Diabetic Retinopathy',
        lifestyleRecommendation: 'Control blood sugar levels, regular exercise, maintain healthy diet',
        foodRecommendation: 'Low glycemic index foods, increase vegetables and fiber intake',
        followUpPlan: 'Follow-up in 3 months',
      },
    },
    {
      id: 1043,
      patientId: 2,
      patientName: 'Jane Smith',
      doctorId: 2,
      doctorName: 'Dr. Siti Rahayu',
      submittedBy: 'Dewi Lestari',
      submittedAt: '2026-06-09T11:45:00',
      status: 'waiting',
      patientData: {
        age: 52,
        gender: 'Female',
        weight: 68,
        height: 160,
        bloodPressure: '140/90',
        hasDiabetes: true,
        diabetesDuration: 8,
      },
      aiResult: {
        predictedClass: 'DR Level 1',
        confidence: 0.92,
        probabilities: {
          'No DR': 0.03,
          'DR Level 1': 0.92,
          'DR Level 2': 0.05,
          'DR Level 3': 0.00,
          'DR Level 4': 0.00,
        },
        recommendation: 'Mild diabetic retinopathy detected. Regular monitoring recommended.',
      },
      doctorResult: null,
    },
    {
      id: 1044,
      patientId: 3,
      patientName: 'Ahmad Fauzi',
      doctorId: 1,
      doctorName: 'Dr. Budi Santoso',
      submittedBy: 'Rina Kusuma',
      submittedAt: '2026-06-09T13:20:00',
      status: 'rejected',
      patientData: {
        age: 38,
        gender: 'Male',
        weight: 80,
        height: 175,
        bloodPressure: '125/80',
        hasDiabetes: false,
        diabetesDuration: 0,
      },
      aiResult: {
        predictedClass: 'No DR',
        confidence: 0.95,
        probabilities: {
          'No DR': 0.95,
          'DR Level 1': 0.03,
          'DR Level 2': 0.02,
          'DR Level 3': 0.00,
          'DR Level 4': 0.00,
        },
        recommendation: 'No diabetic retinopathy detected. Continue regular screening.',
      },
      doctorResult: {
        rejectNote: 'Image quality insufficient for accurate diagnosis. Please re-upload with better lighting and focus.',
      },
    },
    {
      id: 1045,
      patientId: 4,
      patientName: 'Siti Aminah',
      doctorId: 2,
      doctorName: 'Dr. Siti Rahayu',
      submittedBy: 'Dewi Lestari',
      submittedAt: '2026-06-09T14:50:00',
      status: 'waiting',
      patientData: {
        age: 41,
        gender: 'Female',
        weight: 62,
        height: 165,
        bloodPressure: '135/88',
        hasDiabetes: true,
        diabetesDuration: 3,
      },
      aiResult: {
        predictedClass: 'DR Level 3',
        confidence: 0.78,
        probabilities: {
          'No DR': 0.01,
          'DR Level 1': 0.05,
          'DR Level 2': 0.16,
          'DR Level 3': 0.78,
          'DR Level 4': 0.00,
        },
        recommendation: 'Severe diabetic retinopathy detected. Urgent ophthalmologist consultation required.',
      },
      doctorResult: null,
    },
    {
      id: 1046,
      patientId: 5,
      patientName: 'Robert Johnson',
      doctorId: 3,
      doctorName: 'Dr. Ahmad Wijaya',
      submittedBy: 'Rina Kusuma',
      submittedAt: '2026-06-09T16:30:00',
      status: 'approved',
      patientData: {
        age: 55,
        gender: 'Male',
        weight: 85,
        height: 178,
        bloodPressure: '145/95',
        hasDiabetes: true,
        diabetesDuration: 12,
      },
      aiResult: {
        predictedClass: 'DR Level 4',
        confidence: 0.85,
        probabilities: {
          'No DR': 0.00,
          'DR Level 1': 0.02,
          'DR Level 2': 0.08,
          'DR Level 3': 0.05,
          'DR Level 4': 0.85,
        },
        recommendation: 'Proliferative diabetic retinopathy detected. Immediate intervention required.',
      },
      doctorResult: {
        finalDiagnosis: 'Proliferative Diabetic Retinopathy',
        lifestyleRecommendation: 'Strict blood sugar control, avoid smoking, regular eye examinations',
        foodRecommendation: 'Diabetic diet plan, limit carbohydrates, increase protein intake',
        followUpPlan: 'Monthly follow-up with ophthalmologist',
      },
    },
  ],
  
  appointments: [
    {
      id: 1,
      patientId: 1,
      patientName: 'John Doe',
      doctorId: 1,
      doctorName: 'Dr. Budi Santoso',
      scheduleId: 1,
      date: '2026-06-10',
      time: '09:00',
      status: 'confirmed',
      bookedAt: '2026-06-08T10:00:00',
    },
    {
      id: 2,
      patientId: 2,
      patientName: 'Jane Smith',
      doctorId: 2,
      doctorName: 'Dr. Siti Rahayu',
      scheduleId: 3,
      date: '2026-06-11',
      time: '09:00',
      status: 'submitted',
      bookedAt: '2026-06-09T11:00:00',
    },
    {
      id: 3,
      patientId: 3,
      patientName: 'Ahmad Fauzi',
      doctorId: 1,
      doctorName: 'Dr. Budi Santoso',
      scheduleId: 2,
      date: '2026-06-10',
      time: '14:00',
      status: 'done',
      bookedAt: '2026-06-07T14:00:00',
    },
  ],
  
  systemStats: {
    totalPatients: 12450,
    screeningsThisMonth: 3142,
    activeDoctors: 145,
    activeStaff: 328,
    serverLoad: 42,
    databaseStorage: 78,
    aiProcessingQueue: 12,
  },
  
  drLevelStats: {
    'No DR': 5420,
    'DR Level 1': 3210,
    'DR Level 2': 2150,
    'DR Level 3': 1120,
    'DR Level 4': 550,
  },
  
  recentActivity: [
    { id: 1, type: 'approval', message: 'Dr. Budi approved case #1042', time: '2 hours ago' },
    { id: 2, type: 'ai', message: 'AI System flagged anomaly in case #1045', time: '3 hours ago' },
    { id: 3, type: 'user', message: 'Admin Sarah added new staff member', time: '5 hours ago' },
    { id: 4, type: 'system', message: 'System completed daily backup', time: '8 hours ago' },
  ],
};

// Helper functions to manipulate mock data
export const addCase = (caseData) => {
  const newCase = {
    id: mockData.cases.length + 1040,
    ...caseData,
    submittedAt: new Date().toISOString(),
    status: 'waiting',
    doctorResult: null,
  };
  mockData.cases.unshift(newCase);
  return newCase;
};

export const updateCase = (caseId, updates) => {
  const index = mockData.cases.findIndex((c) => c.id === caseId);
  if (index !== -1) {
    mockData.cases[index] = { ...mockData.cases[index], ...updates };
    return mockData.cases[index];
  }
  return null;
};

export const addAppointment = (appointmentData) => {
  const newAppointment = {
    id: mockData.appointments.length + 1,
    ...appointmentData,
    status: 'submitted',
    bookedAt: new Date().toISOString(),
  };
  mockData.appointments.push(newAppointment);
  return newAppointment;
};

export const updateAppointment = (appointmentId, updates) => {
  const index = mockData.appointments.findIndex((a) => a.id === appointmentId);
  if (index !== -1) {
    mockData.appointments[index] = { ...mockData.appointments[index], ...updates };
    return mockData.appointments[index];
  }
  return null;
};

export const addUser = (userData) => {
  const newUser = {
    id: mockData.users.length + 1,
    ...userData,
    status: 'active',
  };
  mockData.users.push(newUser);
  return newUser;
};

export const addPatient = (patientData) => {
  const newPatient = {
    id: mockData.patients.length + 1,
    ...patientData,
  };
  mockData.patients.push(newPatient);
  return newPatient;
};

export const addDoctorSchedule = (scheduleData) => {
  const newSchedule = {
    id: mockData.doctorSchedules.length + 1,
    ...scheduleData,
  };
  mockData.doctorSchedules.push(newSchedule);
  return newSchedule;
};
