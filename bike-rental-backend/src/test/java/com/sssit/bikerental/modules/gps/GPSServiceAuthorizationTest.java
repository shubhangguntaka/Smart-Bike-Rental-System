package com.sssit.bikerental.modules.gps;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.sssit.bikerental.common.security.AuthorizationService;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.gps.entity.Ride;
import com.sssit.bikerental.modules.gps.repository.GPSRepository;
import com.sssit.bikerental.modules.gps.repository.RideRepository;
import com.sssit.bikerental.modules.gps.serviceimpl.GPSServiceImpl;

@ExtendWith(MockitoExtension.class)
class GPSServiceAuthorizationTest {

    @Mock
    private GPSRepository gpsRepository;

    @Mock
    private RideRepository rideRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private BikeRepository bikeRepository;

    private GPSServiceImpl gpsService;

    private Ride testRide;
    private Bike testBike;

    @BeforeEach
    void setUp() {

        gpsService = new GPSServiceImpl(
                gpsRepository,
                rideRepository,
                authorizationService,
                bikeRepository
        );

        testRide = new Ride();

        testRide.setId(1L);
        testRide.setCustomerId(100L);
        testRide.setBikeId(10L);

        testBike = Bike.builder()
                .bikeId(10L)
                .ownerId(200L)
                .bikeName("Honda Activa")
                .build();
    }

    @Test
    void customerCanAccessGPSData() {

        when(authorizationService.isAdmin())
                .thenReturn(false);

        when(authorizationService.isCurrentUser(100L))
                .thenReturn(true);

        assertDoesNotThrow(() ->
                invokeValidateGPSAccess(testRide)
        );

        verify(authorizationService)
                .isCurrentUser(100L);

        verify(bikeRepository, never())
                .findById(anyLong());
    }

    @Test
    void bikeOwnerCanAccessGPSData() {

        when(authorizationService.isAdmin())
                .thenReturn(false);

        when(authorizationService.isCurrentUser(100L))
                .thenReturn(false);

        when(bikeRepository.findById(10L))
                .thenReturn(Optional.of(testBike));

        when(authorizationService.isCurrentUser(200L))
                .thenReturn(true);

        assertDoesNotThrow(() ->
                invokeValidateGPSAccess(testRide)
        );

        verify(bikeRepository)
                .findById(10L);

        verify(authorizationService)
                .isCurrentUser(200L);
    }

    @Test
    void adminCanAccessGPSData() {

        when(authorizationService.isAdmin())
                .thenReturn(true);

        assertDoesNotThrow(() ->
                invokeValidateGPSAccess(testRide)
        );

        verify(authorizationService)
                .isAdmin();

        verify(bikeRepository, never())
                .findById(anyLong());
    }

    @Test
    void unauthorizedUserCannotAccessGPSData() {

        when(authorizationService.isAdmin())
                .thenReturn(false);

        when(authorizationService.isCurrentUser(100L))
                .thenReturn(false);

        when(bikeRepository.findById(10L))
                .thenReturn(Optional.of(testBike));

        when(authorizationService.isCurrentUser(200L))
                .thenReturn(false);

        assertThrows(
                AccessDeniedException.class,
                () -> invokeValidateGPSAccess(testRide)
        );
    }

    /**
     * Calls the private validation method through reflection.
     *
     * The production method is intentionally private because
     * authorization is an internal implementation detail.
     */
    private void invokeValidateGPSAccess(Ride ride) {

        try {

            var method = GPSServiceImpl.class
                    .getDeclaredMethod(
                            "validateGPSAccess",
                            Ride.class
                    );

            method.setAccessible(true);

            method.invoke(gpsService, ride);

        } catch (java.lang.reflect.InvocationTargetException e) {

            if (e.getCause() instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }

            throw new RuntimeException(e.getCause());

        } catch (Exception e) {

            throw new RuntimeException(e);
        }
    }
}