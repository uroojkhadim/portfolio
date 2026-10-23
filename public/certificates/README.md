# Internship Certificates Directory

Place your official internship certificates or credential verification documents here:
- Supported formats: `.pdf`, `.png`, `.jpg`, `.webp`
- Example: `public/certificates/internship_certificate.pdf`

Then open `src/data/experience.js` and set:
```javascript
certificateUrl: '/certificates/internship_certificate.pdf',
certificateType: 'pdf', // or 'image'
```

The portfolio's Experience section will automatically render a **View Certificate** button and open an interactive preview modal or direct PDF viewer!
