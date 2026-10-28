package com.busan.orora.common.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class FileServiceTest {

    private static final byte[] PNG = { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0 };
    private static final byte[] JPG = { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0 };
    private static final byte[] GIF = { 'G', 'I', 'F', '8', '9', 'a', 0, 0 };
    private static final byte[] WEBP = { 'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P', 0, 0 };
    private static final byte[] HTML = "<html><script>alert(1)</script></html>".getBytes(StandardCharsets.UTF_8);

    private final FileService fileService = new FileService();

    @TempDir
    Path uploadDir;

    @Test
    void 허용된_이미지는_검증된_소문자_확장자로_저장된다() throws Exception {
        assertSaved("photo.PNG", PNG, "png");
        assertSaved("photo.jpeg", JPG, "jpeg");
        assertSaved("photo.jpg", JPG, "jpg");
        assertSaved("photo.gif", GIF, "gif");
        assertSaved("photo.webp", WEBP, "webp");
    }

    @Test
    void 이미지가_아닌_확장자는_거부된다() {
        assertRejected("evil.html", HTML);
        assertRejected("evil.svg", "<svg onload=alert(1)>".getBytes(StandardCharsets.UTF_8));
        assertRejected("evil.png.html", PNG);
        assertRejected("noextension", PNG);
        assertRejected(null, PNG);
    }

    @Test
    void 확장자만_이미지로_바꾼_파일은_거부된다() {
        assertRejected("evil.jpg", HTML);
        assertRejected("evil.png", JPG);
        assertRejected("empty.png", new byte[0]);
    }

    private void assertSaved(String originalFileName, byte[] data, String expectedExtension) throws Exception {
        String savedName = fileService.uploadFile(uploadDir.toString(), originalFileName, data);
        assertTrue(savedName.endsWith("." + expectedExtension), savedName);
        assertTrue(new File(uploadDir.toFile(), savedName).exists());
    }

    private void assertRejected(String originalFileName, byte[] data) {
        assertThrows(IllegalArgumentException.class,
                () -> fileService.uploadFile(uploadDir.toString(), originalFileName, data));
        assertEquals(0, uploadDir.toFile().list().length, "거부된 파일은 저장되면 안 됩니다.");
    }
}
