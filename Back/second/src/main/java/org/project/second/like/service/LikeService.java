package org.project.second.like.service;

import lombok.RequiredArgsConstructor;
import org.project.second.like.repository.LikeRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LikeService {
    private LikeRepository likeRepository;
}
