/**
 * Custom prop-type checker that validates a prop is a Set.
 *
 * Ensures the specified prop on a React component's props object is an instance of
 * the built-in ES6 Set. If the check fails, an Error is returned describing the
 * invalid prop; if the check passes, the function returns undefined.
 *
 * @param {Object} props - The props object supplied to the component.
 * @param {string} propName - The name of the prop to validate.
 * @param {string} componentName - The name of the component for use in error messages.
 * @returns {Error|undefined} An Error when the prop is not a Set; otherwise undefined.
 *
 * @example
 * // In a React component:
 * MyComponent.propTypes = {
 *   selectedItems: isPropSet
 * };
 */
// Custom prop type checker for Set
export function isPropSet (props, propName, componentName) {
    if (!(props[propName] instanceof Set)) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected a Set.`
      );
    }
  };
