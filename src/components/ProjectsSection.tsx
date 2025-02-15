import React, { useEffect, useState } from 'react';
import { getLastestsProjects } from '../services/project.service';
import type { ProjectModel } from '@/models/project.model';
import { AllTechImages } from '@/constants/imagesPath';
import { showToastBackend } from '@/lib/customToast';

const ProjectsSection = () => {
    const [projects, setProjects] = useState<ProjectModel[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getLastestsProjects();
                setProjects(data);
            } catch (error: Error | any) {
                console.error('Error fetching lastests projects:', error);
                showToastBackend(error?.message, 'danger');
            }
        };

        fetchProjects();
    }, []);

    const getImagePath = (tech: string) => {
        return AllTechImages.filter((img) => img.title === tech)[0].src;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
                <div key={project.id} className="bg-gray-800 rounded-2xl flex flex-col h-full">
                    {
                        project.url_cover_image &&
                        <img
                            src={project.url_cover_image}
                            alt={project.name}
                            className="w-full h-44 object-cover rounded-t-2xl"
                        />
                    }
                    <div className="p-6 flex-grow">
                        <h3 className="text-xl font-bold">{project.name}</h3>
                        <p className="mt-2">{project.description}</p>
                    </div>
                    <div className="w-full flex items-center justify-center bg-gray-100 p-4">
                        {project.technologies.map((tech) => {
                            const imagePath = getImagePath(tech);
                            return (
                                <div key={tech} className="p-1 w-10 h-10 mx-1 flex items-center justify-center">
                                    <img
                                        src={imagePath}
                                        alt={tech}
                                        title={tech}
                                        className="mx-auto"
                                        loading="lazy"
                                        width={40}
                                        height={40}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-6 flex justify-between">
                        <a
                            href={project.url_project}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white text-black font-bold rounded-full hover:bg-yellow-300 transition duration-300 cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-github">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
                            </svg>
                        </a>
                        {project.url_demo && (
                            <a
                                href={project.url_demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-yellow-300 text-black font-bold rounded-full hover:bg-white hover:text-black transition duration-300 cursor-pointer"
                            >
                                Ver Demo
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectsSection;
