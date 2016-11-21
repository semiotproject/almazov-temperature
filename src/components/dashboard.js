import React from 'react';
import SystemStore from '../stores/systems-store';
import api from '../api/';
import CONFIG from '../config';

export default class Dashboard extends React.Component {
    constructor() {
        super();
    }

    renderMin(data) {
        let min = {
            sensors: {
                temperature: {
                    value: Infinity
                }
            }
        };
        data.forEach((d) => {
            if (d.sensors.temperature && d.sensors.temperature.value < min.sensors.temperature.value) {
                min = d;
            }
        });
        return [
            <span key="1">{min.sensors.temperature.value} {String.fromCharCode("8451")}</span>,
            <label key="2">минимальная температура</label>,
            <label key="3">в комнате № {min.room}</label>
        ];
    }
    renderAverage(data) {
        return (data.reduce((prev, next) => {
            if (next.sensors.temperature.value) {
                return prev + parseFloat(next.sensors.temperature.value);
            } else {
                return prev;
            }
        }, 0) / data.filter((s) => {
            return s.sensors.temperature;
        }).length).toFixed(2);
    }
    renderMax(data) {
        let max = {
            sensors: {
                temperature: {
                    value: -Infinity
                }
            }
        };
        data.forEach((d) => {
            if (d.sensors.temperature && d.sensors.temperature.value > max.sensors.temperature.value) {
                max = d;
            }
        });
        return [
            <span key="1">{max.sensors.temperature.value} {String.fromCharCode("8451")}</span>,
            <label key="2">максимальная температура</label>,
            <label key="3">в комнате № {max.room}</label>
        ];
    }

    render() {
        const { data } = this.props;
        return (
            <div className="dashboard">
                <div className="dashboard__min">
                    {this.renderMin(data)}
                </div>
                <div className="dashboard__average">
                    {this.renderAverage(data)} {String.fromCharCode("8451")}
                    <label>средняя температура</label>
                </div>
                <div className="dashboard__max">
                    {this.renderMax(data)}
                </div>
            </div>
        );
    }
}