package org.project.second.donation.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.project.second.common.image.ImageService;
import org.project.second.donation.domain.Donation;
import org.project.second.donation.domain.DonationImage;
import org.project.second.donation.dto.DonationDto;
import org.project.second.donation.repository.DonationImageRepository;
import org.project.second.donation.repository.DonationRepository;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonationImageRepository donationImageRepository;
    private final MemberRepository memberRepository;
    private final ImageService imageService;

    //작성
    @Transactional
    public void createPost(DonationDto donationDto, List<MultipartFile> imageFiles, Member loginUser) {
        validateMember(loginUser);
        validateMember(donationDto);
        Donation donation = Donation.builder()
                .member(loginUser)
                .category(donationDto.getCategory())
                .province(donationDto.getProvince())
                .city(donationDto.getCity())
                .district(donationDto.getDistrict())
                .neighborhood(donationDto.getNeighborhood())
                .title(donationDto.getTitle())
                .content(donationDto.getContent())
                .price(donationDto.getPrice())
                .build();

        donationRepository.save(donation);

        if (imageFiles != null && !imageFiles.isEmpty()){
            for (MultipartFile imageFile : imageFiles) {
                String imageUrl = imageService.saveImage(imageFile);

                if (imageUrl != null) {
                    DonationImage image = DonationImage.builder()
                            .imgUrl(imageUrl)
                            .donation(donation)
                            .isDeleted(false)
                            .build();
                    donationImageRepository.save(image);
                }
            }
        }
    }

    //수정




    //삭제


    //전체조회




    //상세조회




    // 사용자 정보 확인
    public void validateMember (Member loginUser){
        Member foundMember = memberRepository.findById(loginUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당사용자가 존재하지 않습니다"));

        if (!foundMember.getEmail().equals(loginUser.getEmail())) {
            throw new AccessDeniedException("사용자 정보가 일치하지 않습니다.");
        }
    }

    // 글작성 공백확인
    public void validateMember (DonationDto donationDto){
        if (donationDto.getTitle() == null || donationDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("제목을 입력하세요");
        }
        if (donationDto.getContent() == null || donationDto.getContent().isBlank()) {
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
    public Donation validatePost (Long id){
        return donationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다"));
    }
}
