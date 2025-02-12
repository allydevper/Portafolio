import type { ProjectModel } from "../models/project.model";

export async function getProjects() {
    const response = await fetch('http://localhost:3000/api/v1/projects', {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

export async function createProject(project: ProjectModel) {
    const response = await fetch('http://localhost:3000/api/v1/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'insomnia/10.3.0'
        },
        body: JSON.stringify(project)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

export async function updateProject(id: number, project: ProjectModel) {
    const response = await fetch(`http://localhost:3000/api/v1/projects/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'insomnia/10.3.0'
        },
        body: JSON.stringify(project)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

export async function deleteProject(id: number) {
    const response = await fetch(`http://localhost:3000/api/v1/projects/${id}`, {
        method: 'DELETE',
        headers: {
            'User-Agent': 'insomnia/10.3.0'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}
