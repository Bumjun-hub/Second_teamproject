package org.project.second.grade.service;

import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.ActivityType;
import org.project.second.grade.repository.GradeRepository;
import org.project.second.member.domain.Member;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;

    public void addScore(Member member, ActivityType activityType){
        
    }
}
