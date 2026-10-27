export interface Task {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  dueDate: string;
  priority: "Urgent" | "High" | "Normal" | "Low";
  estimatedMinutes: number;
  completed: boolean;
  notes?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  mastered?: boolean;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  icon: string;
  badge: string;
  color: string;
  cards: Flashcard[];
}

export interface QuizQuestion {
  id: string;
  deckId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CourseGrade {
  id: string;
  name: string;
  code: string;
  type: "AP" | "Honors" | "Regular";
  grade: string;
  credits: number;
}

export interface SchedulePeriod {
  period: number;
  time: string;
  course: string;
  room: string;
  teacher: string;
  days: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
  category: "STEM" | "Humanities" | "Arts" | "Break";
}

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "AP Calculus BC: Problem Set 4.2",
    subject: "Calculus",
    subjectColor: "#6366f1",
    dueDate: "Tomorrow, 8:00 AM",
    priority: "Urgent",
    estimatedMinutes: 45,
    completed: false,
    notes: "Problems #14-38 evens on integration by parts and trigonometric substitution.",
  },
  {
    id: "task-2",
    title: "Physics Lab Report: Pendulum Harmonics",
    subject: "Physics",
    subjectColor: "#06b6d4",
    dueDate: "Wednesday, 11:59 PM",
    priority: "High",
    estimatedMinutes: 60,
    completed: false,
    notes: "Include error analysis charts and graph period vs square root of string length.",
  },
  {
    id: "task-3",
    title: "English Lit: Read 'The Great Gatsby' Ch. 5-7",
    subject: "Literature",
    subjectColor: "#ec4899",
    dueDate: "Thursday, 10:30 AM",
    priority: "Normal",
    estimatedMinutes: 35,
    completed: true,
    notes: "Highlight the green light symbolism and Daisy's voice metaphor.",
  },
  {
    id: "task-4",
    title: "US History: Civil Rights Movement Primary Sources",
    subject: "History",
    subjectColor: "#f59e0b",
    dueDate: "Friday, 2:00 PM",
    priority: "Normal",
    estimatedMinutes: 40,
    completed: false,
    notes: "Analyze Martin Luther King Jr.'s 'Letter from Birmingham Jail'.",
  },
  {
    id: "task-5",
    title: "Computer Science: Binary Search Tree Implementation",
    subject: "CompSci",
    subjectColor: "#10b981",
    dueDate: "Oct 2, 11:59 PM",
    priority: "Low",
    estimatedMinutes: 50,
    completed: false,
    notes: "Implement insert, search, and in-order traversal in Python or Java.",
  },
];

export const initialDecks: FlashcardDeck[] = [
  {
    id: "deck-bio",
    title: "Cellular Biology & Genetics",
    subject: "AP Biology",
    icon: "biology",
    badge: "12 Cards",
    color: "#10b981",
    cards: [
      {
        id: "b1",
        front: "What is the primary function of the Mitochondria?",
        back: "Generate most of the chemical energy needed to power the cell's biochemical reactions, stored in adenosine triphosphate (ATP) via cellular respiration.",
        hint: "Powerhouse of the cell",
      },
      {
        id: "b2",
        front: "What are the two main stages of Photosynthesis?",
        back: "1. Light-Dependent Reactions (thylakoid membrane, produces ATP & NADPH)\n2. Calvin Cycle / Light-Independent (stroma, fixes CO2 into G3P sugar).",
        hint: "Sunlight conversion & carbon fixation",
      },
      {
        id: "b3",
        front: "Difference between Mitosis and Meiosis?",
        back: "Mitosis yields 2 genetically identical diploid daughter cells (somatic growth & repair). Meiosis yields 4 genetically diverse haploid gametes (sexual reproduction).",
        hint: "Body cells vs sex cells",
      },
      {
        id: "b4",
        front: "What role does mRNA play during translation?",
        back: "Carries genetic code transcribed from DNA in the nucleus to the ribosomes in cytoplasm, where codons are read to assemble amino acids into polypeptide chains.",
        hint: "Messenger transcription",
      },
    ],
  },
  {
    id: "deck-calc",
    title: "Essential Calculus Derivatives & Integrals",
    subject: "AP Calculus",
    icon: "math",
    badge: "10 Cards",
    color: "#6366f1",
    cards: [
      {
        id: "c1",
        front: "What is the derivative of f(x) = ln(x)?",
        back: "f'(x) = 1/x (for x > 0). With chain rule: d/dx [ln(u)] = (1/u) * u'.",
        hint: "Inverse of exponential function",
      },
      {
        id: "c2",
        front: "State the Fundamental Theorem of Calculus (Part 1).",
        back: "If f is continuous on [a, b] and F(x) = ∫[a to x] f(t)dt, then F'(x) = f(x). Differentiation and integration are inverse operations.",
        hint: "Relates definite integral to derivative",
      },
      {
        id: "c3",
        front: "What is the formula for Integration by Parts?",
        back: "∫ u dv = uv - ∫ v du.\nDerived from the product rule of differentiation: (uv)' = u'v + uv'.",
        hint: "Ultra-Violet Voodoo",
      },
      {
        id: "c4",
        front: "What is the derivative of tan(x)?",
        back: "d/dx [tan(x)] = sec²(x) = 1 / cos²(x).",
        hint: "Trig identity with secant",
      },
    ],
  },
  {
    id: "deck-hist",
    title: "Pivotal World History Milestones",
    subject: "World History",
    icon: "history",
    badge: "8 Cards",
    color: "#f59e0b",
    cards: [
      {
        id: "h1",
        front: "What was the significance of the Magna Carta in 1215?",
        back: "First document to establish the principle that everyone, even the king, was subject to the law, establishing foundational human rights and due process.",
        hint: "Runnymede, King John",
      },
      {
        id: "h2",
        front: "What sparked the Industrial Revolution in 18th century Britain?",
        back: "Abundant coal and iron reserves, agricultural surplus, commercial trade wealth, legal patent protections, and James Watt's improved steam engine.",
        hint: "Steam, coal, and textile mills",
      },
      {
        id: "h3",
        front: "What was the primary goal of the Marshall Plan (1948)?",
        back: "U.S. initiative providing over $13 billion to rebuild war-torn Western European economies, prevent the spread of Soviet Communism, and foster democratic trade.",
        hint: "Post-WWII economic recovery",
      },
    ],
  },
  {
    id: "deck-cs",
    title: "Data Structures & Algorithmic Complexity",
    subject: "Computer Science",
    icon: "code",
    badge: "10 Cards",
    color: "#06b6d4",
    cards: [
      {
        id: "cs1",
        front: "What is the average and worst-case time complexity of QuickSort?",
        back: "Average: O(n log n)\nWorst case: O(n²) when poorly chosen pivot repeatedly splits array unevenly.",
        hint: "Divide and conquer sorting",
      },
      {
        id: "cs2",
        front: "What distinguishes a Stack from a Queue?",
        back: "Stack: LIFO (Last-In, First-Out) - e.g. undo history, call stack.\nQueue: FIFO (First-In, First-Out) - e.g. printer queue, BFS traversal.",
        hint: "LIFO vs FIFO",
      },
      {
        id: "cs3",
        front: "What makes Binary Search require an O(log n) time complexity?",
        back: "It requires sorted data and eliminates half of the remaining search space at every step.",
        hint: "Halving search space",
      },
    ],
  },
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    deckId: "deck-bio",
    question: "Where do the light-dependent reactions of photosynthesis take place?",
    options: ["Stroma", "Thylakoid Membrane", "Outer mitochondrial matrix", "Ribosome"],
    correctIndex: 1,
    explanation: "Light-dependent reactions occur in the thylakoid membranes where chlorophyll absorbs photons to generate ATP & NADPH.",
  },
  {
    id: "q2",
    deckId: "deck-bio",
    question: "Which organelle is responsible for synthesizing ribosomal RNA (rRNA)?",
    options: ["Nucleolus", "Golgi apparatus", "Lysosome", "Centriole"],
    correctIndex: 0,
    explanation: "The nucleolus inside the nucleus is the dense region dedicated to assembling ribosome subunits.",
  },
  {
    id: "q3",
    deckId: "deck-calc",
    question: "What is the derivative of e^(3x)?",
    options: ["e^(3x)", "3 * e^(3x)", "(1/3) * e^(3x)", "3x * e^(3x-1)"],
    correctIndex: 1,
    explanation: "By the Chain Rule: d/dx [e^u] = e^u * u'. Since u = 3x, u' = 3, so derivative is 3e^(3x).",
  },
  {
    id: "q4",
    deckId: "deck-calc",
    question: "What does the second derivative f''(x) > 0 on an interval indicate?",
    options: ["The function is decreasing", "The curve is concave down", "The curve is concave up", "An inflection point occurs"],
    correctIndex: 2,
    explanation: "A positive second derivative means the slope f'(x) is increasing, which implies the graph is concave upward (holds water).",
  },
  {
    id: "q5",
    deckId: "deck-cs",
    question: "Which data structure follows a Last-In First-Out (LIFO) pattern?",
    options: ["Queue", "Priority Queue", "Stack", "Linked List"],
    correctIndex: 2,
    explanation: "A Stack operates like a stack of plates: the last item added is the first one removed (LIFO).",
  },
  {
    id: "q6",
    deckId: "deck-hist",
    question: "In what year was the Magna Carta signed by King John?",
    options: ["1066", "1215", "1492", "1776"],
    correctIndex: 1,
    explanation: "The Magna Carta was agreed upon in June 1215 at Runnymede near Windsor.",
  },
];

export const initialCourses: CourseGrade[] = [
  { id: "c1", name: "AP Calculus BC", code: "MAT-501", type: "AP", grade: "A", credits: 4 },
  { id: "c2", name: "AP Physics C: Mechanics", code: "SCI-502", type: "AP", grade: "A-", credits: 4 },
  { id: "c3", name: "AP English Literature", code: "ENG-401", type: "AP", grade: "B+", credits: 3 },
  { id: "c4", name: "Honors US History", code: "HIS-301", type: "Honors", grade: "A", credits: 3 },
  { id: "c5", name: "Honors Computer Science", code: "CS-302", type: "Honors", grade: "A+", credits: 4 },
  { id: "c6", name: "Spanish IV", code: "WLG-201", type: "Regular", grade: "A", credits: 3 },
];

export const weeklySchedule: SchedulePeriod[] = [
  {
    period: 1,
    time: "08:15 - 09:05 AM",
    course: "AP Calculus BC",
    room: "Room 304 (Math Wing)",
    teacher: "Mr. Henderson",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    category: "STEM",
  },
  {
    period: 2,
    time: "09:15 - 10:05 AM",
    course: "AP Physics C: Mechanics",
    room: "Science Lab 108",
    teacher: "Dr. Alistair Vance",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    category: "STEM",
  },
  {
    period: 3,
    time: "10:15 - 11:05 AM",
    course: "Honors US History",
    room: "Humanities Hall 215",
    teacher: "Mrs. Katherine Adams",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    category: "Humanities",
  },
  {
    period: 4,
    time: "11:15 - 12:00 PM",
    course: "Campus Lunch & Study Hall",
    room: "Courtyard & Central Library",
    teacher: "Faculty Supervision",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    category: "Break",
  },
  {
    period: 5,
    time: "12:10 - 01:00 PM",
    course: "AP English Literature",
    room: "Room 402 (East Annex)",
    teacher: "Ms. Rebecca Thorne",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    category: "Humanities",
  },
  {
    period: 6,
    time: "01:10 - 02:00 PM",
    course: "Honors Computer Science",
    room: "Innovation Tech Lab 5",
    teacher: "Prof. David Lin",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    category: "STEM",
  },
  {
    period: 7,
    time: "02:10 - 03:00 PM",
    course: "Spanish IV",
    room: "Language Arts 112",
    teacher: "Señora Martinez",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    category: "Humanities",
  },
];

export const motivationalQuotes = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Consistency transforms average into excellence.", author: "Robin Sharma" },
];
