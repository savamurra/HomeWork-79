export interface Category {
    title: string;
    description: string;
    id: string;
}

export type CategoryWithoutId = Omit<Category, 'id'>

export interface Location {
    location_names: string;
    description: string;
    id: string;
}

export type LocationWithoutId = Omit<Location, 'id'>

export interface Subjects {
    id: string;
    category_id: string;
    location_id: string;
    subject_title: string;
    subject_description: string;
    subject_image: string | null;
    accounting_date: string;
}

export type SubjectWithoutId = Omit<Subjects,'id','accounting_date'>