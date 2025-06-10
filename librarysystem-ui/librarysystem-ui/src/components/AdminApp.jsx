import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Search,
    BookOpen,
    Users,
    FileText,
    LogOut,
    Plus,
    Edit,
    Trash2,
    BarChart3,
    AlertTriangle,
    X
} from 'lucide-react';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8080';

// 일반 API 헬퍼 함수 (JWT 토큰 필요) - 여기에 기존 apiCall 함수를 포함
const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    console.log('API Call:', url);
    console.log('Token exists:', !!token);

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && {'Authorization': `Bearer ${token}`}),
        ...(refreshToken && {'Refresh-Token': refreshToken})
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            },
            mode: 'cors',
            credentials: 'include'
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        const newAccessToken = response.headers.get('New-Access-Token');
        const newRefreshToken = response.headers.get('New-Refresh-Token');

        if (newAccessToken) {
            console.log('Received new access token, updating localStorage');
            localStorage.setItem('accessToken', newAccessToken);

            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }
        }

        if (!response.ok) {
            if (response.status === 401) {
                console.log('Unauthorized - removing tokens');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                // 로그인 페이지로 리다이렉트
                window.location.href = '/admin';
                throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
            }

            const errorText = await response.text();
            console.log('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // 응답이 비어있거나 No Content인 경우 처리
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            console.log('Success response: No content');
            return null;
        }

        // Content-Type이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Success response:', data);
            return data;
        } else {
            // JSON이 아닌 경우 텍스트로 처리
            const text = await response.text();
            console.log('Success response (text):', text);
            return text || null;
        }
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
};

// 네비게이션 컴포넌트
const AdminNav = ({currentPage, onNavigate, onLogout}) => {
    const navItems = [
        {id: 'dashboard', label: '대시보드', icon: BarChart3},
        {id: 'users', label: '사용자 관리', icon: Users},
        {id: 'books', label: '도서 관리', icon: BookOpen},
        {id: 'loans', label: '대출 관리', icon: FileText}
    ];

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* 로고 및 타이틀 */}
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <BookOpen size={20} className="text-white"/>
                            </div>
                            <h1 className="text-xl font-semibold text-slate-800">관리자 시스템</h1>
                        </div>

                        {/* 네비게이션 메뉴 */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onNavigate(item.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium ${
                                            currentPage === item.id
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600'
                                        }`}
                                    >
                                        <Icon size={16}/>
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 로그아웃 버튼 */}
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-600 rounded-xl"
                    >
                        <LogOut size={16}/>
                        <span className="hidden sm:block">로그아웃</span>
                    </button>
                </div>
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

                const [activeLoans, overdueLoans, totalUsers, totalBooks] = await Promise.all([
                    apiCall('/api/admin/loans'),
                    apiCall('/api/admin/loans/overdue'),
                    apiCall('/api/admin/users'),
                    apiCall('/api/admin/books')
                ]);

                setStats({
                    activeLoans: activeLoans.content.length || 0,
                    overdueLoans: overdueLoans.length || 0,
                    totalUsers: totalUsers.content.length || 0,
                    totalBooks: totalBooks.content.length || 0
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={24} className="text-red-600"/>
                    </div>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-6 py-8">
                {/* 페이지 헤더 */}
                <div className="mb-8">
                    <h2 className="text-3xl font-light text-slate-800 mb-2">대시보드</h2>
                    <p className="text-slate-600">도서관 현황을 한눈에 확인하세요</p>
                </div>

                {/* 통계 카드 */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FileText size={24} className="text-blue-600"/>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-slate-800">{stats.activeLoans}</p>
                                <p className="text-sm text-slate-600">권</p>
                            </div>
                        </div>
                        <h3 className="font-medium text-slate-800 mb-1">현재 대출 중</h3>
                        <p className="text-sm text-slate-500">대출된 도서 수</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <AlertTriangle size={24} className="text-red-600"/>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-slate-800">{stats.overdueLoans}</p>
                                <p className="text-sm text-slate-600">권</p>
                            </div>
                        </div>
                        <h3 className="font-medium text-slate-800 mb-1">연체된 도서</h3>
                        <p className="text-sm text-slate-500">반납 기한 초과</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Users size={24} className="text-emerald-600"/>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-slate-800">{stats.totalUsers}</p>
                                <p className="text-sm text-slate-600">명</p>
                            </div>
                        </div>
                        <h3 className="font-medium text-slate-800 mb-1">전체 사용자</h3>
                        <p className="text-sm text-slate-500">등록된 사용자 수</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <BookOpen size={24} className="text-purple-600"/>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-slate-800">{stats.totalBooks}</p>
                                <p className="text-sm text-slate-600">권</p>
                            </div>
                        </div>
                        <h3 className="font-medium text-slate-800 mb-1">전체 도서</h3>
                        <p className="text-sm text-slate-500">등록된 도서 수</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 사용자 관리
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userLoans, setUserLoans] = useState([]);
    const [loanLoading, setLoanLoading] = useState(false);
    const [userStatistics, setUserStatistics] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [modalType, setModalType] = useState('user'); // 'user' or 'admin'
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

    // 사용자 대출 현황 조회 함수
    const loadUserLoans = async (userId) => {
        try {
            setLoanLoading(true);
            // 모든 대출 기록과 통계 정보를 동시에 조회
            const [loansResponse, statisticsResponse] = await Promise.all([
                apiCall(`/api/admin/users/${userId}/loans`),
                apiCall(`/api/admin/users/${userId}/loan-statistics`)
            ]);
            setUserLoans(loansResponse || []);
            setUserStatistics(statisticsResponse || null);
        } catch (error) {
            console.error('Failed to load user loans:', error);
            alert('사용자 대출 현황을 불러오는데 실패했습니다.');
        } finally {
            setLoanLoading(false);
        }
    };

    // 사용자 대출 현황 모달 열기
    const handleViewUserLoans = async (user) => {
        setSelectedUser(user);
        setShowLoanModal(true);
        await loadUserLoans(user.id);
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    // 대출 상태 배지
    const getLoanStatusBadge = (loan) => {
        if (loan.status === 'RETURNED') {
            return (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    반납완료
                </span>
            );
        } else if (loan.overdue) {
            return (
                <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    연체
                </span>
            );
        } else {
            return (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    대출중
                </span>
            );
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSaveUser = async () => {
        try {
            // 사용자 타입에 따라 다른 엔드포인트 사용
            const baseUrl = modalType === 'admin' ? '/api/admin/users/admin' : '/api/admin/users';
            const url = editingUser
                ? `${baseUrl}/${editingUser.id}`
                : baseUrl;
            const method = editingUser ? 'PUT' : 'POST';

            // 사용자 정보
            const requestData = userForm;

            await apiCall(url, {
                method,
                body: JSON.stringify(requestData)
            });

            setShowModal(false);
            setEditingUser(null);
            setUserForm({username: '', password: '', contact: '', memo: ''});
            setModalType('user');
            loadUsers(currentPage);
            alert(modalType === 'admin' ? '관리자가 저장되었습니다.' : '사용자가 저장되었습니다.');
        } catch (error) {
            console.error('Failed to save user:', error);
            alert('저장에 실패했습니다.');
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setModalType('user'); // 수정 시에는 항상 사용자로 처리
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
            await apiCall(`/api/admin/users/${userId}`, {method: 'DELETE'});
            loadUsers(currentPage);
            alert('사용자가 삭제되었습니다.');
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('사용자 삭제에 실패했습니다.');
        }
    };

    const openAddUserModal = () => {
        setEditingUser(null);
        setModalType('user');
        setUserForm({username: '', password: '', contact: '', memo: ''});
        setShowModal(true);
    };

    const openAddAdminModal = () => {
        setEditingUser(null);
        setModalType('admin');
        setUserForm({username: '', password: '', contact: '', memo: ''});
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
                <h2 className="text-2xl font-light text-slate-800">사용자 관리</h2>
                <div className="flex gap-3">
                    <button
                        onClick={openAddUserModal}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                    >
                        <Plus size={16}/>
                        사용자 추가
                    </button>
                    <button
                        onClick={openAddAdminModal}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                    >
                        <Plus size={16}/>
                        관리자 추가
                    </button>
                </div>
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
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleViewUserLoans(user)}
                                            className="text-emerald-600 font-medium flex items-center gap-1"
                                        >
                                            <FileText size={14}/>
                                            대출현황
                                        </button>
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-indigo-600 font-medium flex items-center gap-1"
                                        >
                                            <Edit size={14}/>
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 font-medium flex items-center gap-1"
                                        >
                                            <Trash2 size={14}/>
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

                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
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

            {/* 사용자/관리자 추가/수정 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingUser
                                ? '사용자 수정'
                                : modalType === 'admin'
                                    ? '관리자 추가'
                                    : '사용자 추가'
                            }
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

                            {/* 비밀번호 필드는 관리자 추가 시 또는 수정 시에만 표시 */}
                            {(modalType === 'admin' || editingUser) && (
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
                            )}

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

            {/* 사용자 대출 현황 모달 */}
            {showLoanModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {selectedUser.username} 사용자 대출 현황
                            </h3>
                            <button
                                onClick={() => setShowLoanModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-medium">사용자 ID:</span> {selectedUser.id}
                                </div>
                                <div>
                                    <span className="font-medium">연락처:</span> {selectedUser.contact}
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium">메모:</span> {selectedUser.memo || '-'}
                                </div>
                            </div>
                        </div>

                        {/* 대출 통계 정보 */}
                        {userStatistics && (
                            <div className="border-t pt-4 mb-4">
                                <h4 className="font-medium mb-3">대출 통계</h4>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {userStatistics.totalLoans}
                                        </div>
                                        <div className="text-sm text-gray-600">총 대출</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {userStatistics.activeLoans}
                                        </div>
                                        <div className="text-sm text-gray-600">대출 중</div>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">
                                            {userStatistics.overdueLoans}
                                        </div>
                                        <div className="text-sm text-gray-600">연체</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-600">
                                            {userStatistics.returnedLoans}
                                        </div>
                                        <div className="text-sm text-gray-600">반납 완료</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loanLoading ? (
                            <div className="text-center py-8">로딩 중...</div>
                        ) : userLoans.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                대출 기록이 없습니다.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            대출번호
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            도서명
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            저자
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            대출일
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            반납예정일
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            반납일
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            상태
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {userLoans.map((loan) => (
                                        <tr key={loan.id}
                                            className={loan.overdue && loan.status !== 'RETURNED' ? 'bg-red-50' : ''}>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {loan.id}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {loan.book.title}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {loan.book.author}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {formatDate(loan.loanDate)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {formatDate(loan.dueDate)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {loan.returnDate ? formatDate(loan.returnDate) : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {getLoanStatusBadge(loan)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowLoanModal(false)}
                                className="px-6 py-3 bg-slate-600 text-white rounded-xl font-medium"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 도서 관리
const BookManagement = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [showBookLoanModal, setShowBookLoanModal] = useState(false);
    const [selectedBookForLoans, setSelectedBookForLoans] = useState(null);
    const [bookLoans, setBookLoans] = useState([]);
    const [bookLoanLoading, setBookLoanLoading] = useState(false);
    const [bookForm, setBookForm] = useState({
        title: '',
        author: '',
        publisher: '',
        publishedAt: '',
        price: ''
    });

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    // 대출 상태 배지
    const getLoanStatusBadge = (loan) => {
        if (loan.status === 'RETURNED') {
            return (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    반납완료
                </span>
            );
        } else if (loan.overdue) {
            return (
                <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    연체
                </span>
            );
        } else {
            return (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    대출중
                </span>
            );
        }
    };

    const loadBooks = async (page = 0) => {
        try {
            setLoading(true);
            setError('');
            const response = await apiCall(`/api/admin/books?page=${page}&size=10`);
            setBooks(response.content || []);
            setCurrentPage(response.number || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error('Failed to load books:', error);
            setError('도서 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 도서 대출 이력 조회 함수
    const loadBookLoans = async (bookId) => {
        try {
            setBookLoanLoading(true);
            const response = await apiCall(`/api/admin/books/${bookId}/loans`);
            setBookLoans(response || []);
        } catch (error) {
            console.error('Failed to load book loans:', error);
            alert('도서 대출 이력을 불러오는데 실패했습니다.');
        } finally {
            setBookLoanLoading(false);
        }
    };

    // 도서 대출 이력 모달 열기
    const handleViewBookLoans = async (book) => {
        setSelectedBookForLoans(book);
        setShowBookLoanModal(true);
        await loadBookLoans(book.id);
    };

    useEffect(() => {
        loadBooks();
    }, []);

    const handleSaveBook = async () => {
        try {
            const bookData = {
                ...bookForm,
                publishedAt: bookForm.publishedAt ? parseInt(bookForm.publishedAt) : null,
                price: bookForm.price ? parseInt(bookForm.price) : null
            };

            const url = editingBook
                ? `/api/admin/books/${editingBook.id}`
                : '/api/admin/books';
            const method = editingBook ? 'PUT' : 'POST';

            await apiCall(url, {
                method,
                body: JSON.stringify(bookData)
            });

            setShowModal(false);
            setEditingBook(null);
            setBookForm({title: '', author: '', publisher: '', publishedAt: '', price: ''});
            loadBooks(currentPage);
            alert('도서가 저장되었습니다.');
        } catch (error) {
            console.error('Failed to save book:', error);
            alert('도서 저장에 실패했습니다.');
        }
    };

    const handleEditBook = (book) => {
        setEditingBook(book);
        setBookForm({
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            publishedAt: book.publishedAt ? book.publishedAt.toString() : '',
            price: book.price ? book.price.toString() : ''
        });
        setShowModal(true);
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('정말로 이 도서를 삭제하시겠습니까?')) return;

        try {
            await apiCall(`/api/admin/books/${bookId}`, {method: 'DELETE'});
            loadBooks(currentPage);
            alert('도서가 삭제되었습니다.');
        } catch (error) {
            console.error('Failed to delete book:', error);
            alert('도서 삭제에 실패했습니다.');
        }
    };

    const openAddModal = () => {
        setEditingBook(null);
        setBookForm({title: '', author: '', publisher: '', publishedAt: '', price: ''});
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        return status === 'AVAILABLE' ? (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                대출 가능
            </span>
        ) : (
            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                대출 중
            </span>
        );
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
                <h2 className="text-2xl font-light text-slate-800">도서 관리</h2>
                <button
                    onClick={openAddModal}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus size={16}/>
                    도서 추가
                </button>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">도서번호</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">저자</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">출판사</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">출간년</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {books.map((book) => (
                            <tr key={book.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.author}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.publisher}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.publishedAt || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {book.price ? `${book.price.toLocaleString()}원` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {getStatusBadge(book.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleViewBookLoans(book)}
                                            className="text-emerald-600 font-medium flex items-center gap-1"
                                        >
                                            <FileText size={14}/>
                                            대출이력
                                        </button>
                                        <button
                                            onClick={() => handleEditBook(book)}
                                            className="text-indigo-600 font-medium flex items-center gap-1"
                                        >
                                            <Edit size={14}/>
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBook(book.id)}
                                            className="text-red-600 font-medium flex items-center gap-1"
                                        >
                                            <Trash2 size={14}/>
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
                    <div className="flex justify-center gap-2 p-6">
                        <button
                            onClick={() => loadUsers(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="px-4 py-2 border border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            이전
                        </button>

                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                            const page = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                            return (
                                <button
                                    key={page}
                                    onClick={() => loadUsers(page)}
                                    className={`px-4 py-2 rounded-xl ${
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
                            onClick={() => loadUsers(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-4 py-2 border border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            다음
                        </button>
                    </div>

                )}
            </div>

            {/* 도서 대출 이력 모달 */}
            {showBookLoanModal && selectedBookForLoans && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                "{selectedBookForLoans.title}" 대출 이력
                            </h3>
                            <button
                                onClick={() => setShowBookLoanModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <span className="font-medium">저자:</span> {selectedBookForLoans.author}
                                </div>
                                <div>
                                    <span className="font-medium">출판사:</span> {selectedBookForLoans.publisher}
                                </div>
                                <div>
                                    <span className="font-medium">현재 상태:</span>
                                    <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs ${
                                        selectedBookForLoans.status === 'AVAILABLE'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {selectedBookForLoans.status === 'AVAILABLE' ? '대출 가능' : '대출 중'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {bookLoanLoading ? (
                            <div className="text-center py-8">로딩 중...</div>
                        ) : bookLoans.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                대출 이력이 없습니다.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            대출번호
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            사용자
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            연락처
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            대출일
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            반납예정일
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            반납일
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                            상태
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {bookLoans.map((loan) => (
                                        <tr key={loan.id}
                                            className={loan.overdue && loan.status !== 'RETURNED' ? 'bg-red-50' : ''}>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {loan.id}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {loan.user.username}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {loan.user.contact}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {formatDate(loan.loanDate)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {formatDate(loan.dueDate)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {loan.returnDate ? formatDate(loan.returnDate) : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                                {getLoanStatusBadge(loan)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowBookLoanModal(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 도서 추가/수정 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingBook ? '도서 수정' : '도서 추가'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                                <input
                                    type="text"
                                    value={bookForm.title}
                                    onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">저자</label>
                                <input
                                    type="text"
                                    value={bookForm.author}
                                    onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">출판사</label>
                                <input
                                    type="text"
                                    value={bookForm.publisher}
                                    onChange={(e) => setBookForm({...bookForm, publisher: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">출간년</label>
                                <input
                                    type="number"
                                    value={bookForm.publishedAt}
                                    onChange={(e) => setBookForm({...bookForm, publishedAt: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                                <input
                                    type="number"
                                    value={bookForm.price}
                                    onChange={(e) => setBookForm({...bookForm, price: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-6 py-3 text-slate-700 bg-slate-100 rounded-xl font-medium"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveUser}
                                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium"
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

// 대출 관리
const LoanManagement = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [loanForm, setLoanForm] = useState({
        userId: '',
        bookId: '',
        loanDays: 14
    });
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    // 대출 상태 배지
    const getLoanStatusBadge = (loan) => {
        if (loan.status === 'RETURNED') {
            return (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    반납완료
                </span>
            );
        } else if (loan.overdue) {
            return (
                <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    연체
                </span>
            );
        } else {
            return (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    대출중
                </span>
            );
        }
    };

    const loadLoans = async (page = 0) => {
        try {
            setLoading(true);
            setError('');
            const url = searchTerm
                ? `/api/admin/loans/search?query=${encodeURIComponent(searchTerm)}&page=${page}&size=10`
                : `/api/admin/loans?page=${page}&size=10`;
            const response = await apiCall(url);
            setLoans(response.content || []);
            setCurrentPage(response.number || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error('Failed to load loans:', error);
            setError('대출 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const loadUsersAndBooks = async () => {
        try {
            const [usersResponse, booksResponse] = await Promise.all([
                apiCall('/api/admin/users?size=1000'),
                apiCall('/api/admin/books?size=1000')
            ]);
            setUsers(usersResponse.content || []);
            setBooks(booksResponse.content?.filter(book => book.status === 'AVAILABLE') || []);
        } catch (error) {
            console.error('Failed to load users and books:', error);
        }
    };

    useEffect(() => {
        loadLoans();
        loadUsersAndBooks();
    }, []);

    const handleSearch = () => {
        setCurrentPage(0);
        loadLoans(0);
    };

    const handleCreateLoan = async () => {
        try {
            await apiCall('/api/admin/loans', {
                method: 'POST',
                body: JSON.stringify({
                    userId: parseInt(loanForm.userId),
                    bookId: parseInt(loanForm.bookId),
                    loanDays: parseInt(loanForm.loanDays)
                })
            });

            setShowModal(false);
            setLoanForm({userId: '', bookId: '', loanDays: 14});
            loadLoans(currentPage);
            loadUsersAndBooks(); // 도서 목록 새로고침
            alert('대출이 등록되었습니다.');
        } catch (error) {
            console.error('Failed to create loan:', error);
            alert('대출 등록에 실패했습니다.');
        }
    };

    const handleReturnBook = async (loanId) => {
        if (!window.confirm('이 도서를 반납처리 하시겠습니까?')) return;

        try {
            await apiCall(`/api/admin/loans/${loanId}/return`, {
                method: 'PUT'
            });
            loadLoans(currentPage);
            loadUsersAndBooks(); // 도서 목록 새로고침
            alert('반납처리가 완료되었습니다.');
        } catch (error) {
            console.error('Failed to return book:', error);
            alert('반납처리에 실패했습니다.');
        }
    };

    const openCreateModal = () => {
        setLoanForm({userId: '', bookId: '', loanDays: 14});
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
                <h2 className="text-2xl font-light text-slate-800">대출 관리</h2>
                <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus size={16}/>
                    대출 등록
                </button>
            </div>

            {/* 검색 */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="사용자명, 도서명으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                    >
                        <Search size={16}/>
                        검색
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">대출번호</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">도서명</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">저자</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">대출일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">반납예정일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">반납일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {loans.map((loan) => (
                            <tr key={loan.id} className={loan.overdue && loan.status !== 'RETURNED' ? 'bg-red-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.book.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.book.author}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(loan.loanDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(loan.dueDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {loan.returnDate ? formatDate(loan.returnDate) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {getLoanStatusBadge(loan)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {loan.status !== 'RETURNED' && (
                                        <button
                                            onClick={() => handleReturnBook(loan.id)}
                                            className="text-emerald-600 font-medium flex items-center gap-1"
                                        >
                                            <FileText size={14}/>
                                            반납
                                        </button>
                                    )}
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
                            onClick={() => loadLoans(currentPage - 1)}
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
                                    onClick={() => loadLoans(page)}
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
                            onClick={() => loadLoans(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>

            {/* 대출 등록 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">대출 등록</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">사용자</label>
                                <select
                                    value={loanForm.userId}
                                    onChange={(e) => setLoanForm({...loanForm, userId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">사용자를 선택하세요</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.username} ({user.contact})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">도서</label>
                                <select
                                    value={loanForm.bookId}
                                    onChange={(e) => setLoanForm({...loanForm, bookId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">도서를 선택하세요</option>
                                    {books.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} - {book.author}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">대출 기간 (일)</label>
                                <input
                                    type="number"
                                    value={loanForm.loanDays}
                                    onChange={(e) => setLoanForm({...loanForm, loanDays: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    max="30"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-6 py-3 text-slate-700 bg-slate-100 rounded-xl font-medium"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateLoan}
                                disabled={!loanForm.userId || !loanForm.bookId}
                                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                등록
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 관리자 앱 메인 컴포넌트
const AdminApp = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState('dashboard');

    const handleLogout = async () => {
        try {
            // 서버에 로그아웃 요청으로 Refresh Token 무효화
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                await apiCall('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Refresh-Token': refreshToken
                    }
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
            // API 실패해도 클라이언트 측 정리는 진행
        } finally {
            // 클라이언트 측 토큰 완전 삭제
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            // sessionStorage도 정리
            sessionStorage.clear();

            // 로그인 페이지로 이동
            navigate('/admin');
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'users':
                return <UserManagement/>;
            case 'books':
                return <BookManagement/>;
            case 'loans':
                return <LoanManagement/>;
            default:
                return <AdminDashboard/>;
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

export default AdminApp;