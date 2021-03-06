import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import { vnode } from 'deku';

const linkClass = (vnode, styles) => {
  if (vnode.children) {
    vnode.children = vnode.children.map((vnode) => {
      return linkClass(vnode, styles);
    })
  }
  if (vnode.attributes) {
    let classes = new Set();
    if (vnode.attributes.class) {
      vnode.attributes.class.split(' ').forEach((name) => {
        classes.add(name);
      })
    }
    if (vnode.attributes.styleName) {
      vnode.attributes.styleName.split(' ').forEach((name) => {
        if (styles[name] !== undefined) {
          classes.add(styles[name]);
        }
      })
    }
    delete vnode.attributes.styleName;
    if (classes.size) {
      vnode.attributes.class = Array.from(classes).join(' ');
    }
  }
  return vnode;
}

const functionConstructor = (Component, defaultStyles, options) => {
  const render = isFunction(Component)? Component : Component.render;
  const WrappedComponent = (model) => {
    let styles;
    let { props }  = model;

    if (props.styles) {
      styles = props.styles;
    } else if (isObject(defaultStyles)) {
      props.styles = defaultStyles;
      styles = defaultStyles;
    } else {
      styles = {};
    }

    const renderResult = render(model);

    if (renderResult) {
      return linkClass(renderResult, styles, options);
    }

    return vnode.createEmptyElement();
  }

  if (isFunction(Component)) {
    return WrappedComponent;
  } else {
    return Object.assign(Component, {
      render: WrappedComponent
    });
  }
};

/**
 * When used as a ES7 decorator.
 */
const decoratorConstructor = (defaultStyles, options) => {
  return (Component) => {
    return functionConstructor(Component, defaultStyles, options);
  };
};

export default (...args) => {
  if (isFunction(args[0]) || 
     isObject(args[0]) && isFunction(args[0].render)) {
    return functionConstructor(args[0], args[1], args[2]);
  } else {
    return decoratorConstructor(args[0], args[1]);
  }
};
