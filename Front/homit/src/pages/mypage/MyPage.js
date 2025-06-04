import React, { useState, useEffect } from 'react';
import './MyPage.css';
import MyPageEditProfile from './MyPageEditProfile';
import CheckPw from './CheckPw'; 
import ChangePw from './ChangePw';
import WishList  from './WishList';
import { PiFinnTheHumanBold } from "react-icons/pi";
import { authenticatedFetch, deleteAccount } from '../../utils/authUtils';
import { useAuth } from '../../utils/AuthProvider';

const MyPage = () => {
    const [showChangePw, setShowChangePw] = useState(false);

    const handleChangePassword = () => {
        setShowChangePw(true);
    };

    const handleCloseChangePw = () => {
        setShowChangePw(false);
    };

    const handlePasswordChangeSuccess = () => {
        console.log('비밀번호 변경 완료');
    };
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

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 브라우저 뒤로가기 처리
  useEffect(() => {
    const handlePopState = (event) => {
      // 브라우저 뒤로가기 시 메인 화면으로 이동
      setCurrentView('main');
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 프로필 이미지 URL 생성 함수
  const getProfileImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  return `http://localhost:8080${imageUrl}`;
};

  // 사용자 정보 가져오기 (토큰 자동 갱신 포함)
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
      } else {
        if (response.status === 403) {
          alert('접근 권한이 없습니다.');
        } else if (response.status === 500) {
          alert('서버 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      if (error.message !== '인증이 만료되었습니다. 다시 로그인해주세요.') {
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {

    }
  };
  // 프로필 편집 버튼 클릭 시 - 비밀번호 확인 모달 표시
  const handleEditProfile = () => {
    setShowPasswordCheck(true);
  };
  
  // 비밀번호 확인 완료 시 - 프로필 편집 페이지로 이동
  const handlePasswordVerified = () => {
    setShowPasswordCheck(false);
    // 히스토리에 새 상태 추가
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
  
  // 회원탈퇴 처리 (토큰 자동 갱신 포함)
  const handleDeleteAccount = async () => {
    if (window.confirm('정말로 회원탈퇴를 하시겠습니까?\n\n탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      try {
        const result = await deleteAccount();
        if (result.success) {
          alert('회원탈퇴가 완료되었습니다.');
        } else {
          alert(result.message || '회원탈퇴에 실패했습니다.');
        }
      } catch (error) {
        alert('회원탈퇴 중 오류가 발생했습니다.');
      }
    }
  };
  
  // 프로필 편집 화면으로 전환
  if (currentView === 'editProfile') {
    return (
      <MyPageEditProfile 
        // onBack 제거 - 브라우저 뒤로가기 사용
      />
    );
  }

  // 위시리스트 화면으로 전환
  if (currentView === 'wishlist') {
    return (
      <WishList 
        // onBack 제거 - 브라우저 뒤로가기 사용
      />
    );
  }

  return (
    <div className="mypage-container">
      {/* 프로필 섹션 */}
      <div className="profile-section">
        <div className="profile-image">
          {userInfo.profileImage ? (
            <img 
              src={getProfileImageUrl(userInfo.profileImage)}
              alt="프로필"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
              onLoad={() => {
              }}
            />
          ) : null}
          {/* 기본 아이콘 (이미지가 없거나 로드 실패시 표시) */}
          <div 
            style={{ 
              display: userInfo.profileImage ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <PiFinnTheHumanBold size={40}/>
          </div>
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
      {/* 메뉴 섹션 */}
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
            onClick={() => console.log('레시피 즐겨찾기')}
          />
          <MenuItem 
            icon="📝" 
            text="내가 쓴 글" 
            onClick={() => console.log('내가 쓴 글')}
          />
        </div>
        {/* 하단 버튼 */}
        <div className="bottom-section">
          <button 
            onClick={handleDeleteAccount}
            className="delete-account-btn"
          >
            회원탈퇴
          </button>
        </div>
      </div>
      {/* 비밀번호 확인 모달 */}
      {showPasswordCheck && (
        <CheckPw
          onPasswordVerified={handlePasswordVerified}
          onCancel={handlePasswordCheckCancel}
        />
      )}
      {/* 새로 추가: 비밀번호 변경 모달 */}
            {showChangePw && (
                <ChangePw 
                    onClose={handleCloseChangePw}
                    onSuccess={handlePasswordChangeSuccess}
                />
            )}
    </div>
  );
};

// 메뉴 아이템 컴포넌트
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