package cl.biblioteca.api.service;

import cl.biblioteca.api.dto.auth.AuthResponse;
import cl.biblioteca.api.dto.auth.LoginRequest;
import cl.biblioteca.api.dto.auth.RefreshTokenRequest;
import cl.biblioteca.api.model.RefreshToken;
import cl.biblioteca.api.model.Usuario;
import cl.biblioteca.api.repository.UsuarioRepository;
import cl.biblioteca.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        String accessToken = jwtService.generateToken(usuario);
        RefreshToken refreshToken = refreshTokenService.obtenerOCrearRefreshToken(usuario);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .email(usuario.getEmail())
                .rol(usuario.getRol().name())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verificarValidez(request.getRefreshToken());
        Usuario usuario = refreshToken.getUsuario();
        String nuevoAccessToken = jwtService.generateToken(usuario);

        // Devuelve el mismo refresh token reutilizable hasta su fecha de expiración
        return AuthResponse.builder()
                .accessToken(nuevoAccessToken)
                .refreshToken(refreshToken.getToken())
                .email(usuario.getEmail())
                .rol(usuario.getRol().name())
                .build();
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenService.revocarToken(request.getRefreshToken());
    }
}