package org.project.second.grade.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeResponseDto {

    private boolean upgraded;      // 등급이 올라갔는지 여부
    private String message;        // 보여줄 메시지 (등급이 올라간 경우만)
    private String gradeName;      // 현재 등급 이름 (프론트에서 쓸 수도 있음)

}
