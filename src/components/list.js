import React from 'react';
import SystemStore from '../stores/systems-store';
import CONFIG from '../config';

import { Link } from 'react-router';
import Header from './header';

export default class List extends React.Component {
    constructor() {
        super();
        this.state = {

        };

        this.handleUpdate = () => {
            this.forceUpdate();
        }
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
    renderSensorValue(sensor) {
        return (
            <td>
                {sensor.value || "неизвестно"} {this.renderDynamic(sensor)}
            </td>
        );
    }

    render() {
        const { param, asc } = this.props.location.query;
        return (
            <div className="list">
                <Header />
                <Link to={CONFIG.baseURL}>Назад</Link>
                <table>
                    <thead>
                        <tr>
                            <th>Комната</th>
                            <th>Температура, C</th>
                            <th>Отн. влажность, %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.sortBy(
                                SystemStore.getData(),
                                param,
                                asc ? "asc" : "desc"
                            ).map((d) => {
                                return (
                                    <tr>
                                        <td>{d.room}</td>
                                        {this.renderSensorValue(d.sensors.temperature)}
                                        {this.renderSensorValue(d.sensors.humidity)}
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