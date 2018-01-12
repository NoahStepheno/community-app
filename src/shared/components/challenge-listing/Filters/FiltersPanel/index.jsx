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
import { Button, PrimaryButton } from 'components/buttons';
import Tooltip from 'components/Tooltip';
import { COMPOSE, PRIORITY } from 'react-css-super-themr';
import { REVIEW_OPPORTUNITY_TYPES } from 'utils/tc';
import DateRangePicker from '../DateRangePicker';
import style from './style.scss';
import UiSimpleRemove from '../../Icons/ui-simple-remove.svg';

export default function FiltersPanel({
  communityFilters,
  defaultCommunityId,
  filterState,
  challenges,
  hidden,
  isAuth,
  auth,
  isReviewOpportunitiesBucket,
  onClose,
  onSaveFilter,
  selectCommunity,
  selectedCommunityId,
  setFilterState,
  setSearchText,
  validKeywords,
  validSubtracks,
  isSavingFilter,
}) {
  let className = 'FiltersPanel';
  if (hidden) className += ' hidden';

  const isVisitorRegisteredToCommunity = (visitorGroupIds, communityGroupIds) =>
    Boolean(_.intersection(visitorGroupIds, communityGroupIds).length);

  const getLabel = (community) => {
    const { communityName } = community;
    if (!isAuth || communityName === 'All') {
      return <div>{communityName}</div>;
    }

    const visitorGroupIds = auth.profile ? auth.profile.groups.map(g => g.id) : [];
    const visitorBelongsToCommunity = isVisitorRegisteredToCommunity(
      visitorGroupIds,
      community.groupIds,
    );

    const registrationStatus = visitorBelongsToCommunity
      ? <div>Registered</div>
      : <div>You are <span styleName="bold uppercase">not</span> registered</div>;

    const challengesInCommunity = challenges.filter(challenge =>
      Filter.filterByGroupIds(challenge, community)).length;

    const selectItem = (
      <div styleName="community-select-item">
        <div>
          <div>{communityName}</div>
          <div styleName="registration-status">{registrationStatus}</div>
        </div>
        <div>{challengesInCommunity}</div>
      </div>
    );

    if (!visitorBelongsToCommunity) {
      return (
        <div>
          <Tooltip
            position="bottomRight"
            className="subcommunity-tooltip"
            trigger={['hover']}
            content={
              <div>
                <p>You are NOT registered for this sub community.</p>
                <p>There are {challengesInCommunity} challenges in this sub community</p>
              </div>
            }
          >
            {selectItem}
          </Tooltip>
        </div>
      );
    }

    return (
      <div>{selectItem}</div>
    );
  };

  const communityOps = communityFilters.filter(community => !community.hidden)
    .map(community => ({
      label: getLabel(community),
      value: community.communityId,
    }));

  const disableClearSaveFilterButtons = isSavingFilter || (
    selectedCommunityId === defaultCommunityId
    && _.isEmpty(filterState)
  );

  const mapOps = item => ({ label: item, value: item });
  const mapSubtracks = item => ({ label: item.name, value: item.subTrack });
  return (
    <div styleName={className}>
      <div styleName="header">
        <span styleName="title">Filters</span>
        <span styleName="close-icon" onClick={() => onClose()}>
          <UiSimpleRemove className="cross" />
        </span>
      </div>
      <div styleName="filters inGroup">
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
          <div styleName="filter community">
            <label htmlFor="community-select">Sub community</label>
            <Select
              autoBlur
              clearable={false}
              id="community-select"
              onChange={selectCommunity}
              options={communityOps}
              simpleValue
              value={selectedCommunityId}
            />
          </div>
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
              options={validSubtracks.map(mapSubtracks)}
              simpleValue
              value={
                filterState.subtracks ? filterState.subtracks.join(',') : null
              }
            />
          </div>
          {/* Only shown when the Review Opportunity bucket is selected */}
          { isReviewOpportunitiesBucket ?
            <div styleName="filter review-type">
              <label htmlFor="review-type-select">Review Type</label>
              <Select
                autoBlur
                clearable={false}
                id="review-type-select"
                onChange={value =>
                  setFilterState(Filter.setReviewOpportunityType(filterState, value))
                }
                options={[
                  { label: 'All', value: 0 }, // 0 value deactivates above filter
                  ...Object.entries(REVIEW_OPPORTUNITY_TYPES)
                    .map(([value, label]) => ({ value, label })),
                ]}
                simpleValue
                value={filterState.reviewOpportunityType || 0} // Default: All
              />
            </div> : null
          }
          <div styleName="filter dates hidetwomonthdatepicker">
            <label htmlFor="date-range-picker">Date range</label>
            <DateRangePicker
              numberOfMonths={1}
              endDate={filterState.endDate && moment(filterState.endDate)}
              id="date-range-picker"
              onDatesChange={(dates) => {
                let d = dates.endDate ? dates.endDate.toISOString() : null;
                let state = Filter.setEndDate(filterState, d);
                d = dates.startDate ? dates.startDate.toISOString() : null;
                state = Filter.setStartDate(state, d);
                setFilterState(state);
              }}
              startDate={
                filterState.startDate && moment(filterState.startDate)
              }
            />
          </div>
          <div styleName="filter dates hideonemonthdatepicker">
            <label htmlFor="date-range-picker">Date range</label>
            <DateRangePicker
              numberOfMonths={2}
              endDate={filterState.endDate && moment(filterState.endDate)}
              id="date-range-picker"
              onDatesChange={(dates) => {
                let d = dates.endDate ? dates.endDate.toISOString() : null;
                let state = Filter.setEndDate(filterState, d);
                d = dates.startDate ? dates.startDate.toISOString() : null;
                state = Filter.setStartDate(state, d);
                setFilterState(state);
              }}
              startDate={
                filterState.startDate && moment(filterState.startDate)
              }
            />
          </div>
        </div>
      </div>
      <div styleName="buttons">
        <Button
          composeContextTheme={COMPOSE.SOFT}
          disabled={disableClearSaveFilterButtons}
          onClick={() => {
            setFilterState({});
            selectCommunity(defaultCommunityId);
            setSearchText('');
          }}
          size="sm"
          theme={{ button: style.button }}
          themePriority={PRIORITY.ADHOC_DEFAULT_CONTEXT}
        >Clear filters</Button>
        <PrimaryButton
          disabled={disableClearSaveFilterButtons || !isAuth}
          onClick={onSaveFilter}
          size="sm"
          theme={{ button: style.button }}
        >Save filter</PrimaryButton>
      </div>
    </div>
  );
}

FiltersPanel.defaultProps = {
  challenges: [],
  hidden: false,
  isAuth: false,
  isSavingFilter: false,
  isReviewOpportunitiesBucket: false,
  onSaveFilter: _.noop,
  onClose: _.noop,
};

FiltersPanel.propTypes = {
  communityFilters: PT.arrayOf(PT.shape({
    communityId: PT.string.isRequired,
    communityName: PT.string.isRequired,
  })).isRequired,
  defaultCommunityId: PT.string.isRequired,
  filterState: PT.shape().isRequired,
  challenges: PT.arrayOf(PT.shape()),
  hidden: PT.bool,
  isAuth: PT.bool,
  auth: PT.shape().isRequired,
  isSavingFilter: PT.bool,
  isReviewOpportunitiesBucket: PT.bool,
  onSaveFilter: PT.func,
  selectCommunity: PT.func.isRequired,
  selectedCommunityId: PT.string.isRequired,
  setFilterState: PT.func.isRequired,
  setSearchText: PT.func.isRequired,
  validKeywords: PT.arrayOf(PT.string).isRequired,
  validSubtracks: PT.arrayOf(PT.shape()).isRequired,
  onClose: PT.func,
};
