import ProjectForm from "./ProjectForm";
import ProjectTable from "./ProjectTable";
import type { ProjectModel } from '../../models/project.model';
import React, { useState, useEffect } from 'react';
import { deleteProject, getProjects } from '../../services/project.service';
import { Toaster } from "sonner";
import { showToast } from "../../lib/customToast";

const ProjectBase: React.FC = () => {

    const [project, setProject] = useState<ProjectModel>();
    const [projects, setProjects] = useState<ProjectModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const projects = await getProjects();
                setProjects(projects.sort((a, b) => (b.id) - (a.id)));
            } catch (error: Error | any) {
                console.error('Error fetching projects:', error);
                showToast(error?.message, 'danger');
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    const handSetProjects = (project: ProjectModel, id?: number) => {
        if (!id) {
            const index = projects.findIndex(p => p.id === project.id);
            projects[index] = { ...project };
            setProjects([...projects]);
            return;
        } else {
            setProjects([{ ...project, id }, ...projects]);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await deleteProject(id);
            setProjects(projects.filter(p => p.id !== id));
            setProject(undefined)
        } catch (error: Error | any) {
            console.error('Error fetching projects:', error);
            showToast(error?.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (project: ProjectModel) => {
        setProject(project);
    }

    return (<span>
        <Toaster />
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ProjectForm handSetProjects={handSetProjects} project={project} />
            <ProjectTable projects={projects} loading={loading} handleDelete={handleDelete} handleEdit={handleEdit} />
        </div>
    </span>)
};
export default ProjectBase;
