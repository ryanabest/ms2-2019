/* global Vue */

var app = new Vue({
  // This is the id of our referenced div-element
  // only this element and everything in it
  // will be connected to the data
  el: '#bars',
  data: {
    chartTitle: "Counting in German",
    margin: {
      top: 25,
      left: 25,
      bottom: 25,
      right: 25
    },
    svg: {
      width:  155,
      height: 300
    },
    data: [
      { name: "eins", val: 1 },
      { name: "zwei", val: 2 },
      { name: "drei", val: 3 },
      { name: "vier", val: 4 },
      { name: "fünf", val: 5 }
    ]
  },
  computed: {
    scale() {
      const x = d3
        .scaleBand()
        .domain(this.data.map(x => x.name))
        .rangeRound([0, this.width])
        .padding(0.15);
      const y = d3
        .scaleLinear()
        .domain([0, Math.max(...this.data.map(x => x.val))])
        .rangeRound([this.height, 0]);
      return { x, y };
    },
    width() {
      return this.svg.width - this.margin.right - this.margin.left;
    },
    height() {
      return this.svg.height - this.margin.top - this.margin.bottom;
    }
  },
  methods: {
    myFill(index) {
      if(index === 0) {
        return '#C06C84'
      } else {
        return '#355C7D'
      }
    }
  },
  directives: {
    axis(el, binding) {
      console.log(el); // this is the g
      console.log(binding); // the scale object
      const axis = binding.arg; // x or y
      // Line below defines an object and immediately calls
      // only the property for x or y
      // it’s basically like a ternary expression
      const axisMethod = { x: "axisBottom", y: "axisLeft" }[axis];
      // The line below assigns the x or y function of the scale object
      const methodArg = binding.value[axis];
      // The variable assignments above are a very concise way to
      // guarantee that d3 can select *this* element and call
      // the axis method on it
      // with the right argument
      // so it ends up equivalent to the expression
      // d3.axisBottom(scale.x)
      d3.select(el).call(d3[axisMethod](methodArg));
    }
  }
})
