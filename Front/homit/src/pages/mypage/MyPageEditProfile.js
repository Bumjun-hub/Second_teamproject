import React, { useState, useEffect } from 'react';
import './MyPageEditProfile.css';

const MyPageEditProfile = () => {
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mypage', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.username || data.name,
          email: data.email,
          phone: data.phone,
          address: data.address
        });
      } else {
        setError(`서버 오류: ${response.status}`);
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setEditData({ ...profile });
    setEditMode(true);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditData({});
    setError('');
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      
      // 변경된 필드만 찾기
      const changedFields = {};
      let hasChanges = false;
      
      Object.keys(editData).forEach(key => {
        if (editData[key] !== profile[key]) {
          changedFields[key] = editData[key];
          hasChanges = true;
        }
      });
      
      console.log('현재 프로필:', profile);
      console.log('편집 데이터:', editData);
      console.log('변경된 필드만:', changedFields);
      
      // 변경사항이 없으면 바로 완료
      if (!hasChanges) {
        setSuccess('변경사항이 없습니다.');
        setEditMode(false);
        setEditData({});
        return;
      }
      
      // 이름이 변경되지 않았다면 기존 이름 제외하고 전송
      const sendData = { ...editData };
      if (editData.name === profile.name) {
        // 이름이 같으면 이름 필드 제외
        const { name, ...dataWithoutName } = sendData;
        console.log('이름 제외하고 전송:', dataWithoutName);
        
        const response = await fetch('/api/mypage/editProfile', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataWithoutName)
        });
        
        await handleResponse(response);
      } else {
        // 이름이 변경되었으면 전체 데이터 전송
        console.log('전체 데이터 전송:', sendData);
        
        const response = await fetch('/api/mypage/editProfile', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sendData)
        });
        
        await handleResponse(response);
      }
      
    } catch (err) {
      console.error('에러:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response) => {
    console.log('응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('응답 데이터:', data);
      
      setProfile({
        name: data.username || data.name,
        email: data.email,
        phone: data.phone,
        address: data.address
      });
      setSuccess(data.message || '프로필이 성공적으로 업데이트되었습니다.');
      setEditMode(false);
      setEditData({});
    } else {
      const responseText = await response.text();
      console.log('에러 응답:', responseText);
      
      if (response.status === 401) {
        setError('인증 오류: 로그인을 다시 해주세요.');
      } else {
        try {
          const errorData = JSON.parse(responseText);
          setError(errorData.error || errorData.message || '프로필 업데이트 실패');
        } catch (e) {
          setError('서버 오류가 발생했습니다.');
        }
      }
    }
  };

  if (loading && !editMode) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="mypage-header">
          <h1>마이페이지</h1>
          {!editMode && (
            <button onClick={startEdit} className="edit-button">편집</button>
          )}
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <div className="profile-content">
          <div className="field-group">
            <label>사용자명</label>
            {editMode ? (
              <input
                type="text"
                value={editData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="사용자명을 입력하세요"
              />
            ) : (
              <span>{profile.name || '설정되지 않음'}</span>
            )}
          </div>

          <div className="field-group">
            <label>이메일</label>
            {editMode ? (
              <input
                type="email"
                value={editData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="이메일을 입력하세요"
              />
            ) : (
              <span>{profile.email || '설정되지 않음'}</span>
            )}
          </div>

          <div className="field-group">
            <label>전화번호</label>
            {editMode ? (
              <input
                type="tel"
                value={editData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="전화번호를 입력하세요"
              />
            ) : (
              <span>{profile.phone || '설정되지 않음'}</span>
            )}
          </div>

          <div className="field-group">
            <label>주소</label>
            {editMode ? (
              <textarea
                value={editData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="주소를 입력하세요"
                rows={3}
              />
            ) : (
              <span>{profile.address || '설정되지 않음'}</span>
            )}
          </div>
        </div>

        {editMode && (
          <div className="action-buttons">
            <button onClick={cancelEdit} className="cancel-button">취소</button>
            <button onClick={updateProfile} disabled={loading} className="save-button">
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPageEditProfile;