import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MyPage.css';
import MyPageEditProfile from './MyPageEditProfile';
import CheckPw from './CheckPw'; 
import ChangePw from './ChangePw';
import WishList  from './WishList';
import RecipeFavorite  from './RecipeFavorite';
import RecipeInfoPage from '../recipepage/RecipeInfoPage'; 
import MyPosts from './MyPosts';
import { PiFinnTheHumanBold } from "react-icons/pi";
import { authenticatedFetch } from '../../utils/authUtils';
import { useAuth } from '../../utils/AuthProvider';

const MyPage = () => {
    const [showChangePw, setShowChangePw] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null); 

    const [userInfo, setUserInfo] = useState({
        username: '',
        email: '',
        phone: '',
        address: '',
        profileImage: ''
    });
    const [updateKey, setUpdateKey] = useState(0); // ✅ 강제 리렌더링용
    const [currentView, setCurrentView] = useState('main'); 
    const [showPasswordCheck, setShowPasswordCheck] = useState(false); 
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchUserInfo();
    }, []);

    // ✅ 프로필 업데이트 이벤트 감지
    useEffect(() => {
        const handleProfileUpdate = () => {
            console.log('MyPage: 프로필 업데이트 이벤트 감지 - 사용자 정보 새로고침');
            fetchUserInfo(); 
            setUpdateKey(prev => prev + 1); 
        };
        
        const handleAuthChange = () => {
            console.log('MyPage: 인증 변경 이벤트 감지 - 사용자 정보 새로고침');
            fetchUserInfo(); 
            setUpdateKey(prev => prev + 1); 
        };
        
        // 프로필 업데이트 이벤트 리스너 등록
        window.addEventListener('profileUpdate', handleProfileUpdate);
        window.addEventListener('authChange', handleAuthChange);
        
        return () => {
            window.removeEventListener('profileUpdate', handleProfileUpdate);
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    // URL 변경 감지해서 메인 화면으로 리셋
    useEffect(() => {
        if (location.pathname === '/mypage' && !location.hash && !location.search) {
            setCurrentView('main');
            setSelectedRecipe(null);
            setShowChangePw(false);
            setShowPasswordCheck(false);
        }
    }, [location]);

    useEffect(() => {
        const handlePopState = (event) => {
            if (currentView === 'recipeDetail') {
                setSelectedRecipe(null);
                setCurrentView('recipeFavorite');
            } else {
                setCurrentView('main');
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [currentView]);

    const handleChangePassword = () => {
        setShowChangePw(true);
        navigate('/mypage?view=changePw');
    };

    const handleCloseChangePw = () => {
        setShowChangePw(false);
        navigate('/mypage');
    };

    const handleRecipeClick = (recipe) => {
        setSelectedRecipe(recipe);
        setCurrentView('recipeDetail');
        navigate(`/mypage?view=recipeDetail&recipeId=${recipe.RCP_SEQ}`);
    };

    const handleBackFromRecipe = () => {
        setSelectedRecipe(null);
        setCurrentView('recipeFavorite');
        navigate('/mypage?view=recipeFavorite');
    };

    const getProfileImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        // ✅ 이미지 캐시 방지를 위한 타임스탬프 추가
        return `http://localhost:8080${imageUrl}?t=${Date.now()}`;
    };

    const fetchUserInfo = async () => {
        try {
            const response = await authenticatedFetch('http://localhost:8080/api/mypage', {
                method: 'GET',
            });
            
            if (response.ok) {
                const data = await response.json();
                
                setUserInfo({
                    username: data.username || data.name, // ✅ name도 고려
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    profileImage: data.imageUrl 
                });
            }
        } catch (error) {
            console.error('MyPage: 사용자 정보 로드 실패:', error);
            alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleEditProfile = () => {
        setShowPasswordCheck(true);
    };

    const handlePasswordVerified = () => {
        setShowPasswordCheck(false);
        setCurrentView('editProfile');
        navigate('/mypage?view=editProfile');
    };

    const handlePasswordCheckCancel = () => {
        setShowPasswordCheck(false);
        navigate('/mypage'); // 메인으로 돌아가기
    };

    const handleGoToWishList = () => {
        setCurrentView('wishlist');
        navigate('/mypage?view=wishlist');
    };

    const handleGoToRecipeFavorite = () => {
        setCurrentView('recipeFavorite');
        navigate('/mypage?view=recipeFavorite');
    };

    const handleGoToMyPost = () => {
        setCurrentView('myPosts');
        navigate('/mypage?view=myPosts');
    };

    // URL 파라미터에 따라 뷰 설정
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const view = urlParams.get('view');
        const recipeId = urlParams.get('recipeId');

        if (view) {
            setCurrentView(view);
            if (view === 'changePw') {
                setShowChangePw(true);
            } else if (view === 'recipeDetail' && recipeId) {
                // 필요시 레시피 데이터를 다시 가져오는 로직 추가
                // setSelectedRecipe(recipe);
            }
        } else {
            // URL에 view 파라미터가 없으면 메인 화면
            setCurrentView('main');
            setShowChangePw(false);
            setShowPasswordCheck(false);
            setSelectedRecipe(null);
        }
    }, [location.search]);

    // ✅ 프로필 편집에서 메인으로 돌아올 때 사용자 정보 새로고침
    useEffect(() => {
        if (currentView === 'main') {
            fetchUserInfo();
        }
    }, [currentView]);

    if (currentView === 'recipeDetail' && selectedRecipe) {
        return (
            <RecipeInfoPage 
                recipe={selectedRecipe} 
                onBackClick={handleBackFromRecipe}
                hideHeartButton={true}
            />
        );
    }

    if (currentView === 'editProfile') {
        return <MyPageEditProfile />;
    }

    if (currentView === 'wishlist') {
        return <WishList />;
    }

    if (currentView === 'recipeFavorite') {
        return <RecipeFavorite onRecipeClick={handleRecipeClick} />;
    }

    if (currentView === 'myPosts') {
        return <MyPosts />;
    }

    return (
        <div className="mypage-container">
            <div className="profile-section">
                <div className="profile-image">
                    {userInfo.profileImage ? (
                        <img 
                            src={getProfileImageUrl(userInfo.profileImage)}
                            alt="프로필"
                            key={userInfo.profileImage} // ✅ 이미지 변경 시 리렌더링 강제
                        />
                    ) : (
                        <div>
                            <PiFinnTheHumanBold size={80}/>
                        </div>
                    )}
                </div>
                <h2 className="profile-name" key={`username-${updateKey}`}>
                    {userInfo.username || '홍길동'}
                </h2>
                <p className="profile-email">
                    {userInfo.email || user?.email || 'example@email.com'}
                </p>
                <button className="edit-profile-btn" onClick={handleEditProfile}>
                    호밋킹
                </button>
            </div>

            <div className="menu-section">
                <div className="menu-list">
                    <MenuItem 
                        icon="👤" 
                        text="프로필 편집" 
                        onClick={handleEditProfile}
                    />
                    <MenuItem 
                        icon="🔒" 
                        text="비밀번호 변경" 
                        onClick={handleChangePassword}
                    />
                    <MenuItem 
                        icon="💜" 
                        text="위시리스트" 
                        onClick={handleGoToWishList}
                    />
                    <MenuItem 
                        icon="🔖" 
                        text="레시피 즐겨찾기" 
                        onClick={handleGoToRecipeFavorite}
                    />
                    <MenuItem 
                        icon="📝" 
                        text="내가 쓴 글" 
                        onClick={handleGoToMyPost}
                    />
                </div>
            </div>

            {showPasswordCheck && (
                <CheckPw
                    onPasswordVerified={handlePasswordVerified}
                    onCancel={handlePasswordCheckCancel}
                />
            )}

            {showChangePw && (
                <ChangePw 
                    onClose={handleCloseChangePw}
                />
            )}
        </div>
    );
};

const MenuItem = ({ icon, text, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="menu-item"
        >
            <span className="menu-icon">{icon}</span>
            <span className="menu-text">{text}</span>
            <svg 
                className="menu-arrow" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
};

export default MyPage;