package com.busan.orora.common.service;

import org.springframework.stereotype.Service;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * 파일 저장 및 삭제를 처리하는 공통 서비스
 */
@Service
public class FileService {

    /** 업로드를 허용하는 이미지 확장자 (소문자) */
    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    /**
     * 상대 경로를 절대 경로로 변환합니다.
     * 프로젝트 루트 기준으로 절대 경로를 생성합니다.
     */
    private String getAbsolutePath(String path) {
        // 이미 절대 경로인 경우 그대로 반환
        File file = new File(path);
        if (file.isAbsolute()) {
            return path;
        }
        // 상대 경로인 경우 프로젝트 루트 기준으로 절대 경로 생성
        String projectRoot = System.getProperty("user.dir");
        File absolutePath = new File(projectRoot, path);
        return absolutePath.getAbsolutePath();
    }

    /**
     * 파일을 업로드하고 UUID 기반의 고유한 파일명을 반환합니다.
     * 
     * @param uploadPath       업로드할 디렉토리 경로
     * @param originalFileName 원본 파일명
     * @param fileData         파일 바이트 데이터
     * @return 저장된 파일명 (UUID + 확장자)
     * @throws IOException 파일 저장 중 오류 발생 시
     */
    public String uploadFile(String uploadPath, String originalFileName, byte[] fileData) throws IOException {
        // 0. 이미지 파일인지 검증 (.html/.svg 등이 업로드되어 같은 출처에서 서빙되는 것을 방지)
        String extension = validateImageFile(originalFileName, fileData);

        // 상대 경로를 절대 경로로 변환
        String absoluteUploadPath = getAbsolutePath(uploadPath);

        // 1. 업로드 디렉토리 생성 (없으면)
        File uploadDir = new File(absoluteUploadPath);
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            if (!created && !uploadDir.exists()) {
                throw new IOException("디렉토리 생성 실패: " + absoluteUploadPath +
                        " (권한을 확인하거나 수동으로 디렉토리를 생성해주세요)");
            }
        }

        // 2. UUID로 고유한 파일명 생성
        // (확장자는 원본 문자열이 아닌 검증된 값을 사용)
        UUID uuid = UUID.randomUUID();
        String savedFileName = uuid.toString() + "." + extension;

        // 3. 전체 경로 생성
        String fileUploadFullUrl = absoluteUploadPath + File.separator + savedFileName;
        File uploadFile = new File(fileUploadFullUrl);

        // 4. 파일 쓰기
        try (FileOutputStream fos = new FileOutputStream(uploadFile)) {
            fos.write(fileData);
        }

        return savedFileName; // 저장된 파일명만 반환
    }

    /**
     * 업로드 파일이 허용된 이미지인지 확인합니다.
     * 확장자 화이트리스트와 파일 시그니처(매직 바이트)가 모두 일치해야 합니다.
     *
     * @return 검증된 확장자 (소문자, 점 제외)
     * @throws IllegalArgumentException 허용되지 않은 파일인 경우
     */
    private String validateImageFile(String originalFileName, byte[] fileData) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf(".") + 1).toLowerCase(Locale.ROOT);
        }
        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension) || !matchesImageSignature(extension, fileData)) {
            throw new IllegalArgumentException("이미지 파일(jpg, jpeg, png, gif, webp)만 업로드할 수 있습니다.");
        }
        return extension;
    }

    /**
     * 파일 앞부분의 시그니처가 확장자에 맞는 이미지 형식인지 확인합니다.
     */
    private boolean matchesImageSignature(String extension, byte[] data) {
        if (data == null) {
            return false;
        }
        switch (extension) {
            case "jpg":
            case "jpeg":
                return startsWith(data, 0, 0xFF, 0xD8, 0xFF);
            case "png":
                return startsWith(data, 0, 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A);
            case "gif":
                return startsWith(data, 0, 'G', 'I', 'F', '8', '7', 'a')
                        || startsWith(data, 0, 'G', 'I', 'F', '8', '9', 'a');
            case "webp":
                return startsWith(data, 0, 'R', 'I', 'F', 'F') && startsWith(data, 8, 'W', 'E', 'B', 'P');
            default:
                return false;
        }
    }

    private boolean startsWith(byte[] data, int offset, int... signature) {
        if (data.length < offset + signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((data[offset + i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     *
     * 
     * @param filePath 삭제할 파일의 전체 경로 (절대 경로 또는 상대 경로)
     * @throws Exception 파일 삭제 중 오류 발생 시
     */
    public void deleteFile(String filePath) throws Exception {
        // 상대 경로를 절대 경로로 변환
        String absoluteFilePath = getAbsolutePath(filePath);
        File file = new File(absoluteFilePath);
        if (file.exists()) {
            file.delete();
        }
    }

    /**
     * 
     * 
     * @param filePath 확인할 파일의 전체 경로 (절대 경로 또는 상대 경로)
     * @return 파일 존재 여부
     */
    public boolean fileExists(String filePath) {
        // 상대 경로를 절대 경로로 변환
        String absoluteFilePath = getAbsolutePath(filePath);
        File file = new File(absoluteFilePath);
        return file.exists();
    }
}
