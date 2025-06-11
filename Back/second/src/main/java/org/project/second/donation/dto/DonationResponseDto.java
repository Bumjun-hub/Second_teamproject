package org.project.second.donation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.second.common.enums.DonationCategory;
import org.project.second.common.enums.DonationStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationResponseDto {
    private Long id;
    private DonationCategory category;
    private DonationStatus status;
    private String username;
    private String title;
    private String content;
    private String province;      //도
    private  String city;         //시
    private  String district;     //구
    private String neighborhood;  //동
    private Long price;
    private List<String> imgUrls;
    private Long viewCount;
    private Long likes;
    private boolean liked;  // 좋아요 여부
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}
