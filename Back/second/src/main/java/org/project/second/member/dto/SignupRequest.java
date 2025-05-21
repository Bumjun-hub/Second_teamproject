package org.project.second.member.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SignupRequest {
    private String email;
    private String password;
    private String confirmPassword;
    private String username;
    private String address;
    private String phone;
}
