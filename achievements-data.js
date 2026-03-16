const achievementsData = [
    {
        id: "se-projects",
        icon: "fas fa-code-branch",
        title: "Software Engineering Projects",
        description: "Successfully completed multiple software engineering projects, focusing on scalable architectures and clean code."
    },
    {
        id: "essay-competitions",
        icon: "fas fa-pen-nib",
        title: "Essay Writing Competitions",
        description: "Participated in various essay writing competitions, demonstrating strong communication and analytical skills."
    },
    {
        id: "ai-security-systems",
        icon: "fas fa-shield-alt",
        title: "AI & Security Systems",
        description: "Built advanced systems integrating Artificial Intelligence with security protocols for enhanced threat detection."
    },
    {
        id: "fullstack-mobile",
        icon: "fas fa-mobile-alt",
        title: "Full-Stack Mobile Apps",
        description: "Developed comprehensive full-stack mobile applications using Flutter and MERN stack for diverse industries."
    }
];

// Export for usage (Universal check)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = achievementsData;
}
