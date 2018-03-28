import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import fp from 'lodash/fp';
import {
  historyGoBack,
  copyText,
  printPage,
} from '~/store/app/actions';
import PostsWrapper from '~/components/Common/PostsWrapper';
import Card from '~/components/Common/Card';
import Pagination from '~/components/Common/Pagination';
import getPosts from '~/utils/getPosts';
import getPage from '~/utils/getPage';
import { CONTENT_PER_PAGE } from '~/constants';

const CategorizedList = ({
  data,
  location,
}) => {
  const page = getPage(3)(location);
  const siteTitle = fp.get('site.siteMetadata.title')(data);
  const category = fp.flow(
    fp.get('pathname'),
    fp.split('/'),
    fp.get('2')
  )(location);
  const allPosts = fp.flow(
    getPosts,
    fp.filter(
      fp.flow(
        fp.get('node.frontmatter.category'),
        fp.isEqual(category)
      )
    )
  )(data);
  const postCount = fp.size(allPosts);
  const posts = fp.slice(
    (page - 1) * CONTENT_PER_PAGE,
    page * CONTENT_PER_PAGE
  )(allPosts);

  return ([
    <PostsWrapper key="posts-wrapper">
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="og:title" content={siteTitle} />
      </Helmet>
      {fp.isEmpty(posts) ? (
        <div>Posts Not Found.</div>
      ) : null}
      {fp.map((post) => {
        if (post.node.path !== '/404/') {
          const frontmatter = fp.get('node.frontmatter')(post);
          const { tags, path } = frontmatter;

          return (
            <Card key={path} path={path} tags={tags} {...frontmatter} hasTags={!fp.isEmpty(tags)} />
          );
        }

        return null;
      })(posts)}
    </PostsWrapper>,
    <Pagination
      key="pagination"
      prefix={`/categories/${category}/`}
      postCount={postCount}
      location={location}
    />,
  ]);
};

CategorizedList.propTypes = {
  data: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({}).isRequired,
};

export default connect(
  state => state,
  {
    historyGoBack,
    copyText,
    printPage,
  }
)(CategorizedList);

/* eslint-disable no-undef */
export const pageQuery = graphql`
  query CategorizedListQuery {
    site {
      siteMetadata {
        title
        author
      }
    }
    allMarkdownRemark (
      filter: {
        frontmatter: {
          hide: { ne: true }
        }
      }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          frontmatter {
            type
            title
            path
            category
            tags
            date(formatString: "DD MMMM, YYYY")
            summary
          }
        }
      }
    }
  }
`;
/* eslint-enable no-undef */