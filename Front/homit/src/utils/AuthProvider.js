import React, { createContext, useContext, useEffect, useState } from 'react';
import { checkAuthStatus, refreshToken } from './authUtils';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // 인증 상태 확인 함수
    const checkAuth = async () => {
    console.log('🔍 checkAuth 시작');
    const result = await checkAuthStatus();
    console.log('🔍 checkAuth 결과:', result);
    
    if (result.isAuthenticated) {
        console.log('✅ checkAuth - 인증됨, 상태 업데이트');
        setIsAuthenticated(true);
        setUser(result.user);
    } else {
        console.log('❌ checkAuth - 비인증, 상태 초기화');
        setIsAuthenticated(false);
        setUser(null);
    }
};
    // 토큰 자동 갱신 설정
    useEffect(() => {
    checkAuth();

    // 주기적으로 토큰 갱신 (13분마다)
    const tokenRefreshInterval = setInterval(async () => {
    console.log('⏰ 1분 타이머 발동 - 서버 상태 직접 확인');
    
    // isAuthenticated 대신 서버에 직접 확인
    const serverAuthResult = await checkAuthStatus();
    
    if (serverAuthResult.isAuthenticated) {
        console.log('🔄 서버에서 인증 확인됨 - 토큰 갱신 시도');
        
        const refreshResult = await refreshToken();
        
        if (refreshResult) {
            console.log('✅ 토큰 갱신 성공');
            // 상태 동기화
            setIsAuthenticated(true);
            setUser(serverAuthResult.user);
        } else {
            console.log('❌ 토큰 갱신 실패 - 로그아웃');
            setUser(null);
            setIsAuthenticated(false);
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '/login';
        }
    } else {
        console.log('ℹ️ 서버에서 비인증 확인됨 - 토큰 갱신 건너뜀');
        setIsAuthenticated(false);
        setUser(null);
    }
}, 13 * 60 * 1000);

    console.log('⏰ 토큰 자동 갱신 타이머 설정됨 (13분 간격)');

    return () => {
        console.log('⏰ 토큰 자동 갱신 타이머 해제됨');
        clearInterval(tokenRefreshInterval);
    };
}, []);

    // 로그인 함수
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                await checkAuth();
                return {
                    success: true,
                    message: data.message,
                    accessToken: data.accessToken // ✅ 로그인 결과로 받은 토큰 전달
                };
            } else {
                return { success: false, message: data.message || '로그인에 실패했습니다.' };
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            return { success: false, message: '서버 연결에 실패했습니다.' };
        }
    };


    // 로그아웃 함수
    const logout = async () => {
        try {
            // 서버에 로그아웃 요청
            await fetch('http://localhost:8080/api/logout', {
                method: 'POST',
                credentials: 'include',
            });
            console.log('서버 로그아웃 완료');
        } catch (error) {
            console.error('로그아웃 API 오류:', error);
        } finally {
            // 클라이언트 상태 정리
            setUser(null);
            setIsAuthenticated(false);
            console.log('클라이언트 로그아웃 완료');
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};