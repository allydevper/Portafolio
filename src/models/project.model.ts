export interface ProjectModel {
    id?: number;
    name: string;
    url: string;
    description: string;
    technologies: string[];
    create_date?: Date;
} 