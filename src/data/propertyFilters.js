/** Client-side filters mirroring previous Supabase query behavior */

export function sortProperties(list, sortBy) {
  const out = [...list];
  switch (sortBy) {
    case "price-low":
      out.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      out.sort((a, b) => b.price - a.price);
      break;
    case "bedrooms":
      out.sort((a, b) => b.bedrooms - a.bedrooms);
      break;
    case "newest":
    default:
      out.sort((a, b) => b.id - a.id);
      break;
  }
  return out;
}

export function applySaleFilters(list, filters) {
  let result = [...list];
  const q = (filters.searchQuery || "").trim().toLowerCase();
  if (q) {
    result = result.filter((p) =>
      [p.title, p.location, p.description].some((f) =>
        (f || "").toLowerCase().includes(q)
      )
    );
  }

  if (filters.selectedLocations?.length) {
    result = result.filter((p) =>
      filters.selectedLocations.some((loc) =>
        (p.location || "").toLowerCase().includes(loc.toLowerCase())
      )
    );
  }

  const pr = filters.selectedPriceRange;
  if (pr === "below50k") {
    result = result.filter((p) => p.price < 50000);
  } else if (pr === "50k-150k") {
    result = result.filter((p) => p.price >= 50000 && p.price <= 150000);
  } else if (pr === "above150k") {
    result = result.filter((p) => p.price > 150000);
  } else if (pr === "custom" && filters.customPriceRange) {
    const { min, max } = filters.customPriceRange;
    result = result.filter((p) => p.price >= min && p.price <= max);
  }

  if (filters.selectedBedrooms && filters.selectedBedrooms !== "Any") {
    const min = parseInt(filters.selectedBedrooms, 10);
    if (!Number.isNaN(min)) {
      result = result.filter((p) => p.bedrooms >= min);
    }
  }

  if (filters.selectedBathrooms && filters.selectedBathrooms !== "Any") {
    const min = parseInt(filters.selectedBathrooms, 10);
    if (!Number.isNaN(min)) {
      result = result.filter((p) => p.bathrooms >= min);
    }
  }

  const yb = filters.selectedYearBuilt;
  if (yb === "2020+") {
    result = result.filter((p) => p.year_built >= 2020);
  } else if (yb === "Before 2020") {
    result = result.filter((p) => p.year_built < 2020);
  } else if (yb && yb !== "Any") {
    const y = parseInt(yb, 10);
    if (!Number.isNaN(y)) {
      result = result.filter((p) => p.year_built === y);
    }
  }

  if (filters.furnishedValue) {
    const fv = filters.furnishedValue.toLowerCase();
    result = result.filter((p) =>
      (p.furnished || "").toLowerCase().includes(fv)
    );
  }

  if (filters.selectedAmenities?.length) {
    result = result.filter((p) =>
      filters.selectedAmenities.every((a) => (p.amenities || []).includes(a))
    );
  }

  return sortProperties(result, filters.sortBy);
}

export function applyRentFilters(list, filters) {
  let result = [...list];
  const q = (filters.searchQuery || "").trim().toLowerCase();
  if (q) {
    result = result.filter((p) =>
      [p.title, p.location, p.description].some((f) =>
        (f || "").toLowerCase().includes(q)
      )
    );
  }

  if (filters.selectedLocations?.length) {
    result = result.filter((p) =>
      filters.selectedLocations.some((loc) =>
        (p.location || "").toLowerCase().includes(loc.toLowerCase())
      )
    );
  }

  const pr = filters.selectedPriceRange;
  if (pr === "below500") {
    result = result.filter((p) => p.price < 500);
  } else if (pr === "500-1500") {
    result = result.filter((p) => p.price >= 500 && p.price <= 1500);
  } else if (pr === "above1500") {
    result = result.filter((p) => p.price > 1500);
  } else if (pr === "custom" && filters.customPriceRange) {
    const { min, max } = filters.customPriceRange;
    result = result.filter((p) => p.price >= min && p.price <= max);
  }

  if (filters.selectedBedrooms && filters.selectedBedrooms !== "Any") {
    const min = parseInt(filters.selectedBedrooms, 10);
    if (!Number.isNaN(min)) {
      result = result.filter((p) => p.bedrooms >= min);
    }
  }

  if (filters.selectedBathrooms && filters.selectedBathrooms !== "Any") {
    const min = parseInt(filters.selectedBathrooms, 10);
    if (!Number.isNaN(min)) {
      result = result.filter((p) => p.bathrooms >= min);
    }
  }

  const yb = filters.selectedYearBuilt;
  if (yb === "2020+") {
    result = result.filter((p) => p.year_built >= 2020);
  } else if (yb === "Before 2020") {
    result = result.filter((p) => p.year_built < 2020);
  } else if (yb && yb !== "Any") {
    const y = parseInt(yb, 10);
    if (!Number.isNaN(y)) {
      result = result.filter((p) => p.year_built === y);
    }
  }

  if (filters.furnishedValue) {
    const fv = filters.furnishedValue.toLowerCase();
    result = result.filter((p) =>
      (p.furnished || "").toLowerCase().includes(fv)
    );
  }

  if (filters.selectedAmenities?.length) {
    result = result.filter((p) =>
      filters.selectedAmenities.every((a) => (p.amenities || []).includes(a))
    );
  }

  return sortProperties(result, filters.sortBy);
}
