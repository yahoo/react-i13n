/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const isLeftClickEvent = (e) => e.button === 0;
const isModifiedEvent = (e) => !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);

const getLinkTarget = (target, props) => props.target || (target?.target) || '_self';
const isNewWindow = (target, props) => getLinkTarget(target, props) === '_blank';

const isLink = (target) => target.tagName === 'A';
const isButtonLike = (target) => {
  const { tagName, type } = target;
  if (tagName === 'BUTTON') {
    return true;
  }
  // input with submit or button type
  if (tagName === 'INPUT' && (type === 'submit' || type === 'button')) {
    return true;
  }
};

const isDefaultRedirectLink = (target) => {
  // if it's a
  // 1. link
  // 2. button
  // 3. input with submit or button type
  // then redirect it by default, otherwise
  if (isLink(target) || isButtonLike(target)) {
    return true;
  }

  return false;
};

const isFormSubmit = (target) => {
  // if it's a
  // 1. button
  // 2. input with submit or button type
  if (isButtonLike(target) && target.type === 'submit') {
    return true;
  }
  return false;
};

/**
 * clickHandler which integrate the beacon event, send out beacon event then redirect user to the destination.
 * @param {Object} e the click event
 * @method ClickHandler
 */
const clickHandler = (e, options = {}) => {
  const target = e.currentTarget;
  const isForm = isFormSubmit(target);

  let isRedirectLink = isDefaultRedirectLink(target);
  let isPreventDefault = true;

  const {
    executeEvent,
    i13nNode,
    props = {},
    shouldFollowLink
  } = options;

  if (!executeEvent) {
    return;
  }

  const { follow } = props;

  const href = props.href || target.href;

  // if users disable the redirect by follow, force set it as false
  isRedirectLink = (shouldFollowLink?.(props) ?? follow) ?? isRedirectLink;
  // 1. not a link or button
  // 2. if it is an anchor but no href or hash link
  // 3. button without form submit
  // Do not trigger navigate action. Let browser handle it natively.
  if (
    (!isDefaultRedirectLink(target))
    || (isLink(target) && (!href || (href && href[0] === '#')))
    || (isButtonLike(target) && !isForm)
  ) {
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

  executeEvent('click', { i13nNode, e }, () => {
    if (isRedirectLink) {
      if (isForm) {
        target.form?.submit();
      } else {
        const linkTarget = getLinkTarget(target, props);

        if (linkTarget === '_top') {
          window.top.location.href = href;
        } else if (linkTarget === '_parent') {
          window.parent.location.href = href;
        } else {
          window.location.assign(href);
        }
      }
    }
  });
};

export default clickHandler;
