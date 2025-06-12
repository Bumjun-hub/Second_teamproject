package org.project.second.common.enums;

public enum HomitGrade {
    EXPERIENCE("호밋체험단"),   //호밋체험단
    MEMBER("호밋회원"),       //호밋회원
    SELLER("호밋셀러"),       //호밋셀러
    MASTER("호밋마스터"),       //호밋마스터
    OWNER("호밋점주");         //호밋점주(관리자)

    private final String label;

    HomitGrade(String label){
        this.label = label;
    }

    public String getLabel(){
        return label;
    }
}
