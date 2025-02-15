import React from 'react';

const ProjectsSection = () => {
    return (
        <section id="projects" className="px-8 py-8 bg-black">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-4 text-center text-yellow-300">
                    Ultimos Proyectos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-2xl flex flex-col">
                        <img
                            src="https://raw.githubusercontent.com/ritaxcorreia/react-profile-card/master/src/images/desktop-screenshot.png"
                            alt="Proyecto 1"
                            className="w-full h-32 object-cover rounded-t-2xl"
                        />
                        <div className="p-6">
                            <h3 className="text-xl font-bold">Proyecto 1</h3>
                            <p className="mt-2">
                                Una breve descripción de este increíble proyecto.
                            </p>
                        </div>
                        <div className="w-full flex items-center justify-center bg-white">
                            <div className="p-1 w-10 h-10 mx-1">
                                <img
                                    src="/images/technologies/small/Solid.js.png"
                                    alt="Solid.js"
                                    title="Solid.js"
                                    className="mx-auto"
                                    loading="lazy"
                                    width={100}
                                    height={100}
                                />
                            </div>
                            <div className="p-1 w-10 h-10 mx-1">
                                <img
                                    src="/images/technologies/small/Three.js.png"
                                    alt="Three.js"
                                    title="Three.js"
                                    className="mx-auto"
                                    loading="lazy"
                                    width={100}
                                    height={100}
                                />
                            </div>
                        </div>
                        <div className="p-6 flex justify-end">
                            <button
                                className="px-4 py-2 bg-yellow-300 text-black font-bold rounded-full hover:bg-white hover:text-black transition duration-300 cursor-pointer"
                            >
                                Ver Demo
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-center">
                    <button
                        type="button"
                        className="px-4 py-3 bg-yellow-300 text-black font-bold rounded-full hover:bg-white hover:text-black transition duration-300 cursor-pointer"
                    >
                        Ver todos los proyectos
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ProjectsSection;
