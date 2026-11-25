package cl.biblioteca.api.service;

import cl.biblioteca.api.exception.TokenRefreshException;
import cl.biblioteca.api.model.RefreshToken;
import cl.biblioteca.api.model.Usuario;
import cl.biblioteca.api.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${application.security.jwt.refresh-token.expiration}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Reutiliza un refresh token vigente y no revocado si existe para el usuario;
     * de lo contrario genera o renueva uno nuevo.
     */
    @Transactional
    public RefreshToken obtenerOCrearRefreshToken(Usuario usuario) {
        Optional<RefreshToken> existenteOpt = refreshTokenRepository.findByUsuario(usuario);

        if (existenteOpt.isPresent()) {
            RefreshToken existente = existenteOpt.get();
            if (!existente.isRevocado() && !existente.estaExpirado()) {
                return existente;
            }
            // Si expiró o fue revocado, lo actualizamos in-place manteniendo la relación 1:1
            existente.setToken(UUID.randomUUID().toString());
            existente.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
            existente.setRevocado(false);
            return refreshTokenRepository.save(existente);
        }

        RefreshToken nuevoToken = RefreshToken.builder()
                .usuario(usuario)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .revocado(false)
                .build();

        return refreshTokenRepository.save(nuevoToken);
    }

    @Transactional
    public RefreshToken verificarValidez(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException("Refresh token no encontrado en la base de datos"));

        if (refreshToken.isRevocado()) {
            throw new TokenRefreshException("El refresh token fue revocado. Inicia sesión nuevamente");
        }

        if (refreshToken.estaExpirado()) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException("El refresh token ha expirado. Inicia sesión nuevamente");
        }

        return refreshToken;
    }

    @Transactional
    public void revocarToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException("Refresh token no encontrado"));
        refreshToken.setRevocado(true);
        refreshTokenRepository.save(refreshToken);
    }
}