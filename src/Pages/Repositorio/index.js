import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export default function Repositorio() {
    const { repositorio } = useParams();
    const [repo, setRepo] = useState({});
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('open');

    useEffect(() => {
        async function load() {
            const [repoData, issuesData] = await Promise.all([
                api.get(`/repos/${repositorio}`),
                api.get(`/repos/${repositorio}/issues`, {
                    params: {
                        state: filter,
                        per_page: 5
                    }
                })
            ]);

            setRepo(repoData.data);
            setIssues(issuesData.data);
            setLoading(false);
        }

        load();
    }, [repositorio, filter]);

    useEffect(() => {
        async function paginate() {
            const response = await api.get(`/repos/${repositorio}/issues`, {
                params: {
                    state: filter,
                    per_page: 5,
                    page
                }
            });

            setIssues(response.data);
        }

        paginate();
    }, [repositorio, page, filter]);

    function handlePage(a) {
        setPage(a === 'previous' ? page - 1 : page + 1);
    }

    function handleFilterChange(newFilter) {
        setFilter(newFilter);
        setPage(1);
    }

    if (loading) {
        return <div className="text-white flex justify-center items-center ">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-github-background flex flex-col justify-start">
            <div className="relative mb-10 pb-10 flex shadow-black shadow-md flex-col mt-20 rounded-md mx-auto w-1/2 bg-github-text justify-center items-center">
                <div className="absolute top-0 left-0 m-4">
                    <Link to="/">
                        <FaArrowLeft className='size-8' />
                    </Link>
                </div>

                <img
                    className="rounded-full size-20 mt-20"
                    src={repo.owner.avatar_url}
                    alt={repo.owner.login}
                />
                <h1 className="font-bold text-2xl">{repo.name}</h1>
                <p className="">
                    {repo.description}
                </p>

                <div className="flex space-x-4 my-4">
                    <button
                        className={`px-4 py-2 rounded ${filter === 'open' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                        onClick={() => handleFilterChange('open')}
                    >
                        Open
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${filter === 'closed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                        onClick={() => handleFilterChange('closed')}
                    >
                        Closed
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All
                    </button>
                </div>

                <div>
                    <ul className="space-y-8 p-4">
                        {issues.map(issue => (
                            <li
                                className='flex p-4 space-x-4 items-center bg-white rounded-lg shadow-md hover:bg-gray-50 transition duration-200 min-h-[150px]'
                                key={issue.id}>
                                <img
                                    className="rounded-full w-16 h-16"
                                    src={issue.user.avatar_url}
                                    alt={issue.user.login}
                                />
                                <div className='flex flex-col'>
                                    <a
                                        className="font-bold text-blue-600 hover:underline"
                                        href={issue.html_url}>
                                        {issue.title}
                                    </a>
                                    <div className="flex space-x-2 mt-2">
                                        {issue.labels.map(label => (
                                            <span
                                                key={label.id}
                                                className="bg-gray-200 text-gray-800 text-sm font-semibold px-2 py-1 rounded">
                                                {label.name}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mt-2">{issue.user.login}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex items-center justify-between w-full px-16">
                    <button
                        className={` ${page < 2 ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={page < 2}
                        onClick={() => handlePage('previous')}
                    >
                        <FaArrowLeft className='size-8' />
                    </button>

                    <button
                        className="cursor-pointer"
                        onClick={() => handlePage('next')}
                    >
                        <FaArrowRight className='size-8' />
                    </button>
                </div>
            </div>
        </div>
    );
}