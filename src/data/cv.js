export const CV_PATH = '/cv/Urooj_Khadim_CV.pdf'
export const CV_FILENAME = 'Urooj_Khadim_CV.pdf'

export const RESUME_PATH = '/cv/Urooj_Khadim_Resume.pdf'
export const RESUME_FILENAME = 'Urooj_Khadim_Resume.pdf'

export const documents = {
  cv: {
    title: 'Curriculum Vitae',
    label: 'Download CV',
    path: CV_PATH,
    filename: CV_FILENAME,
    description: 'Detailed overview of academic coursework, projects, technical skills, and background.',
  },
  resume: {
    title: 'Professional Resume',
    label: 'Download Resume',
    path: RESUME_PATH,
    filename: RESUME_FILENAME,
    description: 'Concise, industry-focused summary of development roles, technical competencies, and impact.',
  },
}

// Download anchor props for CV
export const cvDownloadProps = {
  href: CV_PATH,
  download: CV_FILENAME,
  target: '_blank',
  rel: 'noopener noreferrer',
}

// Open / preview props for CV
export const cvOpenProps = {
  href: CV_PATH,
  target: '_blank',
  rel: 'noopener noreferrer',
}

// Download anchor props for Resume
export const resumeDownloadProps = {
  href: RESUME_PATH,
  download: RESUME_FILENAME,
  target: '_blank',
  rel: 'noopener noreferrer',
}

// Open / preview props for Resume
export const resumeOpenProps = {
  href: RESUME_PATH,
  target: '_blank',
  rel: 'noopener noreferrer',
}

// Backward-compatibility aliases
export const cvLinks = {
  path: CV_PATH,
  filename: CV_FILENAME,
  download: CV_PATH,
  openInNewTab: CV_PATH,
}
export const cvAnchorProps = cvDownloadProps
