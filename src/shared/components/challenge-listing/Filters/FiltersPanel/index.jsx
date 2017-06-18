/* eslint jsx-a11y/no-static-element-interactions:0 */

/**
 * Challenge filters panel.
 *
 * It contains:
 *  - Challenge keywords filter;
 *  - Challenge tracks filter;
 *  - Challenge dates range filter;
 *  - Clear and save filter buttons.
 *
 * Challenge keywords and tracks filters allow to choose multiple keywords from
 * the predefined sets, which should be passed into the component as string arrays
 * via the 'validKeywords' and 'validTracks' properties. The whole filters panel
 * can be hidden/displayed by setting the boolean 'hidden' property.
 *
 * Each time the user modifies any filter, this component triggers the callback
 * provided via the 'onFilter' property, if any, passing in the current filter
 * object.
 */

import _ from 'lodash';
import * as Filter from 'utils/challenge-listing/filter';
import React from 'react';
import PT from 'prop-types';
import Select from 'components/Select';
import moment from 'moment';

import FilterPanelFilter from './FilterPanelFilter';
import UiSimpleRemove from '../../Icons/UiSimpleRemove';

import './style.scss';
import DateRangePicker from '../DateRangePicker';

class FiltersPanel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      filter: props.filter,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.filter !== nextProps.filter) {
      this.setState({
        filter: nextProps.filter,
      });
    }
  }

  /**
   * Clears the the filters.
   * Note that this method does not call the onFilter() callback passed via props,
   * if any, just the onClearFilters().
   */
  onClearFilters() {
    this.props.onClearFilters();
    this.setState({ filter: new FilterPanelFilter() });
  }

  /**
   * Handles updates of the dates filter.
   * @param {Moment} startDate
   * @param {Moment} endDate
   */
  onDatesChanged(startDate, endDate) {
    const filter = new FilterPanelFilter(this.state.filter);
    filter.startDate = moment(startDate);
    filter.endDate = moment(endDate);
    this.props.onFilter(filter);
    this.setState({ filter });
  }

  /**
   * Triggers the 'onFilter' callback, if it is provided in properties.
   */
  filter() {
    this.props.onFilter(this.state.filter);
  }

  render() {
    const {
      filterState,
      setFilterState,
      validKeywords,
      validSubtracks,
    } = this.props;

    let className = 'FiltersPanel';
    if (this.props.hidden) className += ' hidden';

    let communityOps;
    if (this.props.challengeGroupId) {
      communityOps = [{
        label: this.props.communityName,
        value: this.props.communityName,
      }, {
        label: 'All',
        value: 'all',
      }];
    }

    const mapOps = item => ({ label: item, value: item });

    return (
      <div styleName={className}>
        <div styleName="header">
          <span styleName="title">Filters</span>
          <span styleName="close-icon" onClick={() => this.props.onClose()}>
            <UiSimpleRemove className="cross" />
          </span>
        </div>
        <div styleName={`filters ${this.props.challengeGroupId ? 'inGroup' : ''}`}>
          <div styleName="filter-row">
            <div styleName="filter keywords">
              <label htmlFor="keyword-select" styleName="left-label">Keywords</label>
              <Select
                id="keyword-select"
                multi
                onChange={(value) => {
                  const tags = value ? value.split(',') : undefined;
                  setFilterState(Filter.setTags(filterState, tags));
                }}
                options={validKeywords.map(mapOps)}
                simpleValue
                value={filterState.tags ? filterState.tags.join(',') : null}
              />
            </div>
            {this.props.challengeGroupId ? (
              <div styleName="filter community">
                <label htmlFor="community-select">Sub community</label>
                <Select
                  id="community-select"
                  onChange={(value) => {
                    if (value !== 'all') {
                      this.state.filter.groupId = this.props.challengeGroupId;
                    } else {
                      this.state.filter.groupId = null;
                    }
                    this.props.onFilter(this.state.filter);
                  }}
                  options={communityOps}
                  simpleValue
                  value={this.state.filter.groupId ? this.props.communityName : 'all'}
                />
              </div>
            ) : null}
          </div>
          <div styleName="filter-row">
            <div styleName="filter track">
              <label htmlFor="track-select" styleName="left-label">Subtrack</label>
              <Select
                id="track-select"
                multi
                onChange={(value) => {
                  const subtracks = value ? value.split(',') : undefined;
                  setFilterState(Filter.setSubtracks(filterState, subtracks));
                }}
                options={validSubtracks.map(mapOps)}
                simpleValue
                value={
                  filterState.subtracks ? filterState.subtracks.join(',') : null
                }
              />
            </div>
            <div styleName="filter dates">
              <label htmlFor="date-range-picker">Date range</label>
              {<DateRangePicker
                endDate={this.state.filter.endDate}
                id="date-range-picker"
                onDatesChange={dates => this.onDatesChanged(dates.startDate, dates.endDate)}
                startDate={this.state.filter.startDate}
              />}
            </div>
          </div>
        </div>
        <div styleName="buttons">
          <button
            styleName="white"
            className="tc-outline-btn"
            onClick={() => this.onClearFilters()}
          >
            Clear filters
          </button>
          <button
            styleName="blue"
            className="tc-blue-btn"
            onClick={this.props.onSaveFilter}
          >
            Save filter
          </button>
        </div>
      </div>
    );
  }
}

FiltersPanel.defaultProps = {
  communityName: null,
  filter: new FilterPanelFilter(),
  hidden: false,
  onClearFilters: _.noop,
  onFilter: _.noop,
  onSaveFilter: _.noop,
  onClose: _.noop,
};

FiltersPanel.propTypes = {
  challengeGroupId: PT.string.isRequired,
  communityName: PT.string,
  filter: PT.instanceOf(FilterPanelFilter),
  filterState: PT.shape().isRequired,
  hidden: PT.bool,
  onClearFilters: PT.func,
  onFilter: PT.func,
  onSaveFilter: PT.func,
  setFilterState: PT.func.isRequired,
  validKeywords: PT.arrayOf(PT.string).isRequired,
  validSubtracks: PT.arrayOf(PT.string).isRequired,
  onClose: PT.func,
};

export default FiltersPanel;
