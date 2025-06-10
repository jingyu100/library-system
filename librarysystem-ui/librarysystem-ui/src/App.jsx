import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import UserSearchPage from './components/UserSearchPage.jsx';
import AdminLoginPage from './components/AdminLoginPage.jsx';
import AdminApp from './components/AdminApp.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* 사용자 도서 검색 페이지 */}
                    <Route path="/search" element={<UserSearchPage />} />

                    {/* 관리자 로그인 페이지 */}
                    <Route path="/admin" element={<AdminLoginPage />} />

                    {/* 관리자 대시보드*/}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute>
                                <AdminApp />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;