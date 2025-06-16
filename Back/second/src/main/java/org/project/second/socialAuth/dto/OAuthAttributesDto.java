package org.project.second.socialAuth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.project.second.common.enums.SocialProvider;

import java.util.Map;

@Getter
@Setter
@Builder
@Slf4j
public class OAuthAttributesDto {
    private Map<String, Object> attributes; // JSON으로 키값으로 넘어옴, value 부분이 String으로만 넘어온다는 보장이 없어서 Object로
    private String nameAttributeKey;
    private String email;
    private String name;
    private String profileImage;
    private SocialProvider socialProvider;

    public static OAuthAttributesDto of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
        log.info("OAuthAttributesDto.of 호출 - registrationId: {}, userNameAttributeName: {}, attributes: {}",
                registrationId, userNameAttributeName, attributes);

        if ("google".equals(registrationId)) {
            return ofGoogle(userNameAttributeName, attributes);
        }
        // 다른 제공자 처리 (예: kakao, naver)
        return null; // 여기서 null 반환 가능
    }

    private static OAuthAttributesDto ofGoogle(String userNameAttributeName, Map<String, Object> attributes) {
        log.info("ofGoogle 호출 - attributes: {}", attributes);
        return OAuthAttributesDto.builder()
                .name((String) attributes.get("name"))
                .email((String) attributes.get("email"))
                .socialProvider(SocialProvider.GOOGLE)
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }

}
