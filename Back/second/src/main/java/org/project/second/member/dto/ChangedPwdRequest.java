package org.project.second.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class ChangedPwdRequest {
    String oldPassword;
    String newPassword;
    String confirmPassword;
}
