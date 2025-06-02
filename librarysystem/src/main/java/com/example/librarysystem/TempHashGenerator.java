package com.example.librarysystem;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class TempHashGenerator implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();

        System.out.println("\n" + "=".repeat(60));
        System.out.println("🔐 ADMIN123 해시 생성");
        System.out.println("=".repeat(60));

        String admin123Hash = encoder.encode("admin123");
        System.out.println("새로운 admin123 해시: " + admin123Hash);

        // 즉시 검증
        boolean verify = encoder.matches("admin123", admin123Hash);
        System.out.println("검증 결과: " + verify);

        System.out.println("\n📝 H2 콘솔에서 실행할 SQL:");
        System.out.println("UPDATE users SET password = '" + admin123Hash + "' WHERE username = 'admin';");

        System.out.println("=".repeat(60));
    }
}