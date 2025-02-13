import ProjectForm from "./ProjectForm";
import ProjectTable from "./ProjectTable";
import type { ProjectModel } from '../../models/project.model';
import React, { useState, useEffect } from 'react';
import { deleteProject, getProjects } from '../../services/project.service';
import { Toaster } from "sonner";
import { showToast } from "../../lib/customToast";

const ProjectBase: React.FC = () => {

    const [projects, setProjects] = useState<ProjectModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const projects = await getProjects();
                setProjects(projects.sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0)));
            } catch (error: Error | any) {
                console.error('Error fetching projects:', error);
                showToast(error?.message, 'danger');
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    const handSetProjects = (project: ProjectModel) => {
        setProjects([project, ...projects]);
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await deleteProject(id);
            setProjects(projects.filter(p => p.id !== id));
        } catch (error: Error | any) {
            console.error('Error fetching projects:', error);
            showToast(error?.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (<span>
        <Toaster />
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ProjectForm handSetProjects={handSetProjects} />
            <ProjectTable projects={projects} loading={loading} handleDelete={handleDelete} />
        </div>
    </span>)
};
export default ProjectBase;
