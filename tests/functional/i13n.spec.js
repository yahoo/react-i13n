/* global describe, it, document, expect */

describe('React I13n test', () => {
  it.only('should init correctly and give the rootI13nNode the correct default model value', () => {
    const result = window._reactI13nInstance.getRootI13nNode().getMergedModel();
    expect(result).to.eql({ sec: 'default-section-name', page: 'test-page' });
  });

  it.only('should fire a pageview', () => {
    const events = window.firedEvents;
    expect(events.filter(({ name }) => name === 'pageview').length).to.eql(1);
  });

  it.only('should fire an update event when dom change, should get i13n model updated', () => {
    const hiddenBtn = document.querySelectorAll('.HiddenBtn')[0];
    hiddenBtn.click();
    const events = window.firedEvents;
    let currentEventCount = events.length;
    expect(events[currentEventCount - 2].name).to.eql('click');
    expect(events[currentEventCount - 2].model).to.eql({
      sec: 'hidden-btn',
      page: 'test-page',
      expend: false
    });
    expect(events[currentEventCount - 1].name).to.eql('created');

    // click the link and expect the expend value is updated
    const hiddenLink = document.querySelectorAll('.I13nComponentLevel2Hidden a')[0];
    hiddenLink.click();
    currentEventCount = events.length;
    expect(events[currentEventCount - 1].name).to.eql('click');
    expect(events[currentEventCount - 1].model).to.eql({
      sec: 'hidden-btn',
      page: 'test-page',
      expend: true
    });
  });

  it('should handle nested model data well', () => {
    const nestTestI13nComponentLevel3 = document.querySelectorAll('.NestTestI13nComponentLevel3')[0];
    nestTestI13nComponentLevel3.click();
    const events = window.firedEvents;
    const currentEventCount = events.length;
    expect(events[currentEventCount - 1].model).to.eql({
      page: 'test-page',
      sec: 'level1',
      vl1: 'foo',
      vl2: 'bar',
      vl3: 'baz',
      vl3_ovr: 'baz'
    });
  });

  it('should fire a click beacon', () => {
    const link = document.querySelectorAll('.NormalLink a')[0];
    link.click();
    const events = window.firedEvents;
    const currentEventCount = events.length;
    expect(events[currentEventCount - 1].name).to.eql('click');
    expect(events[currentEventCount - 1].model).to.eql({ page: 'test-page', sec: 'foo' });
    expect(events[currentEventCount - 1].text).to.eql('NormalLink');
    expect(events[currentEventCount - 1].position).to.eql(1);
  });

  it('should fire a click beacon by model generated by function', () => {
    const link = document.querySelectorAll('.NormalLinkWithFunctionModel a')[0];
    link.click();
    const events = window.firedEvents;
    const currentEventCount = events.length;
    expect(events[currentEventCount - 1].name).to.eql('click');
    expect(events[currentEventCount - 1].model).to.eql({
      page: 'test-page',
      sec: 'dynamical-generated'
    });
    expect(events[currentEventCount - 1].text).to.eql('NormalLinkWithFunctionModel');
    expect(events[currentEventCount - 1].position).to.eql(2);
  });

  it('should fire a click beacon without redirect page if link is hash url', () => {
    const link = document.querySelectorAll('.LinkWithHashUrl a')[0];
    link.click();
    const events = window.firedEvents;
    const currentEventCount = events.length;
    expect(events[currentEventCount - 1].name).to.eql('click');
    expect(events[currentEventCount - 1].model).to.eql({ page: 'test-page', sec: 'foo' });
    expect(events[currentEventCount - 1].text).to.eql('LinkWithHashUrl');
    expect(events[currentEventCount - 1].position).to.eql(3);
  });

  it('should fire a click beacon without do anything if target="_blank"', () => {
    const link = document.querySelectorAll('.NormalLinkWithTargetBlank a')[0];
    link.click();
    const events = window.firedEvents;
    const currentEventCount = events.length;
    expect(events[currentEventCount - 1].name).to.eql('click');
    expect(events[currentEventCount - 1].model).to.eql({ page: 'test-page', sec: 'foo' });
    expect(events[currentEventCount - 1].text).to.eql('NormalLinkWithTargetBlank');
    expect(events[currentEventCount - 1].position).to.eql(4);
  });

  it('should fire a click for the auto-scanned links', () => {
    const link = document.querySelectorAll('.AutoScanLink')[0];
    link.click();
    const events = window.firedEvents;
    const currentEventCount = events.length;
    expect(events[currentEventCount - 1].name).to.eql('click');
    expect(events[currentEventCount - 1].model).to.eql({ page: 'test-page', sec: 'auto-scan' });
    expect(events[currentEventCount - 1].text).to.eql('AutoScanLink');
    expect(events[currentEventCount - 1].position).to.eql(1);
  });
});
