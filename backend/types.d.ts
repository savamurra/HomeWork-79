export interface Category {
    title: string;
    description: string;
    id: string;
}

export type CategoryWithoutId = Omit<Category, 'id'>