package com.busan.orora.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.busan.orora.user.mapper.UserMapper;
import com.busan.orora.user.mapper.UserProfileImageMapper;
import org.springframework.stereotype.Service;
import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.dto.UserProfileImageDto;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.busan.orora.common.service.FileService;
import com.busan.orora.commoncode.service.CommonCodeService;
import com.busan.orora.commoncode.dto.CommonCodeDto;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserProfileImageMapper userProfileImageMapper;

    @Autowired
    private FileService fileService;

    @Autowired
    private CommonCodeService commonCodeService;

    @Value("${file.upload.profileImgLocation}")
    private String profileImgLocation;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void insertUser(UserDto userDto, String rawPassword) {
        insertUser(userDto, rawPassword, null);
    }

    public void insertUser(UserDto userDto, String rawPassword, MultipartFile profileImage) {
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

        // 사용자 정보 먼저 저장 (ID를 얻기 위해)
        userMapper.insertUser(userDto);

        // 프로필 이미지가 제공된 경우 저장
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                String oriImgName = profileImage.getOriginalFilename();
                String imgName = fileService.uploadFile(profileImgLocation, oriImgName, profileImage.getBytes());
                String imgUrl = "/images/upload/profiles/" + imgName;

                // user_profile_images 테이블에 저장
                UserProfileImageDto profileImageDto = new UserProfileImageDto();
                profileImageDto.setUserId(userDto.getId());
                profileImageDto.setImgName(imgName);
                profileImageDto.setOriImgName(oriImgName);
                profileImageDto.setImageUrl(imgUrl);

                userProfileImageMapper.insertImage(profileImageDto);
            } catch (Exception e) {
                // 프로필 이미지 저장 실패 시에도 회원가입은 성공하도록 처리
                // (선택사항이므로 예외를 로그만 남기고 계속 진행)
                logger.error("프로필 이미지 저장 중 오류 발생", e);
            }
        }
    }

    public UserDto login(String loginId, String password) {
        UserDto user = userMapper.findByLoginId(loginId);

        if (user != null && passwordEncoder.matches(password, user.getPasswordHash())) {
            // 사용자 역할이 비활성화되었는지 확인
            if (user.getRoleCode() != null && !isRoleActive(user.getRoleCode())) {
                // 역할이 비활성화된 경우 로그인 불가
                return null;
            }
            
            // 마지막 로그인 시간 업데이트
            user.setLastLogin(LocalDateTime.now());
            userMapper.updateLastLogin(user.getId(), user.getLastLogin());
            return user;
        }

        return null;
    }
    
    /**
     * 역할 코드가 활성화되어 있는지 확인
     */
    private boolean isRoleActive(String roleCode) {
        try {
            CommonCodeDto roleCodeDto = commonCodeService.getCodeByGroupAndCode("USER_ROLE", roleCode);
            return roleCodeDto != null && roleCodeDto.getIsActive() != null && roleCodeDto.getIsActive();
        } catch (Exception e) {
            // 오류 발생 시 기본적으로 활성으로 간주
            return true;
        }
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
        UserProfileImageDto existingImage = userProfileImageMapper.findRepImageByUserId(userId);
        if (existingImage != null) {
            // 기존 파일 삭제
            String existingImageUrl = existingImage.getImageUrl();
            // URL에서 파일명 추출 (예: /images/upload/profiles/uuid.jpg -> uuid.jpg)
            if (existingImageUrl != null && existingImageUrl.contains("/")) {
                String existingFileName = existingImageUrl.substring(existingImageUrl.lastIndexOf("/") + 1);
                String filePath = profileImgLocation + File.separator + existingFileName;
                fileService.deleteFile(filePath);
            }
            // 기존 이미지 삭제
            userProfileImageMapper.deleteImage(existingImage.getId());
        }

        // 새 파일 업로드
        String oriImgName = profileImgFile.getOriginalFilename();
        String imgName = fileService.uploadFile(profileImgLocation, oriImgName, profileImgFile.getBytes());
        String imgUrl = "/images/upload/profiles/" + imgName;

        // user_profile_images 테이블에 저장
        UserProfileImageDto profileImageDto = new UserProfileImageDto();
        profileImageDto.setUserId(userId);
        profileImageDto.setImgName(imgName);
        profileImageDto.setOriImgName(oriImgName);
        profileImageDto.setImageUrl(imgUrl);

        userProfileImageMapper.insertImage(profileImageDto);

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
        List<UserProfileImageDto> images = userProfileImageMapper.findImagesByUserId(userId);
        if (images != null && !images.isEmpty()) {
            for (UserProfileImageDto image : images) {
                // 파일 삭제
                String imageUrl = image.getImageUrl();
                if (imageUrl != null && imageUrl.contains("/")) {
                    String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                    String filePath = profileImgLocation + File.separator + fileName;
                    fileService.deleteFile(filePath);
                }
            }
            // 데이터베이스에서 프로필 이미지 삭제
            userProfileImageMapper.deleteImagesByUserId(userId);
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

    /**
     * 사용자 프로필 정보를 업데이트합니다.
     * 
     * @param userId       사용자 ID
     * @param userDto      업데이트할 사용자 정보
     * @param profileImage 프로필 이미지 파일 (선택사항)
     * @return 업데이트된 사용자 DTO
     * @throws Exception 업데이트 중 오류 발생 시
     */
    @Transactional(rollbackFor = Exception.class)
    public UserDto updateUserProfile(Long userId, UserDto userDto, MultipartFile profileImage) throws Exception {
        // 기존 사용자 정보 가져오기
        UserDto existingUser = userMapper.findById(userId);
        if (existingUser == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        // 업데이트할 정보 설정
        existingUser.setUsername(userDto.getUsername());
        existingUser.setEmail(userDto.getEmail());
        existingUser.setPhoneNumber(userDto.getPhoneNumber());
        existingUser.setAddress(userDto.getAddress());
        existingUser.setBirthDate(userDto.getBirthDate());
        existingUser.setGenderCode(userDto.getGenderCode());

        // 사용자 정보 업데이트
        userMapper.updateUser(existingUser);

        // 프로필 이미지가 제공된 경우 업데이트
        if (profileImage != null && !profileImage.isEmpty()) {
            saveProfileImage(userId, profileImage);
        }

        // 업데이트된 사용자 정보 반환
        return userMapper.findById(userId);
    }

    /**
     * 사용자 상태를 업데이트합니다.
     * 
     * @param userId     사용자 ID
     * @param statusCode 상태 코드 (ACTIVE, INACTIVE, SUSPENDED)
     */
    @Transactional
    public void updateUserStatus(Long userId, String statusCode) {
        userMapper.updateUserStatus(userId, statusCode);
    }

    /**
     * 사용자 권한을 업데이트합니다.
     * 
     * @param userId   사용자 ID
     * @param roleCode 권한 코드 (MEMBER, VIP, ADMIN)
     */
    @Transactional
    public void updateUserRole(Long userId, String roleCode) {
        userMapper.updateUserRole(userId, roleCode);
    }

    /**
     * 사용자 정보를 업데이트합니다 (관리자용).
     * 
     * @param userId  사용자 ID
     * @param userDto 업데이트할 사용자 정보
     * @return 업데이트된 사용자 DTO
     */
    @Transactional
    public UserDto updateUser(Long userId, UserDto userDto) {
        UserDto existingUser = userMapper.findById(userId);
        if (existingUser == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        existingUser.setUsername(userDto.getUsername());
        existingUser.setEmail(userDto.getEmail());
        if (userDto.getRoleCode() != null) {
            existingUser.setRoleCode(userDto.getRoleCode());
        }
        if (userDto.getStatusCode() != null) {
            existingUser.setStatusCode(userDto.getStatusCode());
        }

        userMapper.updateUser(existingUser);
        return userMapper.findById(userId);
    }

    /**
     * 사용자를 삭제합니다.
     * 
     * @param userId 사용자 ID
     */
    @Transactional
    public void deleteUser(Long userId) {
        userMapper.deleteUser(userId);
    }

    /**
     * 이름 또는 이메일로 사용자 아이디를 찾습니다.
     * 
     * @param username 사용자 이름
     * @param email 사용자 이메일
     * @return 사용자 DTO (아이디 찾기 성공 시), null (찾지 못한 경우)
     */
    public UserDto findUserByUsernameOrEmail(String username, String email) {
        if ((username == null || username.trim().isEmpty()) && 
            (email == null || email.trim().isEmpty())) {
            return null;
        }
        return userMapper.findByUsernameOrEmail(username, email);
    }

    /**
     * 아이디로 비밀번호를 재설정합니다.
     * 
     * @param loginId 사용자 로그인 ID
     * @param newPassword 새로운 비밀번호
     * @return 성공 여부
     */
    @Transactional
    public boolean resetPassword(String loginId, String newPassword) {
        UserDto user = userMapper.findByLoginId(loginId);
        if (user == null) {
            return false;
        }
        
        String encodedPassword = passwordEncoder.encode(newPassword);
        userMapper.updatePassword(loginId, encodedPassword);
        return true;
    }
}
