import ProjectForm from "./ProjectForm";
import ProjectTable from "./ProjectTable";
import React, { useState } from 'react';

const ProjectBase: React.FC = () => {

    const [projects, setProjects] = useState([
        {
            name: "Proyecto Alfa",
            url: "https://alpha.ejemplo.com",
            technologies: "JavaScript, React, Node.js",
            description: "Breve descripción del proyecto alfa.",
            creationDate: "2023-08-01",
        },
        {
            name: "Proyecto Beta",
            url: "https://beta.ejemplo.com",
            technologies: "Python, Django, SQL",
            description: "Otro proyecto, esta vez construido con Python.",
            creationDate: "2023-08-15",
        },
    ]);

    const handSetProjects = () => {
        setProjects([...projects]);
    };

    return (<div>
        <ProjectForm handSetProjects={handSetProjects} />
        <ProjectTable projects={projects} />
    </div>)
};
export default ProjectBase; 
