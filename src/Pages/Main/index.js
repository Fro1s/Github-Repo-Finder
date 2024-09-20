import { useCallback, useEffect, useState } from 'react';
import { FaBars, FaGithub, FaLink, FaPlus, FaSpinner, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Main() {
    const [newRepo, setNewRepo] = useState('');
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const repoStorage = localStorage.getItem('repos');
        if (repoStorage) {
            setRepositories(JSON.parse(repoStorage));
        }
    }, []);

    useEffect(() => {
        if (repositories.length > 0) {
            localStorage.setItem('repos', JSON.stringify(repositories));
        }
    }, [repositories]);

    function handleInputChange(e) {
        setNewRepo(e.target.value);
    }

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        async function submit() {
            setLoading(true);
            try {
                if (newRepo === '') {
                    toast.error('Digite o nome de um repositório.');
                    return;
                }
                const response = await api.get(`repos/${newRepo}`);

                const hasRepo = repositories.find(repo => repo.name === response.data.full_name);
                if (hasRepo) {
                    toast.error('Repositório já adicionado anteriormente.');
                    return;
                }

                const data = {
                    id: response.data.id,
                    name: response.data.full_name,
                    url: response.data.html_url,
                };

                const updatedRepos = [...repositories, data];
                setRepositories(updatedRepos);
                localStorage.setItem('repos', JSON.stringify(updatedRepos)); 
                setNewRepo('');
            } catch (error) {
                console.error("Error fetching repository:", error);
            } finally {
                setLoading(false);
            }
        }

        submit();
    }, [newRepo, repositories]);

    const handleDelete = useCallback((repo) => {
        const updatedRepos = repositories.filter(r => r.name !== repo);
        setRepositories(updatedRepos);
        localStorage.setItem('repos', JSON.stringify(updatedRepos)); 
    }, [repositories]);

    return (
        <div className="min-h-screen bg-github-background flex flex-col justify-start">
            <div className="flex shadow-black shadow-md flex-col mt-20 rounded-md mx-auto w-1/2 bg-github-text justify-center items-center p-6">
                <h1 className="flex font-bold items-center pt-2 text-3xl">
                    <FaGithub className='size-9 mr-3' />
                    Meus Repositórios Favoritos
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className='flex items-center justify-center py-3 w-full px-4'>
                    <input
                        value={newRepo}
                        onChange={handleInputChange}
                        className="w-1/2 p-2 border border-zinc-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type="text"
                        placeholder="Digite o nome do repositório"
                    />

                    <button
                        className={`cursor-pointer ml-3 p-2 bg-github-background text-white rounded ${loading ? 'opacity-50 p-2 cursor-not-allowed' : ''}`}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaPlus className="size-4" />}
                    </button>
                </form>

                <ul className="flex flex-col px-4 w-full space-y-4">
                    {repositories.map((repo) => (
                        <li key={repo.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 transition duration-200">
                            <span className='flex items-center'>
                                <button type="button" onClick={() => handleDelete(repo.name)}>
                                    <FaTrash className="size-4 mr-2 text-red-600 hover:text-red-800 transition duration-200" />
                                </button>
                                {repo.name}
                            </span>
                            <div className="flex space-x-4">
                                <Link to={`/repositorio/${encodeURIComponent(repo.name)}`}>
                                    <FaBars className="size-5 text-blue-600 hover:text-blue-800 transition duration-200" />
                                </Link>
                                <a href={repo.url} target="_blank" rel="noopener noreferrer">
                                    <FaLink className="size-5 text-blue-600 hover:text-blue-800 transition duration-200" />
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
