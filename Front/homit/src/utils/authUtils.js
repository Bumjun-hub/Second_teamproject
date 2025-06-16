/**
 * 로그아웃 함수
 */
export const logout = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/logout', {
            method: 'POST',
            credentials: 'include', // 쿠키 포함
        });

        if (response.ok) {
            // 로그아웃 성공 시 홈페이지로 리다이렉트
            window.location.href = '/';
            return true;
        } else {
            console.error('로그아웃 실패');
            return false;
        }
    } catch (error) {
        console.error('로그아웃 오류:', error);
        return false;
    }
};

/**
 * 인증이 필요한 API 요청을 위한 fetch 래퍼
 */
export const authenticatedFetch = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include', // 쿠키 자동 포함
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, defaultOptions);

        // 401 Unauthorized인 경우 토큰 갱신 시도
        if (response.status === 401) {
            const refreshResult = await refreshToken();
            
            if (refreshResult) {
                // 토큰 갱신 성공 시 원래 요청 재시도
                return await fetch(url, defaultOptions);
            } else {
                // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
                window.location.href = '/login';
                throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
            }
        }

        return response;
    } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
    }
};

/**
 * 토큰 갱신 함수 (에러 처리 강화)
 */
export const refreshToken = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/refresh', {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            console.log('토큰 갱신 성공');
            return true;
        } else if (response.status === 401 || response.status === 403) {
            // 리프레시 토큰도 만료된 경우
            console.log('리프레시 토큰 만료 - 재로그인 필요');
            return false;
        } else {
            console.log('토큰 갱신 실패:', response.status);
            return false;
        }
    } catch (error) {
        // 네트워크 오류나 서버 연결 실패
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.log('서버 연결 실패 - 토큰 갱신 건너뜀');
            return true; // 네트워크 오류는 로그아웃시키지 않음
        }
        console.error('토큰 갱신 오류:', error);
        return false;
    }
};

/**
 * 쿠키에서 특정 값 읽기 (간단한 인증 상태 체크용)
 */
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

/**
 * 기본적인 로그인 상태 확인 (쿠키 기반)
 * 서버 요청 없이 빠르게 확인
 */
export const isLoggedIn = () => {
    // 쿠키에 토큰이 있는지 확인 (쿠키명은 실제 사용하는 것으로 변경)
    const accessToken = getCookie('accessToken') || getCookie('token');
    const refreshToken = getCookie('refreshToken');
    
    return !!(accessToken || refreshToken);
};

/**
 * 사용자 인증 상태 확인 함수 (개선된 버전)
 * 먼저 쿠키를 확인하고, 로그인 상태일 때만 서버에 요청
 */
export const checkAuthStatus = async (forceCheck = false) => {
    // forceCheck가 false이고 쿠키에 토큰이 없으면 서버 요청 안함
    if (!forceCheck && !isLoggedIn()) {
        return { isAuthenticated: false, user: null };
    }

    try {
        const response = await fetch('http://localhost:8080/api/mypage', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const userData = await response.json();
            return { isAuthenticated: true, user: userData };
        } else if (response.status === 401) {
            // 토큰 갱신 시도
            const refreshResult = await refreshToken();
            if (refreshResult) {
                // 재시도
                const retryResponse = await fetch('http://localhost:8080/api/mypage', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (retryResponse.ok) {
                    const userData = await retryResponse.json();
                    return { isAuthenticated: true, user: userData };
                }
            }
            return { isAuthenticated: false, user: null };
        }
        return { isAuthenticated: false, user: null };
    } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        return { isAuthenticated: false, user: null };
    }
};

/**
 * 조용한 인증 상태 확인 (콘솔 로그 최소화)
 * 페이지 로드 시 사용하기 좋음
 */
export const checkAuthStatusSilently = async () => {
    // 쿠키 확인 먼저
    if (!isLoggedIn()) {
        return { isAuthenticated: false, user: null };
    }

    try {
        const response = await fetch('http://localhost:8080/api/mypage', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const userData = await response.json();
            return { isAuthenticated: true, user: userData };
        } else if (response.status === 401) {
            // 조용히 토큰 갱신 시도
            const refreshResponse = await fetch('http://localhost:8080/api/refresh', {
                method: 'POST',
                credentials: 'include',
            });
            
            if (refreshResponse.ok) {
                // 재시도
                const retryResponse = await fetch('http://localhost:8080/api/mypage', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (retryResponse.ok) {
                    const userData = await retryResponse.json();
                    return { isAuthenticated: true, user: userData };
                }
            }
            return { isAuthenticated: false, user: null };
        }
        return { isAuthenticated: false, user: null };
    } catch (error) {
        // 네트워크 오류는 조용히 처리
        return { isAuthenticated: false, user: null };
    }
};

/**
 * 비밀번호 변경 함수
 */
export const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await authenticatedFetch('http://localhost:8080/api/changedPwd', {
            method: 'PUT',
            body: JSON.stringify({
                currentPassword,
                newPassword
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message || '비밀번호 변경에 실패했습니다.' };
        }
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        return { success: false, message: '서버 연결에 실패했습니다.' };
    }
};

/**
 * 계정 삭제 함수
 */
export const deleteAccount = async () => {
    try {
        const response = await authenticatedFetch('http://localhost:8080/api/deletion', {
            method: 'DELETE',
        });

        if (response.ok) {
            // 계정 삭제 성공 시 홈페이지로 리다이렉트
            window.location.href = '/';
            return { success: true, message: '계정이 정상적으로 삭제되었습니다.' };
        } else {
            const errorText = await response.text();
            return { success: false, message: errorText || '계정 삭제에 실패했습니다.' };
        }
    } catch (error) {
        console.error('계정 삭제 오류:', error);
        return { success: false, message: '서버 연결에 실패했습니다.' };
    }
};