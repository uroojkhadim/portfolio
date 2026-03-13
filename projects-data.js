const projectsData = [
    {
        id: "pos-inventory",
        title: "POS & Inventory System",
        category: "Mobile App",
        description: "Complete coffee shop management with real-time inventory tracking and sales analytics.",
        longDescription: "A robust mobile application designed for coffee shop owners to manage their business efficiently. It features real-time inventory synchronization, intuitive POS interface for staff, and detailed sales reports for management.",
        tech: ["Flutter", "Node.js", "MongoDB"],
        images: [
            "images/POS-Coffee shop/WhatsApp Image 2026-03-07 at 11.07.48 PM.jpeg",
            "images/POS-Coffee shop/WhatsApp Image 2026-03-07 at 11.07.48 PM (1).jpeg",
            "images/POS-Coffee shop/WhatsApp Image 2026-03-07 at 11.07.48 PM (2).jpeg"
        ],
        features: ["Real-time inventory", "Sales analytics", "Staff management"],
        challenges: "Ensuring real-time synchronization between multiple devices and handling offline transactions.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "task-manager",
        title: "Task Management App",
        category: "Mobile App",
        description: "Productivity tool with task categories, due dates, and progress tracking.",
        longDescription: "A productivity-focused mobile app that helps users organize their daily tasks. Includes category-based filtering, priority levels, and push notifications for reminders.",
        tech: ["Flutter", "Firebase", "Provider"],
        images: [
            "images/Task management/WhatsApp Image 2026-03-07 at 10.56.44 PM.jpeg",
            "images/Task management/WhatsApp Image 2026-03-07 at 10.56.44 PM (1).jpeg"
        ],
        features: ["Task categories", "Push notifications", "Cloud sync"],
        challenges: "Managing state efficiently across complex task lists.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "tasbeeh-app",
        title: "Tasbeeh App",
        category: "Mobile App",
        description: "Digital prayer counter with multiple counters and beautiful UI.",
        longDescription: "A beautifully designed digital counter app that allows users to track their daily zikr. It supports saving multiple counter themes.",
        tech: ["Flutter", "Shared Preferences"],
        images: [
            "images/Tasbeeh App/WhatsApp Image 2026-03-07 at 11.13.53 PM.jpeg",
            "images/Tasbeeh App/WhatsApp Image 2026-03-07 at 11.13.53 PM (1).jpeg"
        ],
        features: ["Multiple saved counters", "Theme options", "History logs"],
        challenges: "Optimizing for low battery consumption while maintaining haptic performance.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "bmi-calc",
        title: "BMI Calculator",
        category: "Mobile App",
        description: "Health tracking tool with BMI categorization and history tracking.",
        longDescription: "A clean and modern BMI calculator that provides instant health assessments based on weight and height.",
        tech: ["Flutter", "Charts"],
        images: [
            "images/BMI calculator/WhatsApp Image 2026-03-07 at 9.52.05 PM.jpeg",
            "images/BMI calculator/WhatsApp Image 2026-03-07 at 9.52.05 PM (1).jpeg"
        ],
        features: ["Unit conversion", "History tracking", "Health tips"],
        challenges: "Creating responsive charts for various screen sizes.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "pos-coffee",
        title: "POS (Coffee Shop)",
        category: "Mobile App",
        description: "Efficient ordering system for fast-paced cafe environments.",
        longDescription: "A localized POS system tailored specifically for small cafes, optimizing the order-taking process for speed.",
        tech: ["Flutter", "SQFlite"],
        images: [
            "images/POS-Coffee shop/WhatsApp Image 2026-03-07 at 11.07.48 PM (3).jpeg"
        ],
        features: ["Quick checkout", "Menu management", "Daily summaries"],
        challenges: "Developing a highly intuitive UI for non-technical staff.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "abaya-shop",
        title: "Abaya Shop",
        category: "Web App",
        description: "E-commerce platform for personalized clothing with cart management.",
        longDescription: "A specialized clothing store platform featuring high-quality product displays and a seamless shopping experience.",
        tech: ["React", "Node.js", "MongoDB"],
        images: [
            "images/Abbaya shop/Screenshot 2026-02-19 123708.png",
            "images/Abbaya shop/Screenshot 2026-02-19 123825.png"
        ],
        features: ["Product catalog", "Shopping cart", "User reviews"],
        challenges: "Implementing advanced product filtering and search.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "custom-gifts",
        title: "Custom Gifts",
        category: "Web App",
        description: "Gift customization platform with live preview tools.",
        longDescription: "An innovative platform allowing users to customize gifts with personalized text and images.",
        tech: ["JavaScript", "HTML/CSS", "PHP"],
        images: [
            "images/custom gifts/Screenshot 2026-02-19 151519.png",
            "images/custom gifts/Screenshot 2026-02-19 151741.png"
        ],
        features: ["Design tools", "Order management", "Secure checkout"],
        challenges: "Generating accurate live previews for custom designs.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "quiz-master",
        title: "Quiz Master",
        category: "Web App",
        description: "Interactive learning platform with timed quizzes and scoring.",
        longDescription: "A gamified learning experience where users can test their knowledge in various software engineering topics.",
        tech: ["React", "JavaScript", "CSS"],
        images: [
            "images/quiz Master/Screenshot 2026-03-13 171727.png",
            "images/quiz Master/Screenshot 2026-03-13 171803.png"
        ],
        features: ["Timed challenges", "Global leaderboards", "Categorized quizzes"],
        challenges: "Ensuring cross-browser timer consistency.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "todo-website",
        title: "To-Do Website",
        category: "Web App",
        description: "Minimalist task manager with local storage persistence.",
        longDescription: "A focused productivity web app that uses browser storage to persist tasks without needing a backend account.",
        tech: ["HTML5", "CSS3", "JavaScript"],
        images: [
            "https://placehold.co/800x600/7c3aed/white?text=To-Do+Website"
        ],
        features: ["Drag and drop", "State persistence", "Filter by status"],
        challenges: "Implementing smooth drag-and-drop interactions.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "doctor-appointment",
        title: "Doctor Appointment System",
        category: "Full Stack",
        description: "Healthcare platform for scheduling and patient management.",
        longDescription: "A full-scale medical administration system connecting doctors with patients through a secure portal.",
        tech: ["React", "Node.js", "MongoDB"],
        images: [
            "images/Doctor appointment/Screenshot 2026-03-13 143203.png",
            "images/Doctor appointment/Screenshot 2026-03-13 171424.png"
        ],
        features: ["Booking calendar", "Electronic prescriptions", "SOS Alerts"],
        challenges: "Handling complex scheduling rules to prevent double bookings.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "student-mgmt",
        title: "Student Management System",
        category: "Full Stack",
        description: "Complete administration with attendance and grade tracking.",
        longDescription: "A specialized platform for educational institutions to manage student lifecycle from enrollment to graduation.",
        tech: ["React", "Node.js", "MySQL"],
        images: [
            "images/student-management.png"
        ],
        features: ["Attendance tracking", "Grade calculation", "PDF reports"],
        challenges: "Managing large datasets and complex MySQL joins for reporting.",
        liveLink: "#",
        githubLink: "#"
    },
    {
        id: "food-ordering",
        title: "Online Food Ordering",
        category: "Full Stack",
        description: "E-commerce for restaurants with cart and order tracking.",
        longDescription: "A full-featured delivery platform for restaurants, featuring real-time status updates and payment integration.",
        tech: ["MERN Stack", "Redux"],
        images: [
            "images/online food order/Screenshot 2026-02-26 194153.png",
            "images/online food order/Screenshot 2026-02-26 194257.png"
        ],
        features: ["Menu browsing", "Cart system", "Order tracking"],
        challenges: "Implementing complex state management with Redux for the multi-vendor cart.",
        liveLink: "#",
        githubLink: "#"
    }
];

// Export for usage (Universal check)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = projectsData;
}
