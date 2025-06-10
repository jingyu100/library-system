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
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-6 py-8">
                {/* 페이지 제목 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-slate-800 mb-2">도서 검색</h1>
                    <p className="text-slate-600">원하는 도서를 빠르게 찾아보세요</p>
                </div>

                {/* 검색 폼 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">제목</label>
                                <input
                                    type="text"
                                    placeholder="도서 제목을 입력하세요"
                                    value={searchForm.title}
                                    onChange={(e) => setSearchForm({...searchForm, title: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">저자</label>
                                <input
                                    type="text"
                                    placeholder="저자명을 입력하세요"
                                    value={searchForm.author}
                                    onChange={(e) => setSearchForm({...searchForm, author: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">출판사</label>
                                <input
                                    type="text"
                                    placeholder="출판사명을 입력하세요"
                                    value={searchForm.publisher}
                                    onChange={(e) => setSearchForm({...searchForm, publisher: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">정렬 기준</label>
                                    <select
                                        value={searchForm.sortBy}
                                        onChange={(e) => setSearchForm({...searchForm, sortBy: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="title">제목순</option>
                                        <option value="author">저자순</option>
                                        <option value="publishedAt">출간년순</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">정렬 방향</label>
                                    <select
                                        value={searchForm.sortDirection}
                                        onChange={(e) => setSearchForm({...searchForm, sortDirection: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="asc">오름차순</option>
                                        <option value="desc">내림차순</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? '검색 중...' : '검색'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 오류 메시지 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* 검색 결과 */}
                <div className="space-y-4 mb-8">
                    {books.length === 0 && !loading ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-800 mb-2">검색 결과가 없습니다</h3>
                            <p className="text-slate-600">다른 검색어로 다시 시도해보세요</p>
                        </div>
                    ) : (
                        books.map((book) => (
                            <div key={book.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1 space-y-3">
                                        <h3 className="text-xl font-medium text-slate-800">{book.title}</h3>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-500">저자:</span>
                                                <span className="text-slate-700 font-medium">{book.author}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-500">출판사:</span>
                                                <span className="text-slate-700">{book.publisher}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-500">출간년:</span>
                                                <span className="text-slate-700">{book.publishedAt || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-500">가격:</span>
                                                <span className="text-slate-700">{book.price ? `${book.price.toLocaleString()}원` : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 md:ml-6">
                                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                                            book.available
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {book.available ? '대출 가능' : '대출 불가'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="flex justify-center">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                이전
                            </button>

                            {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                const page = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-4 py-2 rounded-lg ${
                                            page === currentPage
                                                ? 'bg-indigo-600 text-white'
                                                : 'border border-slate-300'
                                        }`}
                                    >
                                        {page + 1}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSearchPage;