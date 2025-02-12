import ProjectForm from "./ProjectForm";
import ProjectTable from "./ProjectTable";
import type { ProjectModel } from '../../models/ProjectModel';
import React, { useState } from 'react';

const ProjectBase: React.FC = () => {

    const [projects, setProjects] = useState<ProjectModel[]>([]);

    const handSetProjects = () => {
        setProjects([...projects]);
    };

    return (
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ProjectForm handSetProjects={handSetProjects} />
            <ProjectTable projects={projects} />
        </div>)
};
export default ProjectBase; 
