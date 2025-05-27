package org.project.second.member.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EditProfileResponse {
    String message;
    String name;
    String email;
    String phone;
    String address;
}
