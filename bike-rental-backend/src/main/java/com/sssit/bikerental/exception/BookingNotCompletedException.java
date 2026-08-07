package com.sssit.bikerental.exception;

public class BookingNotCompletedException extends RuntimeException {

    public BookingNotCompletedException(String message) {
        super(message);
    }

}