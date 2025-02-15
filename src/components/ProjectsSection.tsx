import React, { useEffect, useState } from 'react';
import { getLastestsProjects } from '../services/project.service';
import type { ProjectModel } from '@/models/project.model';
import { AllTechImages } from '@/constants/imagesPath';
import { showToast } from '@/lib/customToast';

const ProjectsSection = () => {
    const [projects, setProjects] = useState<ProjectModel[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getLastestsProjects();
                setProjects(data);
            } catch (error: Error | any) {
                console.error('Error fetching lastests projects:', error);
                showToast(error?.message, 'danger');
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
                <div key={project.id} className="bg-gray-800 rounded-2xl flex flex-col">
                    {/* <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-32 object-cover rounded-t-2xl"
                    /> */}
                    <div className="p-6">
                        <h3 className="text-xl font-bold">{project.name}</h3>
                        <p className="mt-2">{project.description}</p>
                    </div>
                    <div className="w-full flex items-center justify-center bg-white">
                        {project.technologies.map((tech) => {
                            const imagePath = getImagePath(tech);
                            return (
                                <div key={tech} className="p-1 w-10 h-10 mx-1">
                                    <img
                                        src={imagePath}
                                        alt={tech}
                                        title={tech}
                                        className="mx-auto"
                                        loading="lazy"
                                        width={100}
                                        height={100}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-6 flex justify-end">
                        <button
                            className="px-4 py-2 bg-yellow-300 text-black font-bold rounded-full hover:bg-white hover:text-black transition duration-300 cursor-pointer"
                        >
                            Ver Demo
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectsSection;
