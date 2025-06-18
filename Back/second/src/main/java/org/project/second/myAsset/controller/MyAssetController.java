package org.project.second.myAsset.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.myAsset.dto.MyAssetDto;
import org.project.second.myAsset.service.MyAssetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/myAsset")
public class MyAssetController {

    private final MyAssetService myAssetService;

    @PostMapping("/insert")
    public ResponseEntity<String> inAsset(
            @RequestBody MyAssetDto myAssetDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
            ){
        Member loginUser = userDetails.getMember();
        myAssetService.inAsset(myAssetDto, loginUser);
        return ResponseEntity.ok("내 자산이 등록되었습니다");
    }

    @PutMapping("/edit")
    public ResponseEntity<String> edit(
            @RequestBody MyAssetDto myAssetDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        Member loginUser = userDetails.getMember();
        myAssetService.edit(myAssetDto, loginUser);
        return ResponseEntity.ok("내 자산이 수정되었습니다");
    }

    @GetMapping("/view")
    public ResponseEntity<MyAssetDto> getMyAsset(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        Member loginUser = userDetails.getMember();
        MyAssetDto dto = myAssetService.getMyAsset(loginUser);
        return ResponseEntity.ok(dto);
    }
}
