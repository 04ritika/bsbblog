package com.example.bsbblog.controller;

import com.example.bsbblog.dto.BlogPostRequest;
import com.example.bsbblog.dto.PollPostRequest;
import com.example.bsbblog.model.Post;
import com.example.bsbblog.service.FileStorageService;
import com.example.bsbblog.service.PostService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final FileStorageService fileStorageService;

    public PostController(PostService postService, FileStorageService fileStorageService) {
        this.postService = postService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/blog")
    public Post createBlogPost(@Valid @RequestBody BlogPostRequest request, Authentication authentication) {
        return postService.createBlogPost(request, authentication.getName());
    }

    @PostMapping("/poll")
    public Post createPollPost(@Valid @RequestBody PollPostRequest request, Authentication authentication) {
        return postService.createPollPost(request, authentication.getName());
    }

    @PostMapping(value = "/image", consumes = "multipart/form-data")
    public Post createImagePost(@RequestParam("image") MultipartFile image,
                                 @RequestParam(value = "caption", required = false) String caption,
                                 Authentication authentication) {
        String imageUrl = fileStorageService.storeFile(image);
        return postService.createImagePost(caption, imageUrl, authentication.getName());
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public Post getPostById(@PathVariable String id) {
        return postService.getPostById(id);
    }

    @GetMapping("/user/{username}")
    public List<Post> getPostsByUser(@PathVariable String username) {
        return postService.getPostsByAuthor(username);
    }

    @PutMapping("/{id}")
    public Post updatePost(@PathVariable String id, @Valid @RequestBody BlogPostRequest request, Authentication authentication) {
        return postService.updatePost(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public String deletePost(@PathVariable String id, Authentication authentication) {
        postService.deletePost(id, authentication.getName());
        return "Post with id " + id + " deleted successfully";
    }

    @PostMapping("/{id}/like")
    public Post toggleLike(@PathVariable String id, Authentication authentication) {
        return postService.toggleLike(id, authentication.getName());
    }

    @PostMapping("/{id}/vote")
    public Post votePoll(@PathVariable String id, @RequestBody Map<String, List<Integer>> body, Authentication authentication) {
        return postService.votePoll(id, body.get("optionIndexes"), authentication.getName());
    }
}
