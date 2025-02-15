import type { ProjectModel } from "../models/project.model";

export async function getProjects(): Promise<ProjectModel[]> {
    const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/projects`, {
        method: 'GET'
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status} ${text}`);
    }

    return await response.json();
}

export async function getLastestsProjects(): Promise<ProjectModel[]> {
    const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/projects/lastests`, {
        method: 'GET'
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status} ${text}`);
    }

    return await response.json();
}

export async function createProject(project: ProjectModel): Promise<ProjectModel> {

    const { id, ...rest } = project;

    const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rest)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status} ${text}`);
    }
    return await response.json();
}

export async function updateProject(project: ProjectModel): Promise<any> {

    const { id, ...rest } = project;

    const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rest)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status} ${text}`);
    }

    return await response.json();
}

export async function deleteProject(id: number): Promise<void> {
    const response = await fetch(`${import.meta.env.PUBLIC_API_PORTAFOLIO_URL}/projects/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status} ${text}`);
    }
}
