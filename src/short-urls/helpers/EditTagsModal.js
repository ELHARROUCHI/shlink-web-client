import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import { ExternalLink } from 'react-external-link';
import { shortUrlTagsType } from '../reducers/shortUrlTags';
import { shortUrlType } from '../reducers/shortUrlsList';

const EditTagsModal = (TagsSelector) => class EditTagsModal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    shortUrl: shortUrlType.isRequired,
    shortUrlTags: shortUrlTagsType,
    editShortUrlTags: PropTypes.func,
    shortUrlTagsEdited: PropTypes.func,
    resetShortUrlsTags: PropTypes.func,
  };

  saveTags = () => {
    const { editShortUrlTags, shortUrl, toggle } = this.props;

    editShortUrlTags(shortUrl.shortCode, this.state.tags)
      .then(() => {
        this.tagsSaved = true;
        toggle();
      })
      .catch(() => {});
  };
  refreshShortUrls = () => {
    if (!this.tagsSaved) {
      return;
    }

    const { shortUrlTagsEdited, shortUrl, shortUrlTags } = this.props;
    const { tags } = shortUrlTags;

    shortUrlTagsEdited(shortUrl.shortCode, tags);
  };

  componentDidMount() {
    const { resetShortUrlsTags } = this.props;

    resetShortUrlsTags();
    this.tagsSaved = false;
  }

  constructor(props) {
    super(props);
    this.state = { tags: props.shortUrl.tags };
  }

  render() {
    const { isOpen, toggle, url, shortUrlTags } = this.props;

    return (
      <Modal isOpen={isOpen} toggle={toggle} centered onClosed={() => this.refreshShortUrls()}>
        <ModalHeader toggle={toggle}>
          Edit tags for <ExternalLink href={url}>{url}</ExternalLink>
        </ModalHeader>
        <ModalBody>
          <TagsSelector tags={this.state.tags} onChange={(tags) => this.setState({ tags })} />
          {shortUrlTags.error && (
            <div className="p-2 mt-2 bg-danger text-white text-center">
              Something went wrong while saving the tags :(
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-link" onClick={toggle}>Cancel</button>
          <button
            className="btn btn-primary"
            type="button"
            disabled={shortUrlTags.saving}
            onClick={() => this.saveTags()}
          >
            {shortUrlTags.saving ? 'Saving tags...' : 'Save tags'}
          </button>
        </ModalFooter>
      </Modal>
    );
  }
};

export default EditTagsModal;
