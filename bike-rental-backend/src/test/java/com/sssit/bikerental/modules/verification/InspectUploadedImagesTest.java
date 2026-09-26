package com.sssit.bikerental.modules.verification;

import java.io.File;
import java.lang.reflect.Field;
import org.junit.jupiter.api.Test;
import com.sssit.bikerental.modules.verification.bikedocument.model.RCData;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCExtractor;
import com.sssit.bikerental.modules.verification.common.config.OCRConfig;
import com.sssit.bikerental.modules.verification.common.service.DocumentOCRService;
import com.sssit.bikerental.modules.verification.drivinglicense.model.DLData;
import com.sssit.bikerental.modules.verification.drivinglicense.util.DLExtractor;

public class InspectUploadedImagesTest {

    @Test
    void testInspectImages() throws Exception {
        OCRConfig config = new OCRConfig();
        RCExtractor rcExtractor = new RCExtractor();
        DLExtractor dlExtractor = new DLExtractor();

        DocumentOCRService docService = new DocumentOCRService();
        setField(docService, "ocrConfig", config);
        setField(docService, "rcExtractor", rcExtractor);
        setField(docService, "dlExtractor", dlExtractor);

        File f1 = new File("E:\\CMRM\\SSSIT\\IMG-20251218-WA0016.jpg");
        File f2 = new File("E:\\CMRM\\SSSIT\\IMG-20251218-WA0019.jpg");

        if (f1.exists()) {
            RCData rc1 = docService.extractRcDocument(f1, null);
            DLData dl1 = docService.extractDlDocument(f1);
            java.nio.file.Files.writeString(java.nio.file.Path.of("target/f1_rc_reg.txt"), "Reg: " + rc1.getRegistrationNumber() + "\nRaw:\n" + rc1.getOcrText());
            java.nio.file.Files.writeString(java.nio.file.Path.of("target/f1_dl_lic.txt"), "Lic: " + dl1.getLicenseNumber() + "\nRaw:\n" + dl1.getOcrText());
        }

        if (f2.exists()) {
            RCData rc2 = docService.extractRcDocument(f2, null);
            DLData dl2 = docService.extractDlDocument(f2);
            java.nio.file.Files.writeString(java.nio.file.Path.of("target/f2_rc_reg.txt"), "Reg: " + rc2.getRegistrationNumber() + "\nRaw:\n" + rc2.getOcrText());
            java.nio.file.Files.writeString(java.nio.file.Path.of("target/f2_dl_lic.txt"), "Lic: " + dl2.getLicenseNumber() + "\nRaw:\n" + dl2.getOcrText());
        }
    }

    private static void setField(Object target, String fieldName, Object val) throws Exception {
        Field f = target.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(target, val);
    }
}
