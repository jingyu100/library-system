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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-10 text-center">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-light text-white mb-2">관리자 로그인</h2>
                        <p className="text-slate-300 text-sm">시스템 관리를 위해 로그인해주세요</p>
                    </div>

                    {/* 폼 */}
                    <div className="px-8 py-8">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    아이디
                                </label>
                                <input
                                    type="text"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    placeholder="관리자 아이디를 입력하세요"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    비밀번호
                                </label>
                                <input
                                    type="password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    placeholder="비밀번호를 입력하세요"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-800 text-white py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>로그인 중...</span>
                                    </div>
                                ) : (
                                    '로그인'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* 하단 정보 */}
                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
                        <div className="text-center">
                            <p className="text-sm text-slate-600 mb-3">테스트 계정 정보</p>
                            <div className="bg-white rounded-lg p-3 text-xs text-slate-600 border border-slate-200">
                                <div className="flex justify-between items-center mb-1">
                                    <span>아이디:</span>
                                    <span className="font-mono">admin</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>비밀번호:</span>
                                    <span className="font-mono">admin123</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 링크 */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-600 text-sm font-medium"
                    >
                        ← 메인 페이지로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;