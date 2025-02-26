import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getProjectsByPage } from '../services/project.service';
import type { ProjectModel } from '@/models/project.model';
import { AllTechImages } from '@/constants/imagesPath';
import { showToastFront } from '@/lib/customToast';
import Pagination from './Pagination';
import Skeleton from 'react-loading-skeleton';

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
                    <div className="space-y-4">
                        {[...Array(projectsPerPage)].map((_, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-4">
                                <Skeleton height={96} width={192} />
                                <div className="flex-1 flex flex-col space-y-2">
                                    <Skeleton height={24} width="60%" />
                                    <Skeleton height={16} count={2} />
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex space-x-2">
                                            {[...Array(3)].map((_, i) => (
                                                <Skeleton key={i} circle={true} height={24} width={24} />
                                            ))}
                                        </div>
                                        <div className="ml-auto flex space-x-2">
                                            <Skeleton height={32} width={64} />
                                            <Skeleton height={32} width={64} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                                                className="px-4 py-2 bg-yellow-300 text-black font-bold rounded-md transition duration-300 cursor-pointer"
                                            >
                                                Demo
                                            </a>
                                        )}
                                        <a
                                            href={project.url_project}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-gray-200 text-black font-bold rounded-md hover:bg-yellow-300 transition duration-300 cursor-pointer flex items-center space-x-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-github">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
                                            </svg>
                                            <span>Código</span>
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
