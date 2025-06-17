import { useNavigate } from "react-router-dom";
import Section from "../../components/Section";
import { useState, useEffect } from "react";
import './BoardPage.css';
import { IoIosArrowUp } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

const BoardPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    // 사용자 로그인 여부 확인
    const [currentUser, setCurrentUser] = useState(null);

    const ITEMS_PER_PAGE = 15;

    const [searchField, setSearchField] = useState('title');
    const [searchQuery, setSearchQuery] = useState('');
    const categories = ['전체', '자유게시판', '꿀팁', '공구후기', '요리후기'];
    const [selectedCategory, setSelectedCategory] = useState('전체');

    const [thumbnail, setThumbnail] = useState({ visible: false, x: 0, y: 0, url: '' });

    // 기본값 : 작성일 기준으로 내림차순
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc', });


    const categoryMap = {
        '자유게시판': 'FREE',
        '꿀팁': 'TIP',
        '공구후기': 'GROUP_BUY_REVIEW',
        '요리후기': 'COOKING_REVIEW'
    };

    const categoryLabelMap = {
        FREE: "자유게시판",
        TIP: "꿀팁",
        GROUP_BUY_REVIEW: "공구후기",
        COOKING_REVIEW: "요리후기"
    };

    const fetchData = async () => {
        try {
            let result = [];

            if (selectedCategory === '전체') {
                const all = await Promise.all([
                    fetch("/api/community/view/FREE").then(res => res.json()),
                    fetch("/api/community/view/TIP").then(res => res.json()),
                    fetch("/api/community/view/GROUP_BUY_REVIEW").then(res => res.json()),
                    fetch("/api/community/view/COOKING_REVIEW").then(res => res.json()),
                ]);
                result = all.flat();
            } else {
                const categoryEnum = categoryMap[selectedCategory];
                const res = await fetch(`/api/community/view/${categoryEnum}`);
                result = await res.json();
            }

            setData(result);
            setFilteredData(result);
            setCurrentPage(1);
        } catch (error) {
            console.error("데이터 불러오기 실패:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedCategory]);

    useEffect(() => {
        fetch("api/mypage", { credentials: "include" })
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data && data.name) setCurrentUser(data.name);
            })
            .catch(() => setCurrentUser(null));
    }, []);

    const handleWrite = () => {
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        navigate("/board/write");
    }

    const handleSearch = () => {
        let filtered = [...data];

        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item[searchField]?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    };

    // 정렬 이벤트
    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                if (prev.direction === 'desc') return { key, direction: 'asc' };
                if (prev.direction === 'asc') return { key: null, direction: null };
            }
            return { key, direction: 'desc' }; // ★ 처음 누르면 desc부터 시작
        });
    };


    const getSortArrow = (key) => {
        if (sortConfig.key !== key) return <FaSort />; // 정렬 중이 아님
        if (sortConfig.direction === 'asc') return <FaSortUp />;
        if (sortConfig.direction === 'desc') return <FaSortDown />;
        return '';
    };


    const noticePosts = filteredData.filter(item => item.notice === true);
    const normalPosts = filteredData.filter(item => item.notice !== true);

    // 게시글 정렬
    const sortedPosts = [...normalPosts]; // 원본 훼손 방지용 복사
    if (sortConfig.key && sortConfig.direction) {
        sortedPosts.sort((a, b) => {
            const aValue = sortConfig.key === 'createdAt' ? new Date(a[sortConfig.key]) : a[sortConfig.key];
            const bValue = sortConfig.key === 'createdAt' ? new Date(b[sortConfig.key]) : b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalPages = Math.ceil(normalPosts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = sortedPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);




    return (
        <Section>
            <div className="bp-pageinfo">
                <div className="bp-header">
                    <h2 className="bp-title">다양한 정보를 공유해보세요!</h2>
                </div>
            </div>

            <div className="bp-category-filter">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={selectedCategory === cat ? 'active' : ''}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="bp-table-container">
                <button className="bp-write-button" onClick={handleWrite}>
                    글쓰기
                </button>

                <table className="bp-table">
                    <thead>
                        <tr>
                            <th>카테고리</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일<button className="bp-sort-button" onClick={() => handleSort('createdAt')}>
                                {getSortArrow('createdAt')}</button></th>
                            <th>조회수<button className="bp-sort-button" onClick={() => handleSort('viewCount')}>
                                {getSortArrow('viewCount')}</button></th>
                            <th>추천수<button className="bp-sort-button" onClick={() => handleSort('likes')}>
                                {getSortArrow('likes')}</button></th>
                        </tr>
                    </thead>
                    <tbody>
                        {noticePosts.map((item) => (
                            <tr key={item.id} className="bp-notice-row">
                                <td>{item.notice === true ? "공지사항" : categoryLabelMap[item.category]}</td>
                                <td>
                                    <a
                                        onMouseEnter={(e) => {
                                            if (item.imgUrls && item.imgUrls.length > 0) {
                                                const rect = e.target.getBoundingClientRect();
                                                setThumbnail({
                                                    visible: true,
                                                    x: e.clientX + 10,
                                                    y: window.scrollY + rect.top - 160,
                                                    url: item.imgUrls[0]
                                                });
                                            }
                                        }}
                                        onMouseLeave={() => setThumbnail({ visible: false, x: 0, y: 0, url: '' })}
                                        onClick={() => navigate(`/board/info/${item.category}/${item.id}`)}
                                    >
                                        {item.title}
                                    </a>
                                </td>
                                <td>{item.username}</td>
                                <td>{new Date(item.createdAt).toISOString().slice(0, 10)}</td>
                                <td>{item.viewCount}</td>
                                <td>{item.likes}</td>
                            </tr>
                        ))}

                        {currentItems.map((item) => (
                            <tr key={item.id}>
                                <td>{categoryLabelMap[item.category]}</td>
                                <td>
                                    <a
                                        onMouseEnter={(e) => {
                                            if (item.imgUrls && item.imgUrls.length > 0) {
                                                const rect = e.target.getBoundingClientRect();
                                                setThumbnail({
                                                    visible: true,
                                                    x: e.clientX + 10,
                                                    y: window.scrollY + rect.top - 80,
                                                    url: item.imgUrls[0]
                                                });
                                            }
                                        }}
                                        onMouseLeave={() => setThumbnail({ visible: false, x: 0, y: 0, url: '' })}
                                        onClick={() => navigate(`/board/info/${item.category}/${item.id}`)}
                                    >
                                        {item.title}
                                    </a>
                                </td>
                                <td>{item.username}</td>
                                <td>{new Date(item.createdAt).toISOString().slice(0, 10)}</td>
                                <td>{item.viewCount}</td>
                                <td>{item.likes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="bp-pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            className={currentPage === index + 1 ? 'active' : ''}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

                <div className="bp-search-bar">
                    <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="bp-search-select"
                    >
                        <option value="title">제목</option>
                        <option value="writer">작성자</option>
                    </select>
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        className="bp-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bp-search-button" onClick={handleSearch}>검색</button>
                </div>
            </div>

            {/* 썸네일 */}
            {thumbnail.visible && (
                <div
                    className="bp-thumbnail-tooltip"
                    style={{ top: thumbnail.y, left: thumbnail.x, position: 'absolute' }}
                >
                    <img src={thumbnail.url} alt="썸네일" />
                </div>
            )}
        </Section>
    );
};

export default BoardPage;
