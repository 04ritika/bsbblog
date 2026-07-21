package com.example.bsbblog.controller;

import com.example.bsbblog.dto.ClubCategoryRequest;
import com.example.bsbblog.dto.ClubCreateRequest;
import com.example.bsbblog.model.Club;
import com.example.bsbblog.model.ClubCategory;
import com.example.bsbblog.model.Comment;
import com.example.bsbblog.model.Post;
import com.example.bsbblog.model.User;
import com.example.bsbblog.service.ClubCategoryService;
import com.example.bsbblog.service.ClubService;
import com.example.bsbblog.service.CommentService;
import com.example.bsbblog.service.PostService;
import com.example.bsbblog.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final PostService postService;
    private final CommentService commentService;
    private final ClubService clubService;
    private final ClubCategoryService clubCategoryService;

    public AdminController(UserService userService, PostService postService, CommentService commentService,
                            ClubService clubService, ClubCategoryService clubCategoryService) {
        this.userService = userService;
        this.postService = postService;
        this.commentService = commentService;
        this.clubService = clubService;
        this.clubCategoryService = clubCategoryService;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @DeleteMapping("/users/{id}")
    public String deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return "User deleted successfully";
    }

    @PutMapping("/users/{id}/role")
    public User updateUserRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        return userService.updateUserRole(id, body.get("role"));
    }

    @GetMapping("/posts")
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @DeleteMapping("/posts/{id}")
    public String deletePostAsAdmin(@PathVariable String id) {
        postService.deletePostAsAdmin(id);
        return "Post deleted successfully";
    }

    @GetMapping("/comments")
    public List<Comment> getAllComments() {
        return commentService.getAllComments();
    }

    @PostMapping("/club-categories")
    public ClubCategory createCategory(@Valid @RequestBody ClubCategoryRequest request) {
        return clubCategoryService.createCategory(request);
    }

    @DeleteMapping("/club-categories/{id}")
    public String deleteCategory(@PathVariable String id) {
        clubCategoryService.deleteCategory(id);
        return "Category deleted successfully";
    }

    @PostMapping("/clubs")
    public Club createClub(@Valid @RequestBody ClubCreateRequest request) {
        return clubService.createClub(request);
    }

    @DeleteMapping("/clubs/{id}")
    public String deleteClub(@PathVariable String id) {
        clubService.deleteClub(id);
        return "Club deleted successfully";
    }

    @PostMapping("/clubs/{id}/managers")
    public Club addManager(@PathVariable String id, @RequestBody Map<String, String> body) {
        return clubService.addManager(id, body.get("username"));
    }

    @DeleteMapping("/clubs/{id}/managers/{username}")
    public Club removeManager(@PathVariable String id, @PathVariable String username) {
        return clubService.removeManager(id, username);
    }
}
