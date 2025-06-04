import React, {useState, useEffect} from 'react';
import {
    Search,
    BookOpen,
    Users,
    FileText,
    Settings,
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

// 일반 API 헬퍼 함수 (JWT 토큰 필요)
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
                throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
            }

            const errorText = await response.text();
            console.log('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Success response:', data);
        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
};

// 로그인 전용 API 함수 (JWT 토큰 불필요)
const loginApiCall = async (url, options = {}) => {
    console.log('Login API Call:', url);

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
            mode: 'cors',
            credentials: 'include'
        });

        console.log('Login Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Login Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Login Success response:', data);
        return data;
    } catch (error) {
        console.error('Login API Call Error:', error);
        throw error;
    }
};

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

// 네비게이션 컴포넌트
const AdminNav = ({currentPage, onNavigate, onLogout}) => {
    const navItems = [
        {id: 'dashboard', label: '대시보드', icon: BarChart3},
        {id: 'users', label: '사용자 관리', icon: Users},
        {id: 'books', label: '도서 관리', icon: BookOpen},
        {id: 'loans', label: '대출 관리', icon: FileText}
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
                                    <Icon size={16}/>
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
                    <LogOut size={16}/>
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
                        <FileText size={48} className="opacity-80"/>
                    </div>
                </div>

                <div className="bg-red-500 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100">연체된 도서</p>
                            <p className="text-3xl font-bold">{stats.overdueLoans}</p>
                            <p className="text-red-100">권</p>
                        </div>
                        <AlertTriangle size={48} className="opacity-80"/>
                    </div>
                </div>

                <div className="bg-green-500 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100">전체 사용자</p>
                            <p className="text-3xl font-bold">{stats.totalUsers}</p>
                            <p className="text-green-100">명</p>
                        </div>
                        <Users size={48} className="opacity-80"/>
                    </div>
                </div>

                <div className="bg-purple-500 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100">전체 도서</p>
                            <p className="text-3xl font-bold">{stats.totalBooks}</p>
                            <p className="text-purple-100">권</p>
                        </div>
                        <BookOpen size={48} className="opacity-80"/>
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
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userLoans, setUserLoans] = useState([]);
    const [loanLoading, setLoanLoading] = useState(false);
    const [userStatistics, setUserStatistics] = useState(null);
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
            setUserForm({username: '', password: '', contact: '', memo: ''});
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
            await apiCall(`/api/admin/users/${userId}`, {method: 'DELETE'});
            loadUsers(currentPage);
            alert('사용자가 삭제되었습니다.');
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('사용자 삭제에 실패했습니다.');
        }
    };

    const openAddModal = () => {
        setEditingUser(null);
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
                <h2 className="text-2xl font-bold">사용자 관리</h2>
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={16}/>
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
                                            onClick={() => handleViewUserLoans(user)}
                                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                        >
                                            <FileText size={14}/>
                                            대출현황
                                        </button>
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                        >
                                            <Edit size={14}/>
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
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
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
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

// 관리자 앱 컴포넌트
const AdminApp = ({onLogout}) => {
    const [currentPage, setCurrentPage] = useState('dashboard');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        onLogout();
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

// 메인 홈 페이지 컴포넌트
const HomePage = ({onNavigate}) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="bg-blue-600 text-white p-6 rounded-t-lg text-center">
                            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                                <BookOpen size={32}/>
                                미니 도서관 관리 시스템
                            </h1>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <div className="text-center">
                                        <Search size={48} className="mx-auto text-blue-600 mb-4"/>
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
                                        <Settings size={48} className="mx-auto text-green-600 mb-4"/>
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
const UserSearchPage = ({onNavigate}) => {
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

// 관리자 로그인 페이지
const AdminLoginPage = ({onNavigate, onLogin}) => {
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
            console.log('로그인 요청 데이터:', credentials);
            console.log('API_BASE_URL:', API_BASE_URL);

            const response = await loginApiCall('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            console.log('서버 응답:', response);
            setDebugInfo(`서버 응답 받음: ${JSON.stringify(response)}`);

            if (response.error) {
                setError(response.error);
                setDebugInfo(`로그인 실패: ${response.error}`);
            } else if (response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                if (response.refreshToken) {
                    localStorage.setItem('refreshToken', response.refreshToken);
                }
                setDebugInfo('로그인 성공! 대시보드로 이동...');
                onLogin(response.accessToken);
                onNavigate('admin-dashboard');
            } else {
                setError('잘못된 응답 형식입니다.');
                setDebugInfo(`응답 형식 오류: ${JSON.stringify(response)}`);
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(`로그인 중 오류: ${error.message}`);
            setDebugInfo(`네트워크 오류: ${error.message}`);
        } finally {
            setLoading(false);
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
                            <div
                                className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
                                <strong>디버그:</strong> {debugInfo}
                            </div>
                        )}

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

// 대출 관리 페이지
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
                <h2 className="text-2xl font-bold">대출 관리</h2>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
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

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateLoan}
                                disabled={!loanForm.userId || !loanForm.bookId}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
                return <UserSearchPage onNavigate={handleNavigate}/>;
            case 'admin-login':
                return <AdminLoginPage onNavigate={handleNavigate} onLogin={handleLogin}/>;
            case 'admin-dashboard':
                if (!isLoggedIn) {
                    return <AdminLoginPage onNavigate={handleNavigate} onLogin={handleLogin}/>;
                }
                return <AdminApp onLogout={handleLogout}/>;
            default:
                return <HomePage onNavigate={handleNavigate}/>;
        }
    };

    return (
        <div className="min-h-screen">
            {renderPage()}
        </div>
    );
};

// 도서 관리 페이지
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
                <h2 className="text-2xl font-bold">도서 관리</h2>
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">번호</th>
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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewBookLoans(book)}
                                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                        >
                                            <FileText size={14}/>
                                            대출이력
                                        </button>
                                        <button
                                            onClick={() => handleEditBook(book)}
                                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                        >
                                            <Edit size={14}/>
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBook(book.id)}
                                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
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
                            onClick={() => loadBooks(currentPage - 1)}
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
                                    onClick={() => loadBooks(page)}
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
                            onClick={() => loadBooks(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
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

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveBook}
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

export default LibraryApp;