package org.project.second.community.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.CommunityCategory;
import org.project.second.common.image.ImageService;
import org.project.second.community.domain.Community;
import org.project.second.community.domain.CommunityImage;
import org.project.second.community.dto.CommunityDto;
import org.project.second.community.dto.CommunityResponseDto;
import org.project.second.community.repository.CommunityImageRepository;
import org.project.second.community.repository.CommunityRopository;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRopository communityRopository;
    private final MemberRepository memberRepository;
    private final ImageService imageService;
    private final CommunityImageRepository communityImageRepository;


    //작성
    @Transactional
    public void createPost(CommunityDto communityDto, List<MultipartFile> imageFiles , Member loginUser) {
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


        if (imageFiles != null && !imageFiles.isEmpty()){
            for (MultipartFile imageFile  : imageFiles) {
                String imageUrl = imageService.saveImage(imageFile);

                if (imageUrl != null) {
                    CommunityImage image = CommunityImage.builder()
                            .imgUrl(imageUrl)
                            .community(community)
                            .build();
                    communityImageRepository.save(image);
                }
            }
        }

        // new로 작성한 버전
      /*  CommunityImage image = new CommunityImage();
        image.setImgUrl(fileName);
        image.setCommunity(community);
        communityImageRepository.save(image);*/
    }

    //수정
    @Transactional
    public void updatePost(Long id, CommunityDto communityDto, Member loginUser) {
        Community post = validatePost(id);
        validateMember(loginUser, post.getMember());
        validateMember(communityDto);

        post.setCategory(communityDto.getCategory());
        post.setTitle(communityDto.getTitle());
        post.setContent(communityDto.getContent());

    }

    //삭제
    @Transactional
    public void deletePost(Long id, Member loginUser) {
        Community post = validatePost(id);
        validateMember(loginUser, post.getMember());



        post.setIsDeleted(true);
    }

    //전체조회
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

    //상세조회
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


}
