/* ============================================
   data.js – Seed data & database layer
   ============================================ */

const DB = {
  // ─── Users ───────────────────────────────
  users: [
    {
      id: 1, role: 'student',
      name: 'SUDHARSAN K', email: 'sudharsan@example.com',
      phone: '+91 98765 43210', password: 'demo123',
      location: 'Chennai, Tamil Nadu',
      degree: 'B.E. Mechanical Engineering',
      department: 'Mechanical Engineering',
      college: 'Anna University, Chennai',
      year: 3, cgpa: 8.0,
      profileCompletion: 85,
      assessmentScore: 85, assessmentDone: true,
      analysisRun: true,
      avatar: 'SK'
    },
    {
      id: 2, role: 'admin',
      name: 'Admin User', email: 'admin@nextstep.ai',
      phone: '+91 99999 00000', password: 'admin123',
      location: 'Bangalore, Karnataka',
      degree: 'M.Tech Computer Science',
      department: 'Computer Science',
      college: 'IIT Bangalore',
      year: 1, cgpa: 9.2,
      profileCompletion: 100,
      assessmentScore: 95, assessmentDone: true,
      analysisRun: true,
      avatar: 'AU'
    }
  ],

  // ─── Skills ──────────────────────────────
  skills: [
    { id:1,  name:'Python',           category:'Programming', icon:'code' },
    { id:2,  name:'SQL',              category:'Database',    icon:'database' },
    { id:3,  name:'Machine Learning', category:'AI/ML',       icon:'brain' },
    { id:4,  name:'Deep Learning',    category:'AI/ML',       icon:'cpu' },
    { id:5,  name:'TensorFlow',       category:'AI/ML',       icon:'layers' },
    { id:6,  name:'PyTorch',          category:'AI/ML',       icon:'layers' },
    { id:7,  name:'JavaScript',       category:'Programming', icon:'code' },
    { id:8,  name:'HTML/CSS',         category:'Web Dev',     icon:'globe' },
    { id:9,  name:'React',            category:'Web Dev',     icon:'component' },
    { id:10, name:'Node.js',          category:'Web Dev',     icon:'server' },
    { id:11, name:'Java',             category:'Programming', icon:'code' },
    { id:12, name:'C++',              category:'Programming', icon:'code' },
    { id:13, name:'AWS',              category:'Cloud',       icon:'cloud' },
    { id:14, name:'Docker',           category:'DevOps',      icon:'box' },
    { id:15, name:'Kubernetes',       category:'DevOps',      icon:'box' },
    { id:16, name:'Git',              category:'Tools',       icon:'git-branch' },
    { id:17, name:'MongoDB',          category:'Database',    icon:'database' },
    { id:18, name:'PostgreSQL',       category:'Database',    icon:'database' },
    { id:19, name:'Power BI',         category:'Analytics',   icon:'bar-chart' },
    { id:20, name:'Tableau',          category:'Analytics',   icon:'bar-chart' },
    { id:21, name:'Cybersecurity',    category:'Security',    icon:'shield' },
    { id:22, name:'Linux',            category:'Tools',       icon:'terminal' },
    { id:23, name:'FastAPI',          category:'Web Dev',     icon:'zap' },
    { id:24, name:'Django',           category:'Web Dev',     icon:'layers' },
    { id:25, name:'Flutter',          category:'Mobile',      icon:'smartphone' },
    { id:26, name:'Kotlin',           category:'Mobile',      icon:'smartphone' },
    { id:27, name:'Figma',            category:'Design',      icon:'pen-tool' },
    { id:28, name:'Azure',            category:'Cloud',       icon:'cloud' },
    { id:29, name:'GCP',              category:'Cloud',       icon:'cloud' },
    { id:30, name:'MLOps',            category:'AI/ML',       icon:'settings' }
  ],

  // ─── User Skills (Demo Student) ──────────
  userSkills: [
    { userId:1, skillId:1,  name:'Python',           proficiency:85, level:'Advanced' },
    { userId:1, skillId:2,  name:'SQL',               proficiency:70, level:'Intermediate' },
    { userId:1, skillId:3,  name:'Machine Learning',  proficiency:75, level:'Intermediate' },
    { userId:1, skillId:7,  name:'JavaScript',        proficiency:60, level:'Intermediate' },
    { userId:1, skillId:8,  name:'HTML/CSS',          proficiency:65, level:'Intermediate' },
    { userId:1, skillId:16, name:'Git',               proficiency:80, level:'Advanced' },
    { userId:1, skillId:4,  name:'Deep Learning',     proficiency:20, level:'Beginner' },
    { userId:1, skillId:17, name:'MongoDB',           proficiency:55, level:'Intermediate' },
    { userId:1, skillId:19, name:'Power BI',          proficiency:40, level:'Beginner' },
    { userId:1, skillId:22, name:'Linux',             proficiency:60, level:'Intermediate' },
    { userId:1, skillId:14, name:'Docker',            proficiency:30, level:'Beginner' },
    { userId:1, skillId:5,  name:'TensorFlow',        proficiency:15, level:'Beginner' }
  ],

  softSkills: [
    { name:'Communication',   score: 82 },
    { name:'Leadership',      score: 75 },
    { name:'Teamwork',        score: 88 },
    { name:'Problem Solving', score: 79 },
    { name:'Time Management', score: 71 }
  ],

  // ─── Projects ────────────────────────────
  userProjects: [
    {
      id:1, userId:1,
      name:'Student Performance Predictor',
      description:'ML model predicting student grades using Random Forest. Achieved 88% accuracy.',
      technologies:['Python','Scikit-learn','Pandas','Flask'],
      role:'Solo Developer',
      link:'https://github.com/sudharsan/student-predictor',
      duration:'2 months'
    },
    {
      id:2, userId:1,
      name:'E-commerce Website',
      description:'Full-stack shopping platform with cart, auth and payment integration.',
      technologies:['HTML','CSS','JavaScript','Node.js'],
      role:'Frontend Developer',
      link:'https://github.com/sudharsan/ecommerce',
      duration:'3 months'
    },
    {
      id:3, userId:1,
      name:'Sentiment Analysis Tool',
      description:'NLP-based tool to classify Twitter sentiments using BERT.',
      technologies:['Python','NLTK','Transformers','Streamlit'],
      role:'ML Engineer',
      link:'https://github.com/sudharsan/sentiment-tool',
      duration:'6 weeks'
    }
  ],

  // ─── Certifications ──────────────────────
  userCertifications: [
    { id:1, userId:1, name:'Python for Data Science',   provider:'Coursera',   date:'2024-03', credentialId:'CRS-PDS-2024' },
    { id:2, userId:1, name:'Machine Learning Specialization', provider:'Coursera', date:'2024-07', credentialId:'CRS-MLS-2024' },
    { id:3, userId:1, name:'AWS Cloud Practitioner',    provider:'Amazon',     date:'2024-09', credentialId:'AWS-CP-2024' }
  ],

  // ─── Careers ─────────────────────────────
  careers: [
    {
      id:1, name:'Machine Learning Engineer',
      category:'Artificial Intelligence',
      description:'Design and build ML models to solve real-world problems at scale.',
      icon:'brain', iconBg:'#ede9fe', iconColor:'#7c3aed',
      difficulty:'Intermediate', demand:'Very High',
      salaryMin: 800000, salaryMax: 2500000,
      growth:'+28%',
      requiredSkills:['Python','Machine Learning','Deep Learning','TensorFlow','PyTorch','SQL','MLOps','Git'],
      optionalSkills:['Docker','Kubernetes','AWS','Spark']
    },
    {
      id:2, name:'Data Scientist',
      category:'Data Science',
      description:'Extract insights from data using statistics, ML and visualization.',
      icon:'bar-chart-2', iconBg:'#dbeafe', iconColor:'#3b82f6',
      difficulty:'Intermediate', demand:'High',
      salaryMin: 700000, salaryMax: 2000000,
      growth:'+25%',
      requiredSkills:['Python','SQL','Machine Learning','Statistics','Power BI','Pandas','NumPy'],
      optionalSkills:['Tableau','Spark','AWS','R']
    },
    {
      id:3, name:'AI Engineer',
      category:'Artificial Intelligence',
      description:'Build AI systems, NLP pipelines and computer vision applications.',
      icon:'cpu', iconBg:'#ecfdf5', iconColor:'#10b981',
      difficulty:'Advanced', demand:'Very High',
      salaryMin: 1000000, salaryMax: 3000000,
      growth:'+35%',
      requiredSkills:['Python','Deep Learning','NLP','Computer Vision','TensorFlow','PyTorch','Cloud'],
      optionalSkills:['MLOps','Docker','Kubernetes']
    },
    {
      id:4, name:'Full Stack Developer',
      category:'Web Development',
      description:'Build end-to-end web applications covering both frontend and backend.',
      icon:'layers', iconBg:'#fef3c7', iconColor:'#f59e0b',
      difficulty:'Intermediate', demand:'High',
      salaryMin: 600000, salaryMax: 1800000,
      growth:'+22%',
      requiredSkills:['JavaScript','React','Node.js','SQL','HTML/CSS','Git','REST APIs'],
      optionalSkills:['TypeScript','Docker','AWS','MongoDB']
    },
    {
      id:5, name:'Cloud Engineer',
      category:'Cloud Computing',
      description:'Design and manage scalable cloud infrastructure and services.',
      icon:'cloud', iconBg:'#e0f2fe', iconColor:'#0284c7',
      difficulty:'Intermediate', demand:'Very High',
      salaryMin: 900000, salaryMax: 2500000,
      growth:'+30%',
      requiredSkills:['AWS','Azure','GCP','Linux','Docker','Kubernetes','Networking'],
      optionalSkills:['Terraform','Python','Security']
    },
    {
      id:6, name:'Cybersecurity Engineer',
      category:'Cybersecurity',
      description:'Protect systems, networks and data from digital threats.',
      icon:'shield', iconBg:'#fce7f3', iconColor:'#be185d',
      difficulty:'Advanced', demand:'High',
      salaryMin: 800000, salaryMax: 2200000,
      growth:'+31%',
      requiredSkills:['Networking','Linux','Python','Cybersecurity','Ethical Hacking'],
      optionalSkills:['Cloud','Forensics','SIEM']
    },
    {
      id:7, name:'Data Analyst',
      category:'Data Science',
      description:'Analyze business data to generate actionable insights and reports.',
      icon:'pie-chart', iconBg:'#fdf4ff', iconColor:'#a21caf',
      difficulty:'Beginner', demand:'High',
      salaryMin: 400000, salaryMax: 1200000,
      growth:'+20%',
      requiredSkills:['SQL','Excel','Power BI','Python','Statistics','Tableau'],
      optionalSkills:['R','Spark','Machine Learning']
    },
    {
      id:8, name:'DevOps Engineer',
      category:'DevOps',
      description:'Bridge development and operations with CI/CD, automation and monitoring.',
      icon:'git-branch', iconBg:'#fff7ed', iconColor:'#c2410c',
      difficulty:'Intermediate', demand:'High',
      salaryMin: 750000, salaryMax: 2000000,
      growth:'+24%',
      requiredSkills:['Docker','Kubernetes','Linux','AWS','CI/CD','Python','Git'],
      optionalSkills:['Terraform','Ansible','Monitoring']
    },
    {
      id:9, name:'Mobile App Developer',
      category:'Mobile Development',
      description:'Build native and cross-platform mobile applications for iOS and Android.',
      icon:'smartphone', iconBg:'#f0fdf4', iconColor:'#16a34a',
      difficulty:'Intermediate', demand:'High',
      salaryMin: 500000, salaryMax: 1600000,
      growth:'+18%',
      requiredSkills:['Flutter','Kotlin','Java','React Native','Firebase'],
      optionalSkills:['Swift','REST APIs','UI/UX']
    },
    {
      id:10, name:'UI/UX Designer',
      category:'Design',
      description:'Design beautiful and intuitive digital experiences for users.',
      icon:'pen-tool', iconBg:'#fef2f2', iconColor:'#ef4444',
      difficulty:'Beginner', demand:'Medium',
      salaryMin: 450000, salaryMax: 1400000,
      growth:'+15%',
      requiredSkills:['Figma','User Research','Prototyping','CSS','Design Systems'],
      optionalSkills:['HTML','JavaScript','Adobe XD']
    }
  ],

  // ─── AI Recommendations (for demo user) ──
  recommendations: [
    {
      careerId:1, userId:1, matchScore:91,
      matchedSkills:['Python','SQL','Machine Learning','Git'],
      missingSkills:['Deep Learning','TensorFlow/PyTorch','MLOps'],
      whyRecommended:'Your strong Python skills (85%), ongoing ML knowledge, and project experience align well with ML Engineering. Your academic engineering background adds an edge.',
      recommendedTech:['TensorFlow','PyTorch','Scikit-learn','MLflow','Apache Spark'],
      courses:[1,2,3,4],
      certifications:[1,2],
      projects:[1,2,3]
    },
    {
      careerId:2, userId:1, matchScore:87,
      matchedSkills:['Python','SQL','Machine Learning','Power BI'],
      missingSkills:['Statistics','Tableau','R','Spark'],
      whyRecommended:'Your Python + ML combination with SQL querying and Power BI experience perfectly positions you for Data Science roles.',
      recommendedTech:['Pandas','NumPy','Matplotlib','Seaborn','Tableau'],
      courses:[1,5,6],
      certifications:[2,3],
      projects:[1,4]
    },
    {
      careerId:3, userId:1, matchScore:84,
      matchedSkills:['Python','Machine Learning','Deep Learning'],
      missingSkills:['NLP','Computer Vision','Cloud','Production Deployment'],
      whyRecommended:'Your emerging deep learning interest and Python proficiency are a good foundation for AI Engineering.',
      recommendedTech:['HuggingFace','OpenCV','LangChain','FastAPI','Docker'],
      courses:[3,4,7],
      certifications:[2],
      projects:[2,3]
    }
  ],

  // ─── Assessment Questions ─────────────────
  questions: [
    // Aptitude (1-5)
    { id:1,  category:'Aptitude',    q:'If 5 engineers can complete a project in 10 days, how many days will 10 engineers take?', options:['2 days','5 days','8 days','10 days'], answer:1 },
    { id:2,  category:'Aptitude',    q:'What comes next: 2, 6, 12, 20, 30, ?', options:['40','42','44','36'], answer:1 },
    { id:3,  category:'Aptitude',    q:'A train travels 360 km in 4 hours. What is its speed in km/h?', options:['80','90','100','120'], answer:1 },
    { id:4,  category:'Aptitude',    q:'Which is the odd one out: 121, 144, 169, 175, 196?', options:['121','144','169','175'], answer:3 },
    { id:5,  category:'Aptitude',    q:'If you invest ₹10,000 at 10% annual interest, what amount after 2 years (compound)?', options:['₹12,000','₹12,100','₹11,000','₹12,500'], answer:1 },
    // Technical (6-10)
    { id:6,  category:'Technical',   q:'What is the time complexity of Binary Search?', options:['O(n)','O(log n)','O(n log n)','O(1)'], answer:1 },
    { id:7,  category:'Technical',   q:'Which data structure uses LIFO (Last In First Out)?', options:['Queue','Stack','Linked List','Array'], answer:1 },
    { id:8,  category:'Technical',   q:'What does SQL stand for?', options:['Structured Query Language','Simple Query Language','Sequential Query Language','Standard Query Logic'], answer:0 },
    { id:9,  category:'Technical',   q:'Which of the following is NOT an OOP concept?', options:['Inheritance','Polymorphism','Compilation','Encapsulation'], answer:2 },
    { id:10, category:'Technical',   q:'What does API stand for?', options:['Application Programming Interface','Advanced Programming Integration','Automated Process Interface','Application Process Integration'], answer:0 },
    // Problem Solving (11-15)
    { id:11, category:'Problem Solving', q:'You have a bug in production affecting 1000 users. What is your first step?', options:['Immediately push a hotfix','Identify the root cause','Roll back to previous version','Ignore it and wait'], answer:1 },
    { id:12, category:'Problem Solving', q:'Which approach best describes divide and conquer?', options:['Solve everything at once','Break into smaller subproblems, solve each','Try random solutions','Use brute force'], answer:1 },
    { id:13, category:'Problem Solving', q:'To find the most efficient algorithm, you should primarily consider:', options:['Lines of code','Time and space complexity','Programming language used','Number of functions'], answer:1 },
    { id:14, category:'Problem Solving', q:'A client wants a feature by tomorrow but it needs 3 days. You:', options:['Promise delivery tomorrow','Explain timeline and propose MVP','Do nothing','Ask a colleague'], answer:1 },
    { id:15, category:'Problem Solving', q:'You receive ambiguous requirements. You should:', options:['Start coding immediately','Ask clarifying questions','Guess the requirements','Skip the task'], answer:1 },
    // Personality (16-20)
    { id:16, category:'Personality',  q:'When working in a team, you prefer to:', options:['Work alone mostly','Lead and coordinate others','Follow instructions precisely','Adapt based on team needs'], answer:3 },
    { id:17, category:'Personality',  q:'When facing a challenging problem, you:', options:['Give up quickly','Research and try multiple approaches','Ask for help immediately','Wait for someone else'], answer:1 },
    { id:18, category:'Personality',  q:'You are most motivated by:', options:['High salary only','Creating impactful solutions','Job security only','Minimal responsibilities'], answer:1 },
    { id:19, category:'Personality',  q:'How do you handle deadline pressure?', options:['Panic and freeze','Stay calm and prioritize tasks','Work randomly','Blame others'], answer:1 },
    { id:20, category:'Personality',  q:'You receive critical feedback on your work. You:', options:['Get defensive','Ignore it','Analyze and improve','Feel discouraged'], answer:1 },
    // Career (21-25)
    { id:21, category:'Career',       q:'Which area excites you the most?', options:['Building AI/ML models','Designing beautiful UIs','Managing cloud infrastructure','Analyzing business data'], answer:0 },
    { id:22, category:'Career',       q:'Your preferred work environment?', options:['Remote work','Office with team','Hybrid model','Freelance/Startup'], answer:2 },
    { id:23, category:'Career',       q:'Which project would you enjoy most?', options:['Fraud detection ML system','E-commerce website','Server optimization','Business dashboard'], answer:0 },
    { id:24, category:'Career',       q:'In 5 years you see yourself as:', options:['Senior AI/ML Engineer','Full Stack Architect','Cloud Architect','Data Science Lead'], answer:0 },
    { id:25, category:'Career',       q:'What matters most in your career?', options:['High compensation','Impact and innovation','Work-life balance','Job stability'], answer:1 }
  ],

  // ─── Courses ─────────────────────────────
  courses: [
    { id:1, name:'Python for Everybody Specialization', provider:'Coursera', skill:'Python', difficulty:'Beginner', duration:'8 weeks', rating:4.8, link:'https://www.coursera.org/specializations/python', free:false },
    { id:2, name:'Machine Learning Specialization',     provider:'Coursera', skill:'Machine Learning', difficulty:'Intermediate', duration:'11 weeks', rating:4.9, link:'https://www.coursera.org/specializations/machine-learning-introduction', free:false },
    { id:3, name:'Deep Learning Specialization',        provider:'Coursera', skill:'Deep Learning', difficulty:'Advanced', duration:'16 weeks', rating:4.9, link:'https://www.coursera.org/specializations/deep-learning', free:false },
    { id:4, name:'TensorFlow Developer Certificate',    provider:'Google', skill:'TensorFlow', difficulty:'Intermediate', duration:'12 weeks', rating:4.7, link:'https://www.coursera.org/professional-certificates/tensorflow-in-practice', free:false },
    { id:5, name:'SQL for Data Science',                provider:'Coursera', skill:'SQL', difficulty:'Beginner', duration:'4 weeks', rating:4.6, link:'https://www.coursera.org/learn/sql-for-data-science', free:false },
    { id:6, name:'Data Analysis with Python',           provider:'freeCodeCamp', skill:'Data Analysis', difficulty:'Beginner', duration:'6 weeks', rating:4.7, link:'https://www.freecodecamp.org/learn/data-analysis-with-python/', free:true },
    { id:7, name:'Natural Language Processing',         provider:'Coursera', skill:'NLP', difficulty:'Advanced', duration:'8 weeks', rating:4.8, link:'https://www.coursera.org/specializations/natural-language-processing', free:false },
    { id:8, name:'AWS Cloud Practitioner Essentials',   provider:'AWS', skill:'AWS', difficulty:'Beginner', duration:'6 weeks', rating:4.7, link:'https://aws.amazon.com/training/learn-about/cloud-practitioner/', free:false },
    { id:9, name:'React - The Complete Guide',          provider:'Udemy', skill:'React', difficulty:'Intermediate', duration:'10 weeks', rating:4.8, link:'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', free:false },
    { id:10, name:'Docker and Kubernetes Bootcamp',     provider:'Udemy', skill:'Docker', difficulty:'Intermediate', duration:'8 weeks', rating:4.7, link:'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/', free:false },
    { id:11, name:'The Web Developer Bootcamp',         provider:'Udemy', skill:'Full Stack', difficulty:'Beginner', duration:'12 weeks', rating:4.8, link:'https://www.udemy.com/course/the-web-developer-bootcamp/', free:false },
    { id:12, name:'Cybersecurity Fundamentals',         provider:'IBM', skill:'Cybersecurity', difficulty:'Beginner', duration:'5 weeks', rating:4.6, link:'https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst', free:false },
    { id:13, name:'Statistics for Data Science',        provider:'edX', skill:'Statistics', difficulty:'Beginner', duration:'6 weeks', rating:4.5, link:'https://www.edx.org/learn/data-science', free:false },
    { id:14, name:'Power BI Masterclass',               provider:'Udemy', skill:'Power BI', difficulty:'Beginner', duration:'4 weeks', rating:4.7, link:'https://www.udemy.com/course/microsoft-power-bi-up-running-with-power-bi-desktop/', free:false },
    { id:15, name:'Flutter & Dart - The Complete Guide',provider:'Udemy', skill:'Flutter', difficulty:'Intermediate', duration:'9 weeks', rating:4.8, link:'https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/', free:false },
    { id:16, name:'MLOps Fundamentals',                 provider:'Google Cloud', skill:'MLOps', difficulty:'Advanced', duration:'7 weeks', rating:4.7, link:'https://www.coursera.org/learn/mlops-fundamentals', free:false },
    { id:17, name:'Git & GitHub Complete Course',       provider:'freeCodeCamp', skill:'Git', difficulty:'Beginner', duration:'3 weeks', rating:4.8, link:'https://www.freecodecamp.org/news/git-and-github-for-beginners/', free:true },
    { id:18, name:'Figma UI/UX Design Essentials',      provider:'Udemy', skill:'Figma', difficulty:'Beginner', duration:'5 weeks', rating:4.7, link:'https://www.udemy.com/course/figma-ux-ui-design-user-experience-tutorial-course/', free:false },
    { id:19, name:'Ethical Hacking Complete Course',    provider:'Udemy', skill:'Cybersecurity', difficulty:'Advanced', duration:'14 weeks', rating:4.7, link:'https://www.udemy.com/course/learn-ethical-hacking-from-scratch/', free:false },
    { id:20, name:'Node.js - The Complete Guide',       provider:'Udemy', skill:'Node.js', difficulty:'Intermediate', duration:'8 weeks', rating:4.8, link:'https://www.udemy.com/course/nodejs-the-complete-guide/', free:false }
  ],

  // ─── Projects (Recommended) ───────────────
  projects: [
    { id:1,  careerId:1, name:'House Price Prediction',            difficulty:'Beginner',     technologies:['Python','Scikit-learn','Pandas','Matplotlib'],    description:'Predict house prices using regression algorithms. Great intro to supervised learning.', skills:['Python','Regression','Data Preprocessing'], duration:'2 weeks' },
    { id:2,  careerId:1, name:'Customer Churn Prediction',         difficulty:'Intermediate', technologies:['Python','XGBoost','SMOTE','Sklearn'],             description:'Classify customers likely to leave using ensemble methods with imbalanced data.', skills:['Classification','Feature Engineering','Ensemble Methods'], duration:'3 weeks' },
    { id:3,  careerId:1, name:'Image Classification CNN',          difficulty:'Advanced',     technologies:['Python','TensorFlow','Keras','OpenCV'],           description:'Build a CNN to classify images using transfer learning.', skills:['Deep Learning','CNN','TensorFlow'], duration:'4 weeks' },
    { id:4,  careerId:2, name:'Exploratory Data Analysis Dashboard',difficulty:'Beginner',    technologies:['Python','Pandas','Matplotlib','Streamlit'],       description:'Analyze a real dataset and visualize insights with an interactive dashboard.', skills:['EDA','Visualization','Pandas'], duration:'2 weeks' },
    { id:5,  careerId:2, name:'Recommendation System',             difficulty:'Intermediate', technologies:['Python','Surprise','Pandas','Cosine Similarity'], description:'Build a movie or product recommender using collaborative filtering.', skills:['Recommendation Systems','Matrix Factorization'], duration:'3 weeks' },
    { id:6,  careerId:3, name:'Sentiment Analysis with BERT',       difficulty:'Advanced',     technologies:['Python','HuggingFace','PyTorch','Streamlit'],      description:'Classify text sentiment using fine-tuned BERT transformer model.', skills:['NLP','Transformers','Fine-tuning'], duration:'4 weeks' },
    { id:7,  careerId:4, name:'To-Do App with React',              difficulty:'Beginner',     technologies:['React','JavaScript','CSS','LocalStorage'],         description:'Build a functional task manager with CRUD operations and local storage.', skills:['React','JavaScript','CSS'], duration:'1 week' },
    { id:8,  careerId:4, name:'Full Stack Blog Platform',           difficulty:'Intermediate', technologies:['React','Node.js','MongoDB','JWT'],                description:'Create a complete blog with authentication, posts, comments and admin panel.', skills:['Full Stack','REST APIs','Authentication'], duration:'4 weeks' },
    { id:9,  careerId:5, name:'AWS 3-Tier Architecture',           difficulty:'Intermediate', technologies:['AWS','EC2','RDS','S3','Load Balancer'],           description:'Deploy a scalable 3-tier web application on AWS with proper VPC setup.', skills:['AWS','Networking','Infrastructure'], duration:'3 weeks' },
    { id:10, careerId:6, name:'Network Vulnerability Scanner',      difficulty:'Advanced',     technologies:['Python','Nmap','Scapy','Kali Linux'],             description:'Build a tool to scan and report network vulnerabilities.', skills:['Security','Networking','Python'], duration:'4 weeks' },
    { id:11, careerId:1, name:'NLP Sentiment Analyzer',             difficulty:'Intermediate', technologies:['Python','NLTK','Sklearn','Flask'],                description:'Classify tweet sentiments using NLP techniques and serve via REST API.', skills:['NLP','Text Classification','API Development'], duration:'3 weeks' },
    { id:12, careerId:1, name:'End-to-End ML Pipeline',             difficulty:'Advanced',     technologies:['Python','MLflow','Docker','Airflow'],             description:'Build a production-ready ML pipeline with experiment tracking and CI/CD.', skills:['MLOps','Docker','CI/CD','Experiment Tracking'], duration:'6 weeks' }
  ],

  // ─── Certifications ───────────────────────
  certifications: [
    { id:1, name:'TensorFlow Developer Certificate',          provider:'Google',     difficulty:'Intermediate', careerId:1, validity:'3 years', prepTime:'3 months',   link:'https://www.tensorflow.org/certificate' },
    { id:2, name:'AWS Certified Machine Learning Specialty',  provider:'Amazon AWS', difficulty:'Advanced',     careerId:1, validity:'3 years', prepTime:'4-6 months', link:'https://aws.amazon.com/certification/certified-machine-learning-specialty/' },
    { id:3, name:'Google Associate Cloud Engineer',           provider:'Google Cloud',difficulty:'Intermediate', careerId:5, validity:'3 years', prepTime:'3 months',   link:'https://cloud.google.com/certification/cloud-engineer' },
    { id:4, name:'AWS Solutions Architect Associate',         provider:'Amazon AWS', difficulty:'Intermediate', careerId:5, validity:'3 years', prepTime:'3 months',   link:'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
    { id:5, name:'Microsoft Azure Fundamentals (AZ-900)',     provider:'Microsoft',  difficulty:'Beginner',     careerId:5, validity:'Lifetime', prepTime:'3-4 weeks', link:'https://learn.microsoft.com/en-us/certifications/azure-fundamentals/' },
    { id:6, name:'Certified Ethical Hacker (CEH)',            provider:'EC-Council',  difficulty:'Advanced',    careerId:6, validity:'3 years', prepTime:'4-6 months', link:'https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/' },
    { id:7, name:'CompTIA Security+',                         provider:'CompTIA',    difficulty:'Intermediate', careerId:6, validity:'3 years', prepTime:'2-3 months', link:'https://www.comptia.org/certifications/security' },
    { id:8, name:'Google Data Analytics Certificate',         provider:'Google',     difficulty:'Beginner',     careerId:2, validity:'Lifetime', prepTime:'6 months',  link:'https://grow.google/certificates/data-analytics/' },
    { id:9, name:'IBM Data Science Professional Certificate', provider:'IBM',        difficulty:'Intermediate', careerId:2, validity:'Lifetime', prepTime:'4 months',  link:'https://www.coursera.org/professional-certificates/ibm-data-science' },
    { id:10, name:'Meta Frontend Developer Certificate',      provider:'Meta',       difficulty:'Intermediate', careerId:4, validity:'Lifetime', prepTime:'7 months',  link:'https://www.coursera.org/professional-certificates/meta-front-end-developer' },
    { id:11, name:'Kubernetes Administrator (CKA)',           provider:'CNCF',       difficulty:'Advanced',     careerId:8, validity:'3 years', prepTime:'3-4 months', link:'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/' },
    { id:12, name:'Microsoft Power BI Data Analyst',          provider:'Microsoft',  difficulty:'Intermediate', careerId:7, validity:'Lifetime', prepTime:'2 months',  link:'https://learn.microsoft.com/en-us/certifications/power-bi-data-analyst-associate/' },
    { id:13, name:'Google UX Design Certificate',             provider:'Google',     difficulty:'Beginner',     careerId:10, validity:'Lifetime', prepTime:'6 months', link:'https://grow.google/certificates/ux-design/' },
    { id:14, name:'Flutter Certified Application Developer',  provider:'Google',     difficulty:'Intermediate', careerId:9, validity:'2 years', prepTime:'2-3 months', link:'https://flutter.dev/learn' },
    { id:15, name:'DeepLearning.AI NLP Specialization',       provider:'DeepLearning.AI', difficulty:'Advanced', careerId:3, validity:'Lifetime', prepTime:'4 months', link:'https://www.deeplearning.ai/courses/natural-language-processing-specialization/' }
  ],

  // ─── Learning Roadmap ─────────────────────
  roadmaps: {
    1: { // ML Engineer
      title:'Machine Learning Engineer',
      stages:[
        { id:1, title:'Python Fundamentals', skills:['Python','Variables','Loops','Functions','OOP'], duration:'4 weeks', resources:['Python.org Docs','Automate the Boring Stuff','CS50P'], completed:true },
        { id:2, title:'Data Manipulation & Analysis', skills:['NumPy','Pandas','Matplotlib','Data Cleaning'], duration:'3 weeks', resources:['Kaggle Pandas Course','Matplotlib Docs'], completed:true },
        { id:3, title:'Statistics & Mathematics', skills:['Probability','Linear Algebra','Statistics','Calculus'], duration:'4 weeks', resources:['Khan Academy','3Blue1Brown'], completed:false },
        { id:4, title:'Machine Learning Fundamentals', skills:['Regression','Classification','Clustering','Sklearn'], duration:'6 weeks', resources:['ML Specialization - Coursera','Hands-On ML Book'], completed:false },
        { id:5, title:'Deep Learning', skills:['Neural Networks','CNN','RNN','TensorFlow','PyTorch'], duration:'6 weeks', resources:['Deep Learning Specialization - Coursera'], completed:false },
        { id:6, title:'Advanced ML Topics', skills:['NLP','Computer Vision','Transformers','Reinforcement Learning'], duration:'8 weeks', resources:['Fast.ai','HuggingFace Docs'], completed:false },
        { id:7, title:'MLOps & Production', skills:['Docker','MLflow','Airflow','CI/CD','AWS SageMaker'], duration:'5 weeks', resources:['MLOps Specialization - Google','Coursera MLOps'], completed:false },
        { id:8, title:'Real-World Projects', skills:['End-to-End Pipeline','Data Collection','Model Deployment'], duration:'8 weeks', resources:['Kaggle Competitions','GitHub Projects'], completed:false },
        { id:9, title:'Interview Preparation', skills:['System Design','ML Interviews','LeetCode','Statistics Review'], duration:'4 weeks', resources:['Grokking ML Interviews','LeetCode'], completed:false },
        { id:10, title:'Job Application & Career Launch', skills:['Resume Building','LinkedIn Optimization','Networking','Portfolio'], duration:'2 weeks', resources:['LinkedIn','Company Career Pages'], completed:false }
      ]
    },
    4: { // Full Stack
      title:'Full Stack Developer',
      stages:[
        { id:1, title:'HTML & CSS Fundamentals', skills:['HTML5','CSS3','Flexbox','Grid','Responsive Design'], duration:'3 weeks', resources:['MDN Web Docs','freeCodeCamp'], completed:true },
        { id:2, title:'JavaScript Core', skills:['ES6+','DOM Manipulation','Async/Await','Promises','Fetch API'], duration:'4 weeks', resources:['JavaScript.info','Eloquent JavaScript'], completed:true },
        { id:3, title:'React Framework', skills:['Components','Hooks','State Management','React Router'], duration:'5 weeks', resources:['React Docs','Scrimba React Course'], completed:false },
        { id:4, title:'Backend with Node.js', skills:['Node.js','Express.js','REST APIs','Authentication','JWT'], duration:'5 weeks', resources:['Node.js Docs','The Odin Project'], completed:false },
        { id:5, title:'Databases', skills:['SQL','MongoDB','PostgreSQL','ORM','Database Design'], duration:'4 weeks', resources:['SQLZoo','MongoDB University'], completed:false },
        { id:6, title:'Full Stack Projects', skills:['MERN Stack','Deployment','Docker Basics','Git'], duration:'6 weeks', resources:['Build real projects','freeCodeCamp'], completed:false },
        { id:7, title:'DevOps Basics', skills:['Git','CI/CD','Linux','Deployment','Hosting'], duration:'3 weeks', resources:['GitHub Actions Docs','Netlify','Vercel'], completed:false },
        { id:8, title:'Interview & Career Launch', skills:['Data Structures','System Design','Portfolio'], duration:'4 weeks', resources:['LeetCode','System Design Primer'], completed:false }
      ]
    }
  },

  // ─── Interview Questions ───────────────────
  interviewQuestions: {
    'ml-engineer': {
      technical: [
        'Explain the difference between supervised and unsupervised learning.',
        'What is overfitting? How do you prevent it?',
        'Explain gradient descent and its variants.',
        'What is the bias-variance tradeoff?',
        'How does a neural network learn? Explain backpropagation.',
        'What is the difference between precision and recall?',
        'Explain regularization techniques (L1 vs L2).',
        'What is cross-validation and why do we use it?',
        'How would you handle imbalanced datasets?',
        'Explain the architecture of a Convolutional Neural Network.'
      ],
      hr: [
        'Tell me about yourself and your interest in ML.',
        'Describe a challenging project you worked on.',
        'How do you stay updated with the latest AI/ML trends?',
        'Where do you see yourself in 5 years in the AI field?',
        'How do you handle working with ambiguous data requirements?'
      ]
    },
    'software-engineer': {
      technical: [
        'Explain Object-Oriented Programming principles.',
        'What is the difference between Stack and Queue?',
        'Explain time complexity with an example.',
        'What is a RESTful API?',
        'Explain SOLID principles.',
        'What is the difference between SQL and NoSQL?',
        'Explain the concept of multithreading.',
        'What is a design pattern? Name three.',
        'How does garbage collection work?',
        'Explain the difference between process and thread.'
      ],
      hr: [
        'Why do you want to be a Software Engineer?',
        'Describe a time you debugged a difficult bug.',
        'How do you handle tight deadlines?',
        'Tell me about a time you worked in a team.',
        'How do you approach learning new technologies?'
      ]
    },
    'data-scientist': {
      technical: [
        'Explain the steps in a data science project lifecycle.',
        'What is the Central Limit Theorem?',
        'Explain the difference between correlation and causation.',
        'How do you deal with missing data?',
        'What is A/B testing?',
        'Explain the difference between Random Forest and Gradient Boosting.',
        'What is dimensionality reduction? Name two techniques.',
        'How would you explain a complex model result to a non-technical stakeholder?',
        'What is feature engineering?',
        'Explain k-fold cross validation.'
      ],
      hr: [
        'What drew you to data science?',
        'Describe a data project you are most proud of.',
        'How do you communicate insights to business teams?',
        'How do you prioritize between multiple competing analyses?',
        'What tools do you use daily?'
      ]
    }
  },

  // ─── Coach responses ──────────────────────
  coachResponses: {
    default: "I'm your AI Career Coach! I can help you with career guidance, skill recommendations, interview tips, and more. Ask me anything about your career journey! 🚀",
    career: "Based on your profile, I recommend exploring **Machine Learning Engineering** or **Data Science**. Your Python skills (85%) and ML knowledge (75%) are strong foundations. Focus on building Deep Learning skills and deploying end-to-end ML projects to boost your profile significantly.",
    skills: "To become competitive in AI/ML roles, prioritize:\n\n1. **Deep Learning** (TensorFlow/PyTorch) – currently your biggest gap\n2. **MLOps** (Docker, MLflow, Airflow) – highly demanded in industry\n3. **Statistics & Mathematics** – foundation for all ML\n4. **SQL Advanced** – improve to 80%+\n\nStart with TensorFlow Developer Certificate on Coursera!",
    projects: "Here are 3 impactful projects to build right now:\n\n🔹 **House Price Prediction** (Beginner) – Regression + EDA basics\n🔹 **Customer Churn Analysis** (Intermediate) – Feature engineering + Ensemble models\n🔹 **End-to-End ML Pipeline** (Advanced) – Docker + MLflow + CI/CD\n\nEach project should include proper README, documentation, and be deployed if possible.",
    certification: "Top certifications for your target ML Engineering career:\n\n✅ **TensorFlow Developer Certificate** (Google) – Most recognized for ML roles\n✅ **AWS ML Specialty** – Excellent for cloud ML deployment roles\n✅ **Machine Learning Specialization** (Coursera + Andrew Ng) – Best for fundamentals\n\nStart with TensorFlow cert as it directly validates your skills!",
    resume: "To improve your resume for ML Engineering roles:\n\n📌 **Add a strong summary** highlighting ML + Python expertise\n📌 **Quantify your projects** – '88% accuracy on student performance prediction'\n📌 **List technical skills** prominently with proficiency levels\n📌 **Add GitHub and LinkedIn** links\n📌 **Include relevant coursework** – ML, Statistics, Python\n\nAvoid: generic descriptions, irrelevant experience, walls of text.",
    interview: "For ML Engineering interviews, expect:\n\n**Technical Round:**\n- ML fundamentals (bias-variance, regularization)\n- Python coding challenges\n- Case studies on model selection\n\n**Tips:**\n- Practice LeetCode (Medium) for DSA\n- Review your projects thoroughly\n- Know your resume inside out\n- Learn to explain models in simple terms",
    ai: "To become an AI Engineer, follow this roadmap:\n\n**Phase 1 (3 months):** Strengthen Python + Math + ML basics\n**Phase 2 (3 months):** Deep Learning, NLP, Computer Vision\n**Phase 3 (3 months):** Production AI (Docker, FastAPI, MLOps)\n**Phase 4 (3 months):** Advanced (LLMs, RAG, fine-tuning)\n\nKey certifications: TensorFlow Dev Cert → AWS ML Specialty",
    salary: "💰 **Average Salaries in India (2024):**\n\n| Role | Fresher | Mid-Level | Senior |\n|------|---------|-----------|--------|\n| ML Engineer | ₹8-15 LPA | ₹18-35 LPA | ₹40-80 LPA |\n| Data Scientist | ₹7-12 LPA | ₹15-30 LPA | ₹35-70 LPA |\n| AI Engineer | ₹10-18 LPA | ₹25-45 LPA | ₹50-100 LPA |\n\nSkills that boost pay: MLOps, LLMs, Cloud (AWS/GCP)",
    roadmap: "Here's your personalized ML Engineer roadmap:\n\n🟢 **Stage 1-2** (Done): Python + Data Analysis\n🔄 **Stage 3** (Current): Statistics + Math for ML\n⬜ **Stage 4-5**: Core ML + Deep Learning (3-4 months)\n⬜ **Stage 6-7**: Advanced ML + MLOps (4-5 months)\n⬜ **Stage 8-10**: Projects + Interview Prep (3 months)\n\n**Total: ~12-14 months to job-ready!**"
  },

  // ─── Curated Tech Jobs ─────────────────────
  jobs: [
    {
      id: 1,
      title: 'Associate Machine Learning Engineer',
      company: 'Razorpay',
      logo: 'R',
      logoBg: '#0284c7',
      location: 'Bangalore, India',
      type: 'Full-time',
      workMode: 'Hybrid',
      experience: '0-2 Years',
      salary: '₹12 - ₹18 LPA',
      salaryMin: 1200000,
      salaryMax: 1800000,
      postedDays: 2,
      careerId: 1,
      category: 'Artificial Intelligence',
      requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'SQL', 'Git', 'FastAPI'],
      description: 'Razorpay is looking for an Associate ML Engineer to join our Fraud Risk & Core Intelligence team. You will build and deploy real-time ML inference pipelines processing millions of transactions daily.',
      perks: ['Health Insurance', '₹50,000 WFH Budget', 'Learning Allowance', 'Stock Options']
    },
    {
      id: 2,
      title: 'Full Stack Engineer (SDE-1)',
      company: 'Zoho Corporation',
      logo: 'Z',
      logoBg: '#e11d48',
      location: 'Chennai, Tamil Nadu',
      type: 'Full-time',
      workMode: 'On-site',
      experience: '0-1 Years (Freshers Welcome)',
      salary: '₹8 - ₹14 LPA',
      salaryMin: 800000,
      salaryMax: 1400000,
      postedDays: 1,
      careerId: 4,
      category: 'Web Development',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'HTML/CSS', 'Git'],
      description: 'Join Zoho CRM engineering to architect scalable frontend components and resilient backend microservices. Opportunity to build software used by 100M+ global users.',
      perks: ['Free Campus Food & Transport', 'No Dress Code', 'Gym & Sports Facilities']
    },
    {
      id: 3,
      title: 'Data Scientist Intern / Junior',
      company: 'Swiggy',
      logo: 'S',
      logoBg: '#ea580c',
      location: 'Bangalore, India',
      type: 'Internship to Full-time',
      workMode: 'Hybrid',
      experience: 'Fresher / Final Year',
      salary: '₹50,000/mo (PPO ₹14 LPA)',
      salaryMin: 600000,
      salaryMax: 1400000,
      postedDays: 3,
      careerId: 2,
      category: 'Data Science',
      requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'Power BI', 'Statistics'],
      description: 'Work with the Delivery Optimization and Consumer Intelligence team at Swiggy. Analyze delivery times, customer churn, and experiment with geospatial demand prediction models.',
      perks: ['Swiggy One Membership', 'Mentorship from Principal Data Scientists', 'PPO Opportunity']
    },
    {
      id: 4,
      title: 'Cloud & DevOps Associate',
      company: 'Freshworks',
      logo: 'F',
      logoBg: '#059669',
      location: 'Chennai, Tamil Nadu',
      type: 'Full-time',
      workMode: 'Hybrid',
      experience: '0-2 Years',
      salary: '₹9 - ₹15 LPA',
      salaryMin: 900000,
      salaryMax: 1500000,
      postedDays: 4,
      careerId: 5,
      category: 'Cloud Computing',
      requiredSkills: ['AWS', 'Linux', 'Docker', 'Kubernetes', 'Python', 'Git'],
      description: 'Manage SaaS infrastructure running on multi-region AWS cloud clusters. Automate CI/CD pipelines, monitor observability metrics, and ensure 99.99% system uptime.',
      perks: ['Wellness Benefits', 'Certification Sponsorship', 'Flexible Working Hours']
    },
    {
      id: 5,
      title: 'Software Engineer - AI Platform',
      company: 'Microsoft IDC',
      logo: 'M',
      logoBg: '#4f46e5',
      location: 'Hyderabad, Telangana',
      type: 'Full-time',
      workMode: 'Hybrid',
      experience: '0-2 Years (College Graduates)',
      salary: '₹18 - ₹26 LPA',
      salaryMin: 1800000,
      salaryMax: 2600000,
      postedDays: 1,
      careerId: 3,
      category: 'Artificial Intelligence',
      requiredSkills: ['Python', 'Deep Learning', 'PyTorch', 'Cloud', 'Git', 'REST APIs'],
      description: 'Be part of Microsoft Azure AI Cognitive Services group. Help build next-generation enterprise copilot integrations and high-throughput vector embedding retrieval engines.',
      perks: ['Comprehensive Relocation Package', 'Health Coverage for Family', 'Annual Stocks (RSU)']
    },
    {
      id: 6,
      title: 'Cybersecurity Associate Analyst',
      company: 'Infosys Cyber Defence',
      logo: 'I',
      logoBg: '#7c3aed',
      location: 'Pune, Maharashtra',
      type: 'Full-time',
      workMode: 'On-site',
      experience: '0-1 Years',
      salary: '₹6.5 - ₹10 LPA',
      salaryMin: 650000,
      salaryMax: 1000000,
      postedDays: 5,
      careerId: 6,
      category: 'Cybersecurity',
      requiredSkills: ['Cybersecurity', 'Networking', 'Linux', 'Python', 'Ethical Hacking'],
      description: 'Monitor enterprise SOC environments, analyze security events, conduct vulnerability assessments, and support incident response teams.',
      perks: ['Global Training Programs', 'Shift Allowances', 'Career Fast-Track Program']
    },
    {
      id: 7,
      title: 'Frontend React Developer',
      company: 'CRED',
      logo: 'C',
      logoBg: '#09090b',
      location: 'Bangalore, India',
      type: 'Full-time',
      workMode: 'On-site',
      experience: '1-3 Years',
      salary: '₹16 - ₹24 LPA',
      salaryMin: 1600000,
      salaryMax: 2400000,
      postedDays: 2,
      careerId: 4,
      category: 'Web Development',
      requiredSkills: ['JavaScript', 'React', 'HTML/CSS', 'Git', 'Figma'],
      description: 'Craft ultra-polished, 60fps web experiences for millions of premium members. Obsess over micro-interactions, responsive performance, and modern design standards.',
      perks: ['Top-tier MacBook Pro M3', 'Unlimited Book Allowance', 'Catered Gourmet Meals']
    },
    {
      id: 8,
      title: 'Applied AI & NLP Research Intern',
      company: 'Google Research India',
      logo: 'G',
      logoBg: '#dc2626',
      location: 'Bangalore, Karnataka',
      type: 'Internship',
      workMode: 'Hybrid',
      experience: 'Pre-final / Final Year',
      salary: '₹65,000/month',
      salaryMin: 780000,
      salaryMax: 1200000,
      postedDays: 3,
      careerId: 3,
      category: 'Artificial Intelligence',
      requiredSkills: ['Python', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NLP'],
      description: 'Collaborate with Google Research scientists on multilingual language models, low-resource NLP for Indian languages, and efficient neural inference.',
      perks: ['World-class Mentorship', 'Publish Research Papers', 'Direct PPO Pipeline']
    }
  ],

  // ─── Seed Job Applications (Demo Tracker) ───
  seedJobApplications: [
    {
      id: 101,
      jobId: 1,
      company: 'Razorpay',
      role: 'Associate Machine Learning Engineer',
      location: 'Bangalore (Hybrid)',
      salary: '₹14 LPA',
      appliedDate: '2024-09-18',
      status: 'interview', // wishlist | applied | interview | offer | rejected
      nextStep: 'Technical Round 2: ML Pipeline & Case Study',
      nextDate: '2024-10-08',
      notes: 'Hiring manager loved the Student Performance Predictor project. Need to revise FastAPI and latency optimization.'
    },
    {
      id: 102,
      jobId: 2,
      company: 'Zoho Corporation',
      role: 'Full Stack Engineer (SDE-1)',
      location: 'Chennai (On-site)',
      salary: '₹10 LPA',
      appliedDate: '2024-08-25',
      status: 'offer',
      nextStep: 'Acceptance deadline: Oct 15, 2024',
      nextDate: '2024-10-15',
      notes: 'Official offer letter received! Fixed CTC 10 LPA + benefits. Campus joining scheduled for June 2025.'
    },
    {
      id: 103,
      jobId: 3,
      company: 'Swiggy',
      role: 'Data Scientist Intern',
      location: 'Bangalore (Hybrid)',
      salary: '₹50,000/mo',
      appliedDate: '2024-09-28',
      status: 'applied',
      nextStep: 'Awaiting recruiter screening call',
      nextDate: '2024-10-06',
      notes: 'Applied with tailored cover letter emphasizing Python, SQL, and Power BI dashboards.'
    },
    {
      id: 104,
      jobId: 5,
      company: 'Microsoft IDC',
      role: 'Software Engineer - AI Platform',
      location: 'Hyderabad',
      salary: '₹22 LPA',
      appliedDate: '2024-10-01',
      status: 'wishlist',
      nextStep: 'Request referral from Anna Univ alumni on LinkedIn',
      nextDate: '2024-10-05',
      notes: 'Resume tailored with BERT and Transformers projects. Looking for employee referral code.'
    },
    {
      id: 105,
      jobId: 4,
      company: 'Freshworks',
      role: 'Cloud & DevOps Associate',
      location: 'Chennai',
      salary: '₹11 LPA',
      appliedDate: '2024-08-12',
      status: 'rejected',
      nextStep: 'Re-apply in 6 months after AWS Solutions Architect cert',
      nextDate: '',
      notes: 'Cleared initial technical round. Feedback: build more hands-on Kubernetes and Terraform clusters.'
    }
  ]
};

// ─── LocalStorage Helpers ──────────────────────
const Store = {
  init() {
    if (!localStorage.getItem('nxt_initialized')) {
      localStorage.setItem('nxt_users', JSON.stringify(DB.users));
      localStorage.setItem('nxt_userSkills', JSON.stringify(DB.userSkills));
      localStorage.setItem('nxt_userProjects', JSON.stringify(DB.userProjects));
      localStorage.setItem('nxt_userCerts', JSON.stringify(DB.userCertifications));
      localStorage.setItem('nxt_initialized', '1');
    }
  },
  get(key) { try { return JSON.parse(localStorage.getItem('nxt_' + key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem('nxt_' + key, JSON.stringify(val)); },
  getUsers()  {
    let users = this.get('users');
    if (!Array.isArray(users) || users.length === 0) {
      users = DB.users;
      this.set('users', users);
      return users;
    }
    // Ensure default demo users exist
    const hasStudent = users.some(u => u.email.toLowerCase() === 'sudharsan@example.com');
    const hasAdmin = users.some(u => u.email.toLowerCase() === 'admin@nextstep.ai');
    if (!hasStudent || !hasAdmin) {
      DB.users.forEach(dbUser => {
        if (!users.some(u => u.email.toLowerCase() === dbUser.email.toLowerCase())) {
          users.push(dbUser);
        }
      });
      this.set('users', users);
    }
    return users;
  },
  setUsers(u) { this.set('users', u); },
  getUserById(id) { return this.getUsers().find(u => u.id === id); },
  updateUser(id, data) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) { users[idx] = { ...users[idx], ...data }; this.setUsers(users); }
    return users[idx];
  },
  getUserSkills(uid)   { return this.get('userSkills').filter(s => s.userId === uid); },
  setUserSkills(uid, skills) {
    const all = this.get('userSkills').filter(s => s.userId !== uid);
    this.set('userSkills', [...all, ...skills.map(s => ({...s, userId: uid}))]);
  },
  getUserProjects(uid) { return this.get('userProjects').filter(p => p.userId === uid); },
  setUserProjects(uid, projects) {
    const all = this.get('userProjects').filter(p => p.userId !== uid);
    this.set('userProjects', [...all, ...projects.map(p => ({...p, userId: uid}))]);
  },
  getUserCerts(uid)    { return this.get('userCerts').filter(c => c.userId === uid); },
  setUserCerts(uid, certs) {
    const all = this.get('userCerts').filter(c => c.userId !== uid);
    this.set('userCerts', [...all, ...certs.map(c => ({...c, userId: uid}))]);
  },
  getAssessmentResult(uid) { return this.get(`assessment_${uid}`); },
  setAssessmentResult(uid, result) { this.set(`assessment_${uid}`, result); },
  getRoadmapProgress(uid, careerId) { return this.get(`roadmap_${uid}_${careerId}`) || []; },
  setRoadmapProgress(uid, careerId, completed) { this.set(`roadmap_${uid}_${careerId}`, completed); },

  // ─── Resume Store ───────────────────────────
  getResume(uid) {
    const stored = localStorage.getItem(`nxt_resume_${uid}`);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    const user = this.getUserById(uid) || {};
    const skills = this.getUserSkills(uid) || [];
    const projects = this.getUserProjects(uid) || [];
    const certs = this.getUserCerts(uid) || [];
    const defaultResume = {
      template: 'modern',
      targetRole: 'Machine Learning Engineer',
      fullName: user.name || 'SUDHARSAN K',
      title: 'Machine Learning Engineer & Full Stack Developer',
      email: user.email || 'sudharsan@example.com',
      phone: user.phone || '+91 98765 43210',
      location: user.location || 'Chennai, Tamil Nadu, India',
      linkedin: 'linkedin.com/in/sudharsan-k',
      github: 'github.com/sudharsan',
      portfolioUrl: 'sudharsan.dev',
      summary: `Proactive and analytically-minded engineering student with hands-on proficiency in Python, Machine Learning (Scikit-Learn, TensorFlow), and full-stack web applications. Proven track record of developing end-to-end data systems including predictive ML models achieving 88% accuracy. Adept at translating complex datasets into actionable production solutions.`,
      experience: [
        {
          id: 1,
          role: 'Machine Learning & Software Intern',
          company: 'TechCorp Solutions',
          location: 'Bangalore (Remote)',
          startDate: 'May 2024',
          endDate: 'July 2024',
          bullets: [
            'Engineered automated ETL data pipelines in Python & Pandas, reducing data preprocessing latency by 28%.',
            'Collaborated with senior engineers to deploy predictive ML microservices using FastAPI and Docker containers.',
            'Authored unit tests achieving 85%+ code coverage and participated in weekly agile sprint retrospectives.'
          ]
        }
      ],
      education: [
        {
          id: 1,
          degree: user.degree || 'B.E. Mechanical Engineering',
          college: user.college || 'Anna University, Chennai',
          year: '2022 - 2026 (Year 3)',
          cgpa: `CGPA: ${user.cgpa || 8.0} / 10.0`
        }
      ],
      skills: skills.map(s => s.name),
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role || 'Solo Developer',
        technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || ''),
        link: p.link || '',
        bullets: [
          p.description || '',
          'Architected modular architecture with version control using Git, documenting REST APIs and deployment guides.'
        ]
      })),
      certifications: certs.map(c => ({
        id: c.id,
        name: c.name,
        provider: c.provider,
        date: c.date,
        credentialId: c.credentialId || ''
      }))
    };
    this.saveResume(uid, defaultResume);
    return defaultResume;
  },
  saveResume(uid, data) {
    localStorage.setItem(`nxt_resume_${uid}`, JSON.stringify(data));
  },

  // ─── Portfolio Store ────────────────────────
  getPortfolio(uid) {
    const stored = localStorage.getItem(`nxt_portfolio_${uid}`);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    const user = this.getUserById(uid) || {};
    const skills = this.getUserSkills(uid) || [];
    const projects = this.getUserProjects(uid) || [];
    const certs = this.getUserCerts(uid) || [];
    const defaultPortfolio = {
      theme: 'midnight', // midnight | slate | aurora
      title: 'Aspiring AI Engineer & Full Stack Builder',
      tagline: 'Crafting intelligent systems, predictive models, and performant web experiences.',
      about: `Hi! I'm ${user.name || 'Sudharsan'}, an engineering student at ${user.college || 'Anna University'} passionate about artificial intelligence, modern web technologies, and solving impactful real-world challenges. When I am not training models or architecting full-stack web apps, I enjoy solving algorithmic puzzles and building open-source developer tools.`,
      statusBadge: 'Open to Internship & Full-time Opportunities',
      stats: {
        projectsCount: projects.length || 3,
        skillsCount: skills.length || 12,
        cgpa: user.cgpa || 8.0,
        problemsSolved: '280+'
      },
      socials: {
        github: 'https://github.com/sudharsan',
        linkedin: 'https://linkedin.com/in/sudharsan-k',
        email: user.email || 'sudharsan@example.com',
        twitter: 'https://twitter.com',
        leetcode: 'https://leetcode.com'
      }
    };
    this.savePortfolio(uid, defaultPortfolio);
    return defaultPortfolio;
  },
  savePortfolio(uid, data) {
    localStorage.setItem(`nxt_portfolio_${uid}`, JSON.stringify(data));
  },

  // ─── Job Applications Store ─────────────────
  getJobApplications(uid) {
    const stored = localStorage.getItem(`nxt_job_apps_${uid}`);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    const initial = DB.seedJobApplications || [];
    localStorage.setItem(`nxt_job_apps_${uid}`, JSON.stringify(initial));
    return initial;
  },
  saveJobApplications(uid, apps) {
    localStorage.setItem(`nxt_job_apps_${uid}`, JSON.stringify(apps));
  },
  addJobApplication(uid, app) {
    const apps = this.getJobApplications(uid);
    const newApp = {
      id: Date.now(),
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'applied',
      notes: '',
      ...app
    };
    apps.unshift(newApp);
    this.saveJobApplications(uid, apps);
    return newApp;
  },
  updateJobApplication(uid, appId, updates) {
    const apps = this.getJobApplications(uid);
    const idx = apps.findIndex(a => a.id === appId);
    if (idx !== -1) {
      apps[idx] = { ...apps[idx], ...updates };
      this.saveJobApplications(uid, apps);
      return apps[idx];
    }
    return null;
  },
  deleteJobApplication(uid, appId) {
    let apps = this.getJobApplications(uid);
    apps = apps.filter(a => a.id !== appId);
    this.saveJobApplications(uid, apps);
  }
};

// ─── AI Recommendation Engine ─────────────────
const AIEngine = {
  run(userId) {
    const user = Store.getUserById(userId);
    const userSkills = Store.getUserSkills(userId);
    const userProjects = Store.getUserProjects(userId);
    const userCerts = Store.getUserCerts(userId);
    const assessment = Store.getAssessmentResult(userId);

    return DB.careers.map(career => {
      const matchScore = this._calculateMatch(user, userSkills, userProjects, userCerts, assessment, career);
      const matchedSkills = userSkills.filter(us => career.requiredSkills.includes(us.name)).map(s => s.name);
      const missingSkills = career.requiredSkills.filter(rs => !userSkills.find(us => us.name === rs));

      return {
        careerId: career.id,
        careerName: career.name,
        matchScore,
        matchedSkills,
        missingSkills,
        category: career.category,
        icon: career.icon,
        iconBg: career.iconBg,
        iconColor: career.iconColor,
        whyRecommended: this._generateReason(user, matchedSkills, career),
        recommendedTech: career.optionalSkills,
        courses: DB.courses.filter(c => career.requiredSkills.includes(c.skill)).slice(0,4).map(c => c.id),
        certifications: DB.certifications.filter(c => c.careerId === career.id).map(c => c.id),
        projects: DB.projects.filter(p => p.careerId === career.id).map(p => p.id)
      };
    }).sort((a,b) => b.matchScore - a.matchScore).slice(0,5);
  },

  _calculateMatch(user, userSkills, userProjects, userCerts, assessment, career) {
    user = user || {};
    userSkills = Array.isArray(userSkills) ? userSkills : [];
    userProjects = Array.isArray(userProjects) ? userProjects : [];
    userCerts = Array.isArray(userCerts) ? userCerts : [];

    // Skill match (40%)
    const totalRequired = (career.requiredSkills || []).length;
    const matched = userSkills.filter(us => (career.requiredSkills || []).includes(us.name));
    const skillMatch = totalRequired > 0
      ? matched.reduce((sum, s) => sum + (Number(s.proficiency) || 75), 0) / (totalRequired * 100)
      : 0.6;

    // Interest match (20%) - based on department and projects
    const deptKeywords = String(user.department || '').toLowerCase();
    const interestMatch = deptKeywords.includes('computer') || deptKeywords.includes('mechanical')
      ? (career.category === 'Artificial Intelligence' || career.category === 'Data Science' ? 0.88 : 0.65)
      : 0.65;

    // Assessment (15%)
    const rawAssess = assessment && !isNaN(assessment.overall) ? Number(assessment.overall) : (parseFloat(String(user.assessmentScore || '').replace(/[^0-9.]/g, '')) || 70);
    const assessScore = rawAssess / 100;

    // Academic (10%)
    const cleanCgpa = parseFloat(String(user.cgpa || '').replace(/[^0-9.]/g, '')) || 8.0;
    const acadScore = Math.min(cleanCgpa / 10, 1);

    // Projects/Experience (10%)
    const projScore = Math.min((userProjects || []).length / 5, 1);

    // Career preference (5%)
    const prefScore = 0.8;

    const total = (skillMatch * 0.40) + (interestMatch * 0.20) + (assessScore * 0.15) + (acadScore * 0.10) + (projScore * 0.10) + (prefScore * 0.05);
    const result = Math.round(total * 100);
    return isNaN(result) ? 85 : Math.min(result, 98);
  },

  _generateReason(user, matchedSkills, career) {
    const skillStr = matchedSkills.slice(0,3).join(', ') || 'foundational skills';
    return `Your proficiency in ${skillStr} aligns strongly with ${career.name} requirements. Your ${user.department} background combined with a CGPA of ${user.cgpa} demonstrates the analytical foundation needed for this role.`;
  }
};
