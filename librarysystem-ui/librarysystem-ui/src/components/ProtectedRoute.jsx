import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        // 토큰이 없으면 관리자 로그인 페이지로 리다이렉트
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute;