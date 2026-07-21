package com.example.bsbblog.service;

import com.example.bsbblog.dto.ClubCreateRequest;
import com.example.bsbblog.dto.ClubUpdateRequest;
import com.example.bsbblog.exception.ForbiddenException;
import com.example.bsbblog.model.Club;
import com.example.bsbblog.repository.ClubRepository;
import com.example.bsbblog.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ClubService {

    private final ClubRepository clubRepository;
    private final UserRepository userRepository;

    public ClubService(ClubRepository clubRepository, UserRepository userRepository) {
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
    }

    public Club createClub(ClubCreateRequest request) {
        Club club = new Club();
        club.setName(request.getName());
        club.setDescription(request.getDescription());
        club.setCategoryId(request.getCategoryId());
        club.setCreatedAt(LocalDateTime.now());

        Set<String> managers = new HashSet<>();
        if (request.getInitialManagers() != null) {
            managers.addAll(request.getInitialManagers());
        }
        club.setManagers(managers);

        return clubRepository.save(club);
    }

    public List<Club> getAllClubs() {
        return clubRepository.findAll();
    }

    public List<Club> getClubsByCategory(String categoryId) {
        return clubRepository.findByCategoryId(categoryId);
    }

    public Club getClubById(String id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club not found"));
    }

    public void deleteClub(String id) {
        if (!clubRepository.existsById(id)) {
            throw new RuntimeException("Club not found");
        }
        clubRepository.deleteById(id);
    }

    public Club updateClub(String id, ClubUpdateRequest request, String username, boolean isAdmin) {
        Club club = getClubById(id);
        requireManagerOrAdmin(club, username, isAdmin);

        if (request.getDescription() != null) club.setDescription(request.getDescription());
        if (request.getImageUrl() != null) club.setImageUrl(request.getImageUrl());
        club.setUpdatedAt(LocalDateTime.now());

        return clubRepository.save(club);
    }

    public Club addManager(String clubId, String username) {
        Club club = getClubById(clubId);
        if (!userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("User not found: " + username);
        }
        club.getManagers().add(username);
        return clubRepository.save(club);
    }

    public Club removeManager(String clubId, String username) {
        Club club = getClubById(clubId);
        club.getManagers().remove(username);
        return clubRepository.save(club);
    }

    public Club addMember(String clubId, String username, String requestingUser, boolean isAdmin) {
        Club club = getClubById(clubId);
        requireManagerOrAdmin(club, requestingUser, isAdmin);

        if (!userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("User not found: " + username);
        }
        club.getMembers().add(username);
        return clubRepository.save(club);
    }

    public Club removeMember(String clubId, String username, String requestingUser, boolean isAdmin) {
        Club club = getClubById(clubId);
        requireManagerOrAdmin(club, requestingUser, isAdmin);

        club.getMembers().remove(username);
        return clubRepository.save(club);
    }

    public void requireManagerOrAdmin(Club club, String username, boolean isAdmin) {
        if (!isAdmin && !club.getManagers().contains(username)) {
            throw new ForbiddenException("Only club managers or admins can perform this action");
        }
    }
}
