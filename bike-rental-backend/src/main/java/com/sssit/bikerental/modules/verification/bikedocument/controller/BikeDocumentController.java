package com.sssit.bikerental.modules.verification.bikedocument.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.bikedocument.dto.BikeDocumentResponseDTO;
import com.sssit.bikerental.modules.verification.bikedocument.entity.BikeDocument;
import com.sssit.bikerental.modules.verification.bikedocument.service.BikeDocumentService;

@RestController
@RequestMapping("/api/bike-document")
@CrossOrigin(origins = "*")
public class BikeDocumentController {

    @Autowired
    private BikeDocumentService service;

    //-----------------------------------
    // Upload + OCR/QR verify a Registration Certificate (RC) image
    //-----------------------------------

    @PostMapping(
            value = "/verify",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public BikeDocumentResponseDTO verify(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "ownerId", required = false) Long ownerId,
            @RequestParam(value = "bikeId", required = false) Long bikeId) {
        return service.verifyBikeDocument(file, ownerId, bikeId);
    }

    //-----------------------------------
    // Status check - call this BEFORE showing the upload form when an
    // owner re-adds/re-lists a bike. If it returns a record, this
    // exact bike's RC is already verified and the frontend should
    // skip straight past the upload step. Returns 204 No Content if
    // nothing is verified yet for this owner+bike (e.g. a brand new
    // bike that doesn't have a bikeId/RC on file yet).
    //-----------------------------------

    @GetMapping("/status")
    public ResponseEntity<BikeDocument> getStatus(
            @RequestParam("ownerId") Long ownerId,
            @RequestParam("bikeId") Long bikeId) {

        BikeDocument result = service.getApprovedDocument(ownerId, bikeId);

        return result != null
                ? ResponseEntity.ok(result)
                : ResponseEntity.noContent().build();
    }

    @PostMapping
    public BikeDocument save(@RequestBody BikeDocument bikeDocument) {
        return service.save(bikeDocument);
    }

    @GetMapping
    public List<BikeDocument> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public BikeDocument getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public BikeDocument update(@PathVariable Long id,
                               @RequestBody BikeDocument bikeDocument) {
        return service.update(id, bikeDocument);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Bike Document Deleted Successfully";
    }

}
