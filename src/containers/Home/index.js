import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import './index.css';
import {Layout, Input, Spin} from 'antd';
import ArticleListItem from '../../components/ArticleListItem';
import {getArticlesByCategory, getArticlesByUser} from '../../actions/articles';
const {Header, Content} = Layout;
const Search = Input.Search;

const styles = {
  articlesList: {display: 'flex', flexDirection: 'column'}
};

//Article Overview
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: ''
    };
  }
  //scroll handler for lazy loading
  onScroll = () => {
    const {match, articles, location} = this.props;

    //if in loading process, don´t do anything
    if (articles.isBusy) {
      return;
    }
    //if user hits bottom, load next batch of items
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if ((window.innerHeight + scrollTop) >= document.body.scrollHeight) {
      if (location.pathname === '/mycontributions') {
        this.loadArticlesUser(articles.data.length);
      } else {
        this.loadArticles(match.params.category, articles.data.length);
      }
    }
  };
  componentDidMount() {
    const {location} = this.props;

    if (location.pathname === '/mycontributions') {
      this.loadArticlesUser();
    } else {
      this.loadArticles();
    }

    //on scroll, load the next batch of articles
    window.addEventListener('scroll', this.onScroll);
  }
  componentWillUnmount() {
    //remove scroll event again when hitting another route
    window.removeEventListener('scroll', this.onScroll);
  }
  componentDidUpdate(prevProps, prevState) {
    const {location, match} = this.props;

    if (prevProps.location.pathname !== location.pathname) {
      //location change detected, load new data
      if (location.pathname === '/mycontributions') {
        this.loadArticlesUser();
      } else {
        this.loadArticles(match.params.category);
      }
    }
  }
  //load general articles
  loadArticles = (category = 'all', skip = 0) => {
    const {dispatch, match} = this.props;

    dispatch(getArticlesByCategory(match.params.category, skip));
  };
  //load own contributions
  loadArticlesUser = (skip = 0) => {
    const {dispatch} = this.props;

    dispatch(getArticlesByUser(skip));
  };
  render() {
    const {searchString} = this.state;
    const {articles} = this.props;

    let articlesData = articles.data;
    if (searchString !== '') {
      articlesData = articlesData.filter((elem) => {
        if (elem.title.toLowerCase().indexOf(searchString.toLowerCase()) !== -1) {
          return true;
        }
        if (elem.description.toLowerCase().indexOf(searchString.toLowerCase()) !== -1) {
          return true;
        }
        return false;
      });
    }

    return (
      <div>
        <Header>
          <Search
            placeholder="Search through Knacksteem"
            onSearch={value => this.setState({searchString: value})}
            style={{width: 300}}
          />
        </Header>
        <Content>
          <div className="ant-list ant-list-vertical ant-list-lg ant-list-split ant-list-something-after-last-item" style={styles.articlesList}>
            {articlesData.map((data, index) => {
              return (
                <ArticleListItem key={index} data={data} onUpvoteSuccess={this.loadArticles} />
              );
            })}
          </div>
          {articles.isBusy && <Spin/>}
        </Content>
      </div>
    );
  }
}

Home.propTypes = {
  location: PropTypes.object,
  match: PropTypes.object,
  dispatch: PropTypes.func,
  articles: PropTypes.object
};

const mapStateToProps = state => ({
  articles: state.articles
});

export default withRouter(connect(mapStateToProps)(Home));
