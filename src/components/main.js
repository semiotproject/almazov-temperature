import React from 'react';
import SystemStore from '../stores/systems-store';
import api from '../api/';
import CONFIG from '../config';

import { Link } from 'react-router';
import Header from './header';

require('../css/main.less');

export default class Main extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            authenticationError: SystemStore.authError,
            data: SystemStore.getData()
        };

        this.handleUpdate = () => {
            this.setState({
                data: SystemStore.getData()
            });
        };
    }

    componentDidMount() {
        SystemStore.on('update', this.handleUpdate);
    }
    componentWillUnmount() {
        SystemStore.removeListener('update', this.handleUpdate);
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
            <span>{min.sensors.temperature.value} {String.fromCharCode("8451")}</span>,
            <label>минимальная температура</label>,
            <label>в комнате № {min.room}</label>
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
            <span>{max.sensors.temperature.value} {String.fromCharCode("8451")}</span>,
            <label>максимальная температура</label>,
            <label>в комнате № {max.room}</label>
        ];
    }

    render() {
        const { data, isLoading, authenticationError } = this.state;
        if (isLoading) {
            return <div className="banner"><img src={require("../img/preloader.svg")} alt="загрузка"/></div>;
        }
        if (authenticationError) {
            return <div className="banner">Ошибка авторизации</div>;
        }
        return (
            <div className="overall-wrapper">
                <Header />
                <div className="overall">
                    <Link to={CONFIG.baseURL + "list?param=temperature&asc=true"}>
                        <div className="overall__min">
                            {this.renderMin(data)}
                        </div>
                    </Link>
                    <Link to={CONFIG.baseURL + "list?param=room&desc=true"}>
                        <div className="overall__average">
                            {this.renderAverage(data)} {String.fromCharCode("8451")}
                            <label>средняя температура</label>
                        </div>
                    </Link>
                    <Link to={CONFIG.baseURL + "list?param=temperature&desc=true"}>
                        <div className="overall__max">
                            {this.renderMax(data)}
                        </div>
                    </Link>
                </div>
            </div>
        );
    }
}