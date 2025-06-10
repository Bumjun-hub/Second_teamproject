package org.project.second.groupBuy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.project.second.websocket.service.NotificationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupBuyService {

    private final GroupBuyRepository groupBuyRepository;
    private final MemberRepository memberRepository;
    private final ImageService imageService;
    private final GroupBuyImageRepository groupBuyImageRepository;
    private final NotificationService notificationService;

    //작성
    @Transactional
    public void createPost(GroupBuyDto groupBuyDto, List<MultipartFile> imageFiles, Member loginUser) {
        validateMember(loginUser);
        validateMember(groupBuyDto);

        GroupBuy groupBuy = GroupBuy.builder()
                .title(groupBuyDto.getTitle())
                .content(groupBuyDto.getContent())
                .productUrl(groupBuyDto.getProductUrl())
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

        // 공동구매 오픈 알림
        String content = "🔔 \"" + groupBuy.getTitle() + "\" 새로운 공동구매가 OPEN 되었습니다!";
        notificationService.sendGruopBuyOpenToAll(
                groupBuy, content
        );

    }

    //수정
    @Transactional
    public void closeGroupBuy(Long groupBuyId) {
        GroupBuy groupBuy = groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 공동구매 게시글 번호입니다."));

        if (groupBuy.getStatus() == GroupBuyStatus.CLOSED) {
            log.warn("공동구매 {}는 이미 인원 미달로 종료 되었습니다.", groupBuyId);
            return;
        }

        groupBuy.setStatus(GroupBuyStatus.CLOSED);
        groupBuyRepository.save(groupBuy);

        String content = "🔔 \"" + groupBuy.getTitle() + "\" 공동구매가 인원미달로 종료 되었습니다.";
        notificationService.sendGruopBuyCloseToParticipants(groupBuyId, content);

        log.info("공동구매 {} 인원 미달 종료 및 알림 전송", groupBuyId);
    }

    @Transactional
    public void completedGroupBuy(Long groupBuyId) {
        GroupBuy groupBuy = groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 공동구매 게시글 번호입니다."));

        if (groupBuy.getStatus() == GroupBuyStatus.COMPLETED) {
            log.warn("공동구매 {}는 이미 마감되었습니다.", groupBuyId);
            return;
        }

        groupBuy.setStatus(GroupBuyStatus.COMPLETED);
        groupBuyRepository.save(groupBuy);

        String content = "🔔 \"" + groupBuy.getTitle() + "\" 공동구매가 마감 되었습니다. 구매 신청을 진행해주세요!";
        notificationService.sendGruopBuyCompletedToParticipants(groupBuyId, content);

        log.info("공동구매 {} 마감 완료 및 알림 전송", groupBuyId);
    }

    //수정
    @Transactional
    public void editPost(Long id, GroupBuyDto groupBuyDto, Member loginUser,
                         List<MultipartFile> imageFiles, List<Long> deleteImageIds) {
        GroupBuy post = validatePost(id);
        validateMember(loginUser, post.getMember());
        validateMember(groupBuyDto);

        post.setStatus(groupBuyDto.getStatus());
        post.setTitle(groupBuyDto.getTitle());
        post.setContent(groupBuyDto.getContent());
        post.setProductUrl(groupBuyDto.getProductUrl());
        post.setDescription(groupBuyDto.getDescription());
        post.setMaxParticipants(groupBuyDto.getMaxParticipants());
        post.setMinParticipants(groupBuyDto.getMinParticipants());
        post.setOriginalPrice(groupBuyDto.getOriginalPrice());
        post.setSalePrice(groupBuyDto.getSalePrice());
        post.setMaxQuantity(groupBuyDto.getMaxQuantity());
        post.setDeadline(groupBuyDto.getDeadline());

        if (deleteImageIds != null && !deleteImageIds.isEmpty()) {
            List<GroupBuyImage> imagesToDelete = groupBuyImageRepository.findAllById(deleteImageIds);

            for (GroupBuyImage image : imagesToDelete) {
                if (image.getGroupBuy().getId().equals(id)) {
                    imageService.deleteImage(image.getImgUrl());
                    image.setIsDeleted(true);
                    groupBuyImageRepository.save(image);
                }
            }
        }

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile imageFile : imageFiles) {
                if (!imageFile.isEmpty()) {
                    String imageUrl = imageService.saveImage(imageFile);

                    if (imageUrl != null) {
                        GroupBuyImage image = GroupBuyImage.builder()
                                .imgUrl(imageUrl)
                                .groupBuy(post)
                                .isDeleted(false)
                                .build();

                        groupBuyImageRepository.save(image);
                    }
                }
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


    //전체보기
    public List<GroupBuyResponseDto> viewAll() {
        return groupBuyRepository.findAll().stream().map(post -> {
            List<String> imageUrls = post.getGroupBuyImages().stream()
                    .filter(img -> !img.getIsDeleted())
                    .map(GroupBuyImage::getImgUrl)
                    .collect(Collectors.toList());
            List<Long> imageIds = post.getGroupBuyImages().stream()
                    .filter(img -> !img.getIsDeleted())
                    .map(GroupBuyImage::getId)
                    .collect(Collectors.toList());


            return new GroupBuyResponseDto(
                    post.getId(), post.getStatus(), post.getMember().getUsername(),
                    post.getTitle(), post.getDescription(), post.getContent(), post.getProductUrl(),
                    post.getMaxParticipants(), post.getMinParticipants(), post.getCurrentParticipants(),
                    post.getMaxQuantity(), post.getCurrentQuantity(), post.getOriginalPrice(),
                    post.getSalePrice(), post.getDeadline(), imageUrls, imageIds,
                    (long) post.getLikes().size(), post.getCreatedAt(), post.getUpdatedAt(),
                    Collections.emptyList()

            );
        }).collect(Collectors.toList());
    }

    //상세보기
    public GroupBuyResponseDto detailView(Long id) {
        GroupBuy post = validatePost(id);

        List<String> imageUrls = post.getGroupBuyImages().stream()
                .filter(img -> !img.getIsDeleted())
                .map(GroupBuyImage::getImgUrl)
                .collect(Collectors.toList());

        List<Long> imageIds = post.getGroupBuyImages().stream()
                .filter(img -> !img.getIsDeleted())
                .map(GroupBuyImage::getId)
                .collect(Collectors.toList());
        List<String> participants = post.getParticipations().stream()
                .map(participation -> participation.getMember().getUsername())
                .collect(Collectors.toList());

        return new GroupBuyResponseDto(
                post.getId(), post.getStatus(), post.getMember().getUsername(),
                post.getTitle(), post.getDescription(), post.getContent(), post.getProductUrl(),
                post.getMaxParticipants(), post.getMinParticipants(), post.getCurrentParticipants(),
                post.getMaxQuantity(), post.getCurrentQuantity(), post.getOriginalPrice(),
                post.getSalePrice(), post.getDeadline(), imageUrls, imageIds,
                (long) post.getLikes().size(), post.getCreatedAt(), post.getUpdatedAt(),
                participants
        );
    }

    //상태별보기
    public List<GroupBuyResponseDto> statusView(GroupBuyStatus status) {
        return groupBuyRepository.findByStatus(status).stream().map(post -> {
            List<String> imageUrls = post.getGroupBuyImages().stream()
                    .filter(img -> !img.getIsDeleted())
                    .map(GroupBuyImage::getImgUrl)
                    .collect(Collectors.toList());
            List<Long> imageIds = post.getGroupBuyImages().stream()
                    .filter(img -> !img.getIsDeleted())
                    .map(GroupBuyImage::getId)
                    .collect(Collectors.toList());

            return new GroupBuyResponseDto(
                    post.getId(), post.getStatus(), post.getMember().getUsername(),
                    post.getTitle(), post.getDescription(), post.getContent(), post.getProductUrl(),
                    post.getMaxParticipants(), post.getMinParticipants(), post.getCurrentParticipants(),
                    post.getMaxQuantity(), post.getCurrentQuantity(), post.getOriginalPrice(),
                    post.getSalePrice(), post.getDeadline(), imageUrls, imageIds,
                    (long) post.getLikes().size(), post.getCreatedAt(), post.getUpdatedAt(),
                    Collections.emptyList()
            );
        }).collect(Collectors.toList());
    }

    //예외
    public void validateMember(Member loginUser) {
        Member foundMember = memberRepository.findById(loginUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당사용자가 존재하지 않습니다"));

        if (!foundMember.getEmail().equals(loginUser.getEmail())) {
            throw new AccessDeniedException("사용자 정보가 일치하지 않습니다.");
        }
    }

    public void validateMember(GroupBuyDto groupBuyDto) {
        if (groupBuyDto.getTitle() == null || groupBuyDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("제목을 입력하세요");
        }
        if (groupBuyDto.getContent() == null || groupBuyDto.getContent().isBlank()) {
            throw new IllegalArgumentException("내용을 입력하세요");
        }
    }

    public void validateMember(Member loginUser, Member writer) {
        if (!loginUser.getId().equals(writer.getId())) {
            throw new AccessDeniedException("작성자만 가능합니다");
        }
    }

    public GroupBuy validatePost(Long id) {
        return groupBuyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다"));
    }
}
