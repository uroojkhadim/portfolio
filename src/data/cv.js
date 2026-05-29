export const CV_PATH = '/cv/Urooj_Khadim_CV.pdf'
export const CV_FILENAME = 'Urooj_Khadim_CV.pdf'

export const cvLinks = {
  path: CV_PATH,
  filename: CV_FILENAME,
  download: CV_PATH,
  openInNewTab: CV_PATH,
}

/** Shared anchor props for download / open CV across the portfolio */
export const cvAnchorProps = {
  href: CV_PATH,
  download: CV_FILENAME,
  target: '_blank',
  rel: 'noopener noreferrer',
}

/** Props for opening CV in a new tab (preview / view) */
export const cvOpenProps = {
  href: CV_PATH,
  target: '_blank',
  rel: 'noopener noreferrer',
}
