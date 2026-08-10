// WordPress uploads on myrocky.com / www.myrocky.com return 403; the backend
// host wpbe.myrocky.com serves them. Rewrite upload URLs to the working host.
// Works on plain URLs and on full HTML strings (rewrites every src/srcset match).
const UPLOAD_HOST = /:\/\/(?:www\.)?myrocky\.com\/wp-content\/uploads/g;
const BACKUP = "://wpbe.myrocky.com/wp-content/uploads";

export function toBackupHost(value) {
  if (!value) return value;
  return value.replace(UPLOAD_HOST, BACKUP);
}
