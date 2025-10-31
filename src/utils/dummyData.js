// Dummy data for the app

// Users
export const users = [
  { 
    id: 'u1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    userType: 'admin',
    status: 'active',
    joinedDate: '2023-01-15',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random&color=fff',
  },
  { 
    id: 'u2', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    userType: 'business',
    status: 'active',
    joinedDate: '2023-02-20',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random&color=fff',
  },
  { 
    id: 'u3', 
    name: 'Robert Johnson', 
    email: 'robert@example.com', 
    userType: 'freelancer',
    status: 'active',
    joinedDate: '2023-03-05',
    avatar: 'https://ui-avatars.com/api/?name=Robert+Johnson&background=random&color=fff',
  },
  { 
    id: 'u4', 
    name: 'Emily Davis', 
    email: 'emily@example.com', 
    userType: 'employee',
    status: 'active',
    joinedDate: '2023-04-10',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=random&color=fff',
  },
  { 
    id: 'u5', 
    name: 'Michael Brown', 
    email: 'michael@example.com', 
    userType: 'freelancer',
    status: 'inactive',
    joinedDate: '2023-05-15',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=random&color=fff',
  },
  { 
    id: 'u6', 
    name: 'Sarah Wilson', 
    email: 'sarah@example.com', 
    userType: 'business',
    status: 'active',
    joinedDate: '2023-06-20',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=random&color=fff',
  },
  { 
    id: 'u7', 
    name: 'David Lee', 
    email: 'david@example.com', 
    userType: 'employee',
    status: 'active',
    joinedDate: '2023-07-25',
    avatar: 'https://ui-avatars.com/api/?name=David+Lee&background=random&color=fff',
  },
  { 
    id: 'u8', 
    name: 'Amanda Martinez', 
    email: 'amanda@example.com', 
    userType: 'freelancer',
    status: 'active',
    joinedDate: '2023-08-30',
    avatar: 'https://ui-avatars.com/api/?name=Amanda+Martinez&background=random&color=fff',
  },
];

// Business Activities/Projects
export const activities = [
  {
    id: 'a1',
    businessId: 'u2',
    title: 'Website Redesign Project',
    description: 'Complete redesign of our company website with modern UI/UX principles.',
    status: 'upcoming',
    budget: 5000,
    deadline: '2023-12-15',
    skills: ['React', 'UI/UX', 'Tailwind CSS'],
    responses: ['u3', 'u5', 'u8'],
    assignedTo: [],
    createdAt: '2023-10-01',
  },
  {
    id: 'a2',
    businessId: 'u2',
    title: 'Mobile App Development',
    description: 'Develop a mobile app for our existing web platform using React Native.',
    status: 'ongoing',
    budget: 8000,
    deadline: '2023-11-30',
    skills: ['React Native', 'Firebase', 'API Integration'],
    responses: ['u3', 'u5'],
    assignedTo: ['u3'],
    createdAt: '2023-09-15',
  },
  {
    id: 'a3',
    businessId: 'u6',
    title: 'Content Marketing Campaign',
    description: 'Create and manage a content marketing campaign for our new product launch.',
    status: 'completed',
    budget: 3000,
    deadline: '2023-10-10',
    skills: ['Content Writing', 'SEO', 'Social Media'],
    responses: ['u8'],
    assignedTo: ['u8'],
    createdAt: '2023-08-20',
  },
  {
    id: 'a4',
    businessId: 'u6',
    title: 'Database Optimization',
    description: 'Optimize our existing database structure and queries for better performance.',
    status: 'ongoing',
    budget: 4500,
    deadline: '2023-11-15',
    skills: ['SQL', 'Database Design', 'Performance Tuning'],
    responses: ['u5'],
    assignedTo: ['u5'],
    createdAt: '2023-09-25',
  },
  {
    id: 'a5',
    businessId: 'u2',
    title: 'Brand Identity Refresh',
    description: 'Update our brand identity including logo, color scheme, and brand guidelines.',
    status: 'upcoming',
    budget: 6000,
    deadline: '2023-12-30',
    skills: ['Graphic Design', 'Branding', 'Illustrator'],
    responses: [],
    assignedTo: [],
    createdAt: '2023-10-05',
  },
];

// Proposals from freelancers
export const proposals = [
  {
    id: 'p1',
    activityId: 'a1',
    freelancerId: 'u3',
    coverLetter: 'I have extensive experience in website redesign projects with React and Tailwind CSS.',
    proposedBudget: 4800,
    estimatedDuration: '4 weeks',
    status: 'pending',
    submittedAt: '2023-10-03',
  },
  {
    id: 'p2',
    activityId: 'a1',
    freelancerId: 'u5',
    coverLetter: 'I specialize in modern UI/UX design and have redesigned over 30 websites in the last year.',
    proposedBudget: 5200,
    estimatedDuration: '5 weeks',
    status: 'rejected',
    submittedAt: '2023-10-04',
  },
  {
    id: 'p3',
    activityId: 'a1',
    freelancerId: 'u8',
    coverLetter: 'I can provide a fresh perspective on your website redesign with a focus on user experience.',
    proposedBudget: 4900,
    estimatedDuration: '4 weeks',
    status: 'pending',
    submittedAt: '2023-10-05',
  },
  {
    id: 'p4',
    activityId: 'a2',
    freelancerId: 'u3',
    coverLetter: 'I have built multiple React Native apps with Firebase integration.',
    proposedBudget: 7800,
    estimatedDuration: '8 weeks',
    status: 'accepted',
    submittedAt: '2023-09-18',
  },
  {
    id: 'p5',
    activityId: 'a2',
    freelancerId: 'u5',
    coverLetter: 'I can deliver a high-performance React Native app with excellent UI/UX.',
    proposedBudget: 8200,
    estimatedDuration: '9 weeks',
    status: 'rejected',
    submittedAt: '2023-09-20',
  },
];

// Employee tasks
export const tasks = [
  {
    id: 't1',
    employeeId: 'u4',
    title: 'Update user documentation',
    description: 'Review and update the user documentation for the latest product release.',
    status: 'pending',
    priority: 'medium',
    dueDate: '2023-11-10',
    assignedBy: 'u2',
    createdAt: '2023-10-01',
  },
  {
    id: 't2',
    employeeId: 'u4',
    title: 'Conduct user testing sessions',
    description: 'Schedule and conduct user testing sessions for the new feature.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2023-11-05',
    assignedBy: 'u2',
    createdAt: '2023-09-28',
  },
  {
    id: 't3',
    employeeId: 'u7',
    title: 'Prepare monthly analytics report',
    description: 'Compile and analyze data for the monthly analytics report.',
    status: 'done',
    priority: 'high',
    dueDate: '2023-10-31',
    assignedBy: 'u6',
    createdAt: '2023-10-15',
  },
  {
    id: 't4',
    employeeId: 'u7',
    title: 'Optimize landing page',
    description: 'Optimize the landing page for better conversion rates.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2023-11-15',
    assignedBy: 'u6',
    createdAt: '2023-10-20',
  },
  {
    id: 't5',
    employeeId: 'u4',
    title: 'Research competitor features',
    description: 'Research and document features offered by competitors.',
    status: 'pending',
    priority: 'low',
    dueDate: '2023-11-20',
    assignedBy: 'u2',
    createdAt: '2023-10-25',
  },
];

// Earnings for freelancers
export const earnings = [
  {
    id: 'e1',
    freelancerId: 'u3',
    activityId: 'a2',
    amount: 7800,
    status: 'paid',
    paidDate: '2023-10-15',
  },
  {
    id: 'e2',
    freelancerId: 'u8',
    activityId: 'a3',
    amount: 3000,
    status: 'paid',
    paidDate: '2023-10-20',
  },
  {
    id: 'e3',
    freelancerId: 'u5',
    activityId: 'a4',
    amount: 2250,
    status: 'pending',
    paidDate: null,
  },
];

// Announcements for employees
export const announcements = [
  {
    id: 'an1',
    title: 'Company Holiday Schedule',
    content: 'Please note the upcoming holiday schedule for December.',
    importance: 'normal',
    postedAt: '2023-10-15',
    postedBy: 'u2',
  },
  {
    id: 'an2',
    title: 'New Project Launch',
    content: 'We are excited to announce the launch of our new project next month.',
    importance: 'high',
    postedAt: '2023-10-20',
    postedBy: 'u6',
  },
  {
    id: 'an3',
    title: 'Office Renovation',
    content: 'The office renovation will begin next week. Please plan accordingly.',
    importance: 'normal',
    postedAt: '2023-10-25',
    postedBy: 'u2',
  },
];

// Chat messages (dummy)
export const chatMessages = [
  {
    id: 'c1',
    senderId: 'u2',
    receiverId: 'u3',
    content: 'Hi, I wanted to discuss the website redesign project.',
    timestamp: '2023-10-15T10:30:00',
    read: true,
  },
  {
    id: 'c2',
    senderId: 'u3',
    receiverId: 'u2',
    content: 'Sure, I\'m available. What aspects would you like to discuss?',
    timestamp: '2023-10-15T10:35:00',
    read: true,
  },
  {
    id: 'c3',
    senderId: 'u2',
    receiverId: 'u3',
    content: 'I have some questions about the timeline and specific design elements.',
    timestamp: '2023-10-15T10:40:00',
    read: true,
  },
  {
    id: 'c4',
    senderId: 'u3',
    receiverId: 'u2',
    content: 'I can provide a detailed breakdown of the timeline. For design elements, I\'ll need more specific requirements.',
    timestamp: '2023-10-15T10:45:00',
    read: true,
  },
  {
    id: 'c5',
    senderId: 'u2',
    receiverId: 'u3',
    content: 'Great, let\'s schedule a call to discuss in detail.',
    timestamp: '2023-10-15T10:50:00',
    read: false,
  },
];

// Chart data for dashboards
export const adminChartData = {
  revenue: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [10000, 15000, 12000, 18000, 16000, 21000, 22000, 24000, 19000, 23000, 25000, 28000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  },
  users: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Businesses',
        data: [10, 15, 20, 25, 30, 35],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Freelancers',
        data: [20, 30, 40, 50, 60, 70],
        backgroundColor: '#14b8a6',
      },
      {
        label: 'Employees',
        data: [15, 20, 25, 30, 40, 45],
        backgroundColor: '#f97316',
      },
    ],
  },
};

export const businessChartData = {
  activities: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Posted Activities',
        data: [5, 8, 6, 10, 12, 9],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Completed Activities',
        data: [2, 5, 4, 7, 8, 6],
        backgroundColor: '#14b8a6',
      },
    ],
  },
  responses: {
    labels: ['Website Redesign', 'Mobile App', 'Marketing', 'Database', 'Brand Identity'],
    datasets: [
      {
        label: 'Number of Responses',
        data: [3, 2, 1, 1, 0],
        backgroundColor: [
          '#3b82f6',
          '#14b8a6',
          '#f97316',
          '#eab308',
          '#ef4444',
        ],
      },
    ],
  },
};

export const freelancerChartData = {
  earnings: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Earnings',
        data: [1200, 1800, 1500, 2200, 2800, 3000],
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
      },
    ],
  },
  proposals: {
    labels: ['Accepted', 'Pending', 'Rejected'],
    datasets: [
      {
        label: 'Proposal Status',
        data: [2, 3, 1],
        backgroundColor: [
          '#22c55e',
          '#eab308',
          '#ef4444',
        ],
      },
    ],
  },
};

export const employeeChartData = {
  tasks: {
    labels: ['Pending', 'In Progress', 'Done'],
    datasets: [
      {
        label: 'Task Status',
        data: [2, 2, 1],
        backgroundColor: [
          '#eab308',
          '#3b82f6',
          '#22c55e',
        ],
      },
    ],
  },
  performance: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [5, 8, 12, 10, 15, 12],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  },
};