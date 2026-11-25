import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { prestamosApi } from '../../api/prestamosApi';
import { useStore } from '../../store/StoreContext';

export default function NuevoPrestamoModal({ show, onHide, codigoBarrasInicial = '', onCreated }) {
  const { notify } = useStore();
  const [usuarioId, setUsuarioId] = useState(2);
  const [codigoBarras, setCodigoBarras] = useState(codigoBarrasInicial);
  const [diasPrestamo, setDiasPrestamo] = useState(14);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCodigoBarras(codigoBarrasInicial);
  }, [codigoBarrasInicial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await prestamosApi.registrarPrestamo({
        usuarioId: Number(usuarioId),
        codigoBarras,
        diasPrestamo: Number(diasPrestamo),
      });
      notify('success', `Préstamo registrado para el ejemplar ${codigoBarras}.`);
      onCreated();
      onHide();
    } catch (err) {
      notify('danger', err.response?.data?.message || 'No se pudo registrar el préstamo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-journal-arrow-up me-2 text-primary"></i>Registrar Préstamo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>ID del Socio</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              required
            />
            <Form.Text className="text-body-secondary">
              Socios de prueba: ID 2 (Carlos Lector) o ID 3 (Elena Morales)
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Código de Barras del Ejemplar</Form.Label>
            <Form.Control
              placeholder="Ej: EJ-1984-001"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Días de Préstamo</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="60"
              value={diasPrestamo}
              onChange={(e) => setDiasPrestamo(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Procesando...' : 'Confirmar Préstamo'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}