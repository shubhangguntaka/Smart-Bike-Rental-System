package com.sssit.bikerental.modules.verification;

import com.sssit.bikerental.modules.verification.aadhaar.regex.AadhaarRegexExtractor;
import com.sssit.bikerental.modules.verification.bikedocument.model.RCData;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCExtractor;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCValidator;
import com.sssit.bikerental.modules.verification.common.util.DocumentIdentifierUtil;
import com.sssit.bikerental.modules.verification.common.util.IndianStateCodeUtil;
import com.sssit.bikerental.modules.verification.drivinglicense.model.DLData;
import com.sssit.bikerental.modules.verification.drivinglicense.util.DLExtractor;
import com.sssit.bikerental.modules.verification.drivinglicense.util.DLValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class VerificationPipelineAccuracyTest {

    private RCExtractor rcExtractor;
    private RCValidator rcValidator;
    private DLExtractor dlExtractor;
    private DLValidator dlValidator;

    @BeforeEach
    void setUp() {
        rcExtractor = new RCExtractor();
        rcValidator = new RCValidator();
        dlExtractor = new DLExtractor();
        dlValidator = new DLValidator();
    }

    @Nested
    @DisplayName("RC Extraction and Validation Tests")
    class RCExtractionTests {

        @Test
        @DisplayName("1. Valid RC candidate in Regn. Number region (Telangana RC regression)")
        void testRegressionProvidedRcDocument() {
            String ocrText = "TELANGANA STATE TRANSPORT DEPARTMENT\n" +
                    "CERTIFICATE OF REGISTRATION\n" +
                    "Regn. Number\n" +
                    "TS09AB1234\n" +
                    "KARIMNAGAR-505001\n" +
                    "Mfg. Date: 7/2018\n" +
                    "Chassis No: MA3FDE11S00123456";

            RCData data = rcExtractor.extract(ocrText);
            assertEquals("TS09AB1234", data.getRegistrationNumber());
            assertEquals("VALID", rcValidator.validate(data));
        }

        @Test
        @DisplayName("2. Registration number mixed with/near red header banner")
        void testRcMixedWithRedHeaderText() {
            String ocrText = "TELANGANA STATE TRANSPORT DEPARTMENT CERTIFICATE OF REGISTRATION TS09AB1234\n" +
                    "Regn. Number :\n" +
                    "Class: MOTOR CYCLE\n" +
                    "Owner: G SHUBHANG";

            RCData data = rcExtractor.extract(ocrText);
            assertEquals("TS09AB1234", data.getRegistrationNumber());
            assertEquals("VALID", rcValidator.validate(data));
        }

        @Test
        @DisplayName("3. Registration number with multiple spaces (e.g. TS  09  AB  1234)")
        void testExtractRcWithSpaces() {
            String ocrText = "FORM 23 - CERTIFICATE OF REGISTRATION\n" +
                    "Regn. No: AP   28   CD   5678\n" +
                    "Owner: SIVA RAMA KRISHNA\n" +
                    "PIN: 500081";

            RCData data = rcExtractor.extract(ocrText);
            assertEquals("AP28CD5678", data.getRegistrationNumber());
            assertEquals("VALID", rcValidator.validate(data));
        }

        @Test
        @DisplayName("4. Registration number with hyphens (e.g. KA-01-EF-1234)")
        void testExtractRcWithHyphens() {
            String ocrText = "GOVERNMENT OF KARNATAKA\n" +
                    "Regn No: KA-01-EF-1234\n" +
                    "Model: ACTIVA 6G";

            RCData data = rcExtractor.extract(ocrText);
            assertEquals("KA01EF1234", data.getRegistrationNumber());
            assertEquals("VALID", rcValidator.validate(data));
        }

        @Test
        @DisplayName("5. Repair OCR O/0 confusion in registration digits")
        void testOcrDigitRepairOTo0() {
            String ocrText = "Regn. Number: TS09EA123O"; // Ending letter 'O' repaired to digit '0'
            RCData data = rcExtractor.extract(ocrText);
            assertEquals("TS09EA1230", data.getRegistrationNumber());
        }

        @Test
        @DisplayName("6. Repair OCR I/1 or l/1 confusion in registration digits")
        void testOcrDigitRepairITo1() {
            String ocrText = "Regn. Number: TS09ABl234"; // Lowercase L / I in digits slot repaired to 1
            RCData data = rcExtractor.extract(ocrText);
            assertEquals("TS09AB1234", data.getRegistrationNumber());
        }

        @Test
        @DisplayName("7. Multiple numeric values present (PIN 505001, Year 7/2018, amount 500)")
        void testExcludeMultipleNumericValues() {
            String ocrText = "TELANGANA TRANSPORT\n" +
                    "Fee: 500\n" +
                    "Receipt: 987654321\n" +
                    "PIN: 505001\n" +
                    "Mfg: 7/2018\n" +
                    "Regn No: TS09AB1234";

            RCData data = rcExtractor.extract(ocrText);
            assertEquals("TS09AB1234", data.getRegistrationNumber());
        }

        @Test
        @DisplayName("8. Exclude Chassis (17 chars) and Engine numbers")
        void testExcludeChassisAndEngineNumbers() {
            String ocrText = "REGISTRATION DETAILS\n" +
                    "Chassis No: MA3FDE11S00123456\n" +
                    "Engine No: K10BN1234567\n" +
                    "Regn No: KA01EF1234";

            RCData data = rcExtractor.extract(ocrText);
            assertEquals("KA01EF1234", data.getRegistrationNumber());
            assertNotEquals("MA3FDE11S00123456", data.getRegistrationNumber());
        }

        @Test
        @DisplayName("9. Matching Bike Details registration number entered by user")
        void testMatchingBikeDetailsRegistration() {
            String ocrText = "TELANGANA MOTOR VEHICLES DEPT\n" +
                    "Other Reference: TS09XY5678\n" +
                    "Vehicle Regn: TS 09 AB 1234";

            // User entered TS09AB1234 in Bike Details
            RCData data = rcExtractor.extract(ocrText, "TS09AB1234");
            assertEquals("TS09AB1234", data.getRegistrationNumber());
            assertTrue(DocumentIdentifierUtil.registrationNumbersMatch("TS09AB1234", data.getRegistrationNumber()));
        }

        @Test
        @DisplayName("10. Mismatching Bike Details registration number")
        void testMismatchingBikeDetailsRegistration() {
            String userEnteredReg = "TS09AB1234";
            String ocrExtractedReg = "TS09XY5678";

            assertFalse(DocumentIdentifierUtil.registrationNumbersMatch(userEnteredReg, ocrExtractedReg));
        }

        @Test
        @DisplayName("11. Handle no valid candidate found with exact error message")
        void testNoValidRcCandidate() {
            String ocrText = "RECEIPT FOR FEES PAID\n" +
                    "Transaction ID: 987654321\n" +
                    "Amount: 500\n" +
                    "Date: 2022-01-01";

            RCData data = rcExtractor.extract(ocrText);
            assertNull(data.getRegistrationNumber());
            assertEquals("Could not identify a valid registration number from the RC.", rcValidator.validate(data));
        }

        @Test
        @DisplayName("12. Resolve ambiguous candidates by prioritizing upper zone / Regn Number region")
        void testAmbiguousCandidatesPrioritizeUpperZone() {
            String ocrText = "TELANGANA STATE TRANSPORT DEPARTMENT\n" +
                    "CERTIFICATE OF REGISTRATION\n" +
                    "Regn. Number : TS09AB1234\n" +
                    "History: Transferred from AP28CD5678";

            RCData data = rcExtractor.extract(ocrText);
            assertEquals("TS09AB1234", data.getRegistrationNumber());
        }
    }

    @Nested
    @DisplayName("Driving License Extraction and Validation Tests")
    class DLExtractionTests {

        @Test
        @DisplayName("1. Extract DL number directly below document title (Telangana DL regression)")
        void testDlNumberDirectlyBelowTitle() {
            String ocrText = "Indian Union Driving Licence\n" +
                    "Issued by Telangana\n" +
                    "TG00220240006700\n" +
                    "Issue Date 01/11/2024\n" +
                    "Validity 01/09/2045\n" +
                    "Name: G SHUBHANG";

            DLData data = dlExtractor.extract(ocrText);
            assertEquals("TG00220240006700", data.getLicenseNumber());
            assertEquals("VALID", dlValidator.validate(data));
        }

        @Test
        @DisplayName("2. No 'Driving License Number' label required on document")
        void testNoDlLabelRequired() {
            String ocrText = "FORM 7 - RULE 16(1)\n" +
                    "TG00220240006700\n" +
                    "S/W/D: RAMESH G\n" +
                    "PIN: 500032";

            DLData data = dlExtractor.extract(ocrText);
            assertNotNull(data.getLicenseNumber());
            assertEquals("TG00220240006700", data.getLicenseNumber());
            assertEquals("VALID", dlValidator.validate(data));
        }

        @Test
        @DisplayName("3. Ignore multiple dates (Issue Date, Validity, Endorsement)")
        void testDlExcludesMultipleDates() {
            String ocrText = "DRIVING LICENCE\n" +
                    "Issue Date: 01/11/2024\n" +
                    "Validity (NT): 01/09/2045\n" +
                    "TG00220240006700\n" +
                    "Endorsed: 15/05/2025";

            DLData data = dlExtractor.extract(ocrText);
            assertEquals("TG00220240006700", data.getLicenseNumber());
        }

        @Test
        @DisplayName("4. Ignore Date of Birth (DOB)")
        void testDlExcludesDOB() {
            String ocrText = "DRIVING LICENCE\n" +
                    "DOB: 01/09/2005\n" +
                    "TG00220240006700";

            DLData data = dlExtractor.extract(ocrText);
            assertEquals("TG00220240006700", data.getLicenseNumber());
        }

        @Test
        @DisplayName("5. Ignore PIN code (e.g. 505001)")
        void testDlExcludesPinCode() {
            String ocrText = "DRIVING LICENCE\n" +
                    "Address: KARIMNAGAR\n" +
                    "PIN: 505001\n" +
                    "TG00220240006700";

            DLData data = dlExtractor.extract(ocrText);
            assertEquals("TG00220240006700", data.getLicenseNumber());
            assertNotEquals("505001", data.getLicenseNumber());
        }

        @Test
        @DisplayName("6. Validate exact AA + 14 digits format (16 chars total)")
        void testDlExact16CharsFormat() {
            assertTrue(DocumentIdentifierUtil.isValidDrivingLicenseNumber("TG00220240006700"));
            assertTrue(DocumentIdentifierUtil.isValidDrivingLicenseNumber("TS00123456789012"));
            assertFalse(DocumentIdentifierUtil.isValidDrivingLicenseNumber("ZZ00220240006700")); // Invalid state
            assertFalse(DocumentIdentifierUtil.isValidDrivingLicenseNumber("TG12345")); // Too short
        }

        @Test
        @DisplayName("7. Extract DL with spaces (e.g. TG 00220240006700)")
        void testDlWithSpaces() {
            String ocrText = "INDIAN UNION DRIVING LICENCE\n" +
                    "TG  00220240006700\n" +
                    "Holder: G SHUBHANG";

            DLData data = dlExtractor.extract(ocrText);
            assertEquals("TG00220240006700", data.getLicenseNumber());
        }

        @Test
        @DisplayName("8. Extract DL with hyphens (e.g. TS-001-2024-0012345)")
        void testDlWithHyphens() {
            String ocrText = "UNION OF INDIA DRIVING LICENCE\n" +
                    "TS-001-2024-0012345\n" +
                    "Holder: VIKRAM RAO";

            DLData data = dlExtractor.extract(ocrText);
            assertEquals("TS00120240012345", data.getLicenseNumber());
            assertTrue(DocumentIdentifierUtil.isValidDrivingLicenseNumber(data.getLicenseNumber()));
        }

        @Test
        @DisplayName("9. Extract DL with tokenized spacing (e.g. TG002 2024 0006700)")
        void testDlTokenizedSpacing() {
            String ocrText = "UNION OF INDIA DRIVING LICENCE\n" +
                    "TG002 2024 0006700\n" +
                    "Name: SHUBHANG";

            DLData data = dlExtractor.extract(ocrText);
            assertEquals("TG00220240006700", data.getLicenseNumber());
        }

        @Test
        @DisplayName("10. Invalid candidate returns correct validation error message")
        void testDlInvalidCandidateMessage() {
            DLData data = new DLData();
            data.setLicenseNumber(null);
            assertEquals("Could not identify a valid Driving License number from this document.", dlValidator.validate(data));

            data.setLicenseNumber("INVALID123");
            assertEquals("Could not identify a valid Driving License number from this document.", dlValidator.validate(data));
        }

        @Test
        @DisplayName("11. Resolve multiple candidates by prioritizing region directly below title")
        void testDlResolveMultipleCandidatesByTitleRegion() {
            String ocrText = "INDIAN UNION DRIVING LICENCE\n" +
                    "Issued by Telangana\n" +
                    "TG00220240006700\n" +
                    "Old DL: AP00120150001234\n" +
                    "Name: G SHUBHANG";

            DLData data = dlExtractor.extract(ocrText);
            assertEquals("TG00220240006700", data.getLicenseNumber());
        }
    }

    @Nested
    @DisplayName("Aadhaar Number Extraction Tests")
    class AadhaarExtractionTests {

        @Test
        @DisplayName("Regression test for Aadhaar extraction from standard 12-digit spaced input")
        void testRegressionAadhaarDocument() {
            String ocrText = "GOVERNMENT OF INDIA\n" +
                    "1234 5678 9012\n" +
                    "My Aadhaar, My Identity";

            String aadhaar = AadhaarRegexExtractor.extractAadhaarNumber(ocrText);
            assertEquals("123456789012", aadhaar);
            assertTrue(DocumentIdentifierUtil.isValidAadhaarNumber(aadhaar));
        }

        @Test
        @DisplayName("Extract and normalize 12-digit Aadhaar number from spaced format")
        void testExtractAadhaarSpaced() {
            String ocrText = "GOVERNMENT OF INDIA\n" +
                    "Unique Identification Authority of India\n" +
                    "Name: Rajesh Kumar\n" +
                    "DOB: 01/01/1990\n" +
                    "1234 5678 9012\n" +
                    "My Aadhaar, My Identity";

            String aadhaar = AadhaarRegexExtractor.extractAadhaarNumber(ocrText);
            assertEquals("123456789012", aadhaar);
            assertTrue(DocumentIdentifierUtil.isValidAadhaarNumber(aadhaar));
        }

        @Test
        @DisplayName("Extract Aadhaar number with hyphens and normalize to 12 digits")
        void testExtractAadhaarHyphenated() {
            String ocrText = "MERA AADHAAR MERI PEHCHAN\n" +
                    "Aadhaar No: 9876-5432-1098\n" +
                    "Helpdesk: help@uidai.gov.in";

            String aadhaar = AadhaarRegexExtractor.extractAadhaarNumber(ocrText);
            assertEquals("987654321098", aadhaar);
            assertTrue(DocumentIdentifierUtil.isValidAadhaarNumber(aadhaar));
        }

        @Test
        @DisplayName("Do not select enrollment numbers or unrelated 12-digit numbers blindly")
        void testIgnoreEnrollmentNumbers() {
            String ocrText = "Enrolment No: 123456789012\n" +
                    "Aadhaar Number\n" +
                    "5678 1234 9012";

            String aadhaar = AadhaarRegexExtractor.extractAadhaarNumber(ocrText);
            assertEquals("567812349012", aadhaar);
        }
    }

    @Nested
    @DisplayName("Sensitive Data Masking Tests")
    class MaskingTests {

        @Test
        @DisplayName("Mask Aadhaar number (show only last 4 digits)")
        void testMaskAadhaar() {
            assertEquals("********9012", DocumentIdentifierUtil.maskAadhaarNumber("123456789012"));
            assertEquals("********9012", DocumentIdentifierUtil.maskAadhaarNumber("1234 5678 9012"));
        }

        @Test
        @DisplayName("Mask Driving License number (keep state and last 4)")
        void testMaskDrivingLicense() {
            assertEquals("TG********6700", DocumentIdentifierUtil.maskDrivingLicenseNumber("TG00220240006700"));
        }

        @Test
        @DisplayName("Mask Registration number")
        void testMaskRegistration() {
            assertEquals("TS09**1234", DocumentIdentifierUtil.maskRegistrationNumber("TS09AB1234"));
        }
    }
}
