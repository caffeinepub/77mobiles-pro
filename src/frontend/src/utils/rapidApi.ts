// RapidAPI GSMArena credentials
const RAPIDAPI_KEY = "d50bd35e91mshc6cc3ce01718310p17f6e5jsnb99a94fbcf9a";
const RAPIDAPI_HOST = "mobile-phone-specs-database.p.rapidapi.com";

export interface PhoneSearchResult {
  brand: string;
  phone_name: string;
  key: string;
}

export interface PhoneSpecs {
  phone_name?: string;
  brand?: string;
  image_url?: string;
  color?: string;
  colors?: string[];
  internal_storage?: string;
  memory?: string;
  [key: string]: any;
}

// Search phones by name — returns array of {brand, phone_name, key}
export async function searchPhones(
  query: string,
): Promise<PhoneSearchResult[]> {
  try {
    const res = await fetch(
      `https://mobile-phone-specs-database.p.rapidapi.com/gsm/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Get full specs for a phone by key
export async function getPhoneSpecs(key: string): Promise<PhoneSpecs | null> {
  try {
    const res = await fetch(
      `https://mobile-phone-specs-database.p.rapidapi.com/gsm/spec?key=${encodeURIComponent(key)}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Extract storage options from API spec result
export function extractStorageOptions(specs: PhoneSpecs): string[] {
  const storage = specs.internal_storage || specs.memory || "";
  if (!storage) return [];
  // Pattern: "128GB, 256GB, 512GB"
  const matches = String(storage).match(/\d+\s*GB/gi);
  if (matches) return [...new Set(matches.map((m) => m.replace(/\s/g, "")))];
  return [];
}

// Extract color options from API spec result
export function extractColorOptions(specs: PhoneSpecs): string[] {
  if (Array.isArray(specs.colors)) return specs.colors;
  if (specs.color) {
    return String(specs.color)
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return [];
}
