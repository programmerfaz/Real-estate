const favKey = (email) => `wh_favourites_${email}`;
const savedSearchesKey = (email) => `wh_saved_searches_${email}`;

export function getFavouriteIds(email) {
  if (!email) return [];
  try {
    const raw = localStorage.getItem(favKey(email));
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

export function setFavouriteIds(email, ids) {
  if (!email) return;
  localStorage.setItem(favKey(email), JSON.stringify(ids));
}

/** Returns the new favourite id list */
export function toggleFavouriteId(email, propertyId) {
  const ids = getFavouriteIds(email);
  const id = Number(propertyId);
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  setFavouriteIds(email, next);
  return next;
}

export function appendSavedSearch(email, searchRecord) {
  if (!email) return;
  try {
    const prev = JSON.parse(localStorage.getItem(savedSearchesKey(email)) || "[]");
    const next = [...(Array.isArray(prev) ? prev : []), searchRecord];
    localStorage.setItem(savedSearchesKey(email), JSON.stringify(next));
  } catch {
    localStorage.setItem(
      savedSearchesKey(email),
      JSON.stringify([searchRecord])
    );
  }
}
