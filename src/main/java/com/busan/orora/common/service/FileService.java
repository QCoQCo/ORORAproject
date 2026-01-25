package com.busan.orora.common.service;

import org.springframework.stereotype.Service;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.UUID;

/**
 * 파일 저장 및 삭제를 처리하는 공통 서비스
 */
@Service
public class FileService {

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
        UUID uuid = UUID.randomUUID();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String savedFileName = uuid.toString() + extension;

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
