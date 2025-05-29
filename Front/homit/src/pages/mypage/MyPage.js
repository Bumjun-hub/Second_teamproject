import React, { useState, useEffect } from 'react';
import './MyPage.css';
import MyPageEditProfile from './MyPageEditProfile';
import { PiFinnTheHumanBold } from "react-icons/pi";

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('main'); // 'main' 또는 'editProfile'

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/mypage', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };



  // 회원탈퇴 처리
  const handleDeleteAccount = async () => {
    if (window.confirm('정말로 회원탈퇴를 하시겠습니까?')) {
      try {
        const response = await fetch('/api/deletion', {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (response.ok) {
          alert('회원탈퇴가 완료되었습니다.');
          window.location.href = '/';
        }
      } catch (error) {
        console.error('회원탈퇴 실패:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">로딩중...</div>;
  }

  // 프로필 편집 화면으로 전환
  if (currentView === 'editProfile') {
    return (
      <MyPageEditProfile 
        onBack={() => {
          setCurrentView('main');
          fetchUserInfo(); // 돌아올 때 최신 정보로 업데이트
        }}
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
              src={`/profileimages/${userInfo.profileImage}`}
              alt="프로필"
            />
          ) : (
            <svg fill="currentColor" viewBox="0 0 24 24">
              <PiFinnTheHumanBold size={20}/>
            </svg>
          )}
        </div>
        <h2 className="profile-name">
          {userInfo.username || '홍길동'}
        </h2>
        <p className="profile-email">
          {userInfo.email || 'example@email.com'}
        </p>
        <button className="edit-profile-btn" onClick={() => setCurrentView('editProfile')}>
          호밋킹
        </button>
      </div>

      {/* 메뉴 섹션 */}
      <div className="menu-section">
        <div className="menu-list">
          <MenuItem 
            icon="👤" 
            text="프로필 편집" 
            onClick={() => setCurrentView('editProfile')}
          />
          <MenuItem 
            icon="🔒" 
            text="비밀번호 변경" 
            onClick={() => console.log('비밀번호 변경')}
          />
          <MenuItem 
            icon="💜" 
            text="위시리스트" 
            onClick={() => console.log('위시리스트')}
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