import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { prestamosApi } from '../../api/prestamosApi';
import { useStore } from '../../store/StoreContext';

export default function DevolucionModal({ show, onHide, codigoBarrasInicial = '', onCompleted }) {
  const { notify } = useStore();
  const [codigoBarras, setCodigoBarras] = useState(codigoBarrasInicial);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCodigoBarras(codigoBarrasInicial);
  }, [codigoBarrasInicial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await prestamosApi.registrarDevolucion(codigoBarras);
      notify('success', `Devolución registrada para el ejemplar ${codigoBarras}.`);
      onCompleted();
      onHide();
    } catch (err) {
      notify('danger', err.response?.data?.message || 'Error al registrar devolución.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-journal-check me-2 text-success"></i>Registrar Devolución
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Código de Barras del Ejemplar</Form.Label>
            <Form.Control
              placeholder="Ej: EJ-1984-001"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="success" type="submit" disabled={submitting}>
            {submitting ? 'Procesando...' : 'Confirmar Devolución'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}