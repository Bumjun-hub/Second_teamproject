package org.project.second.donation.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.DonationCategory;
import org.project.second.donation.dto.DonationDto;
import org.project.second.donation.dto.DonationResponseDto;
import org.project.second.donation.service.DonationService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/donation")
public class DonationController {

    private final DonationService donationService;

    //작성
    @PostMapping(value = "/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createPost (
            @RequestPart("category") String category,
            @RequestPart("province") String province,
            @RequestPart("city") String city,
            @RequestPart("district") String district,
            @RequestPart("neighborhood") String neighborhood,
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart("price") Long price,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles,
            @AuthenticationPrincipal CustomUserDetails userDetail) {

        DonationDto donationDto = DonationDto.builder()
                .category(DonationCategory.valueOf(category))
                .province(province)
                .city(city)
                .district(district)
                .neighborhood(neighborhood)
                .title(title)
                .content(content)
                .price(price)
                .build();

        Member loginUser = userDetail.getMember();
        donationService.createPost(donationDto, imageFiles, loginUser);
        return ResponseEntity.ok("게시글이 작성되었습니다");
    }

    //수정
    @PutMapping(value = "/edit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> editPost(
            @PathVariable Long id,
            @RequestPart("category") String category,
            @RequestPart("province") String province,
            @RequestPart("city") String city,
            @RequestPart("district") String district,
            @RequestPart("neighborhood") String neighborhood,
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart("price") Long price,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles,
            @RequestPart(value = "removedImages", required = false) String removedImagesJson,
            @AuthenticationPrincipal CustomUserDetails userDetail) {

        DonationDto donationDto = DonationDto.builder()
                .category(DonationCategory.valueOf(category))
                .province(province)
                .city(city)
                .district(district)
                .neighborhood(neighborhood)
                .title(title)
                .content(content)
                .price(price)
                .build();

        Member loginUser = userDetail.getMember();

        List<String> removedUrls = List.of();
        if (removedImagesJson != null && !removedImagesJson.isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                removedUrls = objectMapper.readValue(removedImagesJson, new TypeReference<List<String>>() {
                });
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("이미지 삭제 목록 파싱 실패");
            }
        }
        donationService.editPost(id, donationDto, loginUser, imageFiles, removedUrls);

        return ResponseEntity.status(HttpStatus.OK).body("게시글이 수정되었습니다");
    }

    //삭제(소프트삭제)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        Member loginUser = userDetails.getMember();
        donationService.deletePost(id, loginUser);
        return ResponseEntity.status(HttpStatus.OK).body("게시글이 삭제되었습니다");
    }

    //전체조회
    @GetMapping("/view/{category}")
    public ResponseEntity<List<DonationResponseDto>> getCategoryPost(
            @PathVariable DonationCategory category
    ){
        List<DonationResponseDto> posts = donationService.getCategoryPost(category);
        return ResponseEntity.ok(posts);
    }

    //상세조회
    @GetMapping("/view/{category}/{id}")
    public ResponseEntity<DonationResponseDto> getDetailPost(
            @PathVariable String category,
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
            ){
        Member loginUser = (userDetails != null) ? userDetails.getMember() : null;

        DonationResponseDto post = donationService.getDetailPost(
                DonationCategory.valueOf(category), id, loginUser);
        return ResponseEntity.ok(post);
    }




    
}
