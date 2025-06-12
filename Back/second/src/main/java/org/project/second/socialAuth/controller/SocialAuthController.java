package org.project.second.socialAuth.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.socialAuth.service.CustomOAuth2UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class SocialAuthController {
    private final CustomOAuth2UserService customOAuth2UserService;


}
