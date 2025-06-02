import { useNavigate } from "react-router-dom";
import Section from "../../components/Section";
import { useState, useEffect } from "react";
import './BoardPage.css';

const BoardPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const [searchField, setSearchField] = useState('title');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['전체', '자유게시판', '꿀팁', '공구후기', '요리후기'];
    const [selectedCategory, setSelectedCategory] = useState('전체');

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
    // ✅ 게시글 불러오기
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

    // ✅ 검색
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

    // ✅ 페이지 계산
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <Section>
            <div className="Pageinfo">
                <div className="board-header">
                    <h2 className="board-title">다양한 정보를 공유해보세요!</h2>
                </div>
            </div>

            {/* 카테고리 필터 버튼 */}
            <div className="category-filter">
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

            <div className="boardtable-container">
                <button className="write-button" onClick={() => navigate("/board/write")}>
                    글쓰기
                </button>

                <table className="board-table">
                    <thead>
                        <tr>
                            <th>카테고리</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                            <th>조회</th>
                            <th>추천</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 공지글 항상 맨 위 */}
                        {filteredData
                            .filter(item => item.isNotice)
                            .map((item) => (
                                <tr key={item.id} className="notice-row">
                                    <td>{categoryLabelMap[item.category]}</td>
                                    <td>
                                        <a onClick={() => navigate(`/board/info/${item.category}/${item.id}`)}>
                                            {item.title}
                                        </a>
                                    </td>
                                    <td>{item.username}</td>
                                    <td>{new Date(item.createdAt).toISOString().slice(0, 10)}</td>
                                    <td>{item.viewCount}</td>
                                    <td>{item.likes}</td>
                                </tr>
                            ))}

                        {/* 일반글 - 페이지네이션 대상 */}
                        {filteredData
                            .filter(item => !item.isNotice)
                            .slice(startIndex, startIndex + ITEMS_PER_PAGE)
                            .map((item) => (
                                <tr key={item.id}>
                                    <td>{categoryLabelMap[item.category]}</td>
                                    <td>
                                        <a onClick={() => navigate(`/board/info/${item.category}/${item.id}`)}>
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

                {/* 페이지네이션 */}
                <div className="board-pagination">
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

                {/* 검색창 */}
                <div className="search-bar">
                    <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="search-select"
                    >
                        <option value="title">제목</option>
                        <option value="writer">작성자</option>
                    </select>

                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <button className="search-button" onClick={handleSearch}>
                        검색
                    </button>
                </div>
            </div>
        </Section>
    );
};

export default BoardPage;
