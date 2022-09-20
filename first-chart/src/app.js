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
    </div>
  );
}
