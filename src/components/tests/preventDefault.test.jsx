/**
 * @jest-environment jsdom
 */
/**
 * Copyright 2026, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import I13nAnchor from '../I13nAnchor';
import I13nButton from '../I13nButton';
import setupI13n from '../../core/setupI13n';

const RootApp = setupI13n(({ children }) => children, {}, []);

const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

describe('preventDefault from user click handlers', () => {
  const windowLocation = window.location;

  beforeEach(() => {
    delete window.location;
    window.location = { assign: jest.fn() };
  });

  afterEach(() => {
    window.location = windowLocation;
  });

  // https://github.com/yahoo/react-i13n/issues/569
  it('should not submit the parent form when the I13nButton onClick calls preventDefault', async () => {
    const onSubmit = jest.fn((e) => e.preventDefault());
    const { getByText } = render(
      <RootApp>
        <form onSubmit={onSubmit}>
          <I13nButton onClick={(e) => e.preventDefault()}>submit</I13nButton>
        </form>
      </RootApp>
    );

    fireEvent.click(getByText('submit'));
    await flush();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should fire the form submit event when the I13nButton click is not prevented', async () => {
    const onSubmit = jest.fn((e) => e.preventDefault());
    const { getByText } = render(
      <RootApp>
        <form onSubmit={onSubmit}>
          <I13nButton>submit</I13nButton>
        </form>
      </RootApp>
    );

    fireEvent.click(getByText('submit'));
    await flush();

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // https://github.com/yahoo/react-i13n/issues/568
  it('should not follow the I13nAnchor href when an inner button calls preventDefault', async () => {
    const { getByText } = render(
      <RootApp>
        <I13nAnchor href="https://www.yahoo.com">
          <button type="button" onClick={(e) => e.preventDefault()}>inner</button>
        </I13nAnchor>
      </RootApp>
    );

    fireEvent.click(getByText('inner'));
    await flush();

    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('should follow the I13nAnchor href when the click is not prevented', async () => {
    const { getByText } = render(
      <RootApp>
        <I13nAnchor href="https://www.yahoo.com">link</I13nAnchor>
      </RootApp>
    );

    fireEvent.click(getByText('link'));
    await flush();

    expect(window.location.assign).toHaveBeenCalledWith('https://www.yahoo.com/');
  });
});
