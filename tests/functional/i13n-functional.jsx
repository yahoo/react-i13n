/* global document, React, ReactDOM */
function getJsonFromUrl() {
  const query = location.search.substr(1);
  const result = {};
  const parts = query.split('&');
  let i = 0;
  const { length } = parts;
  for (i; i < length; i++) {
    const item = parts[i].split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  }
  return result;
}

const container = document.getElementById('container');
const itemsNumber = getJsonFromUrl().items || 1;

class I13nComponentLevel1 extends React.Component {
  render() {
    const links = [];
    for (let i = 0; i < itemsNumber; i++) {
      const linkText = `Button Level1 ${i}`;
      var linkSec = `level1-${i}`;
      links.push(
        <I13nButton className="P(4px) M(4px) Bgc(#ececec)" key={i} i13nModel={{ sec: linkSec, lv1: 'foo' }}>
          {linkText}
        </I13nButton>
      );
    }
    const getModelData = function () {
      return {
        sec: 'dynamical-generated'
      };
    };
    return (
      <div className="P(4px) M(4px) Bgc(#d9edf7) I13nComponentLevel1">
        Level 1 Links
        <div className="P(4px) M(4px) Bgc(#ececec) NormalLink">
          <I13nAnchor
            className="NormalLink"
            i13nModel={{ sec: 'foo' }}
            follow={false}
            href="./mock-destination-page.html"
          >
            NormalLink
          </I13nAnchor>
        </div>
        <div className="P(4px) M(4px) Bgc(#ececec) NormalLinkWithFunctionModel">
          <I13nAnchor i13nModel={getModelData} follow={false} href="./mock-destination-page.html">
            NormalLinkWithFunctionModel
          </I13nAnchor>
        </div>
        <div className="P(4px) M(4px) Bgc(#ececec) LinkWithHashUrl">
          <I13nAnchor i13nModel={{ sec: 'foo' }} href="#">
            LinkWithHashUrl
          </I13nAnchor>
        </div>
        <div className="P(4px) M(4px) Bgc(#ececec) NormalLinkWithTargetBlank">
          <I13nAnchor
            target="_blank"
            className="NormalLink"
            i13nModel={{ sec: 'foo' }}
            href="./mock-destination-page.html"
          >
            NormalLinkWithTargetBlank
          </I13nAnchor>
        </div>
        <div className="P(4px) M(4px) Bgc(#ececec) NormalLinkWithFollow">
          <I13nAnchor i13nModel={{ sec: 'foo' }} href="./mock-destination-page.html">
            NormalLinkWithFollow
          </I13nAnchor>
        </div>
        <div className="P(4px) M(4px) Bgc(#ececec) NormalButton">
          <form action="/mock-destination-page.html">
            <input type="text" name="fname" />
            <I13nButton i13nModel={{ sec: linkSec }} href="./mock-destination-page.html">
              NormalButton
            </I13nButton>
          </form>
        </div>
        {links}
        <I13nComponentLevel2Hidden i13nModel={{ sec: 'hidden' }} />
        <I13nComponentLevel2 i13nModel={{ sec: 'level2' }} />
        <I13nDiv className="NestTestI13nComponentLevel1" i13nModel={{ vl1: 'foo', vl3_ovr: 'foo' }}>
          <div>
            <I13nDiv className="NestTestI13nComponentLevel2" i13nModel={{ vl2: 'bar' }}>
              <div>
                <I13nAnchor
                  href="./mock-destination-page.html"
                  className="NestTestI13nComponentLevel3"
                  follow={false}
                  i13nModel={{ vl3: 'baz', vl3_ovr: 'baz' }}
                >
                  NestTestI13nComponentLevel3
                </I13nAnchor>
              </div>
            </I13nDiv>
          </div>
        </I13nDiv>
        <I13nDiv i13nModel={{ sec: 'auto-scan' }} scanLinks={{ enable: true }}>
          <a className="AutoScanLink" href="/mock-destination-page.html" target="_blank">
            AutoScanLink
          </a>
        </I13nDiv>
      </div>
    );
  }
}

I13nComponentLevel1 = createI13nNode(I13nComponentLevel1);

class I13nComponentLevel2 extends React.Component {
  render() {
    const links = [];
    for (let i = 0; i < itemsNumber; i++) {
      const linkText = `Link Level2 ${i}`;
      const linkSec = `level2-${i}`;
      links.push(
        <div className="P(4px) M(4px) Bgc(#ececec)" key={i}>
          <I13nAnchor i13nModel={{ sec: linkSec, lv2: 'foo' }} follow={false} href="https://yahoo.com">
            {linkText}
          </I13nAnchor>
        </div>
      );
    }
    return (
      <div className="P(4px) M(4px) Bgc(#fcf8e3) I13nComponentLevel2">
        Level 2 Links
        {links}
      </div>
    );
  }
}

I13nComponentLevel2 = createI13nNode(I13nComponentLevel2);

class I13nComponentLevel2Hidden extends React.Component {
  state = {
    expend: false
  };

  clickHandler = () => {
    this.setState({ expend: true });
  }

  render() {
    const links = [];
    if (this.state.expend) {
      for (let i = 0; i < itemsNumber; i++) {
        const linkText = `Link Level2 Hidden ${i}`;
        links.push(
          <div className="P(4px) M(4px) Bgc(#ececec)" key={i}>
            <I13nAnchor href="/mock-destination-page.html" follow={false}>
              {linkText}
            </I13nAnchor>
          </div>
        );
      }
    }
    return (
      <div className="P(4px) M(4px) Bgc(#fcf8e3) I13nComponentLevel2Hidden">
        <I13nDiv
          className="HiddenBtn"
          onClick={this.clickHandler}
          bindClickEvent
          i13nModel={{ sec: 'hidden-btn', expend: this.state.expend }}
        >
          Show Hidden Links
          {links}
        </I13nDiv>
      </div>
    );
  }
}

I13nComponentLevel2Hidden = createI13nNode(I13nComponentLevel2Hidden);

let I13nDemo = () => {
  React.useEffect(() => {
    getInstance().execute('pageview', {});
  }, []);

  return <I13nComponentLevel1 i13nModel={{ sec: 'level1' }} />;
}

window.firedEvents = [];

const testPlugin = {
  name: 'test',
  eventHandlers: {
    click(payload, callback) {
      // click handlers
      window.firedEvents.push({
        name: 'click',
        model: payload.i13nNode.getMergedModel(),
        text: payload.i13nNode.getText(),
        position: payload.i13nNode.getPosition()
      });
      callback();
    },
    event(payload, callback) {
      // event handlers
      window.firedEvents.push({
        name: 'event'
      });
      callback();
    },
    pageview(payload, callback) {
      if (payload.env === 'client') {
        // client side pageview handlers
        window.firedEvents.push({
          name: 'pageview'
        });
      } else {
        // server side pageview handlers
      }
      callback();
    },
    created(payload, callback) {
      // updated handlers
      window.firedEvents.push({
        name: 'created'
      });
      callback();
    }
  }
};
try {
  I13nDemo = setupI13n(
    I13nDemo,
    {
      isViewportEnabled: true,
      rootModelData: {
        sec: 'default-section-name',
        page: 'test-page'
      }
    },
    [testPlugin]
  );
  const Demo = ReactDOM.render(<I13nDemo />, container);
} catch (e) {
  alert(e);
}
