import React, { useState } from 'react';
import type { ProjectModel } from '../../models/ProjectModel';
import Select, { type MultiValue } from 'react-select';
import { AllTechImages } from "../../constants/imagesPath";

interface ProjectFormProps {
    handSetProjects: (project: ProjectModel) => void;
}

interface Option {
    value: string;
    label: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ handSetProjects }) => {
    const [projectName, setProjectName] = useState<string>('');
    const [projectUrl, setProjectUrl] = useState<string>('');
    const [projectDescription, setProjectDescription] = useState<string>('');
    const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const newProject: ProjectModel = {
            name: projectName,
            url: projectUrl,
            description: projectDescription,
            technologies: selectedTechnologies,
        };
        handSetProjects(newProject);
        console.log(newProject);
    };

    const optionSelect = AllTechImages.map(m => ({ value: m.title, label: m.title }));

    const handleChange = (values: MultiValue<Option>) => {
        setSelectedTechnologies(values.map(m => m.value));
    };

    return (
        <div className="bg-gray-800 dark:bg-gray-800 shadow-xl rounded-lg lg:col-span-1">
            <div className="px-6 py-4 bg-gray-700 dark:bg-gray-700">
                <h3 className="text-xl font-semibold text-pink-400 dark:text-pink-300">
                    Añadir Proyecto Nuevo
                </h3>
            </div>
            <div className="px-6 py-6">
                <form id="projectForm" className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 dark:text-gray-300">Nombre del Proyecto</label>
                        <input type="text" id="projectName" required placeholder="Nombre del proyecto"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-300 dark:text-gray-300">URL del Proyecto</label>
                        <input type="url" id="projectUrl" required placeholder="https://github.com/allydevper/Portafolio"
                            value={projectUrl}
                            onChange={(e) => setProjectUrl(e.target.value)}
                            className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-300 dark:text-gray-300">Descripción</label>
                        <textarea id="projectDescription" required placeholder="Breve descripción del proyecto" rows={3}
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white"></textarea>
                    </div>
                    <div>
                        <label htmlFor="projectTechnologies" className="block text-sm font-medium text-gray-300 dark:text-gray-300">Tecnologías</label>
                        <Select
                            isMulti
                            inputId="projectTechnologies"
                            instanceId="projectTechnologies"
                            options={optionSelect}
                            classNamePrefix="react-select"
                            closeMenuOnSelect={false}
                            placeholder="Seleccionar"
                            onChange={handleChange}
                            required
                            styles={{
                                control: () => ({}),
                                option: () => ({}),
                                input: () => ({}),
                            }}
                        />
                        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Selecciona una o más tecnologías aplicables.</p>
                    </div>
                    <div className="mt-6">
                        <button type="submit" className="cursor-pointer relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-purple-800 w-full">
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 rounded-md group-hover:bg-opacity-0 text-white">
                                Crear Proyecto
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm; 