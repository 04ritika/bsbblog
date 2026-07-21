package com.example.bsbblog.service;

import com.example.bsbblog.dto.ClubCategoryRequest;
import com.example.bsbblog.model.ClubCategory;
import com.example.bsbblog.repository.ClubCategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClubCategoryService {

    private final ClubCategoryRepository categoryRepository;

    public ClubCategoryService(ClubCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public ClubCategory createCategory(ClubCategoryRequest request) {
        ClubCategory category = new ClubCategory();
        category.setName(request.getName());
        return categoryRepository.save(category);
    }

    public List<ClubCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public void deleteCategory(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
        categoryRepository.deleteById(id);
    }
}
