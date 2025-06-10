package org.project.second.donation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.second.common.enums.DonationCategory;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationDto {

    private DonationCategory category;
    private Long id;
    private String title;
    private String content;
    private String province;      //도
    private  String city;         //시
    private  String district;     //구
    private String neighborhood;  //동
    private Long price;

}
