import React, { useState, useEffect } from 'react';
import './MyPage.css';
import MyPageEditProfile from './MyPageEditProfile';
import CheckPw from './CheckPw'; 
import ChangePw from './ChangePw';
import WishList  from './WishList';
import RecipeFavorite  from './RecipeFavorite';
import RecipeInfoPage from '../recipepage/RecipeInfoPage'; 
import MyPosts from './MyPosts';
import { PiFinnTheHumanBold } from "react-icons/pi";
import { authenticatedFetch, deleteAccount } from '../../utils/authUtils';
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
    const [currentView, setCurrentView] = useState('main'); 
    const [showPasswordCheck, setShowPasswordCheck] = useState(false); 
    const { user } = useAuth();

    useEffect(() => {
        fetchUserInfo();
    }, []);

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
    };

    const handleCloseChangePw = () => {
        setShowChangePw(false);
    };

    const handleRecipeClick = (recipe) => {
        setSelectedRecipe(recipe);
        setCurrentView('recipeDetail');
        window.history.pushState(
            { page: 'recipeDetail', recipe: recipe.RCP_SEQ }, 
            '', 
            `#recipe-${recipe.RCP_SEQ}`
        );
    };

    const handleBackFromRecipe = () => {
        setSelectedRecipe(null);
        setCurrentView('recipeFavorite');
        window.history.pushState({page: 'recipeFavorite'}, '', window.location.pathname);
    };

    const getProfileImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        return `http://localhost:8080${imageUrl}`;
    };

    const fetchUserInfo = async () => {
        try {
            const response = await authenticatedFetch('http://localhost:8080/api/mypage', {
                method: 'GET',
            });
            
            if (response.ok) {
                const data = await response.json();
                setUserInfo({
                    username: data.username,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    profileImage: data.imageUrl 
                });
            }
        } catch (error) {
            alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleEditProfile = () => {
        setShowPasswordCheck(true);
    };

    const handlePasswordVerified = () => {
        setShowPasswordCheck(false);
        window.history.pushState({page: 'editProfile'}, '', window.location.pathname);
        setCurrentView('editProfile');
    };

    const handlePasswordCheckCancel = () => {
        setShowPasswordCheck(false);
    };

    const handleGoToWishList = () => {
        window.history.pushState({page: 'wishlist'}, '', window.location.pathname);
        setCurrentView('wishlist');
    };

    const handleGoToRecipeFavorite = () => {
        window.history.pushState({page: 'recipeFavorite'}, '', window.location.pathname);
        setCurrentView('recipeFavorite');
    };

    const handleGoToMyPost = () => {
        window.history.pushState({page: 'myPosts'}, '', window.location.pathname);
        setCurrentView('myPosts');
    };


    const handleDeleteAccount = async () => {
        if (window.confirm('정말로 회원탈퇴를 하시겠습니까?\n\n탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
            try {
                const result = await deleteAccount();
                if (result.success) {
                    alert('회원탈퇴가 완료되었습니다.');
                }
            } catch (error) {
                alert('회원탈퇴 중 오류가 발생했습니다.');
            }
        }
    };

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
                        />
                    ) : (
                        <div>
                            <PiFinnTheHumanBold size={80}/>
                        </div>
                    )}
                </div>
                <h2 className="profile-name">
                    {userInfo.username || user?.name || '홍길동'}
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
                
                <div className="bottom-section">
                    <button 
                        onClick={handleDeleteAccount}
                        className="delete-account-btn"
                    >
                        회원탈퇴
                    </button>
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