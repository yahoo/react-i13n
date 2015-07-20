/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals document */

function isLeftClickEvent (e) {
    return e.button === 0;
}

function isModifiedEvent (e) {
    return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}

function isNewWindow (target, props) {
    return props.target === '_blank' || (target && target.target && '_blank' === target.target);
}

function isDefaultRedirectLink (target) {
    var defaultRedirectLink = false;
    // if it's a
    // 1. link
    // 2. button
    // 3. input with submit or button type
    // then redirect it by default, otherwise
    if ('A' === target.tagName || 'BUTTON' === target.tagName) {
        defaultRedirectLink = true;
    }
    if ('INPUT' === target.tagName && ('submit' === target.type || 'button' === target.type)) {
        defaultRedirectLink = true;
    }
    return defaultRedirectLink;
}

function isFormSubmit (target) {
    var formSubmit = false;
    // if it's a
    // 1. button
    // 2. input with submit or button type
    if ('BUTTON' === target.tagName ||
        ('INPUT' === target.tagName && ('submit' === target.type || 'button' === target.type))) {
        formSubmit = true;
    }
    return formSubmit;
}

/**
 * clickHandler which integrate the beacon event, send out beacon event then redirect user to the destination.
 * @param {Object} e the click event
 * @method ClickHandler
 */
module.exports = function clickHandler (e) {
    var self = this;
    var target = e.target || e.srcElement;
    var isRedirectLink = isDefaultRedirectLink(target);
    var isPreventDefault = true;
    var props = self.props;
    var followLink = (undefined !== props.followLink) ? props.followLink : props.follow;
    var href = '';

    // return and do nothing if the handler is append on a component without I13nMixin
    if (!self.executeI13nEvent) {
        return;
    }

    href = props.href;

    // if users disable the redirect by follow, force set it as false
    if (undefined !== followLink) {
        isRedirectLink = followLink;
    }

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

    self.executeI13nEvent('click', {i13nNode: self.getI13nNode(), e:e}, function clickBeaconCallback () {
        if (isRedirectLink) {
            if (isFormSubmit(target)) {
                // if the button has no form linked, then do nothing
                target.form && target.form.submit();
            } else {
                document.location.assign(href);
            }
        }
    });
};
