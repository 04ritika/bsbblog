package com.example.bsbblog.controller;

import com.example.bsbblog.model.ClubCategory;
import com.example.bsbblog.service.ClubCategoryService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/club-categories")
public class ClubCategoryController {

    private final ClubCategoryService categoryService;

    public ClubCategoryController(ClubCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<ClubCategory> getAllCategories() {
        return categoryService.getAllCategories();
    }
}
