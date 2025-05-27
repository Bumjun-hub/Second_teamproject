package org.project.second.community.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.CommunityCategory;
import org.project.second.community.domain.Community;
import org.project.second.community.domain.CommunityImage;
import org.project.second.community.dto.CommunityDto;
import org.project.second.community.dto.CommunityResponseDto;
import org.project.second.community.repository.CommunityImageRepository;
import org.project.second.community.repository.CommunityRopository;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.io.File;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRopository communityRopository;
    private final MemberRepository memberRepository;
    private final CommunityImageRepository communityImageRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // 사용자 정보 확인
    public void validateMember(Member loginUser) {
        Member foundMember = memberRepository.findById(loginUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당사용자가 존재하지 않습니다"));

        if (!foundMember.getEmail().equals(loginUser.getEmail())) {
            throw new AccessDeniedException("사용자 정보가 일치하지 않습니다.");
        }
    }

    // 글작성 공백확인
    public void validateMember(CommunityDto communityDto) {
        if (communityDto.getTitle() == null || communityDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("제목을 입력하세요");
        }
        if (communityDto.getContent() == null || communityDto.getContent().isBlank()) {
            throw new IllegalArgumentException("내용을 입력하세요");
        }
    }

    //작성자확인
    public void validateMember(Member loginUser, Member writer) {
        if (!loginUser.getId().equals(writer.getId())) {
            throw new AccessDeniedException("작성자만 가능합니다");
        }
    }

    //글존재유무확인
    public Community validatePost(Long id) {
        return communityRopository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다"));
    }

    //작성
    @Transactional
    public void createPost(CommunityDto communityDto, List<MultipartFile> imageFiles , Member loginUser) {
        System.out.println("파일 저장 경로 = " + uploadDir);
        validateMember(loginUser);
        validateMember(communityDto);
        Community community = Community.builder()
                .title(communityDto.getTitle())
                .content(communityDto.getContent())
                .category(communityDto.getCategory())
                .member(loginUser)
                .isDeleted(false)
                .build();
        communityRopository.save(community);

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                String savePath = uploadDir + "/" + fileName;

                try{
                    file.transferTo(new File(savePath));
                } catch (IOException e){
                    throw new RuntimeException("이미지 저장 실패", e);
                }

                CommunityImage image = new CommunityImage();
                image.setImgUrl(savePath);
                image.setCommunity(community);

                communityImageRepository.save(image);
            }
        }
    }

    @Transactional
    public void updatePost(Long id, CommunityDto communityDto, Member loginUser) {
        Community post = communityRopository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다"));
        validateMember(loginUser, post.getMember());
        validateMember(communityDto);

        post.setCategory(communityDto.getCategory());
        post.setTitle(communityDto.getTitle());
        post.setContent(communityDto.getContent());

    }

    @Transactional
    public void deletePost(Long id, Member loginUser) {
        Community post = communityRopository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다"));
        validateMember(loginUser, post.getMember());

        post.setIsDeleted(true);
    }

    @Transactional
    public List<CommunityResponseDto> getCategoryPost(CommunityCategory category) {
        List<Community> posts = communityRopository.findByCategoryAndIsDeletedFalse(category);
        return posts.stream().map(post -> new CommunityResponseDto(
                post.getId(),
                post.getMember().getUsername(),
                post.getTitle(),
                post.getContent(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getViewCount(),
                (long) post.getLikes().size()
        )).collect(Collectors.toList());
    }

    @Transactional
    public CommunityResponseDto detailPost(CommunityCategory category, Long id) {
        Community post = communityRopository.findByIdAndCategoryAndIsDeletedFalse(id, category);
        return new CommunityResponseDto(
                post.getId(),
                post.getMember().getUsername(),
                post.getTitle(),
                post.getContent(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getViewCount(),
                (long) post.getLikes().size());
    }



}


    // 수정
    /*
    * 수정(dto , 로그인 햇는지){
    * 권한확인(로그인한 유저랑 db랑 맞는지)
    *
    *
    * 만약에 수정값이 들어오면 수정을 한다.
    * 그렇지 않으면 수정하지 않는다.
    *
    * */

