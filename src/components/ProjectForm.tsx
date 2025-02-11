import React from 'react';
import type { ProjectModel } from '../models/ProjectModel';

interface ProjectFormProps {
    handSetProjects: (project: ProjectModel) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ handSetProjects }) => {
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        //handSetProjects();
    };

    return (
        <div className="bg-gray-800 dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-700 dark:bg-gray-700">
                <h3 className="text-xl font-semibold text-pink-400 dark:text-pink-300">
                    Añadir Proyecto Nuevo
                </h3>
            </div>
            <div className="px-6 py-6">
                <form id="projectForm" className="space-y-5" onSubmit={handleSubmit}>
                    {/* Campos del formulario */}
                    <div>
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 dark:text-gray-300">Nombre del Proyecto</label>
                        <input type="text" id="projectName" required placeholder="Nombre del proyecto" className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-300 dark:text-gray-300">URL del Proyecto</label>
                        <input type="url" id="projectUrl" placeholder="https://github.com/allydevper/Portafolio" className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-300 dark:text-gray-300">Descripción</label>
                        <textarea id="projectDescription" placeholder="Breve descripción del proyecto" rows={3} className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white"></textarea>
                    </div>
                    <div>
                        <label htmlFor="projectTechnologies" className="block text-sm font-medium text-gray-300 dark:text-gray-300">Tecnologías</label>
                        <select id="projectTechnologies" multiple className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white custom-select">
                            {/* Opciones de tecnologías */}
                            <option>HTML</option>
                            <option>CSS</option>
                            <option>JavaScript</option>
                            <option>React</option>
                            <option>Node.js</option>
                            <option>Tailwind CSS</option>
                            <option>Vue.js</option>
                            <option>Angular</option>
                            <option>Python</option>
                            <option>Django</option>
                            <option>Flask</option>
                            <option>Ruby on Rails</option>
                            <option>PHP</option>
                            <option>Laravel</option>
                            <option>SQL</option>
                            <option>MongoDB</option>
                            <option>Firebase</option>
                            <option>Next.js</option>
                            <option>Gatsby</option>
                            <option>Svelte</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Selecciona una de las tecnologías aplicables.</p>
                    </div>
                    <div className="mt-6">
                        <button type="submit" className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-purple-800">
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-gray-800 dark:bg-gray-800 rounded-md group-hover:bg-opacity-0 text-white" style={{ cursor: 'pointer' }}>
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