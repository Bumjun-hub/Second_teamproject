// 리렌더링 방지 댓글 영역
import React, { useEffect, useState } from 'react';
import './CommentSection.css';

const CommentSection = ({ postId, currentUser, entityType, recipeName, imageUrl }) => {
    const [commentList, setCommentList] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [editCommentId, setEditCommentId] = useState(null); // 수정 중인 댓글 ID
    const [editContent, setEditContent] = useState(''); // 수정 중인 내용
    const COMMENT_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const startIndex = (currentPage - 1) * COMMENT_PER_PAGE;
    const currentComments = commentList.slice(startIndex, startIndex + COMMENT_PER_PAGE);

    // 댓글 불러오기
    const fetchComments = async () => {
        const res = await fetch(`/api/comment/list/${entityType}/${postId}`);
        const data = await res.json();

        if (Array.isArray(data)) {
            // 최신순 정렬 (내림차순)
            data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setCommentList(data);
        }
        setCommentList(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;

        const payload = {
            entityType,
            postId,
            content: commentInput,
        };

        // RECIPE 타입일 경우 추가 필드 포함
        if (entityType === "RECIPE") {
            payload.recipeName = recipeName;
            payload.imageUrl = imageUrl;

        }

        const res = await fetch("/api/comment/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setCommentInput('');
            fetchComments();
        } else {
            const errorText = await res.text();
            console.error("댓글 등록 실패:", errorText);
            alert("댓글 등록 실패");
        }
    };


    const handleDelete = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        const res = await fetch(`/api/comment/delete/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (res.ok) {
            fetchComments(); // 삭제 후 다시 불러오기
        } else {
            alert("댓글 삭제 실패");
        }
    };

    const startEdit = (comment) => {
        setEditCommentId(comment.id);
        setEditContent(comment.content);
    };

    const cancelEdit = () => {
        setEditCommentId(null);
        setEditContent('');
    };

    const handleUpdate = async () => {
        const res = await fetch(`/api/comment/update`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                commentId: editCommentId,
                content: editContent
            })
        });

        if (res.ok) {
            setEditCommentId(null);
            setEditContent('');
            fetchComments(); // 수정 후 다시 불러오기
        } else {
            alert("댓글 수정 실패");
        }
    };


    return (
        <div className="comment-box">
            <h3>댓글</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="comment-textarea"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={currentUser ? "댓글을 입력하세요..." : "로그인 후 작성하세요"}
                    readOnly={!currentUser}
                />
                {currentUser && (
                    <button type="submit" className="comment-submit-btn">댓글 등록</button>
                )}
            </form>

            <ul className="comment-list">
                {currentComments.map((comment) => (
                    <li key={comment.id} className="comment-item">
                        <div className="comment-profile">
                            <img src={comment.profileImage || "/profileimages/default.png"} alt="프로필" />
                        </div>

                        <div className="comment-content">
                            <div className="comment-meta">
                                <div className='comment-meta-left'>
                                    <strong>{comment.username}</strong> • {new Date(comment.createdAt).toLocaleDateString()}
                                </div>

                                <div className="comment-icon-buttons">
                                    {currentUser === comment.username ? (
                                        <>
                                            <button onClick={() => startEdit(comment)} className="icon-btn">✏️</button>
                                            <button onClick={() => handleDelete(comment.id)} className="icon-btn">❌</button>
                                        </>

                                    ) : (
                                        <></>

                                    )}
                                </div>
                            </div>

                            {editCommentId === comment.id ? (
                                <>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="comment-edit-textarea"
                                    />
                                    <div className="comment-actions">
                                        <button onClick={handleUpdate} className="comment-save-btn">저장</button>
                                        <button onClick={cancelEdit} className="comment-cancel-btn">취소</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>{comment.content}</div>

                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            <div className="comment-pagination">
                {Array.from({ length: Math.ceil(commentList.length / COMMENT_PER_PAGE) }, (_, index) => (
                    <button
                        key={index}
                        className={currentPage === index + 1 ? 'active' : ''}
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>


        </div>
    );
};

export default CommentSection;
