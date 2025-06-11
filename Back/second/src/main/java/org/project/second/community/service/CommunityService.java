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
import org.project.second.community.repository.CommunityRepository;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final MemberRepository memberRepository;
    private final ImageService imageService;
    private final CommunityImageRepository communityImageRepository;


    //작성
    @Transactional
    public void createPost(CommunityDto communityDto, List<MultipartFile> imageFiles , Member loginUser) {
        System.out.println("🚨 isNotice 값: " + communityDto.getIsNotice());
        validateMember(loginUser);
        validateMember(communityDto);
        Community community = Community.builder()
                .title(communityDto.getTitle())
                .content(communityDto.getContent())
                .category(communityDto.getCategory())
                .member(loginUser)
                .isNotice(communityDto.isNoticeBoolean())  // ✅ 공지글 반영
                .isDeleted(false)
                .build();
        
        communityRepository.save(community);


        if (imageFiles != null && !imageFiles.isEmpty()){
            for (MultipartFile imageFile  : imageFiles) {
                String imageUrl = imageService.saveImage(imageFile);

                if (imageUrl != null) {
                    CommunityImage image = CommunityImage.builder()
                            .imgUrl(imageUrl)
                            .community(community)
                            .isDeleted(false)
                            .build();
                    communityImageRepository.save(image);
                }
            }
        }
    }

    //수정
    @Transactional
    public void editPost(Long id, CommunityDto communityDto, Member loginUser,
                         List<MultipartFile> imageFiles, List<String> deleteImageUrls) {
        Community post = validatePost(id);
        validateMember(loginUser, post.getMember());
        validateMember(communityDto);

        post.setCategory(communityDto.getCategory());
        post.setTitle(communityDto.getTitle());
        post.setContent(communityDto.getContent());

        // 기존 id값 기준으로 특정 이미지 삭제 / 이미지url을 담아와서 삭제로 넘기기
        if (deleteImageUrls != null && !deleteImageUrls.isEmpty()) {
            List<CommunityImage> deleteImages = new ArrayList<>();
            for (CommunityImage image : post.getCommunityImages()){
                if (deleteImageUrls.contains(image.getImgUrl())) {
                    imageService.deleteImage(image.getImgUrl()); // 실제 파일 삭제
                    image.setIsDeleted(true);                    // DB에서 논리 삭제
                }
            }
//            post.getCommunityImages().removeAll(deleteImages);
//            communityImageRepository.deleteAll(deleteImages);
        }
        //생성한다면
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile imageFile : imageFiles) {
                String imageUrl = imageService.saveImage(imageFile);

                //생성한부분합쳐서 다시 저장하기
                CommunityImage image = CommunityImage.builder()
                        .imgUrl(imageUrl)
                        .community(post)
                        .isDeleted(false)
                        .build();
                post.getCommunityImages().add(image);
            }
        }
    }

    //삭제
    @Transactional
    public void deletePost (Long id, Member loginUser){
        Community post = validatePost(id);
        validateMember(loginUser, post.getMember());

        // post.setIsDeleted(true);
        communityRepository.delete(post);
    }

    //전체조회
    @Transactional
    public List<CommunityResponseDto> getCategoryPost(CommunityCategory category) {
        List<Community> posts = communityRepository.findByCategoryAndIsDeletedFalse(category);
        return posts.stream()
                .map(post -> {
                    // 이미지 URL 리스트 만들기
                    List<String> imageUrls = post.getCommunityImages().stream()
                            .filter(img -> !img.getIsDeleted()) // 삭제된 이미지 제외 (optional)
                            .map(CommunityImage::getImgUrl)
                            .collect(Collectors.toList());

                    return new CommunityResponseDto(
                            post.getId(),
                            post.getMember().getUsername(),
                            post.getTitle(),
                            post.getContent(),
                            post.getCategory().name(),
                            post.getCreatedAt(),
                            post.getUpdatedAt(),
                            post.getViewCount(),
                            (long) post.getLikes().stream().filter(like -> like.getCommunity() != null).count(),
                            imageUrls,
                            post.isNotice(),
                            false


                    );
                })
                .collect(Collectors.toList());
    }


    //상세조회
    @Transactional
    public CommunityResponseDto detailPost (CommunityCategory category, Long id, Member loginUser){
        Community post = communityRepository.findByIdAndCategoryAndIsDeletedFalse(id, category);

        if (post == null) {
            throw  new IllegalArgumentException("해당 게시글이 존재하지 않습니다");
        }
        // 조회수
        post.setViewCount(post.getViewCount() == null ? 1 : post.getViewCount() + 1);

        // 이미지 URL 리스트 만들기
        List<String> imageUrls = post.getCommunityImages().stream()
                .filter(img -> !img.getIsDeleted()) // 삭제된 이미지 제외 (optional)
                .map(CommunityImage::getImgUrl)
                .collect(Collectors.toList());

        // ⭐ 로그인 여부에 따라 추천 상태 처리
        boolean liked = false;
        if (loginUser != null && loginUser.getId() != null) {
            liked = post.getLikes().stream()
                    .filter(like -> like.getCommunity() != null && like.getMember() != null)
                    .anyMatch(like -> like.getMember().getId().equals(loginUser.getId()));
        }

        return new CommunityResponseDto(
                post.getId(),
                post.getMember().getUsername(),
                post.getTitle(),
                post.getContent(),
                post.getCategory().name(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getViewCount(),
                (long) post.getLikes().stream().filter(like -> like.getCommunity() != null).count(),
                imageUrls,
                post.isNotice(),
                liked
        );
    }


    // 사용자 정보 확인
    public void validateMember (Member loginUser){
        Member foundMember = memberRepository.findById(loginUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당사용자가 존재하지 않습니다"));

        if (!foundMember.getEmail().equals(loginUser.getEmail())) {
            throw new AccessDeniedException("사용자 정보가 일치하지 않습니다.");
        }
    }

    // 글작성 공백확인
    public void validateMember (CommunityDto communityDto){
        if (communityDto.getTitle() == null || communityDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("제목을 입력하세요");
        }
        if (communityDto.getContent() == null || communityDto.getContent().isBlank()) {
            throw new IllegalArgumentException("내용을 입력하세요");
        }
    }

    //작성자확인
    public void validateMember (Member loginUser, Member writer){
        if (!loginUser.getId().equals(writer.getId())) {
            throw new AccessDeniedException("작성자만 가능합니다");
        }
    }

    //글존재유무확인
    public Community validatePost (Long id){
        return communityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다"));
    }



}
