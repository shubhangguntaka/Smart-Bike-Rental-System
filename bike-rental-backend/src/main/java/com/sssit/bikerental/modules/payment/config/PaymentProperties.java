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

    private BigDecimal platformFeeThreshold;

    private BigDecimal lowerPlatformFeePercent;

    private BigDecimal upperPlatformFeePercent;

    private BigDecimal lateChargeRate;

    private Integer lateGraceMinutes;
}