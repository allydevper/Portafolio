import React from 'react';

interface PaginationProps {
    projectsPerPage: number;
    totalProjects: number;
    paginate: (pageNumber: number) => void;
    currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ projectsPerPage, totalProjects, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalProjects / projectsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <nav>
            <ul className="flex space-x-2">
                {pageNumbers.map(number => (
                    <li key={number} className={`page-item ${currentPage === number ? 'bg-yellow-300' : 'bg-white'} rounded-md`}>
                        <button onClick={() => paginate(number)} className="cursor-pointer px-3 py-1 text-gray-800 rounded-md hover:bg-gray-400 transition">
                            {number}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Pagination;
