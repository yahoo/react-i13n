/**
 * Copyright 2020, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import ReactI13n from '../ReactI13n';

describe('ReactI13n', () => {
  it('should be created correctly', () => {
    const reactI13n = new ReactI13n({
      isViewportEnabled: true
    });
    expect(reactI13n.isViewportEnabled()).toEqual(true);
  });

  it('should be able to update options', () => {
    const reactI13n = new ReactI13n({
      isViewportEnabled: true
    });
    expect(reactI13n.isViewportEnabled()).toEqual(true);

    reactI13n.updateOptions({
      isViewportEnabled: false
    });
    expect(reactI13n.isViewportEnabled()).toEqual(false);
  });

  it('should be able to generate root i13n node', () => {
    const rootModelData = {
      foo: 'bar'
    };
    const mockReactI13nClass = jest.fn();
    mockReactI13nClass.prototype.getMergedModel = function () {
      return rootModelData;
    };
    mockReactI13nClass.prototype.setDOMNode = () => {};
    const reactI13n = new ReactI13n({
      rootModelData,
      i13nNodeClass: mockReactI13nClass
    });
    reactI13n.createRootI13nNode();
    expect(reactI13n.getRootI13nNode().getMergedModel()).toEqual(rootModelData);
  });

  it('should be able to setup plugin and execute event', (done) => {
    const mockPlugin1 = {
      name: 'test1',
      eventHandlers: {
        click(payload, callback) {
          expect(payload).toEqual({});
          callback();
        }
      }
    };

    const mockPlugin2 = {
      name: 'test2',
      eventHandlers: {
        click(payload, callback) {
          expect(payload).toEqual({});
          callback();
        }
      }
    };
    const reactI13n = new ReactI13n({});
    reactI13n.plug(mockPlugin1);
    reactI13n.plug(mockPlugin2);
    // two plugin should be executed correctly then call the custom callback
    reactI13n.execute('click', {}, () => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('should be able to execute event without modifying payload', (done) => {
    const mockPlugin1 = {
      name: 'test1',
      eventHandlers: {
        click(payload, callback) {
          expect(payload).toEqual({});
          callback();
        }
      }
    };

    const payload = {
      foo: 'bar'
    };

    const reactI13n = new ReactI13n({});
    reactI13n.plug(mockPlugin1);
    reactI13n.execute('click', payload, () => {
      // should only have one attribute as 'foo', which means payload is not modified inside reactI13n.execute
      expect(payload).toEqual({ foo: 'bar' });
      done();
    });
  });

  it('should have a global timeout if event handler does not finish in time', (done) => {
    const mockPlugin1 = {
      name: 'test1',
      eventHandlers: {
        click(payload, callback) {
          // do nothing, without callback, simulate if event handler does not execute correctly or timeout
        }
      }
    };

    const reactI13n = new ReactI13n({});
    reactI13n.plug(mockPlugin1);
    // two plugin should be executed correctly then call the custom callback
    reactI13n.execute('click', {}, () => {
      // should still have callback due to the global timeout
      expect(true).toEqual(true);
      done();
    });
  });

  it('should be able to set a scrollableContainerId', () => {
    const reactI13n = new ReactI13n({
      scrollableContainerId: 'scrollable-test'
    });

    expect(reactI13n.getScrollableContainerId()).toEqual('scrollable-test');
  });

  it('should have an undefined scrollableContainerDOMNode if the scrollableContainerId is undefined', () => {
    const reactI13n = new ReactI13n({
      isViewportEnabled: true
    });

    expect(reactI13n.getScrollableContainerDOMNode()).toEqual(undefined);
  });
});
