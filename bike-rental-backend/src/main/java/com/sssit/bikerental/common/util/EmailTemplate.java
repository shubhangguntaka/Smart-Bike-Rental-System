package com.sssit.bikerental.common.util;

public final class EmailTemplate {

    private EmailTemplate() {
        throw new IllegalStateException("Utility class");
    }

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
                    <style>
                        body{
                            font-family:Arial,sans-serif;
                            background:#f5f5f5;
                            padding:20px;
                        }
                        .container{
                            max-width:600px;
                            margin:auto;
                            background:white;
                            border-radius:8px;
                            padding:30px;
                            box-shadow:0 0 10px rgba(0,0,0,0.1);
                        }
                        h2{
                            color:#0d6efd;
                        }
                        .otp{
                            font-size:28px;
                            font-weight:bold;
                            text-align:center;
                            letter-spacing:8px;
                            color:#198754;
                            margin:25px 0;
                        }
                        .footer{
                            margin-top:30px;
                            color:gray;
                            font-size:13px;
                        }
                    </style>
                </head>

                <body>

                <div class="container">

                    <h2>Bike Rental System</h2>

                    <p>Hello <b>%s</b>,</p>

                    <p>Your One-Time Password (OTP) for verification is:</p>

                    <div class="otp">%s</div>

                    <p>This OTP is valid for <b>10 minutes</b>.</p>

                    <p>If you did not request this OTP, please ignore this email.</p>

                    <div class="footer">
                        Thank you,<br>
                        Bike Rental Team
                    </div>

                </div>

                </body>
                </html>
                """.formatted(name, otp);
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

                <body style="font-family:Arial,sans-serif;">

                <h2>Welcome to Bike Rental System 🚲</h2>

                <p>Hello <b>%s</b>,</p>

                <p>Your account has been created successfully.</p>

                <p>You can now:</p>

                <ul>
                    <li>Book Bikes</li>
                    <li>Rent Your Bike</li>
                    <li>Track Bookings</li>
                    <li>Manage Your Profile</li>
                </ul>

                <p>Thank you for choosing us.</p>

                </body>

                </html>
                """.formatted(name);
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

                <body style="font-family:Arial,sans-serif;">

                <h2>Password Reset Request</h2>

                <p>Hello <b>%s</b>,</p>

                <p>Use the following OTP to reset your password.</p>

                <h1 style="color:#dc3545;">%s</h1>

                <p>This OTP will expire in 10 minutes.</p>

                <p>If you didn't request a password reset, please ignore this email.</p>

                </body>

                </html>
                """.formatted(name, otp);
    }
}