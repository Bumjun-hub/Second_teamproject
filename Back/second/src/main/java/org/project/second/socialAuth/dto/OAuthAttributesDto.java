package org.project.second.socialAuth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.project.second.common.enums.SocialProvider;

import java.util.Map;

@Getter
@Setter
@Builder
public class OAuthAttributesDto {
    private Map<String, Object> attributes; // JSON으로 키값으로 넘어옴, value 부분이 String으로만 넘어온다는 보장이 없어서 Object로
    private String nameAttributeKey;
    private String email;
    private String name;
    private String profileImage;
    private SocialProvider socialProvider;

    public static OAuthAttributesDto of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
        return OAuthAttributesDto.builder()
                .email((String)attributes.get("email"))
                .name((String)attributes.get("name"))
                .profileImage((String)attributes.get("picture"))
                .socialProvider(SocialProvider.GOOGLE)
                .build();
    }

}
