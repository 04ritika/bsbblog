package com.example.bsbblog.controller;

import com.example.bsbblog.model.Post;
import com.example.bsbblog.model.User;
import com.example.bsbblog.service.PostService;
import com.example.bsbblog.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final PostService postService;

    public AdminController(UserService userService, PostService postService) {
        this.userService = userService;
        this.postService = postService;
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
}
