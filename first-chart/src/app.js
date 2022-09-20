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

class VegaLiteComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartRef: React.createRef()
    }
  }

  componentDidMount() {
    vl.register(vega, vegaLite, {});

    // why do I have to pass props and state into this async function?
    // why aren't they accessible via parent scope?
    async function buildChart (data, chartRef) {
      const selection = vl.selectInterval().encodings('y');

      const tempCounts = vl.markBar()
        .params(selection)
        .encode(
          vl.x().count(),
          vl.y().fieldQ("MaxTemp").bin(true).axis({title: "Temperature (Celsius)"}),
          vl.tooltip(vl.x().count())
        )
        .width(200);

      const temps = vl.markPoint({filled: true, opacity: 0.4, size: 40})
        .params(selection)
        .encode(
          vl.x().fieldT("time").axis({title: null, format: '%B'}),
          vl.y().fieldQ("MaxTemp").axis({title: "Temperature (Celsius)"}),
          vl.tooltip().fieldQ("MaxTemp"),
          vl.color().if(selection, vl.fieldN('RainToday')).value('grey')
        );

      await vl.hconcat(temps, tempCounts)
        .data(data)
        .render()
        .then(chart => {
          chartRef.current
            .appendChild(chart)
        });

    }
    buildChart({values: this.props.data}, this.state.chartRef);
  }

  render() {
    return (
      <React.Fragment>
        <div ref={this.state.chartRef} style={({width: '100%'})}/>
        {/*<pre>{JSON.stringify(plot.toObject(), 0, 2)}</pre>*/}
      </React.Fragment>
    )
  }
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
