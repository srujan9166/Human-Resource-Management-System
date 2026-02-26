package com.example.officeTask.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import com.example.officeTask.repository.UserRepository;
import com.example.officeTask.service.CustomUserDetailsService;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/employees/createManager").hasRole("CEO")
                .requestMatchers(HttpMethod.POST, "/employees/create").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/employees/**").hasAnyRole("CEO", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/employees/**").hasAnyRole("CEO", "MANAGER")
                .requestMatchers(HttpMethod.GET, "/employees").hasAnyRole("ADMIN", "CEO", "MANAGER", "EMPLOYEE")
                .requestMatchers(HttpMethod.GET, "/employees/**").hasAnyRole("ADMIN", "CEO", "MANAGER", "EMPLOYEE")
                .requestMatchers(HttpMethod.POST, "/department/**").hasAnyRole("ADMIN", "CEO", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/department/**").hasAnyRole("ADMIN", "CEO")
                .requestMatchers(HttpMethod.DELETE, "/department/**").hasAnyRole("ADMIN", "CEO")
                .requestMatchers(HttpMethod.GET, "/department/**").hasAnyRole("ADMIN", "CEO", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/leaves/leaveRequest").hasRole("EMPLOYEE")
                .requestMatchers(HttpMethod.PATCH, "/leaves/*/status").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/leaves/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/leaves/active-today").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.GET, "/leaves/allApproved").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.GET, "/leaves/leaveStatus").hasAnyRole("ADMIN", "EMPLOYEE")
                .requestMatchers(HttpMethod.GET, "/leaves/allLeaves").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/leaves/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.GET, "/payroll/**").hasAnyRole("ADMIN", "CEO", "MANAGER")
                .requestMatchers(HttpMethod.GET, "/report/**").hasAnyRole("ADMIN", "CEO", "MANAGER")
                .anyRequest().authenticated())
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .httpBasic(withDefaults());
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return new CustomUserDetailsService(userRepository);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(authProvider);
    }
}
