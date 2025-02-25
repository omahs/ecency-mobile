import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import { postBodySummary } from '@ecency/render-helper';
import { useNavigation } from '@react-navigation/native';
import { getComments, deleteComment } from '../../../providers/hive/dhive';
// Services and Actions
import { writeToClipboard } from '../../../utils/clipboard';
import { toastNotification } from '../../../redux/actions/uiAction';

// Middleware

// Constants
import ROUTES from '../../../constants/routeNames';

// Component
import CommentsView from '../view/commentsView';
import { useAppSelector } from '../../../hooks';
import { updateCommentCache } from '../../../redux/actions/cacheActions';
import { CommentCacheStatus } from '../../../redux/reducers/cacheReducer';

const CommentsContainer = ({
  author,
  permlink,
  selectedFilter,
  currentAccount: { name },
  isOwnProfile,
  fetchPost,
  currentAccount,
  pinCode,
  comments,
  dispatch,
  intl,
  commentCount,
  isLoggedIn,
  commentNumber,
  mainAuthor,
  selectedPermlink,
  isHideImage,
  isShowSubComments,
  hasManyComments,
  showAllComments,
  hideManyCommentsButton,
  flatListProps,
  postContentView,
  isLoading,
  fetchedAt,
  incrementRepliesCount,
  handleOnReplyPress,
  handleOnCommentsLoaded,
}) => {
  const navigation = useNavigation();

  const lastCacheUpdate = useAppSelector((state) => state.cache.lastUpdate);
  const cachedComments = useAppSelector((state) => state.cache.comments);

  const [lcomments, setLComments] = useState([]);
  const [propComments, setPropComments] = useState(comments);

  useEffect(() => {
    _getComments();
  }, []);

  useEffect(() => {
    _getComments();
    const sortedComments = _sortComments(selectedFilter);
    setLComments(sortedComments);
  }, [commentCount, selectedFilter]);

  useEffect(() => {
    let _comments = comments;
    if (_comments) {
      _comments = _handleCachedComment(comments);
    }
    setPropComments(_comments);
  }, [comments]);

  useEffect(() => {
    const postPath = `${author || ''}/${permlink || ''}`;
    // this conditional makes sure on targetted already fetched post is updated
    // with new cache status, this is to avoid duplicate cache merging
    if (
      lastCacheUpdate &&
      lastCacheUpdate.postPath === postPath &&
      lastCacheUpdate.type === 'comment' &&
      lastCacheUpdate.updatedAt > fetchedAt
    ) {
      _handleCachedComment();
    }
  }, [lastCacheUpdate]);

  // Component Functions

  const _sortComments = (sortOrder = 'trending', _comments) => {
    const sortedComments = _comments || lcomments;

    const absNegative = (a) => a.net_rshares < 0;

    const sortOrders = {
      trending: (a, b) => {
        if (absNegative(a)) {
          return 1;
        }

        if (absNegative(b)) {
          return -1;
        }

        const apayout = a.total_payout;
        const bpayout = b.total_payout;

        if (apayout !== bpayout) {
          return bpayout - apayout;
        }

        return 0;
      },
      reputation: (a, b) => {
        const keyA = get(a, 'author_reputation');
        const keyB = get(b, 'author_reputation');

        if (keyA > keyB) {
          return -1;
        }
        if (keyA < keyB) {
          return 1;
        }

        return 0;
      },
      votes: (a, b) => {
        const keyA = a.active_votes.length;
        const keyB = b.active_votes.length;

        if (keyA > keyB) {
          return -1;
        }
        if (keyA < keyB) {
          return 1;
        }

        return 0;
      },
      age: (a, b) => {
        if (absNegative(a)) {
          return 1;
        }

        if (absNegative(b)) {
          return -1;
        }

        const keyA = Date.parse(get(a, 'created'));
        const keyB = Date.parse(get(b, 'created'));

        if (keyA > keyB) {
          return -1;
        }
        if (keyA < keyB) {
          return 1;
        }

        return 0;
      },
    };

    sortedComments.sort(sortOrders[sortOrder]);

    return sortedComments;
  };

  const _getComments = async () => {
    if (isOwnProfile) {
      await fetchPost();
      if (handleOnCommentsLoaded) {
        handleOnCommentsLoaded();
      }
    } else if (author && permlink && !propComments) {
      await getComments(author, permlink, name)
        .then((__comments) => {
          // favourable place for merging comment cache
          __comments = _handleCachedComment(__comments);
          __comments = _sortComments(selectedFilter, __comments);

          setLComments(__comments);
          if (handleOnCommentsLoaded) {
            handleOnCommentsLoaded();
          }
        })
        .catch(() => {});
    } else {
      _handleCachedComment();
    }
  };

  const _handleCachedComment = (passedComments = null) => {
    const _comments = passedComments || propComments || lcomments || [];
    const postPath = `${author || ''}/${permlink || ''}`;

    if (cachedComments.has(postPath)) {
      const cachedComment = cachedComments.get(postPath);

      let ignoreCache = false;
      let replaceAtIndex = -1;
      let removeAtIndex = -1;
      _comments.forEach((comment, index) => {
        if (cachedComment.permlink === comment.permlink) {
          if (cachedComment.updated < comment.updated) {
            // comment is present with latest data
            ignoreCache = true;
            console.log('Ignore cache as comment is now present');
          } else if (cachedComment.status === CommentCacheStatus.DELETED) {
            removeAtIndex = index;
          } else {
            // comment is present in list but data is old
            replaceAtIndex = index;
          }
        }
      });

      // means deleted comment is not being retuend in fresh data, cache needs to be ignored
      if (cachedComment.status === CommentCacheStatus.DELETED && removeAtIndex < 0) {
        ignoreCache = true;
      }

      // manipulate comments with cached data
      if (!ignoreCache) {
        let newComments = [];
        if (removeAtIndex >= 0) {
          newComments = _comments;
          newComments.splice(removeAtIndex, 1);
        } else if (replaceAtIndex >= 0) {
          _comments[replaceAtIndex] = cachedComment;
          newComments = [..._comments];
        } else {
          newComments = [..._comments, cachedComment];
        }

        console.log('updated comments with cached comment');
        if (passedComments) {
          return newComments;
        } else if (propComments) {
          setPropComments(newComments);
        } else {
          setLComments(newComments);
        }
      }
    }
    return _comments;
  };

  const _handleOnReplyPress = (item) => {
    navigation.navigate({
      name: ROUTES.SCREENS.EDITOR,
      key: 'editor_reply',
      params: {
        isReply: true,
        post: item,
        fetchPost,
      },
    });
  };

  const _handleOnVotersPress = (activeVotes, content) => {
    navigation.navigate({
      name: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
        content,
      },
      key: get(content, 'permlink'),
    });
  };

  const _handleOnEditPress = (item) => {
    navigation.navigate({
      name: ROUTES.SCREENS.EDITOR,
      key: `editor_edit_reply_${item.permlink}`,
      params: {
        isEdit: true,
        isReply: true,
        post: item,
        fetchPost: _getComments,
      },
    });
  };

  const _handleDeleteComment = (_permlink) => {
    let filteredComments;

    deleteComment(currentAccount, pinCode, _permlink).then(() => {
      let deletedItem = null;

      const _applyFilter = (item) => {
        if (item.permlink === _permlink) {
          deletedItem = item;
          return false;
        }
        return true;
      };

      if (lcomments.length > 0) {
        filteredComments = lcomments.filter(_applyFilter);
        setLComments(filteredComments);
      } else {
        filteredComments = propComments.filter(_applyFilter);
        setPropComments(filteredComments);
      }

      // remove cached entry based on parent
      if (deletedItem) {
        const cachePath = `${deletedItem.parent_author}/${deletedItem.parent_permlink}`;
        deletedItem.status = CommentCacheStatus.DELETED;
        delete deletedItem.updated;
        dispatch(updateCommentCache(cachePath, deletedItem, { isUpdate: true }));
      }
    });
  };

  const _openReplyThread = (comment) => {
    navigation.navigate({
      name: ROUTES.SCREENS.POST,
      key: comment.permlink,
      params: {
        author: comment.author,
        permlink: comment.permlink,
      },
    });
  };

  const _handleOnPressCommentMenu = (index, selectedComment) => {
    const _showCopiedToast = () => {
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.copied',
          }),
        ),
      );
    };

    if (index === 0) {
      writeToClipboard(`https://ecency.com${get(selectedComment, 'url')}`).then(_showCopiedToast);
    }
    if (index === 1) {
      const body = postBodySummary(selectedComment.markdownBody, null, Platform.OS);
      writeToClipboard(body).then(_showCopiedToast);
    } else if (index === 2) {
      _openReplyThread(selectedComment);
    }
  };

  return (
    <CommentsView
      key={selectedFilter}
      hasManyComments={hasManyComments}
      hideManyCommentsButton={hideManyCommentsButton}
      selectedFilter={selectedFilter}
      selectedPermlink={selectedPermlink}
      author={author}
      mainAuthor={mainAuthor}
      commentNumber={commentNumber || 1}
      commentCount={commentCount}
      comments={lcomments.length > 0 ? lcomments : propComments}
      currentAccountUsername={currentAccount.name}
      handleOnEditPress={_handleOnEditPress}
      handleOnReplyPress={handleOnReplyPress}
      isLoggedIn={isLoggedIn}
      fetchPost={fetchPost}
      handleDeleteComment={_handleDeleteComment}
      handleOnPressCommentMenu={_handleOnPressCommentMenu}
      isOwnProfile={isOwnProfile}
      isHideImage={isHideImage}
      handleOnVotersPress={_handleOnVotersPress}
      isShowSubComments={isShowSubComments}
      showAllComments={showAllComments}
      flatListProps={flatListProps}
      openReplyThread={_openReplyThread}
      incrementRepliesCount={incrementRepliesCount}
      fetchedAt={fetchedAt}
      postContentView={postContentView}
      isLoading={isLoading}
    />
  );
};

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
});

export default connect(mapStateToProps)(injectIntl(CommentsContainer));
