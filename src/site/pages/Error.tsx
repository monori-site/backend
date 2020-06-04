import React from 'react';

export default class ErrorComponent extends React.Component<any, any> {
  render() {
    return <div>
      jesus why are you so bad at everything
      <br />
      [{this.props.code}]: {this.props.message}
    </div>;
  }
}