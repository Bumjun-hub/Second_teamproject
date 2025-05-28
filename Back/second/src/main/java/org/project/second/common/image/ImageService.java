package org.project.second.common.image;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.project.second.community.domain.CommunityImage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {

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



    //수정
/*    1. 이미지가 더 추가된다면
      * 이미지를 추가하는 로직(저장처럼)
      2. 이미지가 삭제된다면
      * 원래있던 이미지를 빼버린다면
      3. 아무것도 바뀌지 않는다면
      * 변화없음(하지만 글은 바뀔 수 있음)*/

    /*public List<String> editImage(List<MultipartFile> imageFiles){

    }*/

    //삭제
    // 각자의 이미지id를 가져온다
    // 선택된 id를 삭제한다
    @Transactional
    public void deleteImage(List<CommunityImage> imageList) {
        for (CommunityImage image : imageList) {
            image.setIsDeleted(true);
        }
    }




}
