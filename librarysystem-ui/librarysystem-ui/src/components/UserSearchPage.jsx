import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8080';

// 공개 API 함수 (JWT 토큰 불필요)
const publicApiCall = async (url, options = {}) => {
    console.log('Public API Call:', url);

    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            },
            mode: 'cors'
        });

        console.log('Public Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Public Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Public Success response:', data);
        return data;
    } catch (error) {
        console.error('Public API Call Error:', error);
        throw error;
    }
};

const UserSearchPage = () => {
    const navigate = useNavigate();
    const [searchForm, setSearchForm] = useState({
        title: '',
        author: '',
        publisher: '',
        sortBy: 'title',
        sortDirection: 'asc'
    });
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const searchBooks = async (page = 0) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                ...searchForm,
                page: page.toString(),
                size: pageSize.toString()
            });

            // 빈 값들은 제거
            Object.keys(searchForm).forEach(key => {
                if (!searchForm[key] || (key === 'sortBy' || key === 'sortDirection')) {
                    if (!searchForm[key] && key !== 'sortBy' && key !== 'sortDirection') {
                        params.delete(key);
                    }
                }
            });

            const response = await publicApiCall(`/api/public/books/search?${params}`);
            setBooks(response.content || []);
            setCurrentPage(response.number || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error('Search error:', error);
            setError('검색 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setCurrentPage(0);
        searchBooks(0);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        searchBooks(page);
    };

    useEffect(() => {
        searchBooks();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                {/* 네비게이션 */}
                <nav className="flex items-center gap-2 text-sm mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:underline"
                    >
                        홈
                    </button>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-700">도서 검색</span>
                </nav>

                <h1 className="text-3xl font-bold mb-6">도서 검색</h1>

                {/* 검색 폼 */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="제목"
                                value={searchForm.title}
                                onChange={(e) => setSearchForm({...searchForm, title: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="저자"
                                value={searchForm.author}
                                onChange={(e) => setSearchForm({...searchForm, author: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="출판사"
                                value={searchForm.publisher}
                                onChange={(e) => setSearchForm({...searchForm, publisher: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? '검색 중...' : '검색'}
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <select
                                value={searchForm.sortBy}
                                onChange={(e) => setSearchForm({...searchForm, sortBy: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="title">제목순</option>
                                <option value="author">저자순</option>
                                <option value="publishedAt">출간년순</option>
                            </select>
                            <select
                                value={searchForm.sortDirection}
                                onChange={(e) => setSearchForm({...searchForm, sortDirection: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="asc">오름차순</option>
                                <option value="desc">내림차순</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* 오류 메시지 */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* 검색 결과 */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {books.length === 0 && !loading ? (
                        <div className="col-span-2 text-center text-gray-500 py-8">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        books.map((book) => (
                            <div key={book.id} className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-2">{book.title}</h3>
                                <div className="text-gray-600 space-y-1 mb-3">
                                    <p><span className="font-medium">저자:</span> {book.author}</p>
                                    <p><span className="font-medium">출판사:</span> {book.publisher}</p>
                                    <p><span className="font-medium">출간년:</span> {book.publishedAt || 'N/A'}</p>
                                    <p><span
                                        className="font-medium">가격:</span> {book.price ? `${book.price.toLocaleString()}원` : 'N/A'}
                                    </p>
                                </div>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    book.available
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {book.available ? '대출 가능' : '대출 불가'}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                            이전
                        </button>

                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                            const page = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 border border-gray-300 rounded-lg ${
                                        page === currentPage
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    {page + 1}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSearchPage;