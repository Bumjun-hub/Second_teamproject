package org.project.second.grade.service;

import lombok.RequiredArgsConstructor;
import org.project.second.grade.repository.GradeRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;

    public void addScore(){

    }
}
