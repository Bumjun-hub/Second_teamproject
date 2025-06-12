import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/authUtils';
import './MyPosts.css';
import { MdOutlineModeEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

const MyPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchMyPosts();
    }, []);

    // 현재 사용자 정보를 가져오는 함수
    const getCurrentUser = async () => {
        // API 엔드포인트 시도
        const apiEndpoints = [
            'http://localhost:8080/api/mypage',
            'http://localhost:8080/api/user/me',
            'http://localhost:8080/api/member/me',
            'http://localhost:8080/api/auth/me'
        ];

        for (const endpoint of apiEndpoints) {
            try {
                const response = await authenticatedFetch(endpoint, {
                    method: 'GET',
                });
                if (response.ok) {
                    const userData = await response.json();
                    return userData;
                }
            } catch (error) {
                console.log(`${endpoint} 시도 실패:`, error);
            }
        }
        return null;
    };

    const fetchMyPosts = async () => {
        try {
            setLoading(true);
            
            // 1. 현재 사용자 정보 가져오기
            const user = await getCurrentUser();
            if (!user) {
                setError('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
                return;
            }
            
            setCurrentUser(user);
            
            // 2. 모든 카테고리의 게시글 가져오기
            const categories = ['FREE', 'TIP', 'GROUP_BUY_REVIEW', 'COOKING_REVIEW'];
            const allPosts = [];
            
            for (const category of categories) {
                try {
                    const response = await authenticatedFetch(`http://localhost:8080/api/community/view/${category}`, {
                        method: 'GET',
                    });
                    
                    if (response.ok) {
                        const categoryPosts = await response.json();
                        allPosts.push(...categoryPosts);
                    }
                } catch (error) {
                    console.error(`카테고리 ${category} 조회 실패:`, error);
                }
            }
            
            // 3. 내 게시글만 필터링
            const myPosts = allPosts.filter(post => {
                const userIdentifiers = [
                    user.username,
                    user.name,
                    user.email
                ];
                
                // 게시글에서 가능한 작성자 식별자들
                const postAuthor = post.username;
                
                // 사용자의 식별자 중 하나라도 게시글 작성자와 일치하면 내 글
                return userIdentifiers.some(identifier => 
                    identifier && postAuthor && identifier === postAuthor
                );
            });
            
            // 4. 최신 순으로 정렬
            myPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setPosts(myPosts);
            
        } catch (error) {
            setError('게시글을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await authenticatedFetch(`http://localhost:8080/api/community/delete/${postId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                setPosts(posts.filter(post => post.id !== postId));
                alert('게시글이 삭제되었습니다.');
            } else {
                alert('게시글 삭제에 실패했습니다.');
            }
        } catch (error) {
            alert('네트워크 오류가 발생했습니다.');
        }
    };

    const handleEditPost = (post) => {
        // 게시글 편집 페이지로 이동하는 로직 (카테고리와 ID 필요)
        window.location.href = `/board/edit/${post.category}/${post.id}`;
    };

    const handleViewPost = (post) => {
        // 게시글 상세보기 페이지로 이동하는 로직
        window.location.href = `/board/info/${post.category}/${post.id}`;
    };

    const filteredPosts = posts.filter(post => {
        if (activeTab === 'all') return true;
        if (activeTab === 'FREE') return post.category === 'FREE';
        if (activeTab === 'TIP') return post.category === 'TIP';
        if (activeTab === 'GROUP_BUY_REVIEW') return post.category === 'GROUP_BUY_REVIEW';
        if (activeTab === 'COOKING_REVIEW') return post.category === 'COOKING_REVIEW';
        return true;
    });

    const getCategoryName = (category) => {
        const categoryMap = {
            'FREE': '자유게시판',
            'TIP': '꿀팁',
            'GROUP_BUY_REVIEW': '공구후기',
            'COOKING_REVIEW': '요리후기'
        };
        return categoryMap[category] || category;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="myposts-container">
                <div className="loading">게시글을 불러오는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="myposts-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="myposts-container">
            <div className="myposts-header">
                <h2>내가 쓴 글</h2>
                <p className="posts-count">총 {posts.length}개의 게시글</p>
            </div>

            <div className="tab-container">
                <button 
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    전체 ({posts.length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'FREE' ? 'active' : ''}`}
                    onClick={() => setActiveTab('FREE')}
                >
                    자유게시판 ({posts.filter(p => p.category === 'FREE').length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'TIP' ? 'active' : ''}`}
                    onClick={() => setActiveTab('TIP')}
                >
                    꿀팁 ({posts.filter(p => p.category === 'TIP').length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'GROUP_BUY_REVIEW' ? 'active' : ''}`}
                    onClick={() => setActiveTab('GROUP_BUY_REVIEW')}
                >
                    공구후기 ({posts.filter(p => p.category === 'GROUP_BUY_REVIEW').length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'COOKING_REVIEW' ? 'active' : ''}`}
                    onClick={() => setActiveTab('COOKING_REVIEW')}
                >
                    요리후기 ({posts.filter(p => p.category === 'COOKING_REVIEW').length})
                </button>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="empty-container">
                    <div className="empty-icon">📝</div>
                    <h3>작성한 게시글이 없습니다</h3>
                    <p>게시글을 작성해보세요!</p>
                    <button 
                        className="write-btn"
                        onClick={() => window.location.href = '/board'}
                    >
                        글쓰기
                    </button>
                </div>
            ) : (
                <div className="posts-list">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="post-item" onClick={() => handleViewPost(post)}>
                            <div className="post-content">
                                <div className="post-header">
                                    <h3 className="post-title">
                                        {post.title}
                                    </h3>
                                </div>
                                
                                <p className="post-excerpt">
                                    {post.content ? post.content.substring(0, 150) + '...' : '내용 없음'}
                                </p>
                                
                                <div className="post-meta">
                                    <span className="post-date">{formatDate(post.createdAt)}</span>
                                    <span className="post-views">조회수 {post.viewCount || 0}</span>
                                    <span className="post-likes">좋아요 {post.likes || 0}</span>
                                </div>
                            </div>
                            
                            <div className="post-actions">
                                <button 
                                    className="action-btn edit-btn"
                                    onClick={() => handleEditPost(post)}
                                    title="수정"
                                >
                                    <MdOutlineModeEdit size={25}/>
                                </button>
                                <button 
                                    className="action-btn delete-btn"
                                    onClick={() => handleDeletePost(post.id)}
                                    title="삭제"
                                >
                                    <RiDeleteBin6Line size={25}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPosts;