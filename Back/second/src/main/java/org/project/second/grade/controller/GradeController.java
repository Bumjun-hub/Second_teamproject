package org.project.second.grade.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.grade.service.GradeService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/grade")
public class GradeController {

    private final GradeService gradeService;

    @GetMapping("/myGrade")
    public ResponseEntity<String> getGrade(@AuthenticationPrincipal CustomUserDetails userDetails){
        Member loginUser = userDetails.getMember();
        return ResponseEntity.ok(gradeService.getGrade(loginUser));
    }
}
