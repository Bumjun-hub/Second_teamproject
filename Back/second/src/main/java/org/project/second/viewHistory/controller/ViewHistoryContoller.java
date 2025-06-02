package org.project.second.viewHistory.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.viewHistory.service.ViewHistoryService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recipe/viewHistory")
@RequiredArgsConstructor
public class ViewHistoryContoller {
    private final ViewHistoryService viewHistoryService;

}
