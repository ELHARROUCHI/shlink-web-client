import { faCircleNotch as preloader } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isEmpty, mapObjIndexed, values } from 'ramda';
import React from 'react';
import { Card } from 'reactstrap';
import PropTypes from 'prop-types';
import DateRangeRow from '../utils/DateRangeRow';
import MutedMessage from '../utils/MuttedMessage';
import { formatDate } from '../utils/utils';
import SortableBarGraph from './SortableBarGraph';
import { shortUrlVisitsType } from './reducers/shortUrlVisits';
import VisitsHeader from './VisitsHeader';
import GraphCard from './GraphCard';
import { shortUrlDetailType } from './reducers/shortUrlDetail';

const ShortUrlVisits = (
  { processStatsFromVisits },
  OpenMapModalBtn
) => class ShortUrlVisits extends React.PureComponent {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.object,
    }),
    getShortUrlVisits: PropTypes.func,
    shortUrlVisits: shortUrlVisitsType,
    getShortUrlDetail: PropTypes.func,
    shortUrlDetail: shortUrlDetailType,
    cancelGetShortUrlVisits: PropTypes.func,
  };

  state = { startDate: undefined, endDate: undefined };
  loadVisits = () => {
    const { match: { params }, getShortUrlVisits } = this.props;
    const { shortCode } = params;
    const dates = mapObjIndexed(formatDate(), this.state);
    const { startDate, endDate } = dates;

    // While the "page" is loaded, use the timestamp + filtering dates as memoization IDs for stats calcs
    this.memoizationId = `${this.timeWhenMounted}_${shortCode}_${startDate}_${endDate}`;
    getShortUrlVisits(shortCode, dates);
  };

  componentDidMount() {
    const { match: { params }, getShortUrlDetail } = this.props;
    const { shortCode } = params;

    this.timeWhenMounted = new Date().getTime();
    this.loadVisits();
    getShortUrlDetail(shortCode);
  }

  componentWillUnmount() {
    this.props.cancelGetShortUrlVisits();
  }

  render() {
    const { shortUrlVisits, shortUrlDetail } = this.props;

    const renderVisitsContent = () => {
      const { visits, loading, loadingLarge, error } = shortUrlVisits;

      if (loading) {
        const message = loadingLarge ? 'This is going to take a while... :S' : 'Loading...';

        return <MutedMessage><FontAwesomeIcon icon={preloader} spin /> {message}</MutedMessage>;
      }

      if (error) {
        return (
          <Card className="mt-4" body inverse color="danger">
            An error occurred while loading visits :(
          </Card>
        );
      }

      if (isEmpty(visits)) {
        return <MutedMessage>There are no visits matching current filter  :(</MutedMessage>;
      }

      const { os, browsers, referrers, countries, cities, citiesForMap } = processStatsFromVisits(
        { id: this.memoizationId, visits }
      );
      const mapLocations = values(citiesForMap);

      return (
        <div className="row">
          <div className="col-xl-4 col-lg-6">
            <GraphCard title="Operating systems" stats={os} />
          </div>
          <div className="col-xl-4 col-lg-6">
            <GraphCard title="Browsers" stats={browsers} />
          </div>
          <div className="col-xl-4">
            <SortableBarGraph
              stats={referrers}
              withPagination={false}
              title="Referrers"
              sortingItems={{
                name: 'Referrer name',
                amount: 'Visits amount',
              }}
            />
          </div>
          <div className="col-lg-6">
            <SortableBarGraph
              stats={countries}
              title="Countries"
              sortingItems={{
                name: 'Country name',
                amount: 'Visits amount',
              }}
            />
          </div>
          <div className="col-lg-6">
            <SortableBarGraph
              stats={cities}
              title="Cities"
              extraHeaderContent={(activeCities) =>
                mapLocations.length > 0 &&
                  <OpenMapModalBtn modalTitle="Cities" locations={mapLocations} activeCities={activeCities} />
              }
              sortingItems={{
                name: 'City name',
                amount: 'Visits amount',
              }}
            />
          </div>
        </div>
      );
    };
    const setDate = (dateField) => (date) => this.setState({ [dateField]: date }, this.loadVisits);

    return (
      <div className="shlink-container">
        <VisitsHeader shortUrlDetail={shortUrlDetail} />

        <section className="mt-4">
          <DateRangeRow
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            onStartDateChane={setDate('startDate')}
            onEndDateChange={setDate('endDate')}
          />
        </section>

        <section>
          {renderVisitsContent()}
        </section>
      </div>
    );
  }
};

export default ShortUrlVisits;
