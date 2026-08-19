package com.sssit.bikerental.common.seeder;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.bikedocument.entity.BikeDocument;
import com.sssit.bikerental.modules.verification.bikedocument.repository.BikeDocumentRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class DefaultUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AadhaarRepository aadhaarRepository;
    private final BikeDocumentRepository bikeDocumentRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking and seeding default test accounts and verification documents...");

        User admin = seedUser("admin@bikerental.test", "Admin@123", Role.ADMIN, "System", "Administrator", "9000000001");
        User ravi = seedUser("ravi.owner@bikerental.test", "Owner@123", Role.OWNER, "Ravi", "Kumar", "9000000002");
        User priya = seedUser("priya.owner@bikerental.test", "Owner@123", Role.OWNER, "Priya", "Reddy", "9000000003");
        User arjun = seedUser("arjun.customer@bikerental.test", "Customer@123", Role.CUSTOMER, "Arjun", "Sharma", "9000000004");
        seedUser("neha.customer@bikerental.test", "Customer@123", Role.CUSTOMER, "Neha", "Verma", "9000000005");
        seedUser("vikram.customer@bikerental.test", "Customer@123", Role.CUSTOMER, "Vikram", "Rao", "9000000006");

        // Seed default Aadhaar verifications for owners/customers
        seedAadhaar(ravi, "900088776611", "APPROVED");
        seedAadhaar(priya, "900088776622", "APPROVED");
        seedAadhaar(arjun, "900088776633", "APPROVED");

        // Seed default Bike RC verifications for owners
        seedBikeRc(ravi, "TS09GH1002", "Yamaha", "Hitech City Sport", "MOTOR CYCLE", "APPROVED");
        seedBikeRc(ravi, "TS10CD1002", "Yamaha", "MT-15", "MOTOR CYCLE", "APPROVED");
        seedBikeRc(priya, "TS09GH1003", "TVS", "Ameerpet Easy Ride", "MOTOR CYCLE", "APPROVED");

        log.info("Default test accounts and verification seeding completed.");
    }

    private User seedUser(String email, String rawPassword, Role role, String firstName, String lastName, String phone) {
        String cleanEmail = email.toLowerCase().trim();
        return userRepository.findByEmail(cleanEmail).map(user -> {
            if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(rawPassword));
            }
            user.setRole(role);
            user.setEmailVerified(true);
            user.setEnabled(true);
            user.setAccountNonExpired(true);
            user.setAccountNonLocked(true);
            user.setCredentialsNonExpired(true);
            return userRepository.save(user);
        }).orElseGet(() -> {
            User newUser = User.builder()
                    .email(cleanEmail)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .firstName(firstName)
                    .lastName(lastName)
                    .phoneNumber(phone)
                    .emailVerified(true)
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .build();
            return userRepository.save(newUser);
        });
    }

    private void seedAadhaar(User user, String aadhaarNo, String status) {
        if (user == null) return;
        if (aadhaarRepository.findByAadhaarNumber(aadhaarNo).isEmpty()) {
            AadhaarVerification av = new AadhaarVerification();
            av.setCustomerId(user.getId());
            av.setAadhaarNumber(aadhaarNo);
            av.setCustomerName(user.getFirstName() + " " + user.getLastName());
            av.setStatus(status);
            av.setUploadedFile("default_aadhaar.png");
            av.setUploadedAt(LocalDateTime.now());
            av.setVerifiedAt(LocalDateTime.now());
            av.setVerifiedBy("SYSTEM");
            av.setStampLabel("VERIFIED");
            av.setStampColor("green");
            aadhaarRepository.save(av);
            log.info("Seeded Aadhaar verification for user ID {}", user.getId());
        }
    }

    private void seedBikeRc(User user, String regNo, String maker, String model, String vehicleClass, String status) {
        if (user == null) return;
        if (bikeDocumentRepository.findByRegistrationNumber(regNo).isEmpty()) {
            BikeDocument doc = new BikeDocument();
            doc.setOwnerId(user.getId());
            doc.setOwnerName(user.getFirstName() + " " + user.getLastName());
            doc.setRegistrationNumber(regNo);
            doc.setMakerName(maker);
            doc.setModel(model);
            doc.setVehicleClass(vehicleClass);
            doc.setStatus(status);
            doc.setRegistrationDate(LocalDate.now().minusYears(2));
            doc.setInsuranceValidUpto(LocalDate.now().plusYears(1));
            doc.setUploadedFile("default_rc.png");
            doc.setUploadedAt(LocalDateTime.now());
            bikeDocumentRepository.save(doc);
            log.info("Seeded Bike RC document verification for reg {}", regNo);
        }
    }
}
