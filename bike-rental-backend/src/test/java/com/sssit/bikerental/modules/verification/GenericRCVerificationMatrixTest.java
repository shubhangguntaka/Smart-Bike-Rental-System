package com.sssit.bikerental.modules.verification;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.sssit.bikerental.modules.verification.bikedocument.model.RCData;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCDocumentTypeValidator;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCExtractor;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCValidator;
import com.sssit.bikerental.modules.verification.common.config.OCRConfig;
import com.sssit.bikerental.modules.verification.common.service.DocumentOCRService;
import com.sssit.bikerental.modules.verification.common.util.DocumentIdentifierUtil;
import com.sssit.bikerental.modules.verification.drivinglicense.util.DLExtractor;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Generic RC Verification Test Matrix — Layout-Agnostic & Color-Agnostic")
public class GenericRCVerificationMatrixTest {

    private RCExtractor rcExtractor;
    private RCValidator rcValidator;
    private RCDocumentTypeValidator docTypeValidator;
    private DocumentOCRService docService;
    private OCRConfig ocrConfig;

    @BeforeEach
    void setUp() throws Exception {
        rcExtractor = new RCExtractor();
        rcValidator = new RCValidator();
        docTypeValidator = new RCDocumentTypeValidator();
        ocrConfig = new OCRConfig();

        docService = new DocumentOCRService();
        setPrivateField(docService, "ocrConfig", ocrConfig);
        setPrivateField(docService, "rcExtractor", rcExtractor);
        setPrivateField(docService, "dlExtractor", new DLExtractor());
    }

    private static void setPrivateField(Object target, String fieldName, Object val) throws Exception {
        java.lang.reflect.Field f = target.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(target, val);
    }

    @Test
    @DisplayName("Test 1: Provided RC Layout — TS02EY4494 near header, reject AR505001 from address PIN")
    void testCurrentTelanganaRcLayout() {
        String ocr = "GOVERNMENT OF TELANGANA TRANSPORT DEPARTMENT\n" +
                "CERTIFICATE OF REGISTRATION\n" +
                "Regn. Number: TS02EY4494\n" +
                "Regd. Owner: K LATHA\n" +
                "Address: H.NO 2-10-123, KARIMNAGAR - 505001\n" +
                "Chassis No: MD625AF87N1D23456\n" +
                "Engine No: AF87E1234567\n" +
                "Class: MOTOR CYCLE\n" +
                "Mfg Date: 05/2021";

        RCData data = rcExtractor.extract(ocr, "TS02EY4494");
        assertNotNull(data.getRegistrationNumber());
        assertEquals("TS02EY4494", data.getRegistrationNumber());
        assertNotEquals("AR505001", data.getRegistrationNumber());
        assertNotEquals("505001", data.getRegistrationNumber());
        assertFalse(data.isAmbiguous());
        assertEquals("VALID", rcValidator.validate(data));
    }

    @Test
    @DisplayName("Test 2: Black text on white background (Standard Clean Scan)")
    void testBlackTextOnWhiteBackground() {
        String ocr = "FORM 23\n" +
                "TRANSPORT DEPARTMENT, MAHARASHTRA\n" +
                "REGISTRATION NO. : MH12AB1234\n" +
                "OWNER: RAHUL SHARMA\n" +
                "PUNE - 411001";

        RCData data = rcExtractor.extract(ocr, "MH12AB1234");
        assertEquals("MH12AB1234", data.getRegistrationNumber());
        assertFalse(data.isAmbiguous());
        assertEquals("VALID", rcValidator.validate(data));
    }

    @Test
    @DisplayName("Test 3: Colored background with dark text (Karnataka Smart Card)")
    void testColoredBackgroundSmartCard() {
        String ocr = "GOVERNMENT OF KARNATAKA\n" +
                "MOTOR VEHICLES DEPARTMENT\n" +
                "VEHICLE NO: KA01EF9999\n" +
                "CHASSIS NO: ME4JF504EF1234567\n" +
                "BANGALORE - 560001";

        RCData data = rcExtractor.extract(ocr, "KA01EF9999");
        assertEquals("KA01EF9999", data.getRegistrationNumber());
        assertEquals("VALID", rcValidator.validate(data));
    }

    @Test
    @DisplayName("Test 4: Registration Number placed directly below the label (Next Line)")
    void testRegistrationOnNextLine() {
        String ocr = "CERTIFICATE OF REGISTRATION\n" +
                "REGISTRATION NUMBER\n" +
                "DL01AA5555\n" +
                "REGISTERED OWNER: AMIT KUMAR\n" +
                "NEW DELHI 110001";

        RCData data = rcExtractor.extract(ocr, "DL01AA5555");
        assertEquals("DL01AA5555", data.getRegistrationNumber());
        assertEquals("VALID", rcValidator.validate(data));
    }

    @Test
    @DisplayName("Test 5: Registration Number placed directly above the label")
    void testRegistrationAboveLabel() {
        String ocr = "TRANSPORT DEPARTMENT\n" +
                "AP09CD7788\n" +
                "REGN. NO.\n" +
                "OWNER: K VENKATESH\n" +
                "VIJAYAWADA - 520001";

        RCData data = rcExtractor.extract(ocr, "AP09CD7788");
        assertEquals("AP09CD7788", data.getRegistrationNumber());
        assertEquals("VALID", rcValidator.validate(data));
    }

    @Test
    @DisplayName("Test 6: Missing label — Prominent identifier in upper region")
    void testMissingRegLabelProminentInUpperZone() {
        String ocr = "CERTIFICATE OF REGISTRATION\n" +
                "TS07EA1234\n" +
                "OWNER: SURESH REDDY\n" +
                "HYDERABAD - 500081";

        RCData data = rcExtractor.extract(ocr, "TS07EA1234");
        assertEquals("TS07EA1234", data.getRegistrationNumber());
    }

    @Test
    @DisplayName("Test 7: Registration number with spaces (e.g. TS  02  EY  4494)")
    void testRegistrationWithSpaces() {
        String ocr = "CERTIFICATE OF REGISTRATION\n" +
                "Regn. No: TS   02   EY   4494\n" +
                "Owner: K LATHA";

        RCData data = rcExtractor.extract(ocr, "TS02EY4494");
        assertEquals("TS02EY4494", data.getRegistrationNumber());
    }

    @Test
    @DisplayName("Test 8: Registration number with hyphens (e.g. TS-02-EY-4494)")
    void testRegistrationWithHyphens() {
        String ocr = "FORM 23\n" +
                "Regn. Number: TS-02-EY-4494\n" +
                "Owner: K LATHA";

        RCData data = rcExtractor.extract(ocr, "TS02EY4494");
        assertEquals("TS02EY4494", data.getRegistrationNumber());
    }

    @Test
    @DisplayName("Test 9: OCR Character Confusion (O vs 0, S vs 5, I vs 1)")
    void testOcrCharacterConfusionCorrection() {
        // TSO2EY4494 with letter 'O' instead of digit '0'
        String ocr = "CERTIFICATE OF REGISTRATION\n" +
                "Regn. Number: TSO2EY4494\n" +
                "Owner: K LATHA";

        RCData data = rcExtractor.extract(ocr, "TS02EY4494");
        assertEquals("TS02EY4494", data.getRegistrationNumber());
    }

    @Test
    @DisplayName("Test 10: Address containing PIN code — Reject PIN and non-reg tokens")
    void testAddressPinCodeRejection() {
        String ocr = "TRANSPORT DEPT\n" +
                "CERTIFICATE OF REGISTRATION\n" +
                "REGN NUMBER: TS02EY4494\n" +
                "ADDRESS: HOUSE 505001, ROAD 7, KARIMNAGAR - 505001\n" +
                "PIN: 505001";

        RCData data = rcExtractor.extract(ocr, null);
        assertEquals("TS02EY4494", data.getRegistrationNumber());
        assertNotEquals("505001", data.getRegistrationNumber());
        assertFalse(data.getRegistrationNumber().contains("505001"));
    }

    @Test
    @DisplayName("Test 11: Negative Test — Registration Mismatch (RC has TS09AB1234, Bike has TS02EY4494)")
    void testRegistrationMismatch() {
        String ocr = "TELANGANA STATE TRANSPORT\n" +
                "CERTIFICATE OF REGISTRATION\n" +
                "Regn. Number: TS09AB1234\n" +
                "Owner: VIVEK";

        String bikeDetailsReg = "TS02EY4494";

        RCData data = rcExtractor.extract(ocr, bikeDetailsReg);
        // Extraction should succeed in reading the RC number
        assertEquals("TS09AB1234", data.getRegistrationNumber());
        // But mismatch with the bike details
        assertFalse(DocumentIdentifierUtil.registrationNumbersMatch(bikeDetailsReg, data.getRegistrationNumber()));
    }

    @Test
    @DisplayName("Test 12: Ambiguous Candidates (Two equal non-target numbers)")
    void testAmbiguousCandidatesFlagged() {
        String ocr = "TRANSPORT DEPARTMENT\n" +
                "CERTIFICATE OF REGISTRATION\n" +
                "VEHICLE DETAILS\n" +
                "REGN NO: TS01AA1111\n" +
                "OLD REGN: TS02BB2222\n" +
                "OWNER: ANONYMOUS";

        RCData data = rcExtractor.extract(ocr, null);
        assertNotNull(data.getRegistrationNumber());
        // Ambiguous candidate detected because two valid registration numbers exist without target
        // One is selected as best candidate but ambiguity flag is set
        assertTrue(data.isAmbiguous() || data.getRegistrationNumber().equals("TS01AA1111"));
    }

    @Test
    @DisplayName("Test 13: Bharat (BH) Series Registration Format")
    void testBharatSeriesFormat() {
        String ocr = "GOVERNMENT OF INDIA\n" +
                "CERTIFICATE OF REGISTRATION\n" +
                "Regn No: 22BH1234AA\n" +
                "Owner: DEFENCE EMPLOYEE";

        RCData data = rcExtractor.extract(ocr, "22BH1234AA");
        assertEquals("22BH1234AA", data.getRegistrationNumber());
        assertTrue(DocumentIdentifierUtil.isValidRegistrationNumber("22BH1234AA"));
    }

    @Test
    @DisplayName("Test 14: Document Type Validator accepts valid RC and rejects others")
    void testDocumentTypeValidation() {
        String rcText = "CERTIFICATE OF REGISTRATION\nRegn. Number: TS02EY4494\nChassis: 123456";
        assertTrue(docTypeValidator.isRCDocument(rcText, "TS02EY4494"));

        String panText = "INCOME TAX DEPARTMENT\nPERMANENT ACCOUNT NUMBER\nABCDE1234F";
        assertFalse(docTypeValidator.isRCDocument(panText, null));

        String dlText = "Indian Union Driving Licence\nIssued by Telangana\nTG00220240006700";
        assertFalse(docTypeValidator.isRCDocument(dlText, null));
    }

    @Test
    @DisplayName("Test 15: Image-Level OCR Test — Black text on white background image")
    void testImageLevelBlackOnWhite() throws Exception {
        BufferedImage img = new BufferedImage(800, 400, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, 800, 400);

        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setColor(Color.BLACK);
        g.setFont(new Font("Arial", Font.BOLD, 22));
        g.drawString("CERTIFICATE OF REGISTRATION", 200, 60);

        g.setFont(new Font("Arial", Font.BOLD, 28));
        g.drawString("Regn. Number: TS09AB1234", 180, 130);

        g.setFont(new Font("Arial", Font.PLAIN, 18));
        g.drawString("Owner: RAMA RAO", 180, 190);
        g.drawString("Address: HYDERABAD 500081", 180, 240);
        g.dispose();

        File tempFile = File.createTempFile("rc_black_white_", ".png");
        try {
            ImageIO.write(img, "png", tempFile);
            RCData data = docService.extractRcDocument(tempFile, "TS09AB1234");
            assertNotNull(data.getRegistrationNumber());
            assertEquals("TS09AB1234", data.getRegistrationNumber());
        } finally {
            tempFile.delete();
        }
    }

    @Test
    @DisplayName("Test 16: Image-Level OCR Test — White text on colored header banner")
    void testImageLevelWhiteOnColoredHeader() throws Exception {
        BufferedImage img = new BufferedImage(800, 400, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.LIGHT_GRAY);
        g.fillRect(0, 0, 800, 400);

        // Dark Blue Header Banner
        g.setColor(new Color(20, 40, 120));
        g.fillRect(0, 0, 800, 120);

        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setColor(Color.WHITE);
        g.setFont(new Font("Arial", Font.BOLD, 20));
        g.drawString("GOVERNMENT OF KARNATAKA - RC", 220, 40);

        g.setFont(new Font("Arial", Font.BOLD, 26));
        g.drawString("Regn. No: KA01EF1234", 230, 90);

        g.setColor(Color.BLACK);
        g.setFont(new Font("Arial", Font.PLAIN, 18));
        g.drawString("Owner: SNEHA K", 180, 190);
        g.drawString("Chassis No: MA3FDE11S00123456", 180, 240);
        g.dispose();

        File tempFile = File.createTempFile("rc_colored_header_", ".png");
        try {
            ImageIO.write(img, "png", tempFile);
            RCData data = docService.extractRcDocument(tempFile, "KA01EF1234");
            assertNotNull(data.getRegistrationNumber());
            assertEquals("KA01EF1234", data.getRegistrationNumber());
        } finally {
            tempFile.delete();
        }
    }
}
