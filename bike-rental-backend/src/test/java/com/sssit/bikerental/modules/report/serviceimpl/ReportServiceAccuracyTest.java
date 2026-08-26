package com.sssit.bikerental.modules.report.serviceimpl;

import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.enums.RentalType;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;

import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;

import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceAccuracyTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BikeRepository bikeRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    private LocalDate fromDate;
    private LocalDate toDate;

    @BeforeEach
    void setUp() {
        fromDate = LocalDate.of(2026, 8, 1);
        toDate = LocalDate.of(2026, 8, 15);
    }

    // =========================================================
    // BOOKING REPORT TEST
    // =========================================================

    @Test
    @DisplayName("Booking Report: Includes records within date range")
    void testGetBookingReportAccuracyAndBoundaries() {

        Booking inRangeStart = new Booking();

        inRangeStart.setId(101L);
        inRangeStart.setBikeId(1L);
        inRangeStart.setCustomerId(10L);
        inRangeStart.setRentalAmount(new BigDecimal("500.00"));

        inRangeStart.setBookingStatus(
                BookingStatus.CONFIRMED
        );

        /*
         * IMPORTANT:
         * Booking uses booking.enums.PaymentStatus
         */
        inRangeStart.setPaymentStatus(
                com.sssit.bikerental.modules.booking.enums.PaymentStatus.SUCCESS
        );

        inRangeStart.setCreatedAt(
                LocalDateTime.of(2026, 8, 1, 0, 0, 0)
        );


        Booking inRangeEnd = new Booking();

        inRangeEnd.setId(102L);
        inRangeEnd.setBikeId(2L);
        inRangeEnd.setCustomerId(11L);
        inRangeEnd.setRentalAmount(new BigDecimal("750.00"));

        inRangeEnd.setBookingStatus(
                BookingStatus.COMPLETED
        );

        inRangeEnd.setPaymentStatus(
                com.sssit.bikerental.modules.booking.enums.PaymentStatus.SUCCESS
        );

        inRangeEnd.setCreatedAt(
                LocalDateTime.of(2026, 8, 15, 23, 59, 59)
        );


        Booking beforeRange = new Booking();

        beforeRange.setId(103L);

        beforeRange.setCreatedAt(
                LocalDateTime.of(2026, 7, 31, 23, 59, 59)
        );


        Booking afterRange = new Booking();

        afterRange.setId(104L);

        afterRange.setCreatedAt(
                LocalDateTime.of(2026, 8, 16, 0, 0, 0)
        );


        Booking nullCreatedAt = new Booking();

        nullCreatedAt.setId(105L);
        nullCreatedAt.setCreatedAt(null);


        when(bookingRepository.findAll()).thenReturn(
                Arrays.asList(
                        inRangeStart,
                        inRangeEnd,
                        beforeRange,
                        afterRange,
                        nullCreatedAt
                )
        );


        List<Map<String, Object>> rows =
                reportService.getBookingReport(
                        fromDate,
                        toDate
                );


        assertNotNull(rows);

        assertEquals(
                2,
                rows.size()
        );


        Map<String, Object> row1 = rows.get(0);

        assertEquals(
                101L,
                row1.get("bookingId")
        );

        assertEquals(
                1L,
                row1.get("bikeId")
        );

        assertEquals(
                10L,
                row1.get("customerId")
        );

        assertEquals(
                "CONFIRMED",
                row1.get("bookingStatus")
        );

        assertEquals(
                "SUCCESS",
                row1.get("paymentStatus")
        );

        assertEquals(
                new BigDecimal("500.00"),
                row1.get("rentalAmount")
        );


        Map<String, Object> row2 = rows.get(1);

        assertEquals(
                102L,
                row2.get("bookingId")
        );

        assertEquals(
                "COMPLETED",
                row2.get("bookingStatus")
        );
    }


    // =========================================================
    // REVENUE REPORT TEST
    // =========================================================

    @Test
    @DisplayName("Revenue Report: Only SUCCESS payments within date range")
    void testGetRevenueReportFiltersSuccessAndDate() {

        Payment successPayment = new Payment();

        successPayment.setPaymentId(201L);

        successPayment.setBookingId(101L);

        successPayment.setFinalAmount(
                new BigDecimal("1200.00")
        );

        /*
         * Payment uses payment.entity.PaymentStatus
         */
        successPayment.setPaymentStatus(
                PaymentStatus.SUCCESS
        );

        successPayment.setPaidAt(
                LocalDateTime.of(
                        2026,
                        8,
                        5,
                        14,
                        30
                )
        );


        Payment pendingPayment = new Payment();

        pendingPayment.setPaymentId(202L);

        pendingPayment.setBookingId(102L);

        pendingPayment.setFinalAmount(
                new BigDecimal("800.00")
        );

        pendingPayment.setPaymentStatus(
                PaymentStatus.PENDING
        );

        pendingPayment.setPaidAt(
                LocalDateTime.of(
                        2026,
                        8,
                        5,
                        15,
                        0
                )
        );


        Payment failedPayment = new Payment();

        failedPayment.setPaymentId(203L);

        failedPayment.setBookingId(103L);

        failedPayment.setFinalAmount(
                new BigDecimal("500.00")
        );

        failedPayment.setPaymentStatus(
                PaymentStatus.FAILED
        );

        failedPayment.setPaidAt(
                LocalDateTime.of(
                        2026,
                        8,
                        6,
                        10,
                        0
                )
        );


        Payment outOfRangeSuccess = new Payment();

        outOfRangeSuccess.setPaymentId(204L);

        outOfRangeSuccess.setBookingId(104L);

        outOfRangeSuccess.setFinalAmount(
                new BigDecimal("1000.00")
        );

        outOfRangeSuccess.setPaymentStatus(
                PaymentStatus.SUCCESS
        );

        outOfRangeSuccess.setPaidAt(
                LocalDateTime.of(
                        2026,
                        8,
                        20,
                        10,
                        0
                )
        );


        when(paymentRepository.findAll()).thenReturn(
                Arrays.asList(
                        successPayment,
                        pendingPayment,
                        failedPayment,
                        outOfRangeSuccess
                )
        );


        List<Map<String, Object>> rows =
                reportService.getRevenueReport(
                        fromDate,
                        toDate
                );


        assertNotNull(rows);

        assertEquals(
                1,
                rows.size()
        );


        Map<String, Object> row = rows.get(0);

        assertEquals(
                201L,
                row.get("paymentId")
        );

        assertEquals(
                101L,
                row.get("bookingId")
        );

        assertEquals(
                new BigDecimal("1200.00"),
                row.get("amount")
        );

        assertEquals(
                "SUCCESS",
                row.get("status")
        );

        assertEquals(
                LocalDateTime.of(
                        2026,
                        8,
                        5,
                        14,
                        30
                ),
                row.get("paymentDate")
        );
    }


    // =========================================================
    // BIKE REPORT TEST
    // =========================================================

    @Test
    @DisplayName("Bike Report: Generates bike report within date range")
    void testGetBikeReportAccuracy() {

        Bike bike1 = Bike.builder()

                .bikeId(1L)

                .ownerId(5L)

                .bikeName("Yamaha FZ")

                .brand("Yamaha")

                .model("FZ-S V3")

                .registrationNumber("KA01AB1234")

                .rentalPrice(
                        new BigDecimal("350.00")
                )

                .location(
                        "Indiranagar, Bangalore"
                )

                .bikeStatus(
                        BikeStatus.AVAILABLE
                )

                .rentalType(
                        RentalType.HOURLY
                )

                .hourlyRate(
                        new BigDecimal("50.00")
                )

                .availableDate(
                        LocalDate.of(2026, 8, 1)
                )

                .createdAt(
                        LocalDateTime.of(
                                2026,
                                8,
                                2,
                                10,
                                0
                        )
                )

                .build();


        Bike bikeOutside = Bike.builder()

                .bikeId(2L)

                .ownerId(5L)

                .bikeName("Honda Activa")

                .brand("Honda")

                .model("6G")

                .registrationNumber("KA01CD5678")

                .createdAt(
                        LocalDateTime.of(
                                2026,
                                7,
                                20,
                                10,
                                0
                        )
                )

                .build();


        when(bikeRepository.findAll()).thenReturn(
                Arrays.asList(
                        bike1,
                        bikeOutside
                )
        );


        List<Map<String, Object>> rows =
                reportService.getBikeReport(
                        fromDate,
                        toDate
                );


        assertNotNull(rows);

        assertEquals(
                1,
                rows.size()
        );


        Map<String, Object> row = rows.get(0);


        assertEquals(
                1L,
                row.get("bikeId")
        );

        assertEquals(
                5L,
                row.get("ownerId")
        );

        assertEquals(
                "Yamaha FZ",
                row.get("bikeName")
        );

        assertEquals(
                "Yamaha",
                row.get("brand")
        );

        assertEquals(
                "FZ-S V3",
                row.get("model")
        );

        assertEquals(
                "KA01AB1234",
                row.get("registrationNumber")
        );

        assertEquals(
                new BigDecimal("350.00"),
                row.get("rentalPrice")
        );

        assertEquals(
                "AVAILABLE",
                row.get("bikeStatus")
        );
    }


    // =========================================================
    // PAYMENT REPORT TEST
    // =========================================================

    @Test
    @DisplayName("Payment Report: Generates payment audit records")
    void testGetPaymentReportAccuracy() {

        Payment p1 = new Payment();

        p1.setPaymentId(301L);

        p1.setBookingId(11L);

        p1.setFinalAmount(
                new BigDecimal("999.00")
        );

        p1.setPaymentStatus(
                PaymentStatus.SUCCESS
        );

        p1.setPaidAt(
                LocalDateTime.of(
                        2026,
                        8,
                        10,
                        11,
                        0
                )
        );

        p1.setCreatedAt(
                LocalDateTime.of(
                        2026,
                        8,
                        10,
                        11,
                        0
                )
        );


        Payment p2 = new Payment();

        p2.setPaymentId(302L);

        p2.setBookingId(12L);

        p2.setFinalAmount(
                new BigDecimal("500.00")
        );

        p2.setPaymentStatus(
                PaymentStatus.FAILED
        );

        p2.setPaidAt(
                LocalDateTime.of(
                        2026,
                        8,
                        11,
                        12,
                        0
                )
        );

        p2.setCreatedAt(
                LocalDateTime.of(
                        2026,
                        8,
                        11,
                        12,
                        0
                )
        );


        when(paymentRepository.findAll()).thenReturn(
                Arrays.asList(
                        p1,
                        p2
                )
        );


        List<Map<String, Object>> rows =
                reportService.getPaymentReport(
                        fromDate,
                        toDate
                );


        assertNotNull(rows);

        assertEquals(
                2,
                rows.size()
        );


        assertEquals(
                301L,
                rows.get(0).get("paymentId")
        );

        assertEquals(
                "SUCCESS",
                rows.get(0).get("status")
        );


        assertEquals(
                302L,
                rows.get(1).get("paymentId")
        );

        assertEquals(
                "FAILED",
                rows.get(1).get("status")
        );
    }


    // =========================================================
    // EMPTY RESULT TEST
    // =========================================================

    @Test
    @DisplayName("Empty Results: Returns empty lists")
    void testEmptyDateRangeResults() {

        when(
                bookingRepository.findAll()
        ).thenReturn(
                Collections.emptyList()
        );


        when(
                paymentRepository.findAll()
        ).thenReturn(
                Collections.emptyList()
        );


        when(
                bikeRepository.findAll()
        ).thenReturn(
                Collections.emptyList()
        );


        assertTrue(
                reportService
                        .getBookingReport(
                                fromDate,
                                toDate
                        )
                        .isEmpty()
        );


        assertTrue(
                reportService
                        .getRevenueReport(
                                fromDate,
                                toDate
                        )
                        .isEmpty()
        );


        assertTrue(
                reportService
                        .getBikeReport(
                                fromDate,
                                toDate
                        )
                        .isEmpty()
        );


        assertTrue(
                reportService
                        .getPaymentReport(
                                fromDate,
                                toDate
                        )
                        .isEmpty()
        );
    }
}