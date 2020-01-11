import qs from 'qs';
import { isEmpty, isNil, reject } from 'ramda';
import PropTypes from 'prop-types';

const API_VERSION = '1';

export const apiErrorType = PropTypes.shape({
  type: PropTypes.string,
  detail: PropTypes.string,
  title: PropTypes.string,
  status: PropTypes.number,
  error: PropTypes.string, // Deprecated
  message: PropTypes.string, // Deprecated
});

export const buildShlinkBaseUrl = (url) => url ? `${url}/rest/v${API_VERSION}` : '';

export default class ShlinkApiClient {
  constructor(axios, baseUrl, apiKey) {
    this.axios = axios;
    this._baseUrl = buildShlinkBaseUrl(baseUrl);
    this._apiKey = apiKey || '';
  }

  listShortUrls = (options = {}) =>
    this._performRequest('/short-urls', 'GET', options)
      .then((resp) => resp.data.shortUrls);

  createShortUrl = (options) => {
    const filteredOptions = reject((value) => isEmpty(value) || isNil(value), options);

    return this._performRequest('/short-urls', 'POST', {}, filteredOptions)
      .then((resp) => resp.data);
  };

  getShortUrlVisits = (shortCode, query) =>
    this._performRequest(`/short-urls/${shortCode}/visits`, 'GET', query)
      .then((resp) => resp.data.visits);

  getShortUrl = (shortCode) =>
    this._performRequest(`/short-urls/${shortCode}`, 'GET')
      .then((resp) => resp.data);

  deleteShortUrl = (shortCode) =>
    this._performRequest(`/short-urls/${shortCode}`, 'DELETE')
      .then(() => ({}));

  updateShortUrlTags = (shortCode, tags) =>
    this._performRequest(`/short-urls/${shortCode}/tags`, 'PUT', {}, { tags })
      .then((resp) => resp.data.tags);

  listTags = () =>
    this._performRequest('/tags', 'GET')
      .then((resp) => resp.data.tags.data);

  deleteTags = (tags) =>
    this._performRequest('/tags', 'DELETE', { tags })
      .then(() => ({ tags }));

  editTag = (oldName, newName) =>
    this._performRequest('/tags', 'PUT', {}, { oldName, newName })
      .then(() => ({ oldName, newName }));

  health = () => this._performRequest('/health', 'GET').then((resp) => resp.data);

  _performRequest = async (url, method = 'GET', query = {}, body = {}) =>
    await this.axios({
      method,
      url: `${this._baseUrl}${url}`,
      headers: { 'X-Api-Key': this._apiKey },
      params: query,
      data: body,
      paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
    });
}
