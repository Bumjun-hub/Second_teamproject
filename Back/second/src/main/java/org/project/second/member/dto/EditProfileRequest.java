package org.project.second.member.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EditProfileRequest {
    String name;
    String email;
    String phone;
    String address;
}
