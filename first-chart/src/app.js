import { mapValues, max, min, values } from "lodash";
import weather from './weather.json';
import {useState} from "react";
import * as vega from "vega";
import * as vegaLite from "vega-lite";
import * as vl from "vega-lite-api";
import React from "react";
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";

dayjs.extend(dayOfYear);

const data = weather.map((v, i) => ({...v, idx: i, time: dayjs().dayOfYear(i).toString()}));

// region Normalization

// -2 to 12
// 0.3 to 2
// 5 to 48
// 48 - 5 = 43
// 12/43

const ex1 = [0, 1, 40, 43];
const ex2 = [0, 1, 5, 100];
const ex3 = [-2, 0, 2, 98];
const ex4 = [0.3, 0.5, 1];

const normalize = (arr, low, high) => {
  const minv = min(arr)
  const maxv = max(arr)
  const range = maxv - minv
  return arr.map((v) => v/range);
}

console.log(ex1, normalize(ex1))
console.log(ex2, normalize(ex2))
console.log(ex3, normalize(ex3))
console.log(ex4, normalize(ex4))

// endregion

function VegaLiteComponent(props) {
  const chartRef = React.createRef()

  console.log(props.data)

  React.useEffect(() => {
    vl.register(vega, vegaLite, {})

    const minTemp = vl
      .markPoint({stroke: "#85C5A6"})
      .encode(
        vl.x().fieldT("time").axis({title: "Day of the year", format: '%B'}),
        vl.y().fieldQ("MinTemp").axis({title: "MinTemp", titleColor: "#85C5A6"}),
        vl.tooltip().fieldQ("MinTemp"),
      );

    const maxTemp = vl
      .markPoint({stroke: "#85A9C5"})
      .encode(
        vl.x().fieldT("time").axis({title: "Day of the year", format: '%B'}),
        vl.y().fieldQ("MaxTemp").axis({title: "MaxTemp", titleColor: "#85A9C5"}),
        vl.tooltip().fieldQ("MaxTemp"),
      );

    vl.layer(minTemp, maxTemp)
      .data({
        values: props.data
      })
      // .width("container")
      .width(400)
      .render()
      .then(chart => {
        chartRef.current
          .appendChild(chart)
      })
  })
  return (
    <React.Fragment>
      <div ref={chartRef} style={({width: '100%'})}/>
      {/*<pre>{JSON.stringify(plot.toObject(), 0, 2)}</pre>*/}
    </React.Fragment>
  )
}

export function App() {
  const keys = Object.keys(data[0]);
  const [selectedKey, setSelectedKey] = useState(keys[0]);
  const dataByKey = Object.fromEntries(keys.map((k) => ([k, values(mapValues(data, k))])));
  const handleKeyChange = (e) => {
    setSelectedKey(e.target.value)
  }
  const tickLength = 10;

  return (
    <div>
      <h1>Weather Data</h1>
      <p><strong>Dataset size: </strong>{data.length}</p>
      <p>Distribution of: <select value={selectedKey} onChange={handleKeyChange}>{keys.map((k) => (<option key={k}>{k}</option>))}</select></p>
      <p>Range: {min(dataByKey[selectedKey])} - {max(dataByKey[selectedKey])}</p>
      <VegaLiteComponent data={data}/>
      <p><strong>Datum keys: </strong></p>
      <ul>
        {keys.map((k) => (<li key={k}>{k}</li>))}
      </ul>
      {/*<svg width='500px' height='400px'>*/}
      {/*  <line x1={tickLength} y1="0" x2={tickLength} y2="100%" stroke='black' strokeWidth='2'/>*/}
      {/*  <svg width='100%' height='100%'>*/}
      {/*    {dataByKey[selectedKey].map((v, i) => (<circle key={i} r='5' cx={i} cy={v}></circle>))}*/}
      {/*  </svg>*/}
      {/*</svg>*/}
    </div>
  );
}
