package com.sssit.bikerental.modules.payment.config;

import java.math.BigDecimal;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "payment")
public class PaymentProperties {

    private BigDecimal platformFeeThreshold = new BigDecimal("1000");

    private BigDecimal lowerPlatformFeePercent = new BigDecimal("3");

    private BigDecimal upperPlatformFeePercent = new BigDecimal("5");

    private BigDecimal lateChargeRate = new BigDecimal("50.00");

    private Integer lateGraceMinutes = 15;
}