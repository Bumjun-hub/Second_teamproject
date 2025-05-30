import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './BoardWritePage.css';
import Section from './../../components/Section';

const BoardWritePage = () => {
  const navigate = useNavigate();
  const { id, category: urlCategory } = useParams(); // 수정 모드: 게시글 ID와 카테고리
  const isEdit = !!id;

  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    writer: 'guest',
    category: 'FREE',
    content: '',
  });

  // 🔄 기존 게시글 불러오기 (수정용)
  useEffect(() => {
    if (isEdit && urlCategory) {
      fetch(`/api/community/detail/${urlCategory}/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            title: data.title,
            writer: data.username,
            category: data.category,
            content: data.content,
          });
        })
        .catch((err) => {
          console.error("수정용 게시글 불러오기 실패", err);
        });
    }
  }, [isEdit, id, urlCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('category', formData.category);

    const url = isEdit
      ? `/api/community/edit/${id}`
      : '/api/community/write';

    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: data,
      });

      if (response.ok) {
        alert(isEdit ? "게시글이 수정되었습니다!" : "게시글이 등록되었습니다!");
        navigate('/board');
      } else {
        const errorText = await response.text();
        alert("요청 실패: " + errorText);
      }
    } catch (err) {
      console.error("요청 실패", err);
      alert("서버 연결 실패");
    }
  };

  const handleCancel = () => {
    navigate('/board');
  };

  const fetchRole = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/roleinfo", {
        credentials: "include",
      });
      const text = await res.text();
      setRole(text);
    } catch (e) {
      console.error("roleinfo 요청 실패:", e);
    }
  };

  useEffect(() => {
    fetchRole();
  }, []);

  return (
    <Section>
      <div className="write-wrapper">
        <div className="write-container">
          <form id="writeForm" className="input-form" onSubmit={handleSubmit}>
            <h2>{isEdit ? "게시글 수정" : "게시글 작성"}</h2>

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
              placeholder="작성자 이름"
              disabled
            />

            <label>카테고리</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="FREE">자유게시판</option>
              <option value="TIP">꿀팁</option>
              <option value="GROUP_BUY_REVIEW">공구후기</option>
              <option value="COOKING_REVIEW">요리후기</option>
            </select>

            <label>내용</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="내용을 입력해주세요"
              required
            />
            <div className="form-bottom">
              {role === "ROLE_ADMIN" && (
                <label>
                  <input type="checkbox" className="checkbox" />
                  공지글 등록
                </label>
              )}
              <div className='button-area'>
                <button type="button" className="cancel-button" onClick={handleCancel}>취소</button>
                <button type="submit" className="submit-button">{isEdit ? "수정" : "등록"}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
};

export default BoardWritePage;
