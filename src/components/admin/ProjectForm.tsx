import React, { useState, useEffect } from 'react';
import type { ProjectModel } from '../../models/project.model';
import Select, { type MultiValue } from 'react-select';
import { AllTechImages } from "../../constants/imagesPath";
import { showToastBackend } from '../../lib/customToast';
import { createProject, updateProject } from '../../services/project.service';

interface ProjectFormProps {
    handSetProjects: (project: ProjectModel, id?: number) => void;
    project: ProjectModel | undefined;
}

interface Option {
    value: string;
    label: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ handSetProjects, project }) => {

    const optionSelect = AllTechImages.map(m => ({ value: m.title, label: m.title }));

    const [formData, setFormData] = useState<ProjectModel>({
        id: 0,
        name: '',
        url_project: '',
        url_demo: '',
        description: '',
        technologies: [],
        url_cover_image: '',
    });

    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

    useEffect(() => {

        if (project && project.id !== 0) {
            setFormData(project);
            setSelectedOptions(project.technologies.map(m => ({ value: m, label: m })));
        } else {
            setFormData({
                id: 0,
                name: '',
                url_project: '',
                url_demo: '',
                description: '',
                technologies: [],
                url_cover_image: '',
            });
            setSelectedOptions([]);
        }
    }, [project]);

    const handleChange = (values: MultiValue<Option>) => {
        setSelectedOptions([...values]);
        setFormData({ ...formData, technologies: [...values.map(m => m.value)] });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        try {
            event.preventDefault();

            if (formData.id > 0) {
                await updateProject(formData);
                handSetProjects(formData);
            } else {
                const response = await createProject(formData);
                handSetProjects(formData, response.id);
            }

            handleResetForm();
        }
        catch (error: Error | any) {
            console.error('Error adding projects:', error);
            showToastBackend(error?.message, 'danger');
        }
    };

    const handleResetForm = () => {
        setFormData({
            id: 0,
            name: '',
            url_project: '',
            url_demo: '',
            description: '',
            technologies: [],
            url_cover_image: '',
        });
        setSelectedOptions([]);
    }

    return (
        <div className="bg-gray-800 dark:bg-gray-800 shadow-xl rounded-lg lg:col-span-1">
            <div className="px-6 py-4 bg-gray-700 dark:bg-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-pink-400 dark:text-pink-300">
                    {formData.id > 0 ? 'Actualizar Proyecto' : 'Añadir Proyecto Nuevo'}
                </h3>
                <button type="button" className="cursor-pointer hover:bg-gray-600 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 px-3 py-2 transition-colors duration-200"
                    onClick={() => handleResetForm()}>
                    Nuevo
                </button>
            </div>
            <div className="px-6 py-6">
                <form id="projectForm" className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 dark:text-gray-300">Nombre del Proyecto</label>
                        <input type="text" id="projectName" required placeholder="Nombre del proyecto"
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-300 dark:text-gray-300">URL del Proyecto</label>
                        <input type="url" id="projectUrl" required placeholder="https://github.com/allydevper/Portafolio"
                            value={formData.url_project || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, url_project: e.target.value }))}
                            className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-300 dark:text-gray-300">URL de la demo</label>
                        <input type="url" id="demoUrl" placeholder="https://demo.com"
                            value={formData.url_demo || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, url_demo: e.target.value }))}
                            className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-300 dark:text-gray-300">URL de la Imagen de Portada</label>
                        <input type="url" id="coverImageUrl" placeholder="https://imageurl.com"
                            value={formData?.url_cover_image || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, url_cover_image: e.target.value }))}
                            className="mt-1 p-2 block w-full rounded-md border-gray-600 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-700 dark:bg-gray-700 text-white dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-300 dark:text-gray-300">Descripción</label>
                        <textarea id="projectDescription" required placeholder="Breve descripción del proyecto" rows={3}
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                            value={selectedOptions}
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
                                {formData.id > 0 ? 'Actualizar' : 'Crear'} Proyecto
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;