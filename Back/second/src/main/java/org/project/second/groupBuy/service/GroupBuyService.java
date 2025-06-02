package org.project.second.groupBuy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.GroupBuyStatus;
import org.project.second.common.image.ImageService;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.groupBuy.domain.GroupBuyImage;
import org.project.second.groupBuy.dto.GroupBuyDto;
import org.project.second.groupBuy.dto.GroupBuyResponseDto;
import org.project.second.groupBuy.repository.GroupBuyImageRepository;
import org.project.second.groupBuy.repository.GroupBuyRepository;
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
public class GroupBuyService {

    private final GroupBuyRepository groupBuyRepository;
    private final MemberRepository memberRepository;
    private final ImageService imageService;
    private final GroupBuyImageRepository groupBuyImageRepository;


    //작성
    @Transactional
    public void createPost(GroupBuyDto groupBuyDto, List<MultipartFile> imageFiles, Member loginUser) {
        validateMember(loginUser);
        validateMember(groupBuyDto);
        GroupBuy groupBuy = GroupBuy.builder()
                .title(groupBuyDto.getTitle())
                .content(groupBuyDto.getContent())
                .description(groupBuyDto.getDescription())
                .maxParticipants(groupBuyDto.getMaxParticipants())
                .minParticipants(groupBuyDto.getMinParticipants())
                .currentParticipants(0)
                .maxQuantity(groupBuyDto.getMaxQuantity())
                .originalPrice(groupBuyDto.getOriginalPrice())
                .currentQuantity(0)
                .salePrice(groupBuyDto.getSalePrice())
                .deadline(groupBuyDto.getDeadline())
                .status(groupBuyDto.getStatus())
                .member(loginUser)
                .build();
        groupBuyRepository.save(groupBuy);

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile imageFile : imageFiles) {
                String imageUrl = imageService.saveImage(imageFile);

                if (imageUrl != null) {
                    GroupBuyImage image = GroupBuyImage.builder()
                            .imgUrl(imageUrl)
                            .groupBuy(groupBuy)
                            .isDeleted(false)
                            .build();
                    groupBuyImageRepository.save(image);
                }
            }
        }
    }

    //수정
    @Transactional
    public void editPost(Long id, GroupBuyDto groupBuyDto, Member loginUser,
                         List<MultipartFile> imageFiles, List<Long> deleteImageIds) {
        GroupBuy post = validatePost(id);
        validateMember(loginUser, post.getMember());
        validateMember(groupBuyDto);

        //글
        post.setStatus(groupBuyDto.getStatus());
        post.setTitle(groupBuyDto.getTitle());
        post.setContent(groupBuyDto.getContent());
        post.setDescription(groupBuyDto.getDescription());
        post.setMaxParticipants(groupBuyDto.getMaxParticipants());
        post.setMinParticipants(groupBuyDto.getMinParticipants());
        post.setOriginalPrice(groupBuyDto.getOriginalPrice());
        post.setSalePrice(groupBuyDto.getSalePrice());
        post.setMaxQuantity(groupBuyDto.getMaxQuantity());
        post.setDeadline(groupBuyDto.getDeadline());

        //이미지 삭제
        if (deleteImageIds != null && !deleteImageIds.isEmpty()) {
            List<GroupBuyImage> deletedImages = new ArrayList<>();
            for (GroupBuyImage image : post.getGroupBuyImages()) {
                if (deleteImageIds.contains(image.getId())) {
                    imageService.deleteImage(image.getImgUrl());
                    deletedImages.add(image);
                }
            }
            post.getGroupBuyImages().removeAll(deletedImages);
            groupBuyImageRepository.deleteAll(deletedImages);
        }

        //이미지생성
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile imageFile : imageFiles) {
                String imageUrl = imageService.saveImage(imageFile);

                GroupBuyImage image = GroupBuyImage.builder()
                        .imgUrl(imageUrl)
                        .groupBuy(post)
                        .isDeleted(false)
                        .build();
                post.getGroupBuyImages().add(image);
            }
        }
    }

    //삭제
    @Transactional
    public void deletePost(Long id, Member loginUser) {
        GroupBuy post = validatePost(id);
        validateMember(loginUser, post.getMember());

        groupBuyRepository.delete(post);
    }

    //전체조회
    public List<GroupBuyResponseDto> viewAll() {
        List<GroupBuy> posts = groupBuyRepository.findAll();
        return posts.stream()
                .map(post -> {
                    //이미지
                    List<String> imageUrls = post.getGroupBuyImages().stream()
                            .filter(img -> !img.getIsDeleted())
                            .map(GroupBuyImage::getImgUrl)
                            .collect(Collectors.toList());

                    return new GroupBuyResponseDto(
                            post.getId(),
                            post.getStatus(),
                            post.getTitle(),
                            post.getMember().getUsername(),
                            post.getDescription(),
                            post.getContent(),
                            post.getMaxParticipants(),
                            post.getMinParticipants(),
                            post.getCurrentParticipants(),
                            post.getMaxQuantity(),
                            post.getCurrentQuantity(),
                            post.getOriginalPrice(),
                            post.getSalePrice(),
                            post.getDeadline(),
                            imageUrls,
                            (long) post.getLikes().size(),
                            post.getCreatedAt(),
                            post.getUpdatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    //상세조회
    public GroupBuyResponseDto detailView(Long id) {
        GroupBuy post = groupBuyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다"));

        List<String> imageUrls = post.getGroupBuyImages().stream()
                .filter(img -> !img.getIsDeleted())
                .map(GroupBuyImage::getImgUrl)
                .collect(Collectors.toList());

        return new GroupBuyResponseDto(
                post.getId(),
                post.getStatus(),
                post.getTitle(),
                post.getMember().getUsername(),
                post.getDescription(),
                post.getContent(),
                post.getMaxParticipants(),
                post.getMinParticipants(),
                post.getCurrentParticipants(),
                post.getMaxQuantity(),
                post.getCurrentQuantity(),
                post.getOriginalPrice(),
                post.getSalePrice(),
                post.getDeadline(),
                imageUrls,
                (long) post.getLikes().size(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    //상태별 조회(status)
    public List<GroupBuyResponseDto> statusView(GroupBuyStatus status) {
        List<GroupBuy> posts = groupBuyRepository.findByStatus(status);
        return posts.stream()
                .map(post -> {
                    //이미지
                    List<String> imageUrls = post.getGroupBuyImages().stream()
                            .filter(img -> !img.getIsDeleted())
                            .map(GroupBuyImage::getImgUrl)
                            .collect(Collectors.toList());
                    //글
                    return new GroupBuyResponseDto(
                            post.getId(),
                            post.getStatus(),
                            post.getTitle(),
                            post.getMember().getUsername(),
                            post.getDescription(),
                            post.getContent(),
                            post.getMaxParticipants(),
                            post.getMinParticipants(),
                            post.getCurrentParticipants(),
                            post.getMaxQuantity(),
                            post.getCurrentQuantity(),
                            post.getOriginalPrice(),
                            post.getSalePrice(),
                            post.getDeadline(),
                            imageUrls,
                            (long) post.getLikes().size(),
                            post.getCreatedAt(),
                            post.getUpdatedAt()
                    );
                })
                .collect(Collectors.toList());
    }



    // 사용자 정보 확인
    public void validateMember (Member loginUser){
        Member foundMember = memberRepository.findById(loginUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당사용자가 존재하지 않습니다"));

        if (!foundMember.getEmail().equals(loginUser.getEmail())) {
            throw new AccessDeniedException("사용자 정보가 일치하지 않습니다.");
        }
    }

    // 글작성 공백확인 + 추가해야함
    public void validateMember (GroupBuyDto groupBuyDto){
        if (groupBuyDto.getTitle() == null || groupBuyDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("제목을 입력하세요");
        }
        if (groupBuyDto.getContent() == null || groupBuyDto.getContent().isBlank()) {
            throw new IllegalArgumentException("내용을 입력하세요");
        }
    }
    
    // 작성자 확인
    public void validateMember (Member loginUser ,Member writer) {
        if (!loginUser.getId().equals(writer.getId())) {
            throw new AccessDeniedException("작성자만 가능합니다");
        }
    }
    
    //글존재유무확인
    public GroupBuy validatePost (Long id) {
        return groupBuyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다"));
    }
    
}
