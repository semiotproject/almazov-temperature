import React from 'react';
import SystemStore from '../stores/systems-store';
import CONFIG from '../config';

import moment from "moment";

export default class List extends React.Component {
    constructor() {
        super();
        this.state = {
            sortKey: "room"
        };

        this.handleUpdate = () => {
            this.forceUpdate();
        };

        this.handleSort = (key) => {
            return () => {
                this.setState({
                    sortKey: key
                });
            };
        };
    }

    componentDidMount() {
        SystemStore.on("update", this.handleUpdate);
    }
    componentWillUnmount() {
        SystemStore.removeListener('update', this.handleUpdate);
    }

    sortBy(data, param, direction) {
        const correction = direction === "asc" ? 1 : -1;
        return data.sort((a, b) => {
            return correction * (a[param] > b[param] ? 1 : -1);
        });
    }
    renderDynamic(d) {
        if (d.prevValue) {
            return d.value - d.prevValue > 0 ? String.fromCharCode("8593") : String.fromCharCode("8595");
        }
    }
    renderSensorValue(sensor, units) {
        return (
            <td>
                {sensor.value || "неизвестно"} {units} {this.renderDynamic(sensor)}
            </td>
        );
    }
    renderTimestamp(timestamp) {
        return (
            <td style={{
                color: Date.now() - timestamp > 1 * 60 * 60 * 1000 ? "red" : "black"
            }}>{moment(timestamp).format('MM-DD HH:mm:ss')}</td>
        );
    }
    sort(data, key) {
        return data.sort((a, b) => {
            switch(key) {
            case "room":
                return a.room > b.room ? 1 : -1;
            case "temperature":
                return a.sensors.temperature.value > b.sensors.temperature.value ? 1 : -1;
            case "humidity":
                return a.sensors.humidity.value > b.sensors.humidity.value ? 1 : -1;
            case "timestamp":
                return a.sensors.temperature.timestamp > b.sensors.temperature.timestamp ? 1 : -1;
            default:
                return 1;
            }
        });
    }

    render() {
        const { data } = this.props;
        const { sortKey } = this.state;
        return (
            <div className="list">
                <table>
                    <thead>
                        <tr>
                            <th title="Отсортировать по комнате" onClick={this.handleSort("room")}>Комната</th>
                            <th title="Отсортировать по температуре" onClick={this.handleSort("temperature")}>Температура</th>
                            <th title="Отсортировать по влажности" onClick={this.handleSort("humidity")}>Влажность</th>
                            <th title="Отсортировать по времени последнего показания" onClick={this.handleSort("timestamp")}>Время</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.sort(data, sortKey).map((d, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{d.room}</td>
                                        {this.renderSensorValue(d.sensors.temperature, String.fromCharCode("8451"))}
                                        {this.renderSensorValue(d.sensors.humidity, "%")}
                                        {this.renderTimestamp(d.sensors.temperature.timestamp)}
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}