// Returns a full image URL if available, or null for fallback
// Accepts any possible user image field and name for fallback initial
const API_URL = import.meta.env ? (import.meta.env.VITE_API_URL || "http://localhost:5000") : "";

export default function getProfileImage(user, name) {
  // Accepts either a string (url) or an object (user)
  let url = null;
  if (typeof user === 'string') {
    url = user;
  } else if (user) {
    url = user.profileImageUrl || user.profileImage || user.userProfileImage || null;
  }
  if (url) {
    // If already absolute, return as is
    if (url.startsWith('http')) return url;
    // If relative, prefix with API_URL
    return `${API_URL}${url}`;
  }
  // fallback: null (consumer should show default avatar or initial)
  return null;
}
