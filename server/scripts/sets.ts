export interface ScryfallSet {
  code: string;
  parent_set_code?: string;
}

const SECRET_LAIR_ROOT = "sld";

export function findSecretLairSetCodes(sets: ScryfallSet[]): Set<string> {
  const parentOf = new Map(sets.map((set) => [set.code, set.parent_set_code]));

  function descendsFromRoot(code: string): boolean {
    const seen = new Set<string>();
    let current: string | undefined = code;
    while (current && !seen.has(current)) {
      if (current === SECRET_LAIR_ROOT) return true;
      seen.add(current);
      current = parentOf.get(current);
    }
    return false;
  }

  return new Set(sets.map((set) => set.code).filter(descendsFromRoot));
}

export async function fetchSets(headers: Record<string, string>): Promise<ScryfallSet[]> {
  const res = await fetch("https://api.scryfall.com/sets", { headers });
  if (!res.ok) throw new Error(`Failed to fetch sets: ${res.status}`);
  const body = (await res.json()) as { data: ScryfallSet[] };
  return body.data;
}
