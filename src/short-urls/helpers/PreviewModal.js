import React from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import { ExternalLink } from 'react-external-link';
import './PreviewModal.scss';

const propTypes = {
  url: PropTypes.string,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
};

const PreviewModal = ({ url, toggle, isOpen }) => (
  <Modal isOpen={isOpen} toggle={toggle} size="lg">
    <ModalHeader toggle={toggle}>
      Preview for <ExternalLink href={url}>{url}</ExternalLink>
    </ModalHeader>
    <ModalBody>
      <div className="text-center">
        <p className="preview-modal__loader">Loading...</p>
        <img src={`${url}/preview`} className="preview-modal__img" alt="Preview" />
      </div>
    </ModalBody>
  </Modal>
);

PreviewModal.propTypes = propTypes;

export default PreviewModal;
