const blogData = [
    {
        id: "rest-api-dev",
        title: "Understanding REST API Development",
        description: "A comprehensive guide to building scalable APIs using modern REST principles and best practices.",
        readMoreLink: "#"
    },
    {
        id: "react-native-intro",
        title: "Introduction to Mobile App Development with React Native",
        description: "Learn how to build cross-platform mobile applications using JavaScript and the React ecosystem.",
        readMoreLink: "#"
    },
    {
        id: "cybersecurity-basics",
        title: "Basics of Cybersecurity for Beginners",
        description: "Essential security concepts every developer should know to protect their applications from common threats.",
        readMoreLink: "#"
    },
    {
        id: "ai-security-systems",
        title: "How AI Can Improve Security Systems",
        description: "Exploring the intersection of Artificial Intelligence and Cybersecurity for smarter threat detection.",
        readMoreLink: "#"
    }
];

// Export for usage (Universal check)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = blogData;
}
