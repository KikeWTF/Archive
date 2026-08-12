import references from '../data/api.json';

export interface Reference {
  id: string;
  date: string;
  category: string;
  name: string;
  description: string[] | string;
  url?: string;
  image: string;
  tags?: string[];
  archive?: string;
}

export interface ReferenceGroup {
  category: string;
  references: Reference[];
}

export const allReferences: Reference[] = (references as Omit<Reference, 'id'>[]).map(
  (reference) => ({ ...reference, id: slugify(reference.image) })
);

function slugify(image: string): string {
  return image.replace(/\.[^.]+$/, '');
}

export const allTags: string[] = [
  ...new Set(allReferences.flatMap((reference) => reference.tags ?? [])),
].sort((a, b) => a.localeCompare(b));

export interface TagCount {
  tag: string;
  count: number;
}

export const tagCloud: TagCount[] = Object.entries(
  allReferences.reduce<Record<string, number>>((acc, reference) => {
    for (const tag of reference.tags ?? []) acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {})
)
  .map(([tag, count]) => ({ tag, count }))
  .sort((a, b) => a.tag.localeCompare(b.tag));

export const categoryLabels: Record<string, string> = {
  video: 'Video',
  press: 'Press',
  media: 'Media',
  podcast: 'Podcasts',
};

export function categoryLabel(category: string): string {
  return categoryLabels[category] ?? category;
}

export const featuredSlides: Reference[] = [...allReferences]
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 4);

export const groupsByCategory: ReferenceGroup[] = Object.entries(
  allReferences.reduce<Record<string, Reference[]>>((acc, reference) => {
    if (!acc[reference.category]) acc[reference.category] = [];
    acc[reference.category].push(reference);
    return acc;
  }, {})
)
  .map(([category, refs]) => ({
    category,
    references: refs.sort((a, b) => b.date.localeCompare(a.date)),
  }))
  .sort((a, b) => b.category.localeCompare(a.category));

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
