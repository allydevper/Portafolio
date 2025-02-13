import React from 'react';
import type { ProjectModel } from '../../models/project.model';

interface ProjectTableProps {
    handleDelete: (id: number) => void;
    projects: ProjectModel[];
    loading: boolean;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, loading, handleDelete }) => {

    return (
        <div className="bg-gray-800 dark:bg-gray-800 shadow-xl rounded-lg lg:col-span-2">
            <div className="px-6 py-4 bg-gray-700 dark:bg-gray-700">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-pink-400 dark:text-pink-300">Proyectos Existentes</h3>
                    <div className="inline-flex gap-2">
                        <button className="hover:bg-gray-600 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 px-3 py-2 transition-colors duration-200">Refrescar</button>
                        <button className="hover:bg-gray-600 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 px-3 py-2 transition-colors duration-200">Ver Todos</button>
                        <button className="hover:bg-gray-600 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 px-3 py-2 transition-colors duration-200">Eliminar</button>
                    </div>
                </div>
            </div>
            <div className="px-6 py-6 overflow-x-auto h-120">
                {
                    (loading) ? <div>Cargando...</div> :
                        <table id="projectTable" className="min-w-full table-auto">
                            <thead className="bg-gray-600 dark:bg-gray-700 border-b border-gray-600 dark:border-gray-700">
                                <tr className="text-gray-300 dark:text-gray-300">
                                    <th className="py-3 px-4 font-semibold text-left"></th>
                                    <th className="py-3 px-4 font-semibold text-left">NOMBRE</th>
                                    <th className="py-3 px-4 font-semibold text-left">URL</th>
                                    <th className="py-3 px-4 font-semibold text-left">TECNOLOGÍAS</th>
                                    <th className="py-3 px-4 font-semibold text-left">DESCRIPCIÓN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.length > 0 ? (
                                    projects.map((project, index) => (
                                        <tr key={index} className="hover:bg-gray-700 dark:hover:bg-gray-700 border-b border-gray-600 dark:border-gray-700">
                                            <td className="py-4 px-4">
                                                <button onClick={() => handleDelete(project.id ?? 0)} className="text-red-500 hover:text-red-700">Eliminar</button>
                                            </td>
                                            <td className="py-4 px-4 font-medium text-white dark:text-white">{project.name}</td>
                                            <td className="py-4 px-4"><a href={project.url_project} className="text-pink-400 dark:text-pink-300 hover:underline">{project.url_project}</a></td>
                                            <td className="py-4 px-4 text-gray-400 dark:text-gray-400">{project.technologies.join(', ')}</td>
                                            <td className="py-4 px-4 text-gray-400 dark:text-gray-400">{project.description}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-4 px-4 text-center text-gray-400 dark:text-gray-400">No projects available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                }
            </div>
        </div>
    );
};

export default ProjectTable;