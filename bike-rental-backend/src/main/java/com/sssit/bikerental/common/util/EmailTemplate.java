package com.sssit.bikerental.common.util;

public final class EmailTemplate {

    private EmailTemplate() {
        throw new IllegalStateException("Utility class");
    }

    // Common styling tokens matching frontend theme (index.css)
    private static final String CSS_STYLES = """
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #f8f5ec;
                color: #0b1220;
                margin: 0;
                padding: 24px;
                line-height: 1.6;
            }
            .wrapper {
                max-width: 580px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 8px;
                border: 1px solid #efe9d8;
                box-shadow: 0 4px 16px rgba(11, 18, 32, 0.06);
                overflow: hidden;
            }
            .header {
                background-color: #16305e;
                color: #ffffff;
                padding: 24px 32px;
                text-align: left;
                border-bottom: 3px solid #b1873f;
            }
            .header h1 {
                margin: 0;
                font-size: 22px;
                font-weight: 700;
                letter-spacing: -0.01em;
                color: #ffffff;
            }
            .header p {
                margin: 4px 0 0 0;
                font-size: 13px;
                color: #efe9d8;
                letter-spacing: 0.02em;
            }
            .content {
                padding: 32px;
            }
            h2 {
                color: #16305e;
                font-size: 18px;
                font-weight: 700;
                margin-top: 0;
                margin-bottom: 16px;
            }
            p {
                margin: 0 0 16px 0;
                font-size: 14px;
                color: #334155;
            }
            .otp-box {
                background: #e7f3ec;
                border: 2px dashed #1e7f4d;
                color: #1e7f4d;
                font-family: 'JetBrains Mono', 'Courier New', monospace;
                font-size: 30px;
                font-weight: 700;
                text-align: center;
                letter-spacing: 8px;
                padding: 16px 20px;
                margin: 24px 0;
                border-radius: 6px;
            }
            .otp-box-danger {
                background: #fbeae9;
                border: 2px dashed #b3261e;
                color: #b3261e;
                font-family: 'JetBrains Mono', 'Courier New', monospace;
                font-size: 30px;
                font-weight: 700;
                text-align: center;
                letter-spacing: 8px;
                padding: 16px 20px;
                margin: 24px 0;
                border-radius: 6px;
            }
            .info-card {
                background: #f8f5ec;
                border-left: 4px solid #16305e;
                padding: 14px 18px;
                border-radius: 0 6px 6px 0;
                margin: 20px 0;
                font-size: 14px;
                color: #16305e;
            }
            .badge-success {
                display: inline-block;
                background-color: #e7f3ec;
                color: #1e7f4d;
                font-weight: 700;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 13px;
                border: 1px solid #1e7f4d;
                margin: 8px 0;
            }
            .badge-danger {
                display: inline-block;
                background-color: #fbeae9;
                color: #b3261e;
                font-weight: 700;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 13px;
                border: 1px solid #b3261e;
                margin: 8px 0;
            }
            .feature-list {
                margin: 16px 0 24px 0;
                padding-left: 0;
                list-style: none;
            }
            .feature-list li {
                padding: 8px 0;
                font-size: 14px;
                color: #334155;
                border-bottom: 1px solid #f1f5f9;
            }
            .feature-list li b {
                color: #16305e;
            }
            .footer {
                background: #f8f5ec;
                padding: 20px 32px;
                border-top: 1px solid #efe9d8;
                font-size: 12px;
                color: #64748b;
                text-align: center;
            }
            .footer p {
                margin: 0;
                color: #64748b;
                font-size: 12px;
            }
            """;

    /**
     * Generates OTP Verification Email Template.
     *
     * @param name Recipient Name
     * @param otp Generated OTP
     * @return HTML Email Template
     */
    public static String otpVerificationTemplate(String name, String otp) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        %s
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="header">
                            <h1>Smart Bike Rental 🚲</h1>
                            <p>Verification Security Services</p>
                        </div>
                        <div class="content">
                            <h2>Email Verification</h2>
                            <p>Hello <b>%s</b>,</p>
                            <p>Your One-Time Password (OTP) for verification is:</p>
                            <div class="otp-box">%s</div>
                            <p>This OTP is valid for <b>10 minutes</b>.</p>
                            <p>If you did not request this verification, please safely disregard this email.</p>
                        </div>
                        <div class="footer">
                            <p>© Smart Bike Rental System • Secure Document & Verification Bureau</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(CSS_STYLES, name, otp);
    }

    /**
     * Generates Welcome Email Template.
     *
     * @param name User Name
     * @return HTML Email Template
     */
    public static String welcomeTemplate(String name) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        %s
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="header">
                            <h1>Smart Bike Rental 🚲</h1>
                            <p>Welcome to the Community</p>
                        </div>
                        <div class="content">
                            <h2>Welcome aboard, <b>%s</b>!</h2>
                            <p>Your account has been successfully created and verified. You're now ready to explore our platform:</p>
                            <ul class="feature-list">
                                <li>🚲 <b>Explore & Book Bikes:</b> Choose from a wide selection of verified rides.</li>
                                <li>🔑 <b>List Your Bike:</b> Rent out your bike to earn verified extra income.</li>
                                <li>📍 <b>Live Trip Tracking:</b> Safe and GPS-monitored rides on every trip.</li>
                                <li>🛡️ <b>Secure KYC & Payments:</b> Fast, compliant verification and transparent billing.</li>
                            </ul>
                            <p>Thank you for choosing Smart Bike Rental System.</p>
                        </div>
                        <div class="footer">
                            <p>© Smart Bike Rental System • Support & Customer Operations</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(CSS_STYLES, name);
    }

    /**
     * Generates Password Reset Email Template.
     *
     * @param name User Name
     * @param otp Reset OTP
     * @return HTML Email Template
     */
    public static String passwordResetTemplate(String name, String otp) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        %s
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="header">
                            <h1>Smart Bike Rental 🚲</h1>
                            <p>Account Security & Password Recovery</p>
                        </div>
                        <div class="content">
                            <h2>Password Reset Request</h2>
                            <p>Hello <b>%s</b>,</p>
                            <p>We received a request to reset your password. Use the verification OTP below to complete the reset process:</p>
                            <div class="otp-box-danger">%s</div>
                            <p>This code will expire in <b>10 minutes</b>.</p>
                            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                        </div>
                        <div class="footer">
                            <p>© Smart Bike Rental System • Account Security Bureau</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(CSS_STYLES, name, otp);
    }

    /**
     * Generates Verification Success Email Template.
     *
     * @param name User Name
     * @param documentName Verified Document Name
     * @return HTML Email Template
     */
    public static String verificationSuccessTemplate(String name, String documentName) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        %s
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="header">
                            <h1>Smart Bike Rental 🚲</h1>
                            <p>Verification Bureau Checkpoint</p>
                        </div>
                        <div class="content">
                            <h2>Document Verification Passed</h2>
                            <p>Dear <b>%s</b>,</p>
                            <p>Your submitted document has passed compliance inspection and is verified.</p>
                            <div class="badge-success">✓ %s — VERIFIED</div>
                            <div class="info-card">
                                Your account status has been updated. You can now proceed with booking and renting bikes without restriction.
                            </div>
                            <p>Thank you for completing your verification with Smart Bike Rental System.</p>
                        </div>
                        <div class="footer">
                            <p>© Smart Bike Rental System • Compliance & Verification Team</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(CSS_STYLES, name, documentName);
    }

    /**
     * Generates Verification Failure Email Template.
     *
     * @param name User Name
     * @param documentName Document Name
     * @param failureReason Reason for failure
     * @param suggestion Actionable suggestion for the user
     * @return HTML Email Template
     */
    public static String verificationFailureTemplate(String name, String documentName, String failureReason, String suggestion) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        %s
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="header">
                            <h1>Smart Bike Rental 🚲</h1>
                            <p>Verification Bureau Checkpoint</p>
                        </div>
                        <div class="content">
                            <h2>Document Verification Update</h2>
                            <p>Dear <b>%s</b>,</p>
                            <p>We were unable to verify your submitted document:</p>
                            <div class="badge-danger">✕ %s — REJECTED</div>
                            <div style="background: #f8f5ec; border-radius: 6px; padding: 16px; margin: 16px 0; border: 1px solid #efe9d8;">
                                <p style="margin: 0 0 8px 0;"><b>Reason:</b> %s</p>
                                <p style="margin: 0; color: #16305e;"><b>Suggestion:</b> %s</p>
                            </div>
                            <p>Please log in to your account and re-upload a clear, readable document to continue.</p>
                        </div>
                        <div class="footer">
                            <p>© Smart Bike Rental System • Compliance & Verification Team</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(CSS_STYLES, name, documentName, failureReason, suggestion);
    }

    /**
     * Generates Admin Verification / Custom Message Template.
     *
     * @param name User Name
     * @param subject Subject Header
     * @param messageText Message Content
     * @return HTML Email Template
     */
    public static String adminMessageTemplate(String name, String subject, String messageText) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        %s
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="header">
                            <h1>Smart Bike Rental 🚲</h1>
                            <p>Official Verification Notice</p>
                        </div>
                        <div class="content">
                            <h2>%s</h2>
                            <p>Dear <b>%s</b>,</p>
                            <div class="info-card" style="font-size: 14px; white-space: pre-line; line-height: 1.6;">
                                %s
                            </div>
                            <p>If you have any questions, please contact our support desk.</p>
                        </div>
                        <div class="footer">
                            <p>© Smart Bike Rental System • Compliance & Verification Bureau</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(CSS_STYLES, subject, name, messageText);
    }

    /**
     * Generates Account Deletion Confirmation Email Template.
     *
     * @param name User Name
     * @return HTML Email Template
     */
    public static String accountDeletedTemplate(String name) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        %s
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="header">
                            <h1>Smart Bike Rental 🚲</h1>
                            <p>Account Security & Lifecycle</p>
                        </div>
                        <div class="content">
                            <h2>Account Deletion Confirmation</h2>
                            <p>Dear <b>%s</b>,</p>
                            <div class="badge-danger">✕ ACCOUNT DELETED</div>
                            <div class="info-card" style="border-left-color: #b3261e;">
                                Your Smart Bike Rental account and associated personal profile data have been permanently removed from our system as per your request.
                            </div>
                            <p>Your session tokens, active OTPs, and verification records have been cleared.</p>
                            <p>If you did not initiate this deletion or believe this was an error, please reach out immediately to our support team.</p>
                            <p>Thank you for having been part of the Smart Bike Rental community.</p>
                        </div>
                        <div class="footer">
                            <p>© Smart Bike Rental System • Customer Operations & Security</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(CSS_STYLES, name);
    }
}