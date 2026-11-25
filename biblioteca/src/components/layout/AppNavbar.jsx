import React from 'react';
import { Navbar, Nav, Container, Button, Badge, Stack } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../../store/StoreContext';

export default function AppNavbar() {
  const { isAuthenticated, user, isBibliotecario, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="border-bottom shadow-sm mb-4 bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center gap-2">
          <i className="bi bi-book-half text-primary fs-4"></i>
          <span>Biblioteca</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          {isAuthenticated && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/catalogo" active={location.pathname === '/catalogo'}>
                <i className="bi bi-collection me-1"></i> Catálogo
              </Nav.Link>
              <Nav.Link as={Link} to="/prestamos" active={location.pathname === '/prestamos'}>
                <i className="bi bi-arrow-left-right me-1"></i>
                {isBibliotecario ? 'Gestión de Préstamos' : 'Mis Préstamos'}
              </Nav.Link>
            </Nav>
          )}

          <Stack direction="horizontal" gap={3} className="ms-auto mt-2 mt-lg-0">
            <Button
              variant={theme === 'dark' ? 'outline-light' : 'outline-dark'}
              size="sm"
              onClick={toggleTheme}
              title="Cambiar tema"
            >
              {theme === 'dark' ? (
                <>
                  <i className="bi bi-sun-fill text-warning me-1"></i> Claro
                </>
              ) : (
                <>
                  <i className="bi bi-moon-stars-fill me-1"></i> Oscuro
                </>
              )}
            </Button>

            {isAuthenticated && (
              <>
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-body-secondary d-none d-md-inline">{user?.email}</span>
                  <Badge bg={isBibliotecario ? 'primary' : 'info'}>
                    {isBibliotecario ? 'Bibliotecario' : 'Socio'}
                  </Badge>
                </div>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-1"></i> Salir
                </Button>
              </>
            )}
          </Stack>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}