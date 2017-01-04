'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import Legend from '../utilities/legend';

class PieChart extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      width: this.props.width,
      height: this.props.height
    };
  }

  componentDidMount() {
    this.repaintComponent();
    window.addEventListener('resize', this.updateSize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize, false);
  }

  updateSize = () => {
    const node = ReactDOM.findDOMNode(this);
    const parentWidth = node.offsetWidth;
    (parentWidth < this.props.width) ?
      this.setState({
        width: parentWidth,
        height: parentWidth
      }) :
      this.setState({
        width: this.props.width,
        height: this.props.height
      });
  };

  repaintComponent() {
    const forceResize = this.updateSize;
    function onRepaint(callback){
      setTimeout(function(){
        window.requestAnimationFrame(callback);
      }, 0);
    }
    onRepaint(forceResize);
  }

  createChart(_self) {
    if (this.props.colors) {
      this.color = d3.scale.ordinal()
      .range(this.props.colors);
    } else {
      this.color = d3.scale.category10();
    }

    let pieHeight = _self.state.height;
    let pieWidth;
    if (_self.props.width < _self.state.width) {
      pieWidth = _self.props.width;
    } else {
      pieWidth = _self.state.width;
      pieHeight = _self.props.width;
    }

    let diameter;
    if (pieHeight < pieWidth) {
      diameter = pieHeight;
    } else {
      diameter = pieWidth;
    }
    const radius = diameter/2;

    const outerRadius = radius;
    const innerRadius = _self.props.innerRadiusRatio ? radius*_self.props.innerRadiusRatio : 0;
    const startAngle = _self.degreesToRadians(_self.props.startAngle);
    const endAngle = _self.degreesToRadians(_self.props.endAngle);

    this.arc = d3.svg.arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius);

    this.pie = d3.layout.pie()
      .startAngle(startAngle)
      .endAngle(endAngle)
      .value(function (d) { return d[_self.props.valueKey]; });

    if (this.props.pieSort) {
      this.pie.sort(null);
    }

    this.transform = 'translate(' + radius + ',' + radius + ')';
  }

  degreesToRadians(d) {
    return (Math.PI/180)*d;
  }

  render() {
    this.createChart(this);

    const _self = this;

    const wedge = _self.pie(this.props.data).map(function(d,i) {
      const fill = _self.color(i);
      const centroid = _self.arc.centroid(d);
      const labelOffset = _self.props.labelOffset;
      const label = "translate(" + centroid[0]*labelOffset +"," + centroid[1]*labelOffset + ")";

      return (
        <g key={i}>
          <path
            fill={fill}
            d={_self.arc(d)} />
          {_self.props.showLabel ?
          <text
            transform={label}
            textAnchor="middle">
            {d.data[_self.props.valueKey]}
          </text>
          : null}
        </g>
      );
    });

    let customClassName = "";

    if(this.props.chartClassName){
      customClassName = " " + this.props.chartClassName;
    }

    return(
      <div>
        {this.props.title && <h3>{this.props.title}</h3>}
        <svg className={"rd3r-chart rd3r-pie-chart" + customClassName} id={this.props.chartId} width={this.state.width} height={this.state.height}>
          <g transform={this.transform}>
            {wedge}
          </g>
        </svg>
        {this.props.legend && <Legend data={this.props.data} labelKey={this.props.labelKey} colors={this.color} />}
      </div>
    );
  }

}

PieChart.propTypes = {
  title: React.PropTypes.string,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  chartId: React.PropTypes.string,
  chartClassName: React.PropTypes.string,
  colors: React.PropTypes.array,
  data: React.PropTypes.array,
  valueKey: React.PropTypes.string,
  labelKey: React.PropTypes.string,
  showLabel: React.PropTypes.bool,
  pieSort: React.PropTypes.bool,
  labelOffset: React.PropTypes.number,
  startAngle: React.PropTypes.number,
  endAngle: React.PropTypes.number,
  innerRadiusRatio: React.PropTypes.number,
  legend: React.PropTypes.bool
};

PieChart.defaultProps = {
  width: 300,
  height: 300,
  data: [],
  valueKey: "value",
  labelKey: "label",
  showLabel: true,
  labelOffset: 1,
  startAngle: 0,
  endAngle: 360,
  margin: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  },
  legend: true
};

export default PieChart;
