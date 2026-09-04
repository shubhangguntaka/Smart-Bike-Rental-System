package com.sssit.bikerental.modules.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.payment.config.PaymentProperties;
import com.sssit.bikerental.modules.payment.controller.PaymentController;
import com.sssit.bikerental.modules.payment.dto.InvoiceDTO;
import com.sssit.bikerental.modules.payment.dto.PaymentRequest;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.service.PaymentService;
import com.sssit.bikerental.modules.user.User;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    private PaymentProperties paymentProperties;
    private PaymentController paymentController;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        paymentProperties = new PaymentProperties();
        paymentProperties.setPlatformFeeThreshold(new BigDecimal("1000"));
        paymentProperties.setLowerPlatformFeePercent(new BigDecimal("3"));
        paymentProperties.setUpperPlatformFeePercent(new BigDecimal("5"));
        paymentProperties.setLateGraceMinutes(15);
        paymentProperties.setLateChargeRate(new BigDecimal("50.00"));

        paymentController = new PaymentController(paymentService, paymentProperties);
        mockMvc = MockMvcBuilders.standaloneSetup(paymentController).build();
        objectMapper = new ObjectMapper();

        authenticateAs(100L, Role.CUSTOMER);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long userId, Role role) {
        User user = User.builder()
                .email("test@example.com")
                .password("password")
                .role(role)
                .build();
        user.setId(userId);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        user, null, user.getAuthorities()));
    }

    @Nested
    @DisplayName("HTTP Request & MockMvc Endpoint Tests")
    class MockMvcEndpointTests {

        @Test
        @DisplayName("POST /api/payments/prepare/{bookingId}: Returns 200 OK with PaymentResponse")
        void preparePayment_mockMvc_shouldReturn200() throws Exception {
            PaymentResponse response = PaymentResponse.builder()
                    .paymentId(10L)
                    .bookingId(1L)
                    .finalAmount(new BigDecimal("103.00"))
                    .paymentStatus(PaymentStatus.READY_FOR_PAYMENT)
                    .razorpayOrderId("order_test_123")
                    .build();

            when(paymentService.preparePayment(1L)).thenReturn(response);

            mockMvc.perform(post("/api/payments/prepare/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.paymentId").value(10))
                    .andExpect(jsonPath("$.bookingId").value(1))
                    .andExpect(jsonPath("$.finalAmount").value(103.00))
                    .andExpect(jsonPath("$.paymentStatus").value("READY_FOR_PAYMENT"))
                    .andExpect(jsonPath("$.razorpayOrderId").value("order_test_123"));

            verify(paymentService).preparePayment(1L);
        }

        @Test
        @DisplayName("POST /api/payments/process: Returns 200 OK with valid request payload")
        void processPayment_mockMvc_shouldReturn200_whenPayloadValid() throws Exception {
            PaymentRequest request = new PaymentRequest();
            request.setPaymentId(10L);
            request.setPaymentMethod("card");
            request.setRazorpayOrderId("order_test_123");
            request.setRazorpayPaymentId("pay_test_456");
            request.setRazorpaySignature("sig_test_789");

            PaymentResponse response = PaymentResponse.builder()
                    .paymentId(10L)
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .transactionId("pay_test_456")
                    .invoiceNumber("INV-1-10")
                    .build();

            when(paymentService.processPayment(any(PaymentRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/payments/process")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.paymentId").value(10))
                    .andExpect(jsonPath("$.paymentStatus").value("SUCCESS"))
                    .andExpect(jsonPath("$.transactionId").value("pay_test_456"))
                    .andExpect(jsonPath("$.invoiceNumber").value("INV-1-10"));
        }

        @Test
        @DisplayName("POST /api/payments/process: Returns 400 Bad Request when request fails validation")
        void processPayment_mockMvc_shouldReturn400_whenPayloadInvalid() throws Exception {
            PaymentRequest invalidRequest = new PaymentRequest(); // missing required @NotNull and @NotBlank fields

            mockMvc.perform(post("/api/payments/process")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("GET /api/payments/{id}: Returns 200 OK with PaymentResponse")
        void getPayment_mockMvc_shouldReturn200() throws Exception {
            PaymentResponse response = PaymentResponse.builder()
                    .paymentId(10L)
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .finalAmount(new BigDecimal("154.50"))
                    .build();

            when(paymentService.getPaymentById(10L)).thenReturn(response);

            mockMvc.perform(get("/api/payments/10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.paymentId").value(10))
                    .andExpect(jsonPath("$.paymentStatus").value("SUCCESS"))
                    .andExpect(jsonPath("$.finalAmount").value(154.50));
        }

        @Test
        @DisplayName("GET /api/payments/history: Returns 200 OK with customer payments")
        void getPaymentHistory_mockMvc_shouldReturn200() throws Exception {
            PaymentResponse p1 = PaymentResponse.builder().paymentId(10L).build();
            PaymentResponse p2 = PaymentResponse.builder().paymentId(11L).build();

            when(paymentService.getPaymentHistory(100L)).thenReturn(List.of(p1, p2));

            mockMvc.perform(get("/api/payments/history"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].paymentId").value(10))
                    .andExpect(jsonPath("$[1].paymentId").value(11));
        }

        @Test
        @DisplayName("GET /api/payments/booking/{bookingId}: Returns 200 OK with PaymentResponse")
        void getPaymentByBooking_mockMvc_shouldReturn200() throws Exception {
            PaymentResponse response = PaymentResponse.builder()
                    .paymentId(10L)
                    .bookingId(1L)
                    .build();

            when(paymentService.getPaymentByBookingId(1L)).thenReturn(response);

            mockMvc.perform(get("/api/payments/booking/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.paymentId").value(10))
                    .andExpect(jsonPath("$.bookingId").value(1));
        }

        @Test
        @DisplayName("POST /api/payments/{id}/retry: Returns 200 OK with updated PaymentResponse")
        void retryPayment_mockMvc_shouldReturn200() throws Exception {
            PaymentResponse response = PaymentResponse.builder()
                    .paymentId(10L)
                    .paymentStatus(PaymentStatus.READY_FOR_PAYMENT)
                    .razorpayOrderId("new_order_retry")
                    .build();

            when(paymentService.retryPayment(10L)).thenReturn(response);

            mockMvc.perform(post("/api/payments/10/retry"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.paymentId").value(10))
                    .andExpect(jsonPath("$.paymentStatus").value("READY_FOR_PAYMENT"))
                    .andExpect(jsonPath("$.razorpayOrderId").value("new_order_retry"));
        }

        @Test
        @DisplayName("GET /api/payments/{id}/invoice: Returns 200 OK with InvoiceDTO")
        void getInvoice_mockMvc_shouldReturn200() throws Exception {
            InvoiceDTO invoice = InvoiceDTO.builder()
                    .invoiceNumber("INV-1-10")
                    .paymentId(10L)
                    .bookingId(1L)
                    .customerName("John Doe")
                    .finalAmount(new BigDecimal("125.00"))
                    .build();

            when(paymentService.getInvoice(10L)).thenReturn(invoice);

            mockMvc.perform(get("/api/payments/10/invoice"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.invoiceNumber").value("INV-1-10"))
                    .andExpect(jsonPath("$.paymentId").value(10))
                    .andExpect(jsonPath("$.customerName").value("John Doe"))
                    .andExpect(jsonPath("$.finalAmount").value(125.00));
        }

        @Test
        @DisplayName("GET /api/payments/config: Returns 200 OK with PaymentProperties")
        void getPaymentConfig_mockMvc_shouldReturn200() throws Exception {
            mockMvc.perform(get("/api/payments/config"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.platformFeeThreshold").value(1000))
                    .andExpect(jsonPath("$.lowerPlatformFeePercent").value(3))
                    .andExpect(jsonPath("$.upperPlatformFeePercent").value(5))
                    .andExpect(jsonPath("$.lateChargeRate").value(50.00))
                    .andExpect(jsonPath("$.lateGraceMinutes").value(15));
        }
    }

    @Nested
    @DisplayName("Security & Authorization Boundary Tests")
    class SecurityBoundaryTests {

        @Test
        @DisplayName("getPaymentHistory should reject when unauthenticated")
        void getPaymentHistory_shouldThrowWhenUnauthenticated() {
            SecurityContextHolder.clearContext();

            assertThrows(IllegalStateException.class,
                    () -> paymentController.getPaymentHistory());
        }

        @Test
        @DisplayName("updatePaymentConfig should allow Admin to update billing properties")
        void updatePaymentConfig_shouldAllowAdminToUpdateProperties() {
            authenticateAs(999L, Role.ADMIN);

            PaymentProperties updated = new PaymentProperties();
            updated.setPlatformFeeThreshold(new BigDecimal("2000"));
            updated.setLowerPlatformFeePercent(new BigDecimal("4"));
            updated.setUpperPlatformFeePercent(new BigDecimal("6"));
            updated.setLateChargeRate(new BigDecimal("75.00"));
            updated.setLateGraceMinutes(20);

            ResponseEntity<PaymentProperties> entity = paymentController.updatePaymentConfig(updated);

            assertEquals(HttpStatus.OK, entity.getStatusCode());
            assertEquals(new BigDecimal("2000"), paymentProperties.getPlatformFeeThreshold());
            assertEquals(new BigDecimal("4"), paymentProperties.getLowerPlatformFeePercent());
            assertEquals(new BigDecimal("6"), paymentProperties.getUpperPlatformFeePercent());
            assertEquals(new BigDecimal("75.00"), paymentProperties.getLateChargeRate());
            assertEquals(20, paymentProperties.getLateGraceMinutes());
        }

        @Test
        @DisplayName("updatePaymentConfig should reject non-admin users with AccessDeniedException")
        void updatePaymentConfig_shouldRejectNonAdmin() {
            authenticateAs(100L, Role.CUSTOMER);

            PaymentProperties updated = new PaymentProperties();
            updated.setPlatformFeeThreshold(new BigDecimal("2000"));

            assertThrows(AccessDeniedException.class,
                    () -> paymentController.updatePaymentConfig(updated));
        }

        @Test
        @DisplayName("getPayment should propagate AccessDeniedException when customer views another's payment")
        void getPayment_shouldPropagateAccessDenied() {
            when(paymentService.getPaymentById(999L))
                    .thenThrow(new AccessDeniedException("You are not authorized to access this payment"));

            assertThrows(AccessDeniedException.class,
                    () -> paymentController.getPayment(999L));
        }

        @Test
        @DisplayName("getInvoice should propagate AccessDeniedException when customer views another's invoice")
        void getInvoice_shouldPropagateAccessDenied() {
            when(paymentService.getInvoice(999L))
                    .thenThrow(new AccessDeniedException("You are not authorized to access this payment"));

            assertThrows(AccessDeniedException.class,
                    () -> paymentController.getInvoice(999L));
        }

        @Test
        @DisplayName("retryPayment should propagate AccessDeniedException when customer retries another's payment")
        void retryPayment_shouldPropagateAccessDenied() {
            when(paymentService.retryPayment(999L))
                    .thenThrow(new AccessDeniedException("You are not authorized to access this payment"));

            assertThrows(AccessDeniedException.class,
                    () -> paymentController.retryPayment(999L));
        }
    }
}
