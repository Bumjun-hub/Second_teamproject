import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BoardWritePage.css';
import Section from './../../components/Section';

const BoardWritePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    writer: 'guest', // 추후 로그인 유저 이름으로 대체 예정
    category: '자유게시판',
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('작성된 글:', formData);
    navigate('/board');
  };

  const handleCancel = () => {
    navigate('/board');
  };

  return (
    <Section>
      <div className="write-wrapper">
        <div className="write-container">
          <form id="writeForm" className="input-form" onSubmit={handleSubmit}>
            <label>제목</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="제목을 입력해주세요"
              required
            />

            <label>작성자</label>
            <input
              name="writer"
              value={formData.writer}
              onChange={handleChange}
              placeholder="작성자 이름"
              disabled
            />

            <label>카테고리</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="자유게시판">자유게시판</option>
              <option value="꿀팁">꿀팁</option>
              <option value="공구후기">공구후기</option>
              <option value="요리후기">요리후기</option>
            </select>

            <label>내용</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="내용을 입력해주세요"
              required
            />
            <div className="form-buttons">
              <button type="button" className="cancel-button" onClick={handleCancel}>취소</button>
              <button type="submit" className="submit-button">등록</button>
            </div>

          </form>
        </div>
      </div>
    </Section>
  );
};

export default BoardWritePage;
