import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../store/StoreContext';

export default function LoginPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('bibliotecario@biblioteca.cl');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      loginSuccess(data);
      navigate('/catalogo');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas o servidor no disponible.');
    } finally {
      setLoading(false);
    }
  };

  const autocompletar = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <i className="bi bi-book-half text-primary display-4"></i>
                <h3 className="mt-2 fw-bold">Acceso a Biblioteca</h3>
                <p className="text-body-secondary small">Inicia sesión para gestionar o consultar el catálogo</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </Button>
              </Form>

              <hr className="my-4" />
              <p className="small text-body-secondary mb-2">Cuentas rápidas de prueba:</p>
              <ListGroup variant="flush" className="small">
                <ListGroup.Item
                  action
                  onClick={() => autocompletar('bibliotecario@biblioteca.cl', 'Admin123!')}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span><strong>Bibliotecario:</strong> bibliotecario@biblioteca.cl</span>
                  <span className="text-primary">Usar</span>
                </ListGroup.Item>
                <ListGroup.Item
                  action
                  onClick={() => autocompletar('socio@biblioteca.cl', 'Socio123!')}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span><strong>Socio:</strong> socio@biblioteca.cl</span>
                  <span className="text-primary">Usar</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}