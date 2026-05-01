export async function downloadPrefilledStep7Pdf(_values, downloadLink = {}) {
  const href = downloadLink?.href || '/forms/mucm-step-7-sponsor-financial-declaration.pdf'
  const fileName = downloadLink?.fileName || 'mucm-step-7-sponsor-financial-declaration.pdf'

  // Fallback behavior for admin: open the template and let the browser handle download.
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = fileName
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}
