package org.project.second.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.second.common.enums.CommunityCategory;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityDto {
    private CommunityCategory category;
    private String title;
    private String content;
    private String isNotice;  // ✅ 문자열로 받음 ("1" or "0")

    public boolean isNoticeBoolean() {
        return "1".equals(isNotice);
        }
}
