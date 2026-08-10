// Some WordPress uploads 403 on myrocky.com / www.myrocky.com; the backend
// host wpbe.myrocky.com serves them. We keep the original URL as primary and
// only swap to the backup host when an image actually fails to load.
const UPLOAD_HOST = /:\/\/(?:www\.)?myrocky\.com\/wp-content\/uploads/g;
const BACKUP = "://wpbe.myrocky.com/wp-content/uploads";

export function toBackupHost(value) {
  if (!value) return value;
  return value.replace(UPLOAD_HOST, BACKUP);
}

// True when the URL points at a WP upload on the primary host (i.e. rewritable).
export function hasBackupHost(value) {
  return !!value && value !== toBackupHost(value);
}

// Swap a raw <img> element's src + srcset to the backup host on load error.
// Used for blog body images injected via dangerouslySetInnerHTML.
export function applyBackupHostToImg(img) {
  if (!img || img.dataset.backupApplied) return;
  const src = img.getAttribute("src");
  const srcset = img.getAttribute("srcset");
  const nextSrc = toBackupHost(src);
  const nextSrcset = toBackupHost(srcset);
  if (nextSrc === src && nextSrcset === srcset) return;
  img.dataset.backupApplied = "1";
  if (nextSrcset) img.setAttribute("srcset", nextSrcset);
  if (nextSrc) img.setAttribute("src", nextSrc);
}
