import React, { useEffect, useState } from 'react';
import { getLastestsProjects } from '../services/project.service';

const ProjectsSection = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getLastestsProjects();
                console.log(data);
                setProjects(data);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
                <div key={project.id} className="bg-gray-800 rounded-2xl flex flex-col">
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-32 object-cover rounded-t-2xl"
                    />
                    <div className="p-6">
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <p className="mt-2">{project.description}</p>
                    </div>
                    <div className="w-full flex items-center justify-center bg-white">
                        {project.technologies.map((tech) => (
                            <div key={tech.name} className="p-1 w-10 h-10 mx-1">
                                <img
                                    src={"/public/images/technologies/" + tech.image}
                                    alt={tech.name}
                                    title={tech.name}
                                    className="mx-auto"
                                    loading="lazy"
                                    width={100}
                                    height={100}
                                />
                            </div>
                        ))}
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
