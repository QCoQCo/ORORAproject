package com.busan.orora.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.busan.orora.user.mapper.UserMapper;
import org.springframework.stereotype.Service;
import com.busan.orora.user.dto.UserDto;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.busan.orora.common.service.FileService;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private FileService fileService;

    @Value("${file.upload.profileImgLocation}")
    private String profileImgLocation;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void insertUser(UserDto userDto, String rawPassword) {
        // 비밀번호 암호화
        userDto.setPasswordHash(passwordEncoder.encode(rawPassword));

        // 기본값 설정
        if (userDto.getRoleCode() == null || userDto.getRoleCode().isEmpty()) {
            userDto.setRoleCode("MEMBER");
        }
        if (userDto.getStatusCode() == null || userDto.getStatusCode().isEmpty()) {
            userDto.setStatusCode("ACTIVE");
        }
        if (userDto.getJoinDate() == null) {
            userDto.setJoinDate(LocalDateTime.now());
        }

        userMapper.insertUser(userDto);
    }

    public UserDto login(String loginId, String password) {
        UserDto user = userMapper.findByLoginId(loginId);

        if (user != null && passwordEncoder.matches(password, user.getPasswordHash())) {
            // 마지막 로그인 시간 업데이트
            user.setLastLogin(LocalDateTime.now());
            userMapper.updateLastLogin(user.getId(), user.getLastLogin());
            return user;
        }

        return null;
    }

    public boolean isLoginIdExists(String loginId) {
        return userMapper.countByLoginId(loginId) > 0;
    }

    public boolean isEmailExists(String email) {
        return userMapper.countByEmail(email) > 0;
    }

    public List<UserDto> getAllUsers() {
        return userMapper.findAllUsers();
    }

    /**
     * 사용자 프로필 이미지를 저장합니다.
     * 
     * @param userId         사용자 ID
     * @param profileImgFile 업로드된 프로필 이미지 파일
     * @return 저장된 이미지 URL
     * @throws Exception 파일 저장 또는 DB 저장 중 오류 발생 시
     */
    @Transactional(rollbackFor = Exception.class)
    public String saveProfileImage(Long userId, MultipartFile profileImgFile) throws Exception {
        if (profileImgFile == null || profileImgFile.isEmpty()) {
            throw new IllegalArgumentException("프로필 이미지 파일이 없습니다.");
        }

        // 기존 프로필 이미지가 있으면 삭제
        UserDto existingUser = userMapper.findById(userId);
        if (existingUser != null && existingUser.getProfileImage() != null
                && !existingUser.getProfileImage().isEmpty()) {
            // 기존 파일 삭제
            String existingImageUrl = existingUser.getProfileImage();
            // URL에서 파일명 추출 (예: /images/upload/profiles/uuid.jpg -> uuid.jpg)
            if (existingImageUrl.contains("/")) {
                String existingFileName = existingImageUrl.substring(existingImageUrl.lastIndexOf("/") + 1);
                String filePath = profileImgLocation + File.separator + existingFileName;
                fileService.deleteFile(filePath);
            }
        }

        // 새 파일 업로드
        String oriImgName = profileImgFile.getOriginalFilename();
        String imgName = fileService.uploadFile(profileImgLocation, oriImgName, profileImgFile.getBytes());
        String imgUrl = "/images/upload/profiles/" + imgName;

        // 데이터베이스 업데이트
        userMapper.updateProfileImage(userId, imgUrl);

        return imgUrl;
    }

    /**
     * 사용자 프로필 이미지를 삭제합니다.
     * 
     * @param userId 사용자 ID
     * @throws Exception 파일 삭제 또는 DB 업데이트 중 오류 발생 시
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteProfileImage(Long userId) throws Exception {
        UserDto user = userMapper.findById(userId);
        if (user != null && user.getProfileImage() != null && !user.getProfileImage().isEmpty()) {
            // 파일 삭제
            String imageUrl = user.getProfileImage();
            if (imageUrl.contains("/")) {
                String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                String filePath = profileImgLocation + File.separator + fileName;
                fileService.deleteFile(filePath);
            }

            // 데이터베이스에서 프로필 이미지 URL 제거
            userMapper.updateProfileImage(userId, null);
        }
    }

    /**
     * 사용자 ID로 사용자 정보를 조회합니다.
     * 
     * @param userId 사용자 ID
     * @return 사용자 DTO
     */
    public UserDto getUserById(Long userId) {
        return userMapper.findById(userId);
    }
}
