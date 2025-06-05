import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8080';

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

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: 'admin',
        password: 'admin123'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('로그인 요청 데이터:', credentials);
            console.log('API_BASE_URL:', API_BASE_URL);

            const response = await loginApiCall('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            console.log('서버 응답:', response);

            if (response.error) {
                setError(response.error);
            } else if (response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                if (response.refreshToken) {
                    localStorage.setItem('refreshToken', response.refreshToken);
                }
                // 관리자 대시보드로 이동
                navigate('/admin/dashboard');
            } else {
                setError('잘못된 응답 형식입니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(`로그인 중 오류: ${error.message}`);
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
                        onClick={() => navigate('/')}
                        className="text-gray-600 hover:text-gray-800 underline"
                    >
                        메인 페이지로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;