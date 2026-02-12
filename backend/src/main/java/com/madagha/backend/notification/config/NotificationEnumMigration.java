package com.madagha.backend.notification.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEnumMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
            jdbcTemplate.execute(
                    "ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('LIKE','COMMENT','SUBSCRIPTION','MENTION','POST'))");
        } catch (Exception ignored) {
            // Ignore migration errors to avoid blocking startup
        }
    }
}
