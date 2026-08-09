package com.sssit.bikerental.modules.bike.exception;

public class BikeAlreadyExistsException extends RuntimeException {

    public BikeAlreadyExistsException(String message) {
        super(message);
    }

}