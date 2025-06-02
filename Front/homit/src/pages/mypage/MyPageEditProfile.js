import React, { useState, useEffect } from 'react';
import './MyPageEditProfile.css';

const MyPageEditProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const currentResponse = await fetch('/api/mypage', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!currentResponse.ok) {
        throw new Error(`현재 정보 조회 실패! status: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();
      
      const editRequest = {
        name: (currentData.username || currentData.name || '') + '_temp_' + Date.now(),
        email: currentData.email || '',
        phone: currentData.phone || '',
        address: currentData.address || ''
      };
      
      const editResponse = await fetch('/api/mypage/editProfile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editRequest)
      });

      if (!editResponse.ok) {
        setProfile({
          name: currentData.username || currentData.name || '',
          email: currentData.email || '',
          phone: currentData.phone || '',
          address: currentData.address || '',
          profileImage: currentData.profileImage || ''
        });
        return;
      }

      const editData = await editResponse.json();
      
      const revertRequest = {
        name: currentData.username || currentData.name || '',
        email: editData.email || '',
        phone: editData.phone || '',
        address: editData.address || ''
      };
      
      const revertResponse = await fetch('/api/mypage/editProfile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(revertRequest)
      });

      if (revertResponse.ok) {
        const finalData = await revertResponse.json();
        setProfile({
          name: finalData.name || '',
          email: finalData.email || '',
          phone: finalData.phone || '',
          address: finalData.address || '',
          profileImage: ''
        });
      } else {
        setProfile({
          name: (editData.name || '').replace(/_temp_\d+$/, ''),
          email: editData.email || '',
          phone: editData.phone || '',
          address: editData.address || '',
          profileImage: ''
        });
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">프로필 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
          <button onClick={fetchProfile} className="retry-btn">다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>내 프로필</h2>
        <button className="edit-btn" disabled>
          수정하기 (준비중)
        </button>
      </div>

      <div className="profile-content">
        {/* 프로필 이미지 섹션 */}
        <div className="profile-image-section">
          <div className="profile-image-wrapper">
            {profile.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt="프로필 이미지"
                className="profile-image"
              />
            ) : (
              <div className="default-profile-image">
                <span>{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 프로필 정보 섹션 */}
        <div className="profile-info-section">
          <div className="info-group">
            <label>이름</label>
            <div className="info-value">
              {profile.name && profile.name.trim() !== '' ? profile.name : '정보 없음'}
            </div>
          </div>

          <div className="info-group">
            <label>이메일</label>
            <div className="info-value">
              {profile.email && profile.email.trim() !== '' ? profile.email : '정보 없음'}
            </div>
          </div>

          <div className="info-group">
            <label>전화번호</label>
            <div className="info-value">
              {profile.phone && profile.phone.trim() !== '' ? profile.phone : '전화번호 정보 없음'}
            </div>
          </div>

          <div className="info-group">
            <label>주소</label>
            <div className="info-value">
              {profile.address && profile.address.trim() !== '' ? profile.address : '주소 정보 없음'}
            </div>
          </div>
        </div>
      </div>

      {/* 디버그 정보 (개발용) */}
      <div className="debug-section">
        <details>
          <summary>디버그 정보 (개발용)</summary>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default MyPageEditProfile;