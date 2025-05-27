package org.project.second.community.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.second.common.enums.CommunityCategory;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommunityDto {
    private CommunityCategory category;
    private String title;
    private String content;
}
