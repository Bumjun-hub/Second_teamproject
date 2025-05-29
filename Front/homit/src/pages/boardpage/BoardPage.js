import { useNavigate } from "react-router-dom";
import Section from "../../components/Section";
import { boarddummyData } from '../../data/dummyGroupBuyData';
import { useState, useEffect } from "react";
import './BoardPage.css';

const BoardPage = () => {
    const navigate = useNavigate();

    // 전체 데이터 상태
    const [data, setData] = useState(boarddummyData);

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // 검색 조건 상태
    const [searchField, setSearchField] = useState('title');  // 검색 기준 필드 (제목 or 작성자)
    const [searchQuery, setSearchQuery] = useState('');       // 검색어

    // 카테고리 버튼 목록 및 선택 상태
    const categories = ['전체', '자유게시판', '꿀팁', '공구후기', '요리후기'];
    const [selectedCategory, setSelectedCategory] = useState('전체');

    // 버튼에 보이는 이름과 실제 데이터 값 연결
    const categoryMap = {
        '전체': null,
        '자유게시판': '자유',
        '꿀팁': '꿀팁',
        '공구후기': '공구후기',
        '요리후기': '요리후기',
    };

    // 🔁 카테고리 버튼 클릭 시 자동으로 해당 게시글만 필터링
    useEffect(() => {
        let filtered = boarddummyData;

        if (selectedCategory !== '전체') {
            const actualCategory = categoryMap[selectedCategory];
            filtered = filtered.filter(item => item.category === actualCategory);
        }

        setData(filtered);
        setCurrentPage(1); // 필터링되면 첫 페이지로 이동
    }, [selectedCategory]);

    // 🔍 검색 버튼 클릭 시 필터링 (카테고리 + 입력어 기준)
    const handleSearch = () => {
        let filtered = boarddummyData;

        // 카테고리 필터
        if (selectedCategory !== '전체') {
            const actualCategory = categoryMap[selectedCategory];
            filtered = filtered.filter(item => item.category === actualCategory);
        }

        // 입력된 검색어 기준 필터
        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(item =>
                item[searchField].toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setData(filtered);
        setCurrentPage(1);
    };

    // 현재 페이지에서 보여줄 게시글 목록 계산
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <Section>
            {/* 상단 제목 영역 */}
            <div className="Pageinfo">
                <div className="board-header">
                    <h2 className="board-title">다양한 정보를 공유해보세요!</h2>
                </div>
            </div>

            {/* 카테고리 버튼 */}
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
                {/* 글쓰기 버튼 */}
                <button className="write-button" onClick={() => navigate("/board/write")}>
                    글쓰기
                </button>

                {/* 게시글 테이블 */}
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
                        {currentItems.map((item) => (
                            <tr key={item.id}>
                                <td>{item.category}</td>
                                <td>
                                    <a onClick={() => navigate(`/board/info/${item.id}`)}>
                                        {item.title}
                                    </a>
                                </td>
                                <td>{item.writer}</td>
                                <td>{item.date}</td>
                                <td>{item.count}</td>
                                <td>{item.like}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* 페이지네이션 버튼 */}
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
