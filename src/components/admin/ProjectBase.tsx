import ProjectForm from "./ProjectForm";
import ProjectTable from "./ProjectTable";
import type { ProjectModel } from '../../models/project.model';
import React, { useState, useEffect } from 'react';
import { getProjects } from '../../services/project.service';

const ProjectBase: React.FC = () => {

    const [projects, setProjects] = useState<ProjectModel[]>([]);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const projects = await getProjects();
                setProjects(projects);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        }

        fetchProjects();
    }, []);

    const handSetProjects = (project: ProjectModel) => {
        setProjects([project, ...projects]);
    };

    return (
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ProjectForm handSetProjects={handSetProjects} />
            <ProjectTable projects={projects} />
        </div>)
};
export default ProjectBase;
