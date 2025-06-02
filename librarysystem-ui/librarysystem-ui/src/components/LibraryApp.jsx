import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, FileText, Settings, LogOut, Plus, Edit, Trash2, BarChart3, AlertTriangle } from 'lucide-react';

// API 기본 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 일반 API 헬퍼 함수 (JWT 토큰 필요)
const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // 토큰 만료 시 로그아웃 처리
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
};

// 로그인 전용 API 함수 (JWT 토큰 불필요)
const loginApiCall = async (url, options = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Login API Call Error:', error);
        throw error;
    }
};

// 공개 API 함수 (JWT 토큰 불필요)
const publicApiCall = async (url, options = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Public API Call Error:', error);
        throw error;
    }
};

// 네비게이션 컴포넌트
const AdminNav = ({ currentPage, onNavigate, onLogout }) => {
    const navItems = [
        { id: 'dashboard', label: '대시보드', icon: BarChart3 },
        { id: 'users', label: '사용자 관리', icon: Users },
        { id: 'books', label: '도서 관리', icon: BookOpen },
        { id: 'loans', label: '대출 관리', icon: FileText }
    ];

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold">도서관 관리</h1>
                    <div className="flex gap-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                                        currentPage === item.id
                                            ? 'bg-blue-600'
                                            : 'hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded transition-colors"
                >
                    <LogOut size={16} />
                    로그아웃
                </button>
            </div>
        </nav>
    );
};

// 관리자 대시보드
const AdminDashboard = () => {
    const [stats, setStats] = useState({
        activeLoans: 0,
        overdueLoans: 0,
        totalUsers: 0,
        totalBooks: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                setError('');

                const [activeLoans, overdueLoans] = await Promise.all([
                    apiCall('/api/admin/loans'),
                    apiCall('/api/admin/loans/overdue')
                ]);

                setStats({
                    activeLoans: activeLoans.length || 0,
                    overdueLoans: overdueLoans.length || 0,
                    totalUsers: 0, // 임시값
                    totalBooks: 0  // 임시값
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
                setError('통계 데이터를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="text-lg">로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">관리자 대시보드</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-500 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100">현재 대출 중</p>
                            <p className="text-3xl font-bold">{stats.activeLoans}</p>
                            <p className="text-blue-100">권</p>
                        </div>
                        <FileText size={48} className="opacity-80" />
                    </div>
                </div>

                <div className="bg-red-500 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100">연체된 도서</p>
                            <p className="text-3xl font-bold">{stats.overdueLoans}</p>
                            <p className="text-red-100">권</p>
                        </div>
                        <AlertTriangle size={48} className="opacity-80" />
                    </div>
                </div>

                <div className="bg-green-500 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100">전체 사용자</p>
                            <p className="text-3xl font-bold">{stats.totalUsers}</p>
                            <p className="text-green-100">명</p>
                        </div>
                        <Users size={48} className="opacity-80" />
                    </div>
                </div>

                <div className="bg-purple-500 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100">전체 도서</p>
                            <p className="text-3xl font-bold">{stats.totalBooks}</p>
                            <p className="text-purple-100">권</p>
                        </div>
                        <BookOpen size={48} className="opacity-80" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// 사용자 관리 페이지
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        username: '',
        password: '',
        contact: '',
        memo: ''
    });

    const loadUsers = async (page = 0) => {
        try {
            setLoading(true);
            setError('');
            const response = await apiCall(`/api/admin/users?page=${page}&size=10`);
            setUsers(response.content || []);
            setCurrentPage(response.number || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error('Failed to load users:', error);
            setError('사용자 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSaveUser = async () => {
        try {
            const url = editingUser
                ? `/api/admin/users/${editingUser.id}`
                : '/api/admin/users';
            const method = editingUser ? 'PUT' : 'POST';

            await apiCall(url, {
                method,
                body: JSON.stringify(userForm)
            });

            setShowModal(false);
            setEditingUser(null);
            setUserForm({ username: '', password: '', contact: '', memo: '' });
            loadUsers(currentPage);
            alert('사용자가 저장되었습니다.');
        } catch (error) {
            console.error('Failed to save user:', error);
            alert('사용자 저장에 실패했습니다.');
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setUserForm({
            username: user.username,
            password: '',
            contact: user.contact,
            memo: user.memo || ''
        });
        setShowModal(true);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) return;

        try {
            await apiCall(`/api/admin/users/${userId}`, { method: 'DELETE' });
            loadUsers(currentPage);
            alert('사용자가 삭제되었습니다.');
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('사용자 삭제에 실패했습니다.');
        }
    };

    const openAddModal = () => {
        setEditingUser(null);
        setUserForm({ username: '', password: '', contact: '', memo: '' });
        setShowModal(true);
    };

    if (loading) {
        return <div className="p-8 text-center">로딩 중...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">사용자 관리</h2>
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={16} />
                    사용자 추가
                </button>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">번호</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">아이디</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">연락처</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">메모</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.contact}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.memo || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                        >
                                            <Edit size={14} />
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                        >
                                            <Trash2 size={14} />
                                            삭제
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 p-4">
                        <button
                            onClick={() => loadUsers(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                            이전
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                            return (
                                <button
                                    key={page}
                                    onClick={() => loadUsers(page)}
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
                            onClick={() => loadUsers(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>

            {/* 사용자 추가/수정 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingUser ? '사용자 수정' : '사용자 추가'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                                <input
                                    type="text"
                                    value={userForm.username}
                                    onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                                <input
                                    type="password"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {editingUser && (
                                    <p className="text-sm text-gray-500 mt-1">비워두면 비밀번호가 변경되지 않습니다.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                                <input
                                    type="text"
                                    value={userForm.contact}
                                    onChange={(e) => setUserForm({...userForm, contact: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                                <textarea
                                    value={userForm.memo}
                                    onChange={(e) => setUserForm({...userForm, memo: e.target.value})}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveUser}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 관리자 앱 컴포넌트
const AdminApp = ({ onLogout }) => {
    const [currentPage, setCurrentPage] = useState('dashboard');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        onLogout();
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'users':
                return <UserManagement />;
            case 'books':
                return <div className="p-8 text-center">도서 관리 (개발 중)</div>;
            case 'loans':
                return <div className="p-8 text-center">대출 관리 (개발 중)</div>;
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminNav
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                onLogout={handleLogout}
            />
            {renderPage()}
        </div>
    );
};

// 메인 홈 페이지 컴포넌트
const HomePage = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="bg-blue-600 text-white p-6 rounded-t-lg text-center">
                            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                                <BookOpen size={32} />
                                미니 도서관 관리 시스템
                            </h1>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <div className="text-center">
                                        <Search size={48} className="mx-auto text-blue-600 mb-4" />
                                        <h2 className="text-xl font-semibold mb-2">사용자 페이지</h2>
                                        <p className="text-gray-600 mb-4">도서 검색 및 조회</p>
                                        <button
                                            onClick={() => onNavigate('user')}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            도서 검색하기
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                                    <div className="text-center">
                                        <Settings size={48} className="mx-auto text-green-600 mb-4" />
                                        <h2 className="text-xl font-semibold mb-2">관리자 페이지</h2>
                                        <p className="text-gray-600 mb-4">도서관 관리</p>
                                        <button
                                            onClick={() => onNavigate('admin-login')}
                                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            관리자 로그인
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 사용자 도서 검색 페이지
const UserSearchPage = ({ onNavigate }) => {
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
                        onClick={() => onNavigate('home')}
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
                                    <p><span className="font-medium">가격:</span> {book.price ? `${book.price.toLocaleString()}원` : 'N/A'}</p>
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

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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

// 관리자 로그인 페이지
const AdminLoginPage = ({ onNavigate, onLogin }) => {
    const [credentials, setCredentials] = useState({
        username: 'admin',
        password: 'admin123'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setDebugInfo('로그인 시도 중...');

        try {
            console.log('로그인 요청:', credentials);

            // 로그인 전용 API 함수 사용 (JWT 토큰 없이)
            const response = await loginApiCall('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            console.log('로그인 응답:', response);
            setDebugInfo('로그인 응답 받음');

            if (response.error) {
                setError(response.error);
                setDebugInfo(`로그인 실패: ${response.error}`);
            } else if (response.accessToken) {
                // 성공
                localStorage.setItem('accessToken', response.accessToken);
                if (response.refreshToken) {
                    localStorage.setItem('refreshToken', response.refreshToken);
                }
                setDebugInfo('로그인 성공! 대시보드로 이동...');
                onLogin(response.accessToken);
                onNavigate('admin-dashboard');
            } else {
                setError('잘못된 응답 형식입니다.');
                setDebugInfo('응답에 토큰이 없습니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(`로그인 중 오류: ${error.message}`);
            setDebugInfo(`오류 발생: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async () => {
        try {
            setDebugInfo('연결 테스트 중...');
            const response = await publicApiCall('/api/public/books/search?page=0&size=1');
            setDebugInfo('백엔드 연결 성공!');
            console.log('연결 테스트 성공:', response);
        } catch (error) {
            setDebugInfo(`연결 오류: ${error.message}`);
            console.error('연결 테스트 실패:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="bg-gray-800 text-white p-6 rounded-t-lg text-center">
                        <h2 className="text-2xl font-bold">관리자 로그인</h2>
                    </div>
                    <div className="p-6">
                        {/* 디버그 정보 */}
                        {debugInfo && (
                            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
                                <strong>디버그:</strong> {debugInfo}
                            </div>
                        )}

                        {/* 연결 테스트 버튼 */}
                        <div className="mb-4">
                            <button
                                onClick={testConnection}
                                className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                백엔드 연결 테스트
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    아이디
                                </label>
                                <input
                                    type="text"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    비밀번호
                                </label>
                                <input
                                    type="password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? '로그인 중...' : '로그인'}
                            </button>
                        </form>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 rounded-b-lg text-center">
                        <small className="text-gray-600">
                            테스트 계정: admin / admin123
                        </small>
                    </div>
                </div>
                <div className="text-center mt-4">
                    <button
                        onClick={() => onNavigate('home')}
                        className="text-gray-600 hover:text-gray-800 underline"
                    >
                        메인 페이지로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

// 메인 앱 컴포넌트
const LibraryApp = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        // 페이지 로드 시 저장된 토큰 확인
        const token = localStorage.getItem('accessToken');
        if (token) {
            setAccessToken(token);
            setIsLoggedIn(true);
        }
    }, []);

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    const handleLogin = (token) => {
        setAccessToken(token);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setIsLoggedIn(false);
        setCurrentPage('home');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'user':
                return <UserSearchPage onNavigate={handleNavigate} />;
            case 'admin-login':
                return <AdminLoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
            case 'admin-dashboard':
                if (!isLoggedIn) {
                    return <AdminLoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
                }
                return <AdminApp onLogout={handleLogout} />;
            default:
                return <HomePage onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="min-h-screen">
            {renderPage()}
        </div>
    );
};

export default LibraryApp;