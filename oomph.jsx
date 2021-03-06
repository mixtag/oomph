import React from 'react';

const FONT_HEIGHT_FACTOR = 0.8;
const FONT_WIDTH_FACTOR = 0.2;

// these are not static props to allow certain child style inheritance behaviors
const DEFAULT_STYLE = {
  display: 'flex',
  //flexDirection: 'row',
  flexWrap: 'wrap',
  //alignItems: 'center',
  //alignSelf: 'center',
  alignContent: 'flex-start',
  //justifyContent: 'center',
  overflow: 'auto',
  //border: 'thin solid aquamarine',
  boxSizing: 'border-box',
  margin: 0,
  padding: 0
};


export default class FlexO extends React.Component {

  static defaultProps = {
    //ref: 'me',
    //t: 'div',
    //devBorders: false,
    //tWF: 1/2,
    //root: false,
    //rootWidthMod: -14,
    //rootHeightMod: -14
  };

  state = { rootHeight: 0, rootWidth: 0 };

  render(){
    let {
      children, style,
      ...otherProps
    } = this.props;

    let { o, e, t, wF, hF, cWF, cHF, s, cS, tWF, tHF, root,
      crossAlign, dirAlign, d, reverse,
      devBorders, __isFlexChild
    } = otherProps;

    if (this.props.test){ console.log('test', this.props); }
    //console.log('root check', root, __isFlexChild, this);

    var newStyle = {};

    if(d){
      if (reverse){
        newStyle.flexDirection = `${d}-reverse`;
      } else {
        newStyle.flexDirection = d;
      }
    } else {
      //d = 'row';
      //newStyle.flexDirection = d;
    }

    if (crossAlign === 'start'){
      newStyle.alignItems = 'flex-start';
    } else if (crossAlign === 'end'){
      newStyle.alignItems = 'flex-end';
    } else if (crossAlign){
      newStyle.alignItems = crossAlign;
    }

    if (dirAlign === 'start'){
      newStyle.justifyContent = 'flex-start';
    } else if (dirAlign === 'end'){
      newStyle.justifyContent = 'flex-end';
    } else if (dirAlign){
      newStyle.justifyContent = dirAlign;
    }

    for (var styleKey in DEFAULT_STYLE){
      newStyle[styleKey] = DEFAULT_STYLE[styleKey];
    }

    if (root && !__isFlexChild){
      newStyle.position = 'relative';
      newStyle.height = this.state.rootHeight * (hF || 1);
      newStyle.width = this.state.rootWidth * (wF || 1);
    } else {
      if (0 || wF > 1){
        newStyle.width = 1000;
      } else {
        newStyle.width = `${(wF || 1) * 100}%`;
      }
      if (0 || hF > 1){
        newStyle.height = '100%';
      } else {
        if (this.props.test){ console.log('test hF', `${(hF || 1) * 100}%`); }
        newStyle.height = `${(hF || 1) * 100}%`;
      }
    }

    for (var styleKey in s){
      newStyle[styleKey] = s[styleKey];
    }
    for (var styleKey in style){
      newStyle[styleKey] = style[styleKey];
    }

    if (devBorders && !newStyle.border){
      if (typeof devBorders === 'string' || devBorders instanceof String){
        newStyle.border = devBorders;
      } else {
        newStyle.border = 'thin solid gray';
      }
    }

    //console.log('flex dir', d, newStyle.flexDirection);
    newStyle.flexDirection = newStyle.flexDirection || 'row';

    var wLeft = 1, hLeft = 1;
    var noWFCount = 0, noHFCount = 0;

    React.Children.forEach(children, c => {
      if (!c){
        return;
      }

      if (!c.props) {
        noWFCount++;
        noHFCount++;
        return;
      }

      if (!c.props.wF && !cWF){
        noWFCount++;
      }
      if (!c.props.hF && !cHF){
        noHFCount++;
      }

      wLeft -= c.props.wF || cWF || 0;
      hLeft -= c.props.hF || cHF || 0;
    });
    wLeft = Math.max(wLeft, 0);
    hLeft = Math.max(hLeft, 0);

    var kidCount = React.Children.count(children);
    //var autoKidWF = noWFCount && newStyle.flexDirection.startsWith('row') && wLeft;
    //var autoKidHF = noHFCount && newStyle.flexDirection.startsWith('col') && hLeft;
    //if (autoKidWF && autoKidHF){ console.log('wwwww'); }

    var totalCWF = 0, totalCHF = 0;
    var flexKids = React.Children.map(children, (c, i) => {
      if (!c){
        return;
      }

      if (c.props){
        var newProps = {
          s: {},
          __isFlexChild: true
        };
        for (var pKey in c.props){
          if (c.props.test){
            console.log('test', pKey, c.props[pKey]);
          }
          newProps[pKey] = c.props[pKey];
        }
        //console.log(autoKidWF, autoKidHF, kidCount);


        newProps.wF = c.props.wF || cWF;//  || (autoKidWF? (wLeft/noWFCount): 1);
        newProps.hF = c.props.hF || cHF;//  || (autoKidHF? (hLeft/noHFCount): 1);

        if (!newProps.wF){
          if (newStyle.flexDirection.startsWith('col')){
            newProps.wF = 1;
          } else {
            if (1 || wLeft > 0.00001){
              newProps.wF = wLeft/noWFCount;
            } else {
              newProps.wF = 1/kidCount;
            }
          }
        }
        if (!newProps.hF){
          if (newStyle.flexDirection.startsWith('col')){
            if (1 || hLeft > 0.00001){
              newProps.hF = hLeft/noHFCount;
            } else {
              newProps.hF = 1/kidCount;
            }
          } else {
            newProps.hF = 1;
          }
        }

        /*if (autoKidWF && !autoKidHF){
          console.log(autoKidWF? 'auto w': '', autoKidHF? 'auto h': '');
          console.log('w left', wLeft, 'h left', hLeft, 'no w', noWFCount, 'no h', noHFCount, 'out of', kidCount, 'd', d, 'w each', wLeft/noWFCount, 'h each', hLeft/noHFCount, 'wF', newProps.wF);
        }*/
        //console.log('new props', newProps.wF, newProps.hF);

        for (var styleKey in cS){
          newProps.s[styleKey] = cS[styleKey];
        }
        for (var styleKey in c.props.s){
          newProps.s[styleKey] = c.props.s[styleKey];
        }
        for (var styleKey in c.props.style){
          newProps.s[styleKey] = c.props.style[styleKey];
        }

        if (!c.props.devBorders){
          newProps.devBorders = devBorders;
        }

        totalCWF += newProps.wF;
        totalCHF += newProps.hF;

        if (this.props.pTest){
          console.log('p kid props', newProps);
        }

        return React.cloneElement(c, newProps, c.props.children);
      } else {
        return c;
      }
    });

    if (totalCWF <= 1){
      newStyle.overflowX = 'hidden';
    }
    if (totalCHF <= 1){
      newStyle.overflowY = 'hidden';
    }

    if (this.props.test){ console.log('kid test', this.props); }

    return React.createElement(
      o || e || t || 'div',
      { style: newStyle, ...otherProps },
      flexKids
    );
  }

  componentDidMount(){
    this.rescale = () => {
      if (this.props.root){
        this.setState({
          rootWidth: window.innerWidth * (this.props.wF || 1) + (this.props.rootWidthMod || -14),
          rootHeight: window.innerHeight * (this.props.hF || 1) + (this.props.rootHeightMod || -14)
        });

        if (!this.props.wF || (this.props.wF <= 1)){
          document.body.style.overflowX = 'hidden';
        }
        if (!this.props.hF || (this.props.hF <= 1)){
          document.body.style.overflowY = 'hidden';
        }
      }

      return;
      // TODO: fractional text sizing
      if (this.props.tWF){
        me.style.fontSize
          = `${me.offsetWidth * this.props.tWF * FONT_WIDTH_FACTOR}px`;
      } else if (this.props.tHF){
        me.style.fontSize
          = `${me.offsetHeight * this.props.tHF * FONT_HEIGHT_FACTOR}px`;
      }
    };

    this.rescale();

    window.addEventListener('resize', this.rescale);
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.rescale);
  }

  componentDidUpdate(){
    if (this.props.tWF && this.props.tHF){
      var message = 'Both tWF and tHF were set. Only tWF was used.';
      console.warn(message, this);
    }

    if (this.props.s && this.props.style){
      var message = 'Both s and style props were set. Properties in style will override properties in s.';
      console.warn(message, this);
    }

    if (this.props.root && this.props.__isFlexChild){
      var message = `This component's root prop = true, but it is the child of another root.`;
      console.warn(message, this);
    }
  }

}
