import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getProjectsByPage } from '../services/project.service';
import type { ProjectModel } from '@/models/project.model';
import { AllTechImages } from '@/constants/imagesPath';
import { showToastFront } from '@/lib/customToast';
import Pagination from './Pagination';

const ProjectsPaginationSection = () => {
    const [projects, setProjects] = useState<ProjectModel[]>([]);
    const [totalProjects, setTotalProjects] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage] = useState(4);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const response = await getProjectsByPage(currentPage, projectsPerPage);
                setProjects(response.data);
                setTotalProjects(response.count);
            } catch (error: Error | any) {
                console.error('Error fetching page projects:', error);
                showToastFront(error?.message, 'danger');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [currentPage, projectsPerPage]);

    const paginate = useCallback((pageNumber: number) => setCurrentPage(pageNumber), []);

    const getImagePath = useMemo(() => (tech: string) => {
        return AllTechImages.find((img) => img.title === tech)?.src || '';
    }, []);

    return (
        <span>
            <div className="max-w-4xl mx-auto space-y-4 text-left">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-4">
                            {project.url_cover_image && (
                                <img
                                    src={project.url_cover_image}
                                    alt={project.name}
                                    className="rounded-lg w-48 h-24 object-cover"
                                />
                            )}
                            <div className="flex-1 flex flex-col">
                                <h2 className="text-black text-lg font-semibold">{project.name}</h2>
                                <p className="text-gray-600 text-sm line-clamp-3">{project.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex space-x-2">
                                        {project.technologies.map((tech) => {
                                            const imagePath = getImagePath(tech);
                                            return (
                                                <img
                                                    key={tech}
                                                    src={imagePath}
                                                    alt={tech}
                                                    title={tech}
                                                    className="w-6 h-6"
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="ml-auto flex space-x-2">
                                        {project.url_demo && (
                                            <a
                                                href={project.url_demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600 transition"
                                            >
                                                Ver
                                            </a>
                                        )}
                                        <a
                                            href={project.url_project}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-gray-300 text-gray-800 px-3 py-1 text-sm rounded-md hover:bg-gray-400 transition"
                                        >
                                            Código
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-8 flex justify-center">
                <Pagination
                    projectsPerPage={projectsPerPage}
                    totalProjects={totalProjects}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            </div>
        </span>
    );
};

export default ProjectsPaginationSection;
