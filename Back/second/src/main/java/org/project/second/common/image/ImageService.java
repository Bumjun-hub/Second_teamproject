package org.project.second.common.image;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.project.second.community.domain.CommunityImage;
import org.project.second.community.repository.CommunityImageRepository;
import org.project.second.member.domain.Member;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final CommunityImageRepository communityImageRepository;

    // 경로설정
    @Value("${file.upload-dir}")
    private String uploadDir;

    //절대경로지정
    public String getAbsolutePath() {
        //상대경로를 절대경로로 변환
        File directory = new File(uploadDir);
        if (!directory.isAbsolute()) {
            directory = new File(System.getProperty("user.dir"), uploadDir);
        }
        //경로가 해당폴더에 없으면
        if (!directory.exists()) {
            boolean created = directory.mkdirs(); //폴더생성
            if (!created) {
                throw new RuntimeException("업로드 폴더 생성 실패 : ");
            }
        } else if (!directory.isDirectory()) { //경로는 존재하지만 폴더가 아니라면
            throw new RuntimeException("업로드 경로가 디렉토리가 아닙니다: ");
        }
        return directory.getAbsolutePath();
    }

    //생성
    @Transactional
    public String saveImage(MultipartFile imageFile) {

        //파일이 null이거나 비어있으면 저장X
        if (imageFile == null || imageFile.isEmpty()) {
            return "빈 파일";
        }

        // 원본파일명 가져오기 ,  원본도파일명이 없으면 저장X
        String originalFilename = imageFile.getOriginalFilename();
        String ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        //고유문자열생성, 최종저장될파일명 생성
        String savedFileName = UUID.randomUUID() + ext;

        String absolutePath = getAbsolutePath();
        File file = new File(absolutePath, savedFileName);

        try {
            imageFile.transferTo(file);
        } catch (IOException e) {
            throw new RuntimeException("이미지 저장 실패: " + originalFilename, e);
        }
        return "/uploads/" + savedFileName;
    }


    //삭제
    // 각자의 이미지id를 가져온다
    // 선택된 id를 삭제한다
    @Transactional
    public void deleteImage(Long id, Member loginUser) {
        // 본인이 올린 이미지가 맞는지 한번 더 확인
        CommunityImage image = communityImageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("이미지가 존재하지 않습니다"));

        if(!image.getCommunity().getMember().getId().equals(loginUser.getId())) {
            throw new AccessDeniedException("이미지를 삭제 할 권한이 없습니다");
        }

        File file = new File(image.getImgUrl());
        if (file.exists()) {
            file.delete();
        }
    }



    }


