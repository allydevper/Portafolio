export interface ProjectModel {
    id: number;
    name: string;
    url_project: string;
    url_demo?: string;
    description: string;
    technologies: string[];
    create_date?: Date;
} 