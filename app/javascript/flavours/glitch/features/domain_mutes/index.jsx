import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { ReactComponent as VisibilityOffIcon } from '@material-symbols/svg-600/outlined/visibility_off.svg';
import { debounce } from 'lodash';

import { fetchDomainMutes, expandDomainMutes } from '../../actions/domain_mutes';
import { LoadingIndicator } from '../../components/loading_indicator';
import ScrollableList from '../../components/scrollable_list';
import MutedDomainContainer from '../../containers/muted_domain_container';
import Column from '../ui/components/column';

const messages = defineMessages({
  heading: { id: 'column.domain_mutes', defaultMessage: 'Muted domains' },
  unmuteDomain: { id: 'account.unmute_domain', defaultMessage: 'Unmute domain {domain}' },
});

const mapStateToProps = state => ({
  domains: state.getIn(['domain_lists', 'mutes', 'items']),
  hasMore: !!state.getIn(['domain_lists', 'mutes', 'next']),
});

class Mutes extends ImmutablePureComponent {

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    hasMore: PropTypes.bool,
    domains: ImmutablePropTypes.orderedMap.isRequired,
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
  };

  componentWillMount () {
    this.props.dispatch(fetchDomainMutes());
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandDomainMutes());
  }, 300, { leading: true });

  render () {
    const { intl, domains, hasMore, multiColumn } = this.props;

    if (!domains) {
      return (
        <Column>
          <LoadingIndicator />
        </Column>
      );
    }

    const emptyMessage = <FormattedMessage id='empty_column.domain_mutes' defaultMessage='There are no muted domains yet.' />;

    return (
      <Column bindToDocument={!multiColumn} icon='eye-slash' iconComponent={VisibilityOffIcon} heading={intl.formatMessage(messages.heading)} alwaysShowBackButton>

        <ScrollableList
          scrollKey='domain_mutes'
          onLoadMore={this.handleLoadMore}
          hasMore={hasMore}
          emptyMessage={emptyMessage}
          bindToDocument={!multiColumn}
        >
          {domains.toList().map(domain =>
            <MutedDomainContainer key={domain.domain} domain={domain} />,
          )}
        </ScrollableList>

        <Helmet>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(Mutes));
