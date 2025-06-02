package org.project.second.like.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.like.service.LikeService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/like")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;
}
