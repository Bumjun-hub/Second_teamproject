package org.project.second.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum HomitGrade {
    EXPERIENCE("호밋체험단", 0),   //호밋체험단
    MEMBER("호밋회원", 10),       //호밋회원
    SELLER("호밋셀러", 500),       //호밋셀러
    MASTER("호밋마스터", 900),       //호밋마스터
    OWNER("호밋점주", 999999);         //호밋점주(관리자)

    private final String label;
    private final int upGread;
}
