import {shallowEqual} from "shallow-equal-object";

interface ValueObjectProps {
  [index: string]: any;
}

export abstract class ValueObject<T extends ValueObjectProps> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    if (vo.props === undefined) {
      return false;
    }

    return shallowEqual(this.props, vo.props);
  }
}
