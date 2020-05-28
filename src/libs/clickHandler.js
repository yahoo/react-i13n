/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import isUndefined from '../utils/isUndefined';

function isLeftClickEvent(e) {
  return e.button === 0;
}

function isModifiedEvent(e) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}

function getLinkTarget(target, props) {
  return props.target || (target?.target) || '_self';
}

function isNewWindow(target, props) {
  return getLinkTarget(target, props) === '_blank';
}

function isDefaultRedirectLink(target) {
  let defaultRedirectLink = false;
  const { tagName, type } = target;
  // if it's a
  // 1. link
  // 2. button
  // 3. input with submit or button type
  // then redirect it by default, otherwise
  if (tagName === 'A' || tagName === 'BUTTON') {
    defaultRedirectLink = true;
  }
  if (tagName === 'INPUT' && (type === 'submit' || type === 'button')) {
    defaultRedirectLink = true;
  }
  return defaultRedirectLink;
}

function isFormSubmit(target) {
  let formSubmit = false;
  const {
    tagName,
    type
  } = target;
  // if it's a
  // 1. button
  // 2. input with submit or button type
  if (
    tagName === 'BUTTON'
    || (tagName === 'INPUT' && (type === 'submit' || type === 'button'))
  ) {
    formSubmit = true;
  }
  return formSubmit;
}

/**
 * clickHandler which integrate the beacon event, send out beacon event then redirect user to the destination.
 * @param {Object} e the click event
 * @method ClickHandler
 */
const clickHandler = (e, options) => {
  const target = e.target || e.srcElement;
  let isRedirectLink = isDefaultRedirectLink(target);
  let isPreventDefault = true;

  const {
    executeEvent,
    i13nNode,
    props,
    shouldFollowLink
   } = options;

  let href = '';

  if (!executeEvent) {
    return;
  }

  const { follow } = props;

  href = props.href || target.href;

  // if users disable the redirect by follow, force set it as false
  isRedirectLink = shouldFollowLink?.(props) ?? follow;

  // if it's not an anchor or this is a hash link url for page's internal links.
  // Do not trigger navigate action. Let browser handle it natively.
  if (!href || (href && href[0] === '#')) {
    isRedirectLink = false;
    isPreventDefault = false;
  }

  // this is a click with a modifier or not a left-click
  // let browser handle it natively
  if (isModifiedEvent(e) || !isLeftClickEvent(e) || isNewWindow(target, props)) {
    isPreventDefault = false;
    isRedirectLink = false;
  }

  if (isPreventDefault) {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  }

  executeEvent('click', { i13nNode: getI13nNode(), e }, () => {
    if (isRedirectLink) {
      if (isFormSubmit(target)) {
        // if the button has no form linked, then do nothing
        target.form && target.form.submit();
      } else {
        const linkTarget = getLinkTarget(target, props);
        if (linkTarget === '_top') {
          window.top.location.href = href;
        } else if (linkTarget === '_parent') {
          window.parent.location.href = href;
        } else {
          document.location.assign(href);
        }
      }
    }
  });
}

export default clickHandler;
