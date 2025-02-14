import React from 'react';
import type { ProjectModel } from '../../models/project.model';

interface ProjectTableProps {
    handleDelete: (id: number) => void;
    handleEdit: (project: ProjectModel) => void;
    projects: ProjectModel[];
    loading: boolean;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, loading, handleDelete, handleEdit }) => {

    return (
        <div className="bg-gray-800 dark:bg-gray-800 shadow-xl rounded-lg lg:col-span-2">
            <div className="px-6 py-4 bg-gray-700 dark:bg-gray-700">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-pink-400 dark:text-pink-300">Proyectos Existentes</h3>
                    <div className="inline-flex gap-2">
                        <button className="cursor-pointer hover:bg-gray-600 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 px-3 py-2 transition-colors duration-200">Refrescar</button>
                    </div>
                </div>
            </div>
            <div className="px-6 py-6 overflow-x-auto h-120">
                {
                    (loading) ? <div>Cargando...</div> :
                        <table id="projectTable" className="min-w-full table-auto">
                            <thead className="bg-gray-600 dark:bg-gray-700 border-b border-gray-600 dark:border-gray-700">
                                <tr className="text-gray-300 dark:text-gray-300">
                                    <th className="px-2 font-semibold text-left"></th>
                                    <th className="px-2 font-semibold text-left w-24">NOMBRE</th>
                                    <th className="px-2 font-semibold text-left">REPO</th>
                                    <th className="px-2 font-semibold text-left">DEMO</th>
                                    <th className="px-2 font-semibold text-left w-24">TECNOLOGÍAS</th>
                                    <th className="px-2 font-semibold text-left w-96">DESCRIPCIÓN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.length > 0 ? (
                                    projects.map((project, index) => (
                                        <tr key={index} className="hover:bg-gray-700 dark:hover:bg-gray-700 border-b border-gray-600 dark:border-gray-700">
                                            <td className="py-4 px-4">
                                                <button onClick={() => handleDelete(project.id)} aria-label="Eliminar proyecto" className="cursor-pointer text-red-500 hover:text-white flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M20 6a1 1 0 0 1 .117 1.993l-.117 .007h-.081l-.919 11a3 3 0 0 1 -2.824 2.995l-.176 .005h-8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-.005 -.167l-.923 -11.083h-.08a1 1 0 0 1 -.117 -1.993l.117 -.007h16z" /><path d="M14 2a2 2 0 0 1 2 2a1 1 0 0 1 -1.993 .117l-.007 -.117h-4l-.007 .117a1 1 0 0 1 -1.993 -.117a2 2 0 0 1 1.85 -1.995l.15 -.005h4z" /></svg>
                                                </button>
                                                <button onClick={() => handleEdit(project)} aria-label="Editar proyecto" className="cursor-pointer text-white hover:text-white flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" /><path d="M16 5l3 3" /></svg>
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 font-medium text-white dark:text-white w-24">{project.name}</td>
                                            <td className="py-4 px-4">
                                                <a href={project.url_project} target='_blank' className="cursor-pointer text-gray-400 hover:text-white flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-brand-github">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                        <path d="M5.315 2.1c.791 -.113 1.9 .145 3.333 .966l.272 .161l.16 .1l.397 -.083a13.3 13.3 0 0 1 4.59 -.08l.456 .08l.396 .083l.161 -.1c1.385 -.84 2.487 -1.17 3.322 -1.148l.164 .008l.147 .017l.076 .014l.05 .011l.144 .047a1 1 0 0 1 .53 .514a5.2 5.2 0 0 1 .397 2.91l-.047 .267l-.046 .196l.123 .163c.574 .795 .93 1.728 1.03 2.707l.023 .295l.007 .272c0 3.855 -1.659 5.883 -4.644 6.68l-.245 .061l-.132 .029l.014 .161l.008 .157l.004 .365l-.002 .213l-.003 3.834a1 1 0 0 1 -.883 .993l-.117 .007h-6a1 1 0 0 1 -.993 -.883l-.007 -.117v-.734c-1.818 .26 -3.03 -.424 -4.11 -1.878l-.535 -.766c-.28 -.396 -.455 -.579 -.589 -.644l-.048 -.019a1 1 0 0 1 .564 -1.918c.642 .188 1.074 .568 1.57 1.239l.538 .769c.76 1.079 1.36 1.459 2.609 1.191l.001 -.678l-.018 -.168a5.03 5.03 0 0 1 -.021 -.824l.017 -.185l.019 -.12l-.108 -.024c-2.976 -.71 -4.703 -2.573 -4.875 -6.139l-.01 -.31l-.004 -.292a5.6 5.6 0 0 1 .908 -3.051l.152 -.222l.122 -.163l-.045 -.196a5.2 5.2 0 0 1 .145 -2.642l.1 -.282l.106 -.253a1 1 0 0 1 .529 -.514l.144 -.047l.154 -.03z" />
                                                    </svg>
                                                </a>
                                            </td>
                                            <td className="py-4 px-4">
                                                {
                                                    !project.url_demo ? "" :
                                                        <a href={project.url_project} target='_blank' className="cursor-pointer text-gray-400 hover:text-white flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-world"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M3.6 9h16.8" /><path d="M3.6 15h16.8" /><path d="M11.5 3a17 17 0 0 0 0 18" /><path d="M12.5 3a17 17 0 0 1 0 18" /></svg>
                                                        </a>
                                                }
                                            </td>
                                            <td className="py-4 px-4 text-gray-400 dark:text-gray-400 w-24">{project.technologies.join(', ')}</td>
                                            <td className="py-4 px-4 text-gray-400 dark:text-gray-400 w-96">{project.description}</td>
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